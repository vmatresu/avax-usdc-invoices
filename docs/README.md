# Avalanche USDC Invoices Documentation

Welcome to the official documentation for Avalanche USDC Invoices - a production-grade, on-chain invoice management system on Avalanche C-Chain using native USDC.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Guides](#user-guides)
3. [Architecture](#architecture)
4. [Contract Documentation](#contract-documentation)
5. [Deployment](#deployment)
6. [Development](#development)
7. [Contributing](#contributing)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Overview

Avalanche USDC Invoices is a minimal, safe-by-default MVP monorepo for on-chain invoice management. Key features include:

- **On-chain invoice creation and payment** - All invoice data lives on the blockchain
- **Direct USDC transfers** - Funds transfer directly from payer to merchant
- **Verifiable receipts** - Complete payment verification with tx hashes and decoded events
- **No backend, no database** - Pure on-chain data storage
- **Production-grade architecture** - Built with SOLID principles and DRY code

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/your-org/avax-usdc-invoices.git
cd avax-usdc-invoices
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment**

```bash
cp .env.example .env
cp contracts/.env.fuji.example contracts/.env.fuji
```

4. **Configure environment variables**

Edit `.env` and `contracts/.env.fuji` with your settings.

5. **Run the development server**

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## User Guides

### For Merchants

- [Creating Your First Invoice](./guides/merchant/creating-invoices.md)

### For Customers

- [Paying an Invoice](./guides/customer/paying-invoices.md)

## Architecture

- [Overview](./architecture/overview.md)

## Contract Documentation

- [InvoiceManager Contract](./contracts/invoice-manager.md)

## Deployment

- [Fuji Testnet Deployment](./deployment/fuji.md)

## Development

- [Development Setup](./development/setup.md)
- [Code Style Guide](./development/code-style.md)
- [Linting Guide](./development/linting.md)
- [Testing Guide](./development/testing.md)

## Contributing

Please refer to the [Development Setup](./development/setup.md) and [Code Style Guide](./development/code-style.md) for contribution guidelines.

## Troubleshooting

See the [Development Setup](./development/setup.md) for troubleshooting common development issues.

## Frequently Asked Questions

### Why use native USDC instead of USDC.e?
This system is designed for Circle-issued native USDC, NOT USDC.e (bridged). Using the wrong token will result in failed integrations.

### Is there a backend server?
No. All data is retrieved from the blockchain via JSON-RPC.

## Additional Resources

- [Avalanche C-Chain Documentation](https://docs.avax.network/)
- [Circle USDC Documentation](https://www.circle.com/usdc)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)

## Support

- [GitHub Issues](https://github.com/your-org/avax-usdc-invoices/issues)
