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
 * - Native USDC only (not USDC.e) - verify token address before use
 */
contract InvoiceManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Custom errors for gas efficiency and clarity
    error InvoiceAlreadyExists(bytes32 invoiceId);
    error InvoiceNotFound(bytes32 invoiceId);
    error InvalidAmount();
    error InvoiceAlreadyPaid();
    error InvoiceExpired();
    error PaymentFailed();
    error MerchantMismatch();

    // Invoice data structure
    struct Invoice {
        address merchant;
        address token;
        uint256 amount;
        uint64 dueAt;
        bool paid;
        address payer;
        uint64 paidAt;
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

        // Store invoice
        invoices[invoiceId] = Invoice({
            merchant: msg.sender,
            token: token,
            amount: amount,
            dueAt: dueAt,
            paid: false,
            payer: address(0),
            paidAt: 0
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

        // Validate invoice exists
        if (invoice.merchant == address(0)) revert InvoiceNotFound(invoiceId);

        // Validate invoice is not paid
        if (invoice.paid) revert InvoiceAlreadyPaid();

        // Validate expiration if due date is set
        if (invoice.dueAt != 0 && block.timestamp > invoice.dueAt) revert InvoiceExpired();

        // Transfer USDC from payer to merchant
        // SafeERC20 will revert if transfer fails
        IERC20(invoice.token).safeTransferFrom(msg.sender, invoice.merchant, invoice.amount);

        // Payment successful, update invoice state
        invoice.paid = true;
        invoice.payer = msg.sender;
        invoice.paidAt = uint64(block.timestamp);

        emit InvoicePaid(
            invoiceId,
            invoice.merchant,
            msg.sender,
            invoice.token,
            invoice.amount,
            invoice.paidAt
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
