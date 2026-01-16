// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {InvoiceManager} from "../src/InvoiceManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Mock USDC for testing
contract MockUSDC is IERC20 {
    string public constant name = "USD Coin";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 6;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;

    // ERC20 error types for testing
    bool public returnFalseOnTransfer = false;
    bool public revertOnTransfer = false;
    bool public noReturnValueOnTransfer = false;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        uint256 current = allowance[from][msg.sender];
        if (current < amount) revert("ERC20: insufficient allowance");
        allowance[from][msg.sender] = current - amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (revertOnTransfer) revert("Transfer failed");
        if (balanceOf[from] < amount) revert("ERC20: insufficient balance");
        if (returnFalseOnTransfer) revert("Returning false");

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    // Test helpers
    function setReturnFalseOnTransfer(bool value) external {
        returnFalseOnTransfer = value;
    }

    function setRevertOnTransfer(bool value) external {
        revertOnTransfer = value;
    }

    function setNoReturnValueOnTransfer(bool value) external {
        noReturnValueOnTransfer = value;
    }
}

contract InvoiceManagerTest is Test {
    InvoiceManager public invoiceManager;
    MockUSDC public usdc;

    address public merchant = address(0x1);
    address public payer = address(0x2);
    address public other = address(0x3);

    bytes32 public constant INVOICE_ID = keccak256(abi.encodePacked("invoice-1"));
    uint256 public constant AMOUNT = 100 * 1e6; // 100 USDC
    uint64 public constant DUE_AT = uint64(block.timestamp + 30 days);

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

    function setUp() public {
        usdc = new MockUSDC();
        invoiceManager = new InvoiceManager();

        // Fund accounts with USDC
        usdc.mint(merchant, 1000 * 1e6);
        usdc.mint(payer, 1000 * 1e6);
    }

    // ============================================
    // Create Invoice Tests
    // ============================================

    function test_CreateInvoiceHappyPath() public {
        vm.prank(merchant);

        vm.expectEmit(true, true, true, true);
        emit InvoiceCreated(INVOICE_ID, merchant, address(usdc), AMOUNT, DUE_AT);

        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, DUE_AT);

        (address _merchant, address token, uint256 amount, uint64 dueAt, bool paid, address _payer, uint64 paidAt) =
            invoiceManager.getInvoice(INVOICE_ID);

        assertEq(_merchant, merchant);
        assertEq(token, address(usdc));
        assertEq(amount, AMOUNT);
        assertEq(dueAt, DUE_AT);
        assertEq(paid, false);
        assertEq(_payer, address(0));
        assertEq(paidAt, 0);
    }

    function test_RejectDuplicateInvoiceId() public {
        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, DUE_AT);

        vm.prank(merchant);
        vm.expectRevert(abi.encodeWithSelector(InvoiceManager.InvoiceAlreadyExists.selector, INVOICE_ID));
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, DUE_AT);
    }

    function test_RejectZeroAmount() public {
        vm.prank(merchant);
        vm.expectRevert(abi.encodeWithSelector(InvoiceManager.InvalidAmount.selector));
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), 0, DUE_AT);
    }

    function test_CreateInvoiceNoExpiration() public {
        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, 0);

        (, , , uint64 dueAt, , , ) = invoiceManager.getInvoice(INVOICE_ID);
        assertEq(dueAt, 0);
    }

    function test_InvoiceExists() public {
        assertEq(invoiceManager.invoiceExists(INVOICE_ID), false);

        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, DUE_AT);

        assertEq(invoiceManager.invoiceExists(INVOICE_ID), true);
    }

    // ============================================
    // Pay Invoice Tests
    // ============================================

    function test_PayInvoiceHappyPath() public {
        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, DUE_AT);

        uint256 merchantBalanceBefore = usdc.balanceOf(merchant);
        uint256 payerBalanceBefore = usdc.balanceOf(payer);

        vm.prank(payer);
        usdc.approve(address(invoiceManager), AMOUNT);

        vm.prank(payer);
        vm.expectEmit(true, true, true, true);
        emit InvoicePaid(INVOICE_ID, merchant, payer, address(usdc), AMOUNT, uint64(block.timestamp));

        invoiceManager.payInvoice(INVOICE_ID);

        // Check balances moved
        assertEq(usdc.balanceOf(merchant), merchantBalanceBefore + AMOUNT);
        assertEq(usdc.balanceOf(payer), payerBalanceBefore - AMOUNT);

        // Check invoice state
        (, , , , bool paid, address _payer, uint64 paidAt) = invoiceManager.getInvoice(INVOICE_ID);
        assertEq(paid, true);
        assertEq(_payer, payer);
        assertEq(paidAt, uint64(block.timestamp));
    }

    function test_PreventDoublePay() public {
        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, DUE_AT);

        vm.prank(payer);
        usdc.approve(address(invoiceManager), AMOUNT * 2);

        vm.prank(payer);
        invoiceManager.payInvoice(INVOICE_ID);

        vm.prank(payer);
        vm.expectRevert(abi.encodeWithSelector(InvoiceManager.InvoiceAlreadyPaid.selector));
        invoiceManager.payInvoice(INVOICE_ID);
    }

    function test_DueDateEnforcement() public {
        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, uint64(block.timestamp - 1));

        vm.prank(payer);
        usdc.approve(address(invoiceManager), AMOUNT);

        vm.prank(payer);
        vm.expectRevert(abi.encodeWithSelector(InvoiceManager.InvoiceExpired.selector));
        invoiceManager.payInvoice(INVOICE_ID);
    }

    function test_PayBeforeDueDate() public {
        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, DUE_AT);

        vm.prank(payer);
        usdc.approve(address(invoiceManager), AMOUNT);

        vm.prank(payer);
        invoiceManager.payInvoice(INVOICE_ID); // Should succeed

        (, , , , bool paid, , ) = invoiceManager.getInvoice(INVOICE_ID);
        assertEq(paid, true);
    }

    function test_PayNonExistentInvoice() public {
        vm.prank(payer);
        usdc.approve(address(invoiceManager), AMOUNT);

        vm.prank(payer);
        vm.expectRevert(abi.encodeWithSelector(InvoiceManager.InvoiceNotFound.selector));
        invoiceManager.payInvoice(INVOICE_ID);
    }

    function test_IsInvoicePaid() public {
        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, DUE_AT);

        assertEq(invoiceManager.isInvoicePaid(INVOICE_ID), false);

        vm.prank(payer);
        usdc.approve(address(invoiceManager), AMOUNT);

        vm.prank(payer);
        invoiceManager.payInvoice(INVOICE_ID);

        assertEq(invoiceManager.isInvoicePaid(INVOICE_ID), true);
    }

    // ============================================
    // ERC-20 Failure Behavior Tests
    // ============================================

    function test_Erc20ReturnsFalse() public {
        MockUSDC faultyToken = new MockUSDC();
        faultyToken.mint(payer, AMOUNT);

        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(faultyToken), AMOUNT, DUE_AT);

        vm.prank(payer);
        faultyToken.approve(address(invoiceManager), AMOUNT);

        // Set token to return false on transfer
        vm.prank(payer);
        faultyToken.setReturnFalseOnTransfer(true);

        vm.prank(payer);
        vm.expectRevert(abi.encodeWithSelector(InvoiceManager.PaymentFailed.selector));
        invoiceManager.payInvoice(INVOICE_ID);
    }

    function test_Erc20Reverts() public {
        MockUSDC faultyToken = new MockUSDC();
        faultyToken.mint(payer, AMOUNT);

        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(faultyToken), AMOUNT, DUE_AT);

        vm.prank(payer);
        faultyToken.approve(address(invoiceManager), AMOUNT);

        // Set token to revert on transfer
        vm.prank(payer);
        faultyToken.setRevertOnTransfer(true);

        vm.prank(payer);
        vm.expectRevert(abi.encodeWithSelector(InvoiceManager.PaymentFailed.selector));
        invoiceManager.payInvoice(INVOICE_ID);
    }

    function test_InsufficientAllowance() public {
        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, DUE_AT);

        // Approve only half the amount
        vm.prank(payer);
        usdc.approve(address(invoiceManager), AMOUNT / 2);

        vm.prank(payer);
        vm.expectRevert("ERC20: insufficient allowance");
        invoiceManager.payInvoice(INVOICE_ID);
    }

    function test_InsufficientBalance() public {
        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(usdc), AMOUNT, DUE_AT);

        // Payer doesn't have enough balance
        vm.prank(payer);
        usdc.transfer(other, usdc.balanceOf(payer) - 1);

        vm.prank(payer);
        usdc.approve(address(invoiceManager), AMOUNT);

        vm.prank(payer);
        vm.expectRevert("ERC20: insufficient balance");
        invoiceManager.payInvoice(INVOICE_ID);
    }

    // ============================================
    // Merchant Invoices Tests
    // ============================================

    function test_GetMerchantInvoices() public {
        bytes32[] memory invoiceIds = new bytes32[](3);
        invoiceIds[0] = keccak256(abi.encodePacked("invoice-1"));
        invoiceIds[1] = keccak256(abi.encodePacked("invoice-2"));
        invoiceIds[2] = keccak256(abi.encodePacked("invoice-3"));

        vm.prank(merchant);
        invoiceManager.createInvoice(invoiceIds[0], address(usdc), AMOUNT, DUE_AT);

        vm.prank(merchant);
        invoiceManager.createInvoice(invoiceIds[1], address(usdc), AMOUNT * 2, DUE_AT);

        vm.prank(other);
        invoiceManager.createInvoice(invoiceIds[2], address(usdc), AMOUNT * 3, DUE_AT);

        InvoiceManager.Invoice[] memory invoices =
            invoiceManager.getMerchantInvoices(merchant, invoiceIds);

        assertEq(invoices.length, 2);
        assertEq(invoices[0].merchant, merchant);
        assertEq(invoices[1].merchant, merchant);
        assertEq(invoices[2].merchant, address(0)); // Not merchant's invoice
    }

    // ============================================
    // Reentrancy Protection Tests
    // ============================================

    function test_ReentrancyGuard() public {
        // Create a malicious token that tries to re-enter the contract
        MaliciousReentrantToken reentrantToken = new MaliciousReentrantToken(invoiceManager, INVOICE_ID);
        reentrantToken.mint(payer, AMOUNT);

        vm.prank(merchant);
        invoiceManager.createInvoice(INVOICE_ID, address(reentrantToken), AMOUNT, DUE_AT);

        vm.prank(payer);
        reentrantToken.approve(address(invoiceManager), AMOUNT);

        vm.prank(payer);
        vm.expectRevert();
        reentrantToken.attemptPayment();
    }
}

// Malicious token that attempts reentrancy
contract MaliciousReentrantToken is IERC20 {
    InvoiceManager public invoiceManager;
    bytes32 public invoiceId;

    constructor(InvoiceManager _invoiceManager, bytes32 _invoiceId) {
        invoiceManager = _invoiceManager;
        invoiceId = _invoiceId;
    }

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function attemptPayment() external {
        // First transfer
        balanceOf[msg.sender] -= 100 ether;
        balanceOf[address(invoiceManager)] += 100 ether;
        emit Transfer(msg.sender, address(invoiceManager), 100 ether);

        // Try to re-enter by paying the invoice again
        invoiceManager.payInvoice(invoiceId);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        return true;
    }

    function transferFrom(address, address, uint256) external returns (bool) {
        return true;
    }
}
