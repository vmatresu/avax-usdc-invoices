# Creating Invoices - Merchant Guide

Complete guide for merchants to create and manage invoices on Avalanche USDC Invoices platform.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Creating Your First Invoice](#creating-your-first-invoice)
4. [Invoice Parameters](#invoice-parameters)
5. [Managing Invoices](#managing-invoices)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

### What is an Invoice?

An invoice in this system is an on-chain record that:
- Lives permanently on the Avalanche blockchain
- Stores invoice details (amount, due date, merchant address)
- Enables direct USDC payments from customers
- Provides verifiable payment receipts
- Cannot be altered or deleted once created

### Key Features

- **On-Chain**: All invoice data stored on blockchain
- **Immutable**: Invoice details cannot be changed
- **Verifiable**: Complete payment audit trail
- **Direct**: Funds transfer directly to your wallet
- **Secure**: Smart contract enforces payment rules

### Invoice Lifecycle

1. **Create**: You create an invoice on-chain
2. **Share**: Send invoice ID/URL to customer
3. **Pay**: Customer pays invoice using USDC
4. **Verify**: Payment confirmed on blockchain
5. **Receipt**: Both parties receive verifiable receipt

## Prerequisites

### Required

- **Avalanche Wallet**: MetaMask, WalletConnect, or Web3 wallet
- **Native USDC**: Fuji testnet USDC for testing, mainnet for production
- **AVAX**: Small amount of AVAX for gas fees
- **Wallet Connected**: Wallet must be connected to platform
- **Correct Network**: Connected to Avalanche (Fuji or Mainnet)

### Getting Test USDC

1. **Get Fuji Testnet AVAX**
   - Visit [Avalanche Faucet](https://faucet.avax.network/)
   - Connect wallet
   - Request test AVAX

2. **Get Fuji Testnet USDC**
   - Visit [Circle Faucet](https://faucet.circle.com/)
   - Select Avalanche Fuji
   - Request test USDC

### Network Configuration

- **Testnet**: Avalanche Fuji (Chain ID: 43113)
- **Mainnet**: Avalanche C-Chain (Chain ID: 43114)

## Creating Your First Invoice

### Step 1: Navigate to Dashboard

1. Connect your wallet to the platform
2. Click on "Merchant Dashboard" in navigation
3. Verify your wallet address is displayed correctly

### Step 2: Click Create Invoice

1. Click the "Create New Invoice" button
2. Invoice creation form will appear

### Step 3: Fill Invoice Details

**Required Fields**:
- **Amount**: Invoice amount in USDC
- **Currency**: Automatically USDC (6 decimals)
- **Due Date**: Payment deadline (optional)
- **Description**: Invoice details for customer (optional)

### Step 4: Review and Confirm

1. Review all invoice details
2. Check amount and due date
3. Click "Create Invoice" button
4. Confirm transaction in your wallet

### Step 5: Receive Invoice ID

After successful creation:
1. Invoice ID (bytes32) will be displayed
2. Invoice URL will be generated
3. Share with customer

## Invoice Parameters

### Amount

**Format**: USDC with 6 decimal places
**Range**: 0.000001 to 1,000,000,000 USDC

**Examples**:
- `1` = 1 USDC
- `10.50` = 10.50 USDC
- `1000.25` = 1,000.25 USDC

**Validation**:
- Minimum: 0.000001 USDC (1 wei)
- Maximum: 1,000,000,000 USDC

### Due Date

**Format**: Unix timestamp (seconds)
**Optional**: Set to 0 for no expiration

**Examples**:
- 1 hour from now: `now + 3600`
- 24 hours from now: `now + 86400`
- 7 days from now: `now + 604800`
- 30 days from now: `now + 2592000`
- No expiration: `0`

**Constraints**:
- Minimum: 1 hour from now
- Maximum: 365 days from now

### Description

**Format**: Plain text string
**Length**: Up to 200 characters
**Optional**: Yes

**Purpose**:
- Help customer identify invoice
- Reference your internal invoice number
- Add payment notes or instructions

## Managing Invoices

### Viewing Your Invoices

1. Navigate to "Merchant Dashboard"
2. All your invoices are listed
3. Filter by status (Pending, Paid, Expired)

### Invoice Statuses

**Pending**
- Invoice created but not yet paid
- Customer has not completed payment
- You can share invoice with customer

**Paid**
- Invoice has been paid
- Funds transferred to your wallet
- Payment receipt available

**Expired**
- Invoice passed due date
- Cannot be paid anymore
- Create new invoice if needed

### Sharing Invoices

**Via Invoice URL**
1. Copy invoice URL from dashboard
2. Send to customer via email/chat
3. Customer can pay directly

**Via Invoice ID**
1. Copy invoice ID (bytes32)
2. Provide to customer
3. Customer enters ID on platform

**Via QR Code** (Future Feature)
- Generate QR code for invoice
- Customer scans to pay
- Quick and convenient

### Verifying Payments

**Automatic Verification**
- Platform automatically checks payment status
- Dashboard updates in real-time
- No manual verification needed

**On-Chain Verification**
- Check blockchain explorer
- Search by invoice ID or transaction hash
- View complete payment details

**Receipts**
- Both merchant and customer receive receipt
- Includes transaction hash and event details
- Permanently stored on blockchain

## Best Practices

### Invoice Creation

**✅ Use Descriptive Amounts**
- Round to 2 decimal places when possible
- `10.00` USDC instead of `10.001234` USDC
- Easier for customers to understand

**✅ Set Appropriate Due Dates**
- For immediate payment: 24-48 hours
- For standard invoices: 7-14 days
- For long-term contracts: 30 days

**✅ Add Clear Descriptions**
- Include your internal invoice number
- Reference customer name/project
- Add payment instructions if needed

**✅ Test on Fuji First**
- Create test invoices on Fuji testnet
- Use test USDC and test AVAX
- Verify flow before mainnet deployment

### Invoice Management

**✅ Regularly Check Status**
- Visit dashboard daily
- Monitor pending invoices
- Follow up with customers as needed

**✅ Keep Records**
- Save invoice IDs
- Export transaction hashes
- Keep receipts for accounting

**✅ Communicate Clearly**
- Share invoice URLs promptly
- Explain payment process to customers
- Provide support for payment issues

**❌ Don't Create Duplicate Invoices**
- Each invoice ID is unique
- Duplicate invoices waste gas
- Check existing invoices before creating new ones

### Security

**✅ Protect Your Wallet**
- Never share private keys
- Use hardware wallet for large amounts
- Verify all transactions before signing

**✅ Verify Contract Address**
- Ensure correct contract address
- Check on Avalanche explorer
- Confirm before approving payments

**✅ Keep Testnet Separate**
- Use separate wallet for testnet
- Don't mix test and mainnet funds
- Clear testnet after testing

## Troubleshooting

### Common Issues

**Issue: Transaction Failed**

**Possible Causes**:
- Insufficient gas fees (AVAX)
- Invalid amount (below minimum)
- Invalid due date (outside allowed range)
- Network connection issues

**Solutions**:
```bash
1. Check your AVAX balance for gas fees
2. Ensure amount is between 0.000001 and 1,000,000,000 USDC
3. Verify due date is between 1 hour and 365 days
4. Check you're on correct network (Fuji/Mainnet)
5. Refresh page and try again
```

**Issue: Invoice Not Appearing**

**Possible Causes**:
- Transaction still pending
- Transaction failed
- Incorrect wallet address
- Network congestion

**Solutions**:
```bash
1. Wait 1-2 minutes for transaction confirmation
2. Check transaction status on Avalanche explorer
3. Verify wallet address is correct
4. Refresh page
5. Contact support if issue persists
```

**Issue: Cannot Find Invoice**

**Possible Causes**:
- Wrong invoice ID
- Invoice created by different address
- Invoice expired
- Network mismatch

**Solutions**:
```bash
1. Double-check invoice ID (bytes32)
2. Verify you're logged in with correct wallet
3. Check invoice status (might be expired)
4. Ensure you're on correct network (Fuji/Mainnet)
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

## Advanced Topics

### Batch Invoice Creation

For multiple invoices:
1. Create each invoice individually
2. Save all invoice IDs
3. Share with respective customers
4. Track all invoices in dashboard

### Custom Invoice Flows

**Integration with Your System**:
1. Use web3 library to interact with contract
2. Call `createInvoice` function programmatically
3. Generate invoice IDs automatically
4. Integrate with your accounting system

**API Integration** (Future):
1. Get API key from platform
2. Use REST endpoints to create invoices
3. Automate invoice creation
4. Sync with your database

### Webhook Notifications

**Stay Updated** (Future Feature):
- Configure webhooks for payment events
- Receive notifications when invoices are paid
- Automate accounting and order fulfillment
- Integrate with your systems

## Summary

### Key Takeaways

1. **On-Chain**: All invoices live on blockchain
2. **Immutable**: Cannot be changed once created
3. **Verifiable**: Complete audit trail
4. **Direct**: Funds transfer to your wallet
5. **Secure**: Smart contract enforces rules

### Getting Started Checklist

- [ ] Connect wallet to platform
- [ ] Get test USDC and AVAX (for testing)
- [ ] Create first test invoice on Fuji
- [ ] Share invoice with test customer
- [ ] Verify payment receipt
- [ ] Practice with multiple test invoices
- [ ] Move to mainnet when ready

### Resources

- [InvoiceManager Contract Documentation](../../contracts/invoice-manager.md)
- [System Architecture](../../architecture/overview.md)

- [Customer Guide - Paying Invoices](../customer/paying-invoices.md)

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
