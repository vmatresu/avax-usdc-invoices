# Fuji Testnet Deployment Guide

Complete guide for deploying Avalanche USDC Invoices to the Fuji testnet.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Preparation](#preparation)
3. [Deployment Steps](#deployment-steps)
4. [Verification](#verification)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Foundry**: Latest version
- **Git**: For version control

### Required Accounts

- **GitHub/GitLab account**: For hosting code (optional)
- **Wallet**: MetaMask, WalletConnect, or similar
- **Testnet AVAX**: Get from [Fuji Faucet](https://faucet.avax.network/)
- **Testnet USDC**: Get from [Circle Test Bridge](https://testbridge.circle.com/)

### Recommended Tools

- **VS Code**: Editor with Solidity and TypeScript support
- **Hardhat**: Alternative to Foundry (optional)
- **Postman**: For API testing (optional)

## Preparation

### 1. Clone Repository

```bash
git clone https://github.com/your-org/avax-usdc-invoices.git
cd avax-usdc-invoices
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment

```bash
# Copy environment templates
cp .env.example .env
cp contracts/.env.fuji.example contracts/.env.fuji

# Edit environment files
nano .env
nano contracts/.env.fuji
```

### 4. Configure Environment Variables

**Root `.env`**:
```bash
# Fuji Testnet Configuration
NEXT_PUBLIC_CHAIN_ID=43113
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_EXPLORER_BASE_URL=https://testnet.snowtrace.io

# Fuji Native USDC
NEXT_PUBLIC_USDC_ADDRESS=0x5425890298aed601595a70AB815c96711a31Bc65

# InvoiceManager Contract (set after deployment)
NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=
```

**Contracts `.env.fuji`**:
```bash
# RPC URL
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Deployer Private Key (NEVER commit this!)
PRIVATE_KEY=0x...your_private_key_here
```

### 5. Get Testnet Funds

**Get AVAX**:
1. Visit [Fuji Faucet](https://faucet.avax.network/)
2. Enter your wallet address
3. Complete CAPTCHA
4. Receive 2 AVAX

**Get USDC**:
1. Visit [Circle Test Bridge](https://testbridge.circle.com/)
2. Select Ethereum → Avalanche Fuji
3. Enter amount (e.g., 10,000 USDC)
4. Approve and transfer
5. Receive USDC on Fuji

### 6. Verify Wallet Configuration

- **Network**: Avalanche Fuji Testnet (Chain ID: 43113)
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://testnet.snowtrace.io
- **Currency**: AVAX

## Deployment Steps

### Step 1: Run Contract Tests

Verify contracts work correctly:

```bash
cd contracts
forge test -vv
```

Expected output:
```
[PASS] test_CreateInvoiceHappyPath() (gas: 123456)
[PASS] test_RejectDuplicateInvoiceId() (gas: 89012)
[PASS] test_PayInvoiceHappyPath() (gas: 98765)
...
Test result: ok. 12 passed; 0 failed; finished in 2.34s
```

### Step 2: Build Contracts

Compile contracts to verify no errors:

```bash
forge build
```

Expected output:
```
[⠊] Compiling...
[⠒] Compiling 1 files with 0.8.23
[⠢] Solc 0.8.23 finished in 1.23s
Compiler run successful
```

### Step 3: Deploy InvoiceManager

Deploy the contract to Fuji:

```bash
forge script script/Deploy.s.sol:DeployFuji \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

Expected output:
```
Running 1 script for [Fuji]
DeployFuji
------------------------------------------------------------------------
...
------------------------------------------------------------------------
InvoiceManager deployed to Fuji
========================================
Contract Address: 0x1234567890abcdef1234567890abcdef12345678
Deployer Address: 0xabcdef1234567890abcdef1234567890abcdef12
Network: Avalanche Fuji Testnet (C-Chain)
Chain ID: 43113
========================================
...
Transaction successfully executed.
Gas used: 1234567
```

### Step 4: Copy Contract Address

Copy the deployed contract address from the output:

```
Contract Address: 0xYourDeployedContractAddress
```

### Step 5: Update Environment

Add the contract address to root `.env`:

```bash
NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=0xYourDeployedContractAddress
```

### Step 6: Generate Deployment Info

Generate deployment information for the web app:

```bash
cd contracts
pnpm generate-deployment-info
cd ..
```

Expected output:
```
Deployment info written to: packages/shared/deployment-info.json
{
  "network": "FUJI",
  "address": "0xYourDeployedContractAddress",
  "transactionHash": "0x...",
  "blockNumber": 12345678,
  "deployedAt": "2024-01-15T10:30:00.000Z"
}
```

### Step 7: Verify Deployment

Verify the contract is deployed and working:

```bash
# Check contract exists
cast code $NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS --rpc-url $RPC_URL

# Check contract is not empty (should have code)
# Output: 0x60806040... (non-empty)
```

## Verification

### 1. Block Explorer Verification

Visit [Snowtrace Testnet](https://testnet.snowtrace.io/):

1. Search for your contract address
2. Verify contract is deployed
3. Check transaction hash matches deployment
4. Verify contract code is visible

### 2. Contract Verification

Ensure contract is verified on the block explorer:

1. Go to contract page on Snowtrace
2. Click "Verify and Publish"
3. Select "Solidity (Standard-JSON-Input)"
4. Upload verification file (usually in `broadcast/` directory)
5. Submit and wait for verification

### 3. Function Verification

Verify key functions exist:

```bash
# Check if createInvoice exists
cast call $NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS \
  "supportsInterface(bytes4)" \
  0x... \
  --rpc-url $RPC_URL
```

### 4. Event Verification

Verify events are emitted correctly:

```bash
# Query InvoiceCreated events (after creating test invoice)
cast logs --from-block $DEPLOY_BLOCK \
  --address $NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS \
  --rpc-url $RPC_URL
```

## Testing

### 1. Start Development Server

Run the web app locally:

```bash
pnpm dev
```

Visit `http://localhost:3000`

### 2. Connect Wallet

1. Click "Connect Wallet" button
2. Select your wallet (MetaMask, etc.)
3. Approve connection request
4. Verify network shows "Fuji Testnet"

### 3. Create Test Invoice

1. Go to `/merchant` page
2. Click "Create Invoice"
3. Enter amount (e.g., 10 USDC)
4. Set due date (optional)
5. Click "Create Invoice"

Expected result:
- Invoice created successfully
- Transaction confirmed
- Invoice appears in list

### 4. Pay Test Invoice

1. Click "View" on your invoice
2. Verify invoice details
3. Click "Approve USDC"
4. Approve transaction in wallet
5. Wait for confirmation
6. Click "Pay Invoice"
7. Confirm transaction in wallet

Expected result:
- Payment successful
- Invoice marked as "Paid"
- Receipt visible

### 5. Verify Receipt

1. Click "View Full Receipt"
2. Verify transaction hash
3. Check block number
4. Verify amount matches invoice
5. Verify timestamp is recent

### 6. Check Blockchain

Verify transactions on block explorer:

1. Go to [Snowtrace Testnet](https://testnet.snowtrace.io/)
2. Search for your wallet address
3. Verify createInvoice transaction
4. Verify approve transaction
5. Verify payInvoice transaction

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract address saved to `.env`
- [ ] Deployment info generated
- [ ] Contract verified on block explorer
- [ ] Web app connects to wallet
- [ ] Can create invoice
- [ ] Can pay invoice
- [ ] Receipts display correctly
- [ ] Transactions visible on explorer
- [ ] Gas fees reasonable
- [ ] No errors in console
- [ ] All tests passing

## Troubleshooting

### Deployment Fails

**Error**: "Insufficient funds for gas"

**Solution**:
1. Check AVAX balance on Fuji
2. Get more from [faucet](https://faucet.avax.network/)
3. Estimate gas before deploying:
   ```bash
   forge script script/Deploy.s.sol:DeployFuji --dry-run
   ```

**Error**: "RPC timeout"

**Solution**:
1. Try different RPC URL:
   ```bash
   RPC_URL=https://rpc.ankr.com/avalanche_fuji
   ```
2. Use local node (if available)
3. Check internet connection

### Contract Not Found

**Error**: "Contract not found"

**Solution**:
1. Verify contract address is correct
2. Check deployment transaction on explorer
3. Wait for block confirmation
4. Check chain ID matches Fuji (43113)

### Payment Fails

**Error**: "Insufficient allowance"

**Solution**:
1. Approve USDC before paying
2. Check allowance amount:
   ```bash
   cast call $USDC_ADDRESS \
     "allowance(address,address)(uint256)" \
     $YOUR_WALLET_ADDRESS $INVOICE_MANAGER_ADDRESS \
     --rpc-url $RPC_URL
   ```
3. Approve exact amount (not infinite)

**Error**: "Insufficient balance"

**Solution**:
1. Check USDC balance
2. Get more testnet USDC
3. Verify balance >= invoice amount

**Error**: "Invoice expired"

**Solution**:
1. Check due date
2. Create new invoice with later date
3. Contact merchant to extend due date

### Web App Issues

**Error**: "Wrong network"

**Solution**:
1. Switch wallet to Fuji Testnet
2. Refresh page
3. Verify chain ID is 43113

**Error**: "Contract address not configured"

**Solution**:
1. Check `.env` has `NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS`
2. Restart development server
3. Clear browser cache

## Next Steps

After successful Fuji deployment:

1. **Test Thoroughly**: Create multiple invoices, test all scenarios
2. **Get Testnet Users**: Have friends/colleagues test payment flow
3. **Monitor Gas**: Track gas usage and optimize if needed
4. **Prepare for Mainnet**: Document Fuji deployment process
5. **Plan Mainnet Deployment**: (Mainnet guide coming soon)

## Mainnet Migration

When ready for mainnet:

1. **Audit Contract**: Get professional security audit
2. **Test on Fuji**: Run comprehensive tests
3. **Deploy to Mainnet**: Deploy the same contracts to Avalanche C-Chain Mainnet
4. **Verify on Mainnet**: Check contract on [Snowtrace](https://snowtrace.io/)
5. **Monitor Transactions**: Watch for issues
6. **Provide Support**: Help users with migration

## Additional Resources

- [Avalanche Fuji Documentation](https://docs.avax.network/learn/platform-overview/avalanche-c-chain#testnet)
- [Fuji Faucet](https://faucet.avax.network/)
- [Circle Test Bridge](https://testbridge.circle.com/)
- [Snowtrace Testnet](https://testnet.snowtrace.io/)
- [Foundry Deployment Guide](https://book.getfoundry.sh/deployment/deploying-contracts)

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Architecture Documentation](../architecture/overview.md)
3. Check [Contract Documentation](../contracts/invoice-manager.md)
4. Search [GitHub Issues](https://github.com/your-org/avax-usdc-invoices/issues)
5. Contact support team

---

- [Contract Deployment](./fuji.md)
