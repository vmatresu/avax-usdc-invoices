# Paying Invoices - Customer Guide

Complete guide for customers to pay invoices and manage payments on Avalanche USDC Invoices platform.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Paying an Invoice](#paying-an-invoice)
4. [Payment Process](#payment-process)
5. [Understanding Approvals](#understanding-approvals)
6. [Receipts and Verification](#receipts-and-verification)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

### How Payment Works

Paying an invoice in this system:
- Transfers USDC directly from your wallet to merchant
- Requires USDC approval before payment
- Confirms payment on blockchain
- Provides verifiable receipt
- No third-party intermediaries

### Key Features

- **Direct Transfer**: USDC moves directly from you to merchant
- **On-Chain**: All payment data stored on blockchain
- **Verifiable**: Complete audit trail with transaction hash
- **Secure**: Smart contract enforces payment rules
- **Instant**: Payment confirmed in minutes

### Payment Flow

1. **Receive Invoice**: Merchant shares invoice ID or URL
2. **View Invoice**: Check amount, due date, and merchant details
3. **Approve USDC**: Authorize platform to spend your USDC
4. **Pay Invoice**: Execute payment transaction
5. **Confirmation**: Payment confirmed on blockchain
6. **Receipt**: Receive verifiable payment receipt

## Prerequisites

### Required

- **Avalanche Wallet**: MetaMask, WalletConnect, or Web3 wallet
- **Native USDC**: Fuji testnet USDC for testing, mainnet for production
- **Sufficient Balance**: Must have invoice amount + gas fees in AVAX
- **Wallet Connected**: Wallet must be connected to platform
- **Correct Network**: Connected to Avalanche (Fuji or Mainnet)

### Getting Test USDC

1. **Get Fuji Testnet AVAX**
   - Visit [Avalanche Faucet](https://faucet.avax.network/)
   - Connect wallet
   - Request test AVAX (used for gas fees)

2. **Get Fuji Testnet USDC**
   - Visit [Circle Faucet](https://faucet.circle.com/)
   - Select Avalanche Fuji
   - Request test USDC
   - Wait for tokens to arrive in wallet

### Network Configuration

- **Testnet**: Avalanche Fuji (Chain ID: 43113)
- **Mainnet**: Avalanche C-Chain (Chain ID: 43114)

### Understanding Balances

**USDC Balance**:
- Used to pay invoice amount
- Must be >= invoice amount
- Must be approved for spending

**AVAX Balance**:
- Used for gas fees (transaction costs)
- Gas fees typically 0.01-0.05 AVAX
- Small amount needed (0.01 AVAX usually sufficient)

## Paying an Invoice

### Step 1: Access Invoice

**Via Invoice URL**
1. Click on invoice link shared by merchant
2. Invoice page will open automatically
3. Verify you're on correct network (Fuji/Mainnet)

**Via Invoice ID**
1. Navigate to platform home page
2. Click on "Pay Invoice" in navigation
3. Enter invoice ID (bytes32 format)
4. Click "Load Invoice"

### Step 2: Review Invoice Details

Check before paying:
- **Merchant Address**: Verify it's the correct merchant
- **Invoice Amount**: Confirm amount matches your records
- **Due Date**: Ensure invoice hasn't expired
- **Description**: Verify invoice details match your expectations

**Invoice Statuses**:
- **Pending**: Ready to pay
- **Paid**: Already paid (you can view receipt)
- **Expired**: Past due date (cannot be paid)

### Step 3: Connect Wallet

1. Click "Connect Wallet" button
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. Authorize wallet connection
4. Verify wallet address is displayed correctly

**Switch Networks if Needed**:
- If you're on wrong network
- Wallet will prompt to switch
- Approve network switch
- Refresh page after switch

### Step 4: Approve USDC

**Why Approval is Required**:
- Platform needs permission to spend your USDC
- Approval is a separate transaction from payment
- Approval transaction costs gas (small AVAX amount)

**Steps**:
1. Click "Approve USDC" button
2. Review approval amount (usually invoice amount or unlimited)
3. Confirm transaction in your wallet
4. Wait for approval confirmation (30-60 seconds)

**Approval Amount Options**:
- **Exact Amount**: Approve exactly invoice amount (safer)
- **Unlimited**: Approve unlimited USDC (convenient, less secure)

**Recommendation**: Use exact amount for first-time payments

### Step 5: Pay Invoice

**Steps**:
1. Click "Pay Invoice" button
2. Review payment details (amount, merchant, gas fee)
3. Confirm transaction in your wallet
4. Wait for payment confirmation (30-60 seconds)

**Payment Details to Verify**:
- **Invoice ID**: Must match your invoice
- **Amount**: Must be correct USDC amount
- **Merchant Address**: Must match invoice merchant
- **Gas Fee**: Review and accept gas cost
- **Network**: Must be correct (Fuji/Mainnet)

### Step 6: Receive Confirmation

**On Confirmation**:
1. Payment status changes to "Paid"
2. Transaction hash displayed
3. Receipt page available
4. Both you and merchant can view receipt

**Save Your Receipt**:
- Copy transaction hash
- Download/save receipt page
- Keep record for your accounting
- Share with merchant if needed

## Payment Process

### Detailed Transaction Flow

**1. Approval Transaction**
```
Your Wallet → USDC Contract → Approve(InvoiceManager, amount)
Time: 30-60 seconds
Cost: 0.01-0.02 AVAX (gas fee)
```

**2. Payment Transaction**
```
Your Wallet → InvoiceManager → PayInvoice(invoiceId)
InvoiceManager → USDC Contract → Transfer(you → merchant, amount)
Time: 30-60 seconds
Cost: 0.02-0.03 AVAX (gas fee)
```

**3. On-Chain Confirmation**
```
Transaction Mined
Payment Event Emitted
Invoice Status Updated to Paid
```

**4. Receipt Generation**
```
Payment Confirmed
Receipt Created
Both Parties Notified
```

### Transaction Times

- **Approval**: 30-60 seconds
- **Payment**: 30-60 seconds
- **Total**: 1-2 minutes
- **Confirmation**: Immediately after transaction mined

### Gas Fees

**Estimated Costs** (Fuji Testnet):
- Approval: ~0.01 AVAX
- Payment: ~0.02 AVAX
- **Total**: ~0.03 AVAX

**Estimated Costs** (Avalanche Mainnet):
- Approval: ~0.01 AVAX
- Payment: ~0.02 AVAX
- **Total**: ~0.03 AVAX

**Note**: Gas fees vary based on network congestion.

## Understanding Approvals

### What is USDC Approval?

**Definition**:
- Authorization for a contract to spend your USDC
- Required before contract can transfer your tokens
- Standard ERC20 token mechanism

**How it Works**:
```
1. You call approve(spender, amount)
2. USDC contract records approval
3. Spender (InvoiceManager) can transfer approved amount
4. Approval can be revoked or updated
```

### Approval Amounts

**Exact Amount Approval**
```
Approve(InvoiceManager, 100 USDC)
- Safer (contract can only spend 100 USDC)
- Need new approval for larger payments
- Recommended for new users
```

**Unlimited Approval**
```
Approve(InvoiceManager, unlimited)
- Convenient (one approval for all future payments)
- Riskier (contract can spend all your USDC)
- Only use with trusted platforms
```

### Approval Security

**Risks**:
- **Rogue Contracts**: Could drain your USDC if approved
- **Compromised Platform**: Could misuse unlimited approvals

**Best Practices**:
1. Use exact amount approvals when possible
2. Only approve for trusted platforms
3. Revoke approvals after use (if using unlimited)
4. Monitor your USDC approvals regularly

### Revoking Approvals

**How to Revoke**:
```
Approve(InvoiceManager, 0)
- Sets approval to zero
- Contract can no longer spend your USDC
- Can approve again later
```

**When to Revoke**:
- After making payment (if using unlimited)
- If you suspect platform is compromised
- Before stopping use of platform

## Receipts and Verification

### Payment Receipt

**What's Included**:
- Transaction hash (blockchain reference)
- Invoice ID
- Merchant address
- Payer address (your wallet)
- Payment amount
- Payment timestamp
- Block number

**How to Access**:
1. After payment confirmation, click "View Receipt"
2. Receipt page displays all payment details
3. Copy/save transaction hash for records

### On-Chain Verification

**Verify on Avalanche Explorer**:
1. Copy transaction hash from receipt
2. Visit [SnowTrace](https://snowtrace.io/) (mainnet) or [Testnet Explorer](https://testnet.snowtrace.io/)
3. Paste transaction hash
4. View complete transaction details

**Verify via Platform**:
1. Enter invoice ID on platform
2. View invoice status (should show "Paid")
3. Click "View Receipt" to see payment details

### Receipt Information

**Transaction Hash**:
- Unique identifier for blockchain transaction
- Used to verify payment on explorer
- Keep this for your records

**Block Number**:
- Block in which payment was mined
- Provides chronological reference
- Used for blockchain queries

**Timestamp**:
- Date and time of payment confirmation
- Based on block timestamp
- In Unix format (convertible to readable date)

**Amount**:
- USDC amount paid
- Verifiable on blockchain
- Cross-check with your records

### Keeping Records

**Save These Details**:
- [ ] Transaction hash
- [ ] Invoice ID
- [ ] Merchant address
- [ ] Payment amount
- [ ] Payment date/time
- [ ] Receipt screenshot/download

**Use for**:
- Accounting reconciliation
- Tax records
- Dispute resolution
- Payment verification

## Best Practices

### Before Payment

**✅ Verify Invoice Details**
- Double-check merchant address
- Confirm payment amount matches your records
- Check invoice hasn't expired
- Review invoice description

**✅ Test with Small Amounts**
- Use testnet for first-time payments
- Start with small amounts on mainnet
- Verify merchant and platform legitimacy

**✅ Check Your Balances**
- Ensure sufficient USDC for payment
- Ensure sufficient AVAX for gas fees
- Check you're on correct network

**✅ Use Exact Amount Approvals**
- Approve only the payment amount
- Safer than unlimited approvals
- Requires new approval for each payment

### During Payment

**✅ Review Transactions Carefully**
- Check all transaction details before confirming
- Verify merchant address matches invoice
- Confirm payment amount is correct
- Review gas fees

**✅ Wait for Confirmation**
- Don't close browser during transaction
- Wait for both approval and payment confirmation
- Check for transaction completion

**✅ Save Receipt Immediately**
- Copy transaction hash
- Download/save receipt page
- Keep for your records

### After Payment

**✅ Verify Payment on Blockchain**
- Check transaction on Avalanche explorer
- Confirm payment details
- Ensure merchant received funds

**✅ Keep Records**
- Save transaction hash and invoice ID
- Store receipt with your records
- Use for accounting and tax purposes

**✅ Revoke Approvals (if using unlimited)**
- Set approval to zero after payment
- Prevents unauthorized spending
- Can approve again for future payments

### Security

**✅ Protect Your Wallet**
- Never share private keys
- Use hardware wallet for large payments
- Verify all transactions before signing
- Keep wallet software updated

**✅ Be Cautious of Phishing**
- Only use official platform URLs
- Verify invoice URLs before clicking
- Don't enter wallet info on suspicious sites
- Check SSL certificate (https://)

**✅ Use Testnet First**
- Practice paying invoices on Fuji testnet
- Use test USDC (no real value)
- Verify flow before mainnet payments

**❌ Don't Share Private Keys**
- Never reveal your private key or seed phrase
- Legitimate platforms never ask for private keys
- Report any requests for private keys

## Troubleshooting

### Common Issues

**Issue: Approval Transaction Failed**

**Possible Causes**:
- Insufficient AVAX for gas fees
- Network congestion (high gas fees)
- Wrong network (Fuji vs Mainnet)
- Wallet connection issues

**Solutions**:
```bash
1. Check your AVAX balance (need ~0.01 AVAX)
2. Ensure you're on correct network (Fuji/Mainnet)
3. Refresh page and try again
4. Try increasing gas limit in wallet settings
5. Check for wallet connection errors
```

**Issue: Payment Transaction Failed**

**Possible Causes**:
- Insufficient USDC approval
- Insufficient USDC balance
- Insufficient AVAX for gas fees
- Invoice expired
- Invoice already paid

**Solutions**:
```bash
1. Verify USDC approval is sufficient
2. Check your USDC balance (>= invoice amount)
3. Ensure sufficient AVAX for gas fees (~0.02 AVAX)
4. Check invoice status (might be expired or already paid)
5. Try payment again if status is pending
```

**Issue: Invoice Not Found**

**Possible Causes**:
- Wrong invoice ID
- Invoice created on different network
- Invoice deleted/invalid
- Network mismatch

**Solutions**:
```bash
1. Double-check invoice ID (bytes32 format)
2. Ensure you're on correct network (Fuji/Mainnet)
3. Ask merchant to verify invoice details
4. Refresh page and try again
5. Contact merchant if issue persists
```

**Issue: Payment Stuck Pending**

**Possible Causes**:
- Network congestion
- Low gas fee
- Transaction not yet mined

**Solutions**:
```bash
1. Wait 2-5 minutes for transaction to confirm
2. Check transaction status on Avalanche explorer
3. If stuck, can speed up with higher gas fee
4. Do not retry payment until first is resolved
5. Contact support if stuck >10 minutes
```

**Issue: Can't Connect Wallet**

**Possible Causes**:
- Wallet not installed
- Wrong browser
- Extension blocked
- Network issues

**Solutions**:
```bash
1. Install MetaMask or compatible wallet
2. Refresh page after installation
3. Check browser extensions are enabled
4. Try different browser (Chrome, Firefox)
5. Check internet connection
```

### Getting Help

**Support Resources**:
- [GitHub Issues](https://github.com/vmatresu/avax-usdc-invoices/issues)
- [Discord Community](https://discord.gg/)
- [Email Support](mailto:support@example.com)

**When Reporting Issues**:
1. Include your wallet address (truncated is fine)
2. Provide invoice ID
3. Describe what you were doing
4. Include any error messages
5. Share transaction hash if available

### Emergency Situations

**If You Suspect Fraud**:
1. Immediately revoke USDC approvals
2. Contact your wallet provider
3. Report issue to platform support
4. Document all transactions
5. Monitor your accounts

**If Payment Stuck**:
1. Check transaction on Avalanche explorer
2. Wait up to 10 minutes for confirmation
3. Do not attempt second payment
4. Contact support with transaction hash
5. Merchant will see payment status

## Advanced Topics

### Multiple Invoice Payments

**Pay Multiple Invoices**:
1. Use unlimited USDC approval (single approval)
2. Pay each invoice individually
3. All payments use same approval
4. Revoke approval after all payments

**Benefits**:
- Only one approval transaction
- Faster subsequent payments
- Lower total gas fees
- More convenient

### Web3 Integration

**Programmatic Payment** (Developers):
```typescript
// Using web3.js or ethers.js
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const invoiceManager = new ethers.Contract(
  contractAddress,
  abi,
  signer
);

// Approve USDC
const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
await usdc.approve(contractAddress, amount);

// Pay invoice
await invoiceManager.payInvoice(invoiceId);
```

### Automated Payments

**Scheduled Payments** (Future Feature):
1. Set up payment automation
2. Connect to your accounting system
3. Automatically pay invoices on due date
4. Receive confirmation notifications
5. Keep audit trail

## Summary

### Key Takeaways

1. **Direct Transfer**: USDC moves from you to merchant
2. **Approval Required**: Must approve USDC before payment
3. **On-Chain**: All payments recorded on blockchain
4. **Verifiable**: Complete audit trail with receipts
5. **Secure**: Smart contract enforces payment rules

### Getting Started Checklist

- [ ] Get wallet (MetaMask, WalletConnect, etc.)
- [ ] Get test USDC and AVAX (for testing)
- [ ] Connect wallet to platform
- [ ] Practice paying test invoices on Fuji
- [ ] Understand approval process
- [ ] Verify payment on blockchain
- [ ] Save receipts for records
- [ ] Move to mainnet payments when ready

### Resources

- [InvoiceManager Contract Documentation](../../contracts/invoice-manager.md)
- [System Architecture](../../architecture/overview.md)

- [Merchant Guide - Creating Invoices](../merchant/creating-invoices.md)

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
