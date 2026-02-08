// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title InvoiceManager
 * @dev Manages on-chain invoice creation and payment with direct USDC transfers
 *
 * IMPORTANT SECURITY CONSIDERATIONS:
 * - Funds NEVER sit in this contract
 * - Payments transfer directly from payer to merchant in the same transaction
 * - Uses SafeERC20 to handle non-standard token return values
 * - No admin keys or upgradability - immutable and transparent
 * - Native USDC only (not USDC.e) - enforced via address validation
 */
contract InvoiceManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Native USDC addresses on Avalanche (Circle-issued, NOT USDC.e)
    // Using constant for zero storage cost - addresses are inlined into bytecode
    address public constant MAINNET_USDC = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
    address public constant FUJI_USDC = 0x5425890298aed601595a70AB815c96711a31Bc65;

    // Custom errors for gas efficiency and clarity
    error InvoiceAlreadyExists(bytes32 invoiceId);
    error InvoiceNotFound(bytes32 invoiceId);
    error InvalidAmount();
    error InvalidToken();
    error InvoiceAlreadyPaid();
    error InvoiceExpired();
    error PaymentFailed();
    error MerchantMismatch();

    // Invoice data structure - optimized for storage packing
    // Slot 1: merchant (20 bytes) + paid (1 byte) = 21 bytes
    // Slot 2: token (20 bytes) + dueAt (8 bytes) = 28 bytes
    // Slot 3: payer (20 bytes) + paidAt (8 bytes) = 28 bytes
    // Slot 4: amount (16 bytes)
    struct Invoice {
        address merchant;   // 20 bytes
        bool paid;          // 1 byte (packed with merchant)
        address token;      // 20 bytes
        uint64 dueAt;       // 8 bytes (packed with token)
        address payer;      // 20 bytes
        uint64 paidAt;      // 8 bytes (packed with payer)
        uint128 amount;     // 16 bytes (sufficient for 340M+ USDC)
    }

    // State variables
    mapping(bytes32 => Invoice) public invoices;

    // Events
    event InvoiceCreated(
        bytes32 indexed invoiceId,
        address indexed merchant,
        address indexed token,
        uint256 amount,
        uint64 dueAt
    );

    event InvoicePaid(
        bytes32 indexed invoiceId,
        address indexed merchant,
        address indexed payer,
        address token,
        uint256 amount,
        uint64 paidAt
    );

    /**
     * @dev Creates a new invoice
     * @param invoiceId Unique identifier for the invoice (bytes32 hash, e.g., keccak256(uuid))
     * @param token Address of the USDC token contract (must be native USDC)
     * @param amount Amount to be paid in USDC (6 decimals)
     * @param dueAt Unix timestamp when invoice expires (0 for no expiration)
     */
    function createInvoice(
        bytes32 invoiceId,
        address token,
        uint256 amount,
        uint64 dueAt
    ) external {
        // Validate inputs
        if (amount == 0) revert InvalidAmount();
        if (invoices[invoiceId].merchant != address(0)) revert InvoiceAlreadyExists(invoiceId);

        // Validate token is a contract
        if (token.code.length == 0) revert InvalidAmount();

        // Validate token is a known USDC address (prevents USDC.e or malicious tokens)
        if (token != MAINNET_USDC && token != FUJI_USDC) revert InvalidToken();

        // Store invoice (field order matches optimized struct)
        invoices[invoiceId] = Invoice({
            merchant: msg.sender,
            paid: false,
            token: token,
            dueAt: dueAt,
            payer: address(0),
            paidAt: 0,
            amount: uint128(amount)
        });

        emit InvoiceCreated(invoiceId, msg.sender, token, amount, dueAt);
    }

    /**
     * @dev Pays an existing invoice
     * @param invoiceId The invoice identifier
     *
     * The payment flow:
     * 1. Validates invoice exists and is unpaid
     * 2. Checks expiration if due date is set
     * 3. Transfers USDC directly from payer to merchant
     * 4. Marks invoice as paid and records payer details
     *
     * IMPORTANT: Payer must have approved the exact amount before calling this function.
     * Use approve(InvoiceManager_address, amount) for security.
     */
    function payInvoice(bytes32 invoiceId) external nonReentrant {
        Invoice storage invoice = invoices[invoiceId];

        // CHECKS - Validate all preconditions first
        if (invoice.merchant == address(0)) revert InvoiceNotFound(invoiceId);
        if (invoice.paid) revert InvoiceAlreadyPaid();
        if (invoice.dueAt != 0 && block.timestamp > invoice.dueAt) revert InvoiceExpired();

        // Cache values for use after state changes (gas optimization + CEI compliance)
        address merchant = invoice.merchant;
        address token = invoice.token;
        uint256 amount = invoice.amount;
        uint64 paidAt = uint64(block.timestamp);

        // EFFECTS - Update state BEFORE external call (CEI pattern)
        invoice.paid = true;
        invoice.payer = msg.sender;
        invoice.paidAt = paidAt;

        // INTERACTIONS - External call LAST
        // SafeERC20 will revert if transfer fails, which will revert state changes
        IERC20(token).safeTransferFrom(msg.sender, merchant, amount);

        emit InvoicePaid(
            invoiceId,
            merchant,
            msg.sender,
            token,
            amount,
            paidAt
        );
    }

    /**
     * @dev Retrieves invoice details
     * @param invoiceId The invoice identifier
     * @return Invoice The complete invoice struct
     */
    function getInvoice(bytes32 invoiceId) external view returns (Invoice memory) {
        Invoice memory invoice = invoices[invoiceId];

        if (invoice.merchant == address(0)) revert InvoiceNotFound(invoiceId);

        return invoice;
    }

    /**
     * @dev Checks if an invoice exists
     * @param invoiceId The invoice identifier
     * @return bool True if invoice exists
     */
    function invoiceExists(bytes32 invoiceId) external view returns (bool) {
        return invoices[invoiceId].merchant != address(0);
    }

    /**
     * @dev Checks if an invoice is paid
     * @param invoiceId The invoice identifier
     * @return bool True if invoice is paid
     */
    function isInvoicePaid(bytes32 invoiceId) external view returns (bool) {
        return invoices[invoiceId].paid;
    }

    /**
     * @dev Gets all invoices for a merchant (paginated for gas efficiency)
     * @param merchant The merchant address
     * @param invoiceIds Array of invoice IDs to query
     * @return invoices Array of invoice details
     *
     * Note: This is a batch query helper. The UI should maintain a list of invoice IDs
     * by querying InvoiceCreated events and then batch-fetch details here.
     */
    function getMerchantInvoices(
        address merchant,
        bytes32[] calldata invoiceIds
    ) external view returns (Invoice[] memory) {
        uint256 length = invoiceIds.length;
        Invoice[] memory result = new Invoice[](length);

        for (uint256 i = 0; i < length; i++) {
            Invoice storage invoice = invoices[invoiceIds[i]];
            if (invoice.merchant == merchant) {
                result[i] = invoice;
            }
        }

        return result;
    }
}
