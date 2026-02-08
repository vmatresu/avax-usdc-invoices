# Wallet Funding Scripts

These scripts help you fund wallets for local testing without hardcoding addresses in the repository.

## Security Notes

⚠️ **IMPORTANT**: Never commit wallet addresses or private keys to the repository!

- Wallet addresses are passed as command-line arguments only
- No addresses are stored in files or git history
- Scripts use only the default Anvil test account private key for local testing

## Usage

### Fund a Wallet

```bash
./fund-wallet.sh <WALLET_ADDRESS>
```

Example:
```bash
./fund-wallet.sh 0x1234567890123456789012345678901234567890
```

This will:
- Mint 10,000,000 USDC to the wallet
- Send 1 AVAX for gas fees
- Verify the final balances

### Check Wallet Balance

```bash
./check-wallet.sh <WALLET_ADDRESS>
```

Example:
```bash
./check-wallet.sh 0x1234567890123456789012345678901234567890
```

This will show:
- Current AVAX balance
- Current USDC balance
- Connection instructions

## Prerequisites

1. **Anvil running**: `anvil &`
2. **MockUSDC deployed**: `cd contracts && forge script script/DeployMockUSDC.s.sol --rpc-url http://localhost:8545 --broadcast`

## MetaMask Configuration

To connect your funded wallet to the dApp:

1. **Add Local Network**:
   - Network Name: Local Anvil
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: AVAX

2. **Import Wallet**:
   - Use your wallet's private key
   - Make sure you're on the "Local Anvil" network

3. **Connect to dApp**:
   - Visit http://localhost:3000
   - Click "Connect Wallet"
   - Select MetaMask

## Troubleshooting

- **"Anvil is not running"**: Start Anvil with `anvil &`
- **"MockUSDC contract not found"**: Deploy the contract first
- **"Insufficient balance"**: Run the fund script again

## Clean Up

The scripts automatically clean up temporary files and don't store any sensitive information.
