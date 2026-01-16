# Avalanche USDC Invoices Documentation

Welcome to the official documentation for Avalanche USDC Invoices - a production-grade, on-chain invoice management system on Avalanche C-Chain using native USDC.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Guides](#user-guides)
3. [Architecture](#architecture)
4. [Contract Documentation](#contract-documentation)
5. [API Documentation](#api-documentation)
6. [Deployment](#deployment)
7. [Development](#development)
8. [Contributing](#contributing)
9. [Troubleshooting](#troubleshooting)
10. [Frequently Asked Questions](#frequently-asked-questions)

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

### Key Concepts

- **Native USDC Only**: This system is designed for Circle-issued native USDC, NOT USDC.e (bridged)
- **No Backend**: All data is retrieved from the blockchain via JSON-RPC
- **Direct Transfers**: Payments move directly from payer to merchant; funds never sit in the contract
- **Verifiable**: Every payment has a complete audit trail on the blockchain

### System Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Foundry (for contract development)
- A wallet with AVAX and USDC on Fuji testnet

## User Guides

### For Merchants

- [Creating Your First Invoice](./guides/merchant/creating-invoices.md)
- [Managing Multiple Invoices](./guides/merchant/managing-invoices.md)
- [Verifying Payments](./guides/merchant/verifying-payments.md)
- [Understanding Receipts](./guides/merchant/understanding-receipts.md)

### For Customers

- [Paying an Invoice](./guides/customer/paying-invoices.md)
- [Understanding USDC Approvals](./guides/customer/usdc-approvals.md)
- [Checking Payment Status](./guides/customer/checking-status.md)
- [Viewing Your Receipt](./guides/customer/viewing-receipts.md)

## Architecture

### System Architecture

- [Overview](./architecture/overview.md)
- [Layered Architecture](./architecture/layers.md)
- [SOLID Principles](./architecture/solid.md)
- [Design Patterns](./architecture/patterns.md)
- [Data Flow](./architecture/data-flow.md)

### Technical Architecture

- [Monorepo Structure](./architecture/monorepo.md)
- [Smart Contract Design](./contracts/overview.md)
- [Frontend Architecture](./architecture/frontend.md)
- [State Management](./architecture/state-management.md)
- [Error Handling](./architecture/error-handling.md)

## Contract Documentation

### InvoiceManager Contract

- [Contract Overview](./contracts/invoice-manager.md)
- [Functions](./contracts/invoice-manager-functions.md)
- [Events](./contracts/invoice-manager-events.md)
- [Security Considerations](./contracts/invoice-manager-security.md)

### Contract Testing

- [Test Coverage](./contracts/testing.md)
- [Test Scenarios](./contracts/test-scenarios.md)
- [Running Tests](./contracts/running-tests.md)

## API Documentation

### Web API

- [API Overview](./api/overview.md)
- [Invoice Endpoints](./api/invoice-endpoints.md)
- [Error Responses](./api/errors.md)
- [Rate Limiting](./api/rate-limiting.md)

### Contract APIs

- [Reading Contracts](./api/contract-read.md)
- [Writing Contracts](./api/contract-write.md)
- [Event Queries](./api/contract-events.md)
- [ABI Reference](./api/abi-reference.md)

## Deployment

### Network Deployment

- [Fuji Testnet](./deployment/fuji.md)
- [Avalanche Mainnet](./deployment/mainnet.md)
- [Other Networks](./deployment/other-networks.md)

### Configuration

- [Environment Variables](./deployment/environment-variables.md)
- [Contract Addresses](./deployment/contract-addresses.md)
- [RPC Endpoints](./deployment/rpc-endpoints.md)
- [Explorer URLs](./deployment/explorer-urls.md)

### Deployment Strategies

- [Automated Deployment](./deployment/automated.md)
- [Manual Deployment](./deployment/manual.md)
- [Contract Verification](./deployment/verification.md)
- [Post-Deployment Checklist](./deployment/checklist.md)

## Development

### Getting Started

- [Development Setup](./development/setup.md)
- [Project Structure](./development/structure.md)
- [Code Style Guide](./development/code-style.md)
- [Commit Conventions](./development/commits.md)

### Development Workflow

- [Running Tests](./development/testing.md)
- [Building Contracts](./development/building-contracts.md)
- [Local Development](./development/local.md)
- [Debugging](./development/debugging.md)

### Feature Development

- [Adding New Features](./development/adding-features.md)
- [Creating New Pages](./development/creating-pages.md)
- [Writing Custom Hooks](./development/writing-hooks.md)
- [Creating Components](./development/creating-components.md)

## Contributing

### Contribution Guidelines

- [Overview](./contributing/overview.md)
- [Code of Conduct](./contributing/code-of-conduct.md)
- [Pull Request Process](./contributing/pull-requests.md)
- [Issue Reporting](./contributing/issues.md)

### Development Standards

- [SOLID Principles](./contributing/solid.md)
- [DRY Guidelines](./contributing/dry.md)
- [Type Safety](./contributing/typescript.md)
- [Testing Requirements](./contributing/testing.md)

### Documentation

- [Writing Documentation](./contributing/writing-docs.md)
- [API Documentation](./contributing/api-docs.md)
- [Code Comments](./contributing/code-comments.md)

## Troubleshooting

### Common Issues

- [Wallet Connection Problems](./troubleshooting/wallet.md)
- [Network Issues](./troubleshooting/network.md)
- [Transaction Failures](./troubleshooting/transactions.md)
- [Deployment Issues](./troubleshooting/deployment.md)

### Debugging

- [Browser Console](./troubleshooting/browser-console.md)
- [Contract Events](./troubleshooting/contract-events.md)
- [Error Messages](./troubleshooting/error-messages.md)
- [Logging](./troubleshooting/logging.md)

## Frequently Asked Questions

### General

- [What is Avalanche USDC Invoices?](./faq/general.md#what-is-avalanche-usdc-invoices)
- [Why use native USDC instead of USDC.e?](./faq/general.md#why-native-usdc)
- [Is there a backend server?](./faq/general.md#is-there-a-backend)
- [How are payments verified?](./faq/general.md#how-are-payments-verified)

### Technical

- [How does the invoice flow work?](./faq/technical.md#invoice-flow)
- [What happens if a payment fails?](./faq/technical.md#failed-payments)
- [Can I cancel an invoice?](./faq/technical.md#cancel-invoices)
- [Are there gas fees?](./faq/technical.md#gas-fees)

### Security

- [Is the smart contract audited?](./faq/security.md#contract-audit)
- [What happens to funds during payment?](./faq/security.md#funds-during-payment)
- [Can the contract be upgraded?](./faq/security.md#contract-upgrades)
- [What about reentrancy attacks?](./faq/security.md#reentrancy)

## Additional Resources

- [Avalanche C-Chain Documentation](https://docs.avax.network/)
- [Circle USDC Documentation](https://www.circle.com/usdc)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)

## Support

- [GitHub Issues](https://github.com/your-org/avax-usdc-invoices/issues)
- [Discord Community](https://discord.gg/your-server)
- [Twitter](https://twitter.com/your-handle)
- [Email](mailto:support@your-domain.com)

## License

MIT License - see [LICENSE](../LICENSE) file for details.

---

**Last Updated:** 2024-01-15
**Documentation Version:** 1.0.0
