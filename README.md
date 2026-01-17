# Avalanche USDC Invoices

A minimal, production-ready MVP monorepo for on-chain invoice management on Avalanche C-Chain using **native USDC**.

Merchants create invoices on-chain, customers pay in native USDC, and verified receipts are generated purely from on-chain data. No backend database required.

## Key Features

- **Safe-by-Default Payments**: Uses `transferFrom` with exact approval amounts.
- **Direct Settlement**: Funds move directly from Customer → Merchant. Contracts never hold user funds.
- **Verifiable Receipts**: Receipts are generated from on-chain events and transaction hashes.
- **Native USDC Only**: Strict enforcement of Circle's native USDC extended for Avalanche.
- **Zero-Backend Architecture**: Rely on the blockchain as the source of truth.

## Project Structure

This monorepo uses [pnpm workspaces](https://pnpm.io/workspaces):

- **`/contracts`**: Foundry-based smart contracts (`InvoiceManager.sol`).
- **`/apps/web`**: Next.js 14 frontend with Wagmi/Viem.
- **`/packages/shared`**: Shared TypeScript types, utilities, and constants.

## Quickstart

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- [Foundry](https://getfoundry.sh/) (for contract development)
- Avalanche Fuji Testnet AVAX + Native USDC

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Environment Setup

1. Copy the example `.env` files:

   ```bash
   cp .env.example .env
   cp contracts/.env.fuji.example contracts/.env.fuji
   ```

2. Configure your environment variables in `.env`:

   ```env
   NEXT_PUBLIC_CHAIN_ID=43113 # Fuji
   NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
   NEXT_PUBLIC_USDC_ADDRESS=0x5425890298aed601595a70AB815c96711a31Bc65 # Native USDC (Fuji)
   ```

### Development

Start the development server:

```bash
pnpm dev
# Web app available at http://localhost:3000
```

To run tests across the workspace:

```bash
pnpm test
```

## Smart Contract Deployment

### Fuji Testnet

1. Set your deployer private key in `contracts/.env.fuji`.
2. Deploy the contracts:

   ```bash
   pnpm deploy:fuji
   ```

3. Update the root `.env` with the new contract address:

   ```env
   NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=0x...
   ```

4. Generate deployment artifacts for the web app:

   ```bash
   cd contracts && pnpm generate-deployment-info
   ```

## Production Guidelines

### Native USDC vs USDC.e

**Critical:** This application is designed for **Native USDC** (issued by Circle).

- **Native USDC (Fuji)**: `0x5425890298aed601595a70AB815c96711a31Bc65`
- **Native USDC (Mainnet)**: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`

Do **NOT** use USDC.e (bridged USDC). Using the wrong token address will result in failed transactions or lost funds availability for the merchant. Always verify the contract address on Snowtrace before deploying.

### Production Checklist

Before going to production:

- [ ] **Contract Verification**: Ensure contracts are verified on Snowtrace.
- [ ] **RPC Provider**: Switch `NEXT_PUBLIC_RPC_URL` to a paid provider (e.g., QuickNode, Alchemy) for reliability.
- [ ] **Environment Variables**: Ensure `NEXT_PUBLIC_CHAIN_ID` is set to `43114` (Mainnet).
- [ ] **Security**: Ensure the deployer wallet has no residual permissions (contracts are ownable-free or ownership is managed).
- [ ] **Frontend Build**: Run `pnpm build` to ensure a clean production build properly optimization.

## Troubleshooting

- **"Internal JSON-RPC error"**: Check if your wallet has enough AVAX for gas.
- **"Execution reverted: ERC20: transfer amount exceeds allowance"**: You must approve the `InvoiceManager` to spend your USDC before paying.
- **Chain ID Mismatch**: Ensure your wallet is connected to the network specified in `NEXT_PUBLIC_CHAIN_ID`.

## License

MIT
