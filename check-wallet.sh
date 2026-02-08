#!/bin/bash

# Check wallet balance for local testing
# Usage: ./check-wallet.sh <WALLET_ADDRESS>

set -e

# Check if wallet address is provided
if [ -z "$1" ]; then
    echo "❌ Error: Wallet address is required"
    echo "Usage: ./check-wallet.sh <WALLET_ADDRESS>"
    echo "Example: ./check-wallet.sh 0x1234567890123456789012345678901234567890"
    exit 1
fi

WALLET_ADDRESS="$1"
USDC_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
RPC_URL="http://localhost:8545"

echo "=== Wallet Status ==="
echo "Address: $WALLET_ADDRESS"
echo ""

# Check if Anvil is running
if ! curl -s "$RPC_URL" > /dev/null; then
    echo "❌ Error: Anvil is not running on $RPC_URL"
    echo "Please start Anvil first: anvil &"
    exit 1
fi

# Check AVAX balance
AVAX_BALANCE=$(cast balance "$WALLET_ADDRESS" --rpc-url "$RPC_URL")
AVAX_ETH=$(node -e "console.log((BigInt('$AVAX_BALANCE') / 1000000000000000000n).toString())")
echo "AVAX Balance: $AVAX_ETH AVAX"

# Check USDC balance
USDC_BALANCE=$(cast call "$USDC_ADDRESS" "balanceOf(address)" "$WALLET_ADDRESS" --rpc-url "$RPC_URL")
USDC_AMOUNT=$(node -e "console.log((BigInt('$USDC_BALANCE') / 1000000n).toString())")
echo "USDC Balance: $USDC_AMOUNT USDC"
echo ""

if [ "$AVAX_ETH" = "0" ] && [ "$USDC_AMOUNT" = "0" ]; then
    echo "❌ Wallet has no balance"
    echo "💡 Fund it with: ./fund-wallet.sh $WALLET_ADDRESS"
else
    echo "✅ Wallet is ready to connect to the dApp!"
fi

echo ""
echo "💡 Make sure MetaMask is configured with:"
echo "   - Network: Local Anvil (Chain ID: 31337)"
echo "   - RPC URL: http://localhost:8545"
