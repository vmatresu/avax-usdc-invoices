# Local Development Guide

Complete guide for local development with Anvil blockchain and the InvoiceManager dApp.

## Overview

Local development allows you to test the InvoiceManager smart contract and web application without spending real money on testnet or mainnet. This guide covers:

- Setting up local blockchain with Anvil
- Deploying contracts locally
- Configuring the web application
- Testing the complete workflow

## Prerequisites

- [Foundry](https://book.getfoundry.sh/) installed
- [Node.js](https://nodejs.org/) >= 18.0.0
- [MetaMask](https://metamask.io/) browser extension
- Code from the main repository

## Quick Start

```bash
# 1. Start local blockchain
anvil &

# 2. Deploy contract locally
cd contracts
forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://localhost:8545 --broadcast

# 3. Start web app
cd ../apps/web
npm run dev
```

Visit `http://localhost:3000` and follow the wallet setup instructions below.

## Detailed Setup

### Step 1: Start Local Blockchain

```bash
# Start Anvil in the background
anvil &

# You should see output like:
# Available Accounts
# (0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
# Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# 
# Listening on 127.0.0.1:8545
```

**Key Information**:
- RPC URL: `http://localhost:8545`
- Chain ID: `31337`
- Test accounts with 10,000 ETH each

### Step 2: Deploy Contract Locally

```bash
cd contracts

# Deploy the InvoiceManager contract
forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://localhost:8545 --broadcast
```

**Expected Output**:
```
Script ran successfully.

== Return ==
0: contract InvoiceManager 0x5FbDB2315678afecb367f032d93F642f64180aa3

== Logs ==
========================================
InvoiceManager deployed locally
========================================
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deployer Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Network: Local Anvil
Chain ID: 31337
========================================
```

**Save the contract address** - you'll need it for configuration.

### Step 3: Configure Web Application

Create a local environment file:

```bash
# In the root directory
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local` with your local deployment details:

```bash
# Local network configuration
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_USDC_ADDRESS=0x5425890298aed601595a70AB815c96711a31Bc65
NEXT_PUBLIC_EXPLORER_BASE_URL=http://localhost:8545
NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Note**: The USDC address uses the Fuji testnet address for local testing purposes.

### Step 4: Configure MetaMask

1. **Add Local Network to MetaMask**:
   - Open MetaMask
   - Click on the network dropdown
   - Click "Add Network" → "Add a network manually"
   - Enter these details:
     - **Network Name**: Local Anvil
     - **New RPC URL**: `http://localhost:8545`
     - **Chain ID**: `31337`
     - **Currency Symbol**: `ETH`
     - **Block Explorer URL**: `http://localhost:8545` (optional)

2. **Import Test Account**:
   - In MetaMask, click on your account icon
   - Select "Import Account"
   - Enter the private key from Anvil output:
     ```
     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
     ```
   - The imported address should be: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

### Step 5: Start Web Application

```bash
cd apps/web
npm run dev
```

You should see:
```
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 1119ms
```

## Testing the Application

### Create Test Invoice

1. **Connect Wallet**:
   - Visit `http://localhost:3000`
   - Click "Connect Wallet"
   - Select MetaMask
   - Switch to "Local Anvil" network if not already selected

2. **Create Invoice**:
   - Navigate to the "Create Invoice" page
   - Fill in the form:
     - Amount: `100` (100 USDC)
     - Due Date: Select a future date
     - Description: "Test Invoice"
   - Click "Create Invoice"
   - Confirm the transaction in MetaMask

3. **Verify Creation**:
   - Check the Anvil console for transaction details
   - View the invoice in the "My Invoices" section

### Pay Test Invoice

1. **Switch to Payer Account**:
   - Import a second test account from Anvil (Account #1)
   - Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

2. **Pay Invoice**:
   - Navigate to the "Pay Invoice" page
   - Enter the invoice ID or scan the QR code
   - Click "Pay Invoice"
   - Approve USDC spending (if required)
   - Confirm the payment transaction

3. **Verify Payment**:
   - Check that the invoice status changes to "Paid"
   - Verify transaction details in Anvil console
   - Check the "Transaction History" tab

## Development Commands

### Contract Testing

```bash
cd contracts

# Run all tests with gas reporting
forge test --gas-report

# Run specific security tests
forge test --match test_RejectNonUSDCToken -vvv

# Test reentrancy protection
forge test --match test_ReentrancyGuard -vv

# Generate coverage report
forge coverage

# Clean build artifacts
forge clean
```

### Web Application Testing

```bash
cd apps/web

# Start development server
npm run dev

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

### Local Blockchain Management

```bash
# Start Anvil with custom settings
anvil --host 0.0.0.0 --port 8545 &

# Stop Anvil
pkill -f anvil

# Reset blockchain state (stop and restart)
pkill -f anvil && sleep 2 && anvil &
```

## Troubleshooting

### Common Issues

**Issue: "Connection refused" error**
```bash
# Solution: Make sure Anvil is running
anvil &
# Wait a few seconds, then retry
```

**Issue: MetaMask can't connect to local network**
```bash
# Solution: Verify network configuration
# Chain ID: 31337
# RPC URL: http://localhost:8545
# Make sure Anvil is running on the correct port
```

**Issue: Contract address not found**
```bash
# Solution: Check your .env.local file
# Ensure NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS matches deployed contract
# Re-deploy if necessary
```

**Issue: Transaction fails**
```bash
# Solution: Check Anvil console for error details
# Verify account has sufficient ETH balance
# Check contract function parameters
```

### Debugging Tips

1. **Check Anvil Console**: All transaction details appear here
2. **Use MetaMask Console**: Check browser console for web3 errors
3. **Verify Environment**: Ensure `.env.local` is correctly configured
4. **Check Network**: Make sure MetaMask is on the correct network
5. **Review Logs**: Use `-vvv` flag for verbose Foundry output

## Advanced Configuration

### Custom Anvil Configuration

Create a custom Anvil configuration:

```bash
# Start with custom accounts and chain ID
anvil \
  --chain-id 31337 \
  --accounts 10 \
  --balance 10000 \
  --host 0.0.0.0 \
  --port 8545 &
```

### Mock USDC for Testing

For more realistic testing, you can deploy a mock USDC contract:

```bash
# Deploy mock USDC (if not already done)
forge script script/DeployMockUSDC.s.sol --rpc-url http://localhost:8545 --broadcast

# Update .env.local with mock USDC address
NEXT_PUBLIC_USDC_ADDRESS=0xYourMockUSDCAddress
```

### Multiple Test Environments

You can run multiple local environments:

```bash
# Environment 1 (default)
anvil --port 8545 &

# Environment 2
anvil --port 8546 --chain-id 31338 &

# Use different .env files for each environment
cp apps/web/.env.local apps/web/.env.local2
# Edit .env.local2 to use port 8546
```

## Best Practices

1. **Always use test accounts** - never use real private keys locally
2. **Clean up resources** - stop Anvil when done testing
3. **Version control** - never commit `.env.local` files
4. **Regular testing** - run the full test suite before changes
5. **Documentation** - update docs when adding new features

## Next Steps

- Explore the [Architecture Overview](../architecture/overview.md)
- Learn about [Contract Development](../contracts/invoice-manager.md)
- Read the [Deployment Guide](../deployment/fuji.md) for testnet deployment
- Check [Code Style Guide](./code-style.md) for contribution guidelines

---

**Related Documentation**:
- [Development Setup](./setup.md)
- [Testing Guide](./testing.md)
- [Architecture Overview](../architecture/overview.md)
- [Contract Documentation](../contracts/invoice-manager.md)

**Last Updated**: 2026-02-08
**Version**: 1.0.0
