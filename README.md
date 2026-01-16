# Avalanche USDC Invoices

A minimal, safe-by-default MVP monorepo for on-chain invoice management on Avalanche C-Chain using native USDC. Merchants create invoices on-chain, customers pay in native USDC, and anyone can view a verifiable receipt (tx hash + decoded event + on-chain invoice state).

**Key Features:**
- On-chain invoice creation and payment
- Direct USDC transfers (payer → merchant, funds never sit in contract)
- Verifiable receipts with transaction hashes and decoded events
- No backend, no database, pure on-chain data
- Uses Avalanche C-Chain JSON-RPC via public endpoints

**⚠️ Important: Native USDC Only**

This system is designed for **native USDC (Circle-issued)** only, NOT USDC.e (bridged). Using the wrong token will cause payments to "look paid" but fail integration/off-ramping expectations. See [Native USDC vs USDC.e](#native-usdc-vs-usdce-on-avalanche) below.

## Quickstart

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Foundry (for contracts)
- A wallet with AVAX for gas and USDC on Fuji testnet

### Installation

```bash
cd avax-usdc-invoices
pnpm install
```

### Environment Setup

1. Copy the example environment files:

```bash
cp .env.example .env
cp contracts/.env.fuji.example contracts/.env.fuji
```

2. Fill in the required values:

For root `.env`:
```bash
NEXT_PUBLIC_CHAIN_ID=43113
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_USDC_ADDRESS=0x5425890298aed601595a70AB815c96711a31Bc65
NEXT_PUBLIC_EXPLORER_BASE_URL=https://testnet.snowtrace.io
NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=
```

For Fuji deployment (`contracts/.env.fuji`):
```bash
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_private_key_here
```

### Run Contract Tests

```bash
pnpm test
```

### Deploy to Fuji

1. Ensure you have AVAX on Fuji testnet (get from [faucet](https://faucet.avax.network/))
2. Set your private key in `contracts/.env.fuji`
3. Run deployment:

```bash
pnpm deploy:fuji
```

4. Copy the deployed contract address and update `.env`:

```bash
NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=0xYourDeployedContractAddress
```

5. Generate deployment info for the web app:

```bash
cd contracts
pnpm generate-deployment-info
cd ..
```

### Run the Web App

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the landing page.

## Deploy to Fuji (Detailed Steps)

### 1. Get Testnet AVAX

Visit the [Avalanche Fuji Faucet](https://faucet.avax.network/) and request testnet AVAX.

### 2. Get Testnet USDC

The Fuji native USDC faucet: [https://testbridge.circle.com/](https://testbridge.circle.com/) or use a testnet faucet that provides USDC.

### 3. Configure Environment

Edit `contracts/.env.fuji`:
```bash
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=0x...your_private_key_here
```

⚠️ **Security Warning:** Never commit your private key. The `.env.fuji` file is in `.gitignore`.

### 4. Deploy Contract

```bash
pnpm deploy:fuji
```

You'll see output like:
```
========================================
InvoiceManager deployed to Fuji
========================================
Contract Address: 0x1234567890abcdef1234567890abcdef12345678
Deployer Address: 0xabcdef1234567890abcdef1234567890abcdef12
Network: Avalanche Fuji Testnet (C-Chain)
Chain ID: 43113
========================================
```

### 5. Update Web App Configuration

Edit `.env` (or `.env.local` for development):
```bash
NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=0xYourDeployedContractAddress
```

### 6. Verify Deployment

1. Check the contract on [Snowtrace Testnet](https://testnet.snowtrace.io/)
2. Verify the contract code is deployed
3. Test the web app by creating an invoice

## ERC-20 Approvals Explained

### Why Approval is Needed

Before you can pay an invoice, you must approve the `InvoiceManager` contract to spend your USDC. This is a standard ERC-20 pattern:

1. **Approve:** You authorize `InvoiceManager` to spend a specific amount of your USDC
2. **Pay:** You call `payInvoice()` which triggers the transfer from you to the merchant

### Exact-Amount Approval (Default)

This system uses **exact-amount approval** by default for security:

```solidity
// Approve only the amount needed
usdc.approve(invoiceManagerAddress, invoiceAmount)
```

**Benefits:**
- Limits exposure: The contract can only spend what you approve
- Reduces risk: No risk of draining all your USDC
- Clear audit: Each approval is tied to a specific payment

**Security Note:** Some dapps request infinite approval (`type(uint256).max`), which is convenient but risky. This system avoids that pattern.

### Revoking Approval

If you approved too much or want to revoke:

1. Use the USDC contract on a block explorer
2. Call `approve(invoiceManagerAddress, 0)` to revoke
3. Or approve a smaller amount to reduce your exposure

### Allowance Issues

If you see "insufficient allowance" errors:

1. Check your current allowance:
   ```javascript
   allowance = await usdc.allowance(yourAddress, invoiceManagerAddress)
   ```
2. Approve the exact invoice amount
3. Wait for the approval transaction to confirm before paying

## Native USDC vs USDC.e on Avalanche

### Critical Distinction

Avalanche has **two different USDC tokens**:

| Token | Contract Address | Issuer | Network |
|-------|------------------|--------|---------|
| **Native USDC** | Fuji: `0x5425890298aed601595a70AB815c96711a31Bc65`<br>Mainnet: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | Circle | Native to C-Chain |
| **USDC.e** | Bridge-issued | Bridged from Ethereum | Not native |

### Why This Matters

**Using the wrong token breaks integrations:**

1. **Payment Success ≠ Valid Payment:** A customer might pay with USDC.e, the contract accepts it, but:
   - Off-ramps won't recognize USDC.e
   - Exchange integrations fail
   - Accounting systems show discrepancies
   - The merchant can't use the funds as expected

2. **Different Contracts:** The addresses are completely different. You must verify the contract address.

3. **Liquidity Issues:** USDC.e may have different liquidity and trading pairs.

### How to Verify Token Address

**Before deploying or using the system:**

1. Check [Circle's USDC Contract Addresses](https://www.circle.com/usdc#networks)
2. Verify against the explorer:
   - [Snowtrace Fuji](https://testnet.snowtrace.io/token/0x5425890298aed601595a70AB815c96711a31Bc65)
   - [Snowtrace Mainnet](https://snowtrace.io/token/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E)
3. Confirm the token symbol is "USDC" (not "USDC.e")

### Guidance for Merchants

**Before creating invoices:**

1. **Verify the USDC address** in your environment matches Circle's native USDC
2. **Display the token address** on your invoice page for transparency
3. **Educate customers** to use native USDC, not USDC.e
4. **Include warnings** if you detect the wrong token

**To tell customers:**

> "Please pay using native USDC (Circle-issued), NOT USDC.e. Check the token contract address before transferring."

### Resources

- [Circle USDC Documentation](https://www.circle.com/usdc)
- [Avalanche USDC vs USDC.e](https://docs.avax.network/learn/platform-overview/avalanche-c-chain#mainnet-tokens)
- [Snowtrace Token List](https://snowtrace.io/tokens)

## Troubleshooting

### Common RPC Issues

**Error: "Could not detect network"**

- Verify `NEXT_PUBLIC_RPC_URL` is correct
- Check if the RPC endpoint is accessible: `curl https://api.avax-test.network/ext/bc/C/rpc -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'`
- Try a different RPC endpoint or use a local node

**Error: "Request timeout"**

- The public RPC may be rate-limited
- Consider using a paid RPC service (e.g., Alchemy, QuickNode) for production

### Chain Mismatch

**Error: "Wrong network" or "Chain ID mismatch"**

1. **Check your wallet network:**
   - Fuji: Chain ID `43113`
   - Mainnet: Chain ID `43114`

2. **Switch networks:**
   - MetaMask: Network dropdown → Add Network → Avalanche
   - WalletConnect: Prompt will appear automatically

3. **Verify environment:**
   ```bash
   NEXT_PUBLIC_CHAIN_ID=43113  # Fuji
   # or
   NEXT_PUBLIC_CHAIN_ID=43114  # Mainnet
   ```

### Insufficient AVAX for Gas

**Error: "insufficient funds for gas"**

1. **Get AVAX:**
   - Fuji: [Faucet](https://faucet.avax.network/)
   - Mainnet: Buy from an exchange

2. **Estimate gas costs:**
   - Create invoice: ~0.001 AVAX
   - Approve USDC: ~0.0001 AVAX
   - Pay invoice: ~0.001 AVAX

3. **Check your balance:**
   ```javascript
   balance = await publicClient.getBalance(address)
   ```

### Allowance Problems

**Error: "ERC20: insufficient allowance"**

1. **Check current allowance:**
   ```javascript
   allowance = await publicClient.readContract({
     address: usdcAddress,
     abi: erc20Abi,
     functionName: 'allowance',
     args: [yourAddress, invoiceManagerAddress]
   })
   ```

2. **Approve the exact amount:**
   - Go to the payment page
   - Click "Approve USDC"
   - Wait for transaction confirmation
   - Then click "Pay Invoice"

3. **Common mistakes:**
   - Forgetting to approve before paying
   - Approving an amount less than the invoice
   - Using the wrong USDC contract address

### Invoice Not Found

**Error: "Invoice not found"**

1. **Verify the invoice ID:**
   - Check the URL: `/pay/[invoiceId]` or `/receipt/[invoiceId]`
   - The invoice ID is a 64-character hex string (bytes32)

2. **Check the contract address:**
   ```bash
   NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=0x...
   ```

3. **Verify the invoice exists:**
   ```javascript
   const exists = await publicClient.readContract({
     address: invoiceManagerAddress,
     abi: invoiceManagerAbi,
     functionName: 'invoiceExists',
     args: [invoiceId]
   })
   ```

### Payment Failed

**Error: "Payment failed"**

1. **Check allowance:** See "Allowance Problems" above

2. **Check USDC balance:**
   ```javascript
   balance = await publicClient.readContract({
     address: usdcAddress,
     abi: erc20Abi,
     functionName: 'balanceOf',
     args: [yourAddress]
   })
   ```

3. **Check invoice status:**
   - Is the invoice already paid?
   - Is the invoice expired? (past due date)

4. **Verify USDC token address:**
   - Must be native USDC, not USDC.e
   - Check Circle's [official addresses](https://www.circle.com/usdc#networks)

## Project Structure

```
avax-usdc-invoices/
├── contracts/                 # Foundry smart contracts
│   ├── src/
│   │   └── InvoiceManager.sol
│   ├── test/
│   │   └── InvoiceManager.t.sol
│   ├── script/
│   │   ├── Deploy.s.sol
│   │   └── generate-deployment-info.js
│   ├── foundry.toml
│   └── package.json
├── packages/
│   └── shared/               # Shared types and ABIs
│       ├── index.ts
│       ├── tsconfig.json
│       └── package.json
├── apps/
│   └── web/                  # Next.js 14 frontend
│       ├── app/
│       │   ├── page.tsx               # Landing page
│       │   ├── merchant/
│       │   │   └── page.tsx           # Merchant dashboard
│       │   ├── pay/[invoiceId]/
│       │   │   └── page.tsx           # Payment page
│       │   ├── receipt/[invoiceId]/
│       │   │   └── page.tsx           # Receipt page
│       │   ├── api/
│       │   │   └── invoices/
│       │   │       └── route.ts       # API for invoice queries
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── components/
│       │   └── ui/                    # UI components
│       ├── lib/
│       │   ├── wagmi.ts               # Wagmi config
│       │   ├── contracts.ts           # Contract ABIs
│       │   └── utils.ts               # Utility functions
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       └── next.config.mjs
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # PNPM workspace config
├── .env.example               # Environment template
└── README.md                  # This file
```

## Security Considerations

### Smart Contract Security

1. **ReentrancyGuard:** Prevents reentrancy attacks during payment
2. **SafeERC20:** Handles non-standard token return values
3. **No Admin Keys:** No upgradability, no special privileges
4. **Direct Transfers:** Funds never sit in the contract
5. **State Validation:** Strict checks on all state transitions

### Frontend Security

1. **Type-Safe Contracts:** Viem provides type-safe contract interactions
2. **Chain Mismatch Detection:** Prompts users to switch networks
3. **Exact Approval:** Never requests infinite approval
4. **Input Validation:** All user inputs are validated before transactions
5. **No Secrets:** No private keys or secrets in the frontend

### Best Practices

1. **Always verify token addresses** before deployment
2. **Use exact-amount approvals** for security
3. **Never share private keys** or commit them to git
4. **Test on Fuji testnet** before mainnet deployment
5. **Monitor transactions** on the block explorer

## Contributing

This is a minimal MVP. Areas for future development:

1. Multi-merchant support with on-chain registry
2. Invoice metadata (IPFS for descriptions, attachments)
3. Escrow and dispute resolution
4. Automated reminders for unpaid invoices
5. Batch payment processing
6. USD price feed integration

## License

MIT

## Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Avalanche C-Chain Docs](https://docs.avax.network/)
3. Contact the development team

---

**Built with:**
- [Foundry](https://getfoundry.sh/) - Smart contract development
- [Next.js 14](https://nextjs.org/) - React framework
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [Viem](https://viem.sh/) - TypeScript interface for Ethereum
- [Tailwind CSS](https://tailwindcss.com/) - Styling
