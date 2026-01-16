# Avalanche USDC Invoices

A minimal, safe-by-default MVP monorepo for on-chain invoice management on Avalanche C-Chain using native USDC. Merchants create invoices on-chain, customers pay in native USDC, and anyone can view a verifiable receipt (tx hash + decoded event + on-chain invoice state).

**Key Features:**
- On-chain invoice creation and payment
- Direct USDC transfers (payer → merchant, funds never sit in contract)
- Verifiable receipts with transaction hashes and decoded events
- No backend, no database, pure on-chain data
- Uses Avalanche C-Chain JSON-RPC via public endpoints
- **Production-grade architecture with SOLID principles and DRY**

**⚠️ Important: Native USDC Only**

This system is designed for **native USDC (Circle-issued)** only, NOT USDC.e (bridged). Using the wrong token will cause payments to "look paid" but fail integration/off-ramping expectations. See [Native USDC vs USDC.e](#native-usdc-vs-usdce-on-avalanche) below.

## Architecture

### SOLID Principles

The codebase follows SOLID principles for maintainability and scalability:

1. **Single Responsibility Principle (SRP)**
   - Each class, function, and component has one reason to change
   - `InvoiceRepository` handles data access only
   - `InvoiceService` handles business logic only
   - `InvoiceStatusBadge` handles status display only

2. **Open/Closed Principle (OCP)**
   - Entities are open for extension but closed for modification
   - Interface-based design allows swapping implementations
   - New invoice types can be added without modifying existing code

3. **Liskov Substitution Principle (LSP)**
   - Derived classes are substitutable for base classes
   - `ConsoleLogger` and `NoOpLogger` implement `ILogger`
   - Any logger implementation can be used interchangeably

4. **Interface Segregation Principle (ISP)**
   - Clients don't depend on unused methods
   - Small, focused interfaces (e.g., `IInvoiceRepository`, `IInvoiceService`)
   - Each interface has methods relevant to its purpose

5. **Dependency Inversion Principle (DIP)**
   - High-level modules depend on abstractions, not details
   - Components depend on interfaces, not concrete implementations
   - Easy to swap database, logger, or analytics provider

### DRY (Don't Repeat Yourself)

Code duplication is minimized through:

- **Shared types package**: Centralized type definitions
- **Custom hooks**: Reusable stateful logic
- **Service layer**: Reusable business logic
- **Component library**: Reusable UI components
- **Utility functions**: Shared helper functions

### Layered Architecture

```
┌─────────────────────────────────────────┐
│          Presentation Layer          │
│  (Next.js Pages, React Components) │
└──────────────┬──────────────────────┘
               │ uses
┌──────────────▼──────────────────────┐
│            Hooks Layer              │
│  (useInvoice, useWallet, etc.)   │
└──────────────┬──────────────────────┘
               │ uses
┌──────────────▼──────────────────────┐
│          Service Layer              │
│  (InvoiceService, InvoiceRepo)     │
└──────────────┬──────────────────────┘
               │ uses
┌──────────────▼──────────────────────┐
│          Contracts Layer           │
│  (InvoiceManager, USDC)          │
└──────────────┬──────────────────────┘
               │ uses
┌──────────────▼──────────────────────┐
│          Shared Package            │
│  (Types, Constants, Utils)      │
└─────────────────────────────────────┘
```

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
│   └── shared/               # Shared types and utilities
│       ├── types/index.ts     # Domain types
│       ├── constants/index.ts  # Application constants
│       ├── utils/validation.ts # Validation utilities
│       ├── errors/index.ts    # Custom error classes
│       ├── interfaces/index.ts # Core interfaces
│       ├── logger/index.ts    # Logging utilities
│       ├── index.ts         # Central exports
│       ├── package.json
│       └── tsconfig.json
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
│       │   ├── hooks/                 # Custom hooks
│       │   │   ├── useInvoice.ts
│       │   │   ├── useInvoiceOperations.ts
│       │   │   └── useError.ts
│       │   ├── services/              # Business logic
│       │   │   ├── InvoiceRepository.ts
│       │   │   └── InvoiceService.ts
│       │   ├── config/                # Configuration
│       │   │   └── network.ts
│       │   ├── components/            # Reusable components
│       │   │   ├── InvoiceStatusBadge.tsx
│       │   │   ├── LoadingState.tsx
│       │   │   ├── ErrorMessage.tsx
│       │   │   ├── AddressLink.tsx
│       │   │   └── TxHashLink.tsx
│       │   ├── contracts/
│       │   │   └── abi.ts
│       │   ├── utils/
│       │   │   └── index.ts
│       │   ├── wagmi.ts
│       │   └── utils.ts
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       └── next.config.mjs
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # PNPM workspace config
├── .env.example               # Environment template
└── README.md                  # This file
```

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

## Code Quality

### Type Safety

- **Strict TypeScript**: All code is fully typed
- **Type-safe contracts**: Viem provides ABI type safety
- **Domain types**: Custom types for all domain entities
- **Validation**: Runtime validation for all inputs

### Error Handling

- **Custom error classes**: Hierarchical error types
- **Error boundaries**: Graceful error recovery
- **Logging**: Structured logging with context
- **User-friendly messages**: Clear error descriptions

### Testing

- **Unit tests**: All functions have tests
- **Integration tests**: Contract interactions tested
- **Foundry**: Smart contract test coverage
- **Mocking**: Isolated component testing

### Performance

- **Memoization**: React.memo and useCallback
- **Lazy loading**: Code splitting for routes
- **Caching**: Contract call caching
- **Optimistic UI**: Immediate user feedback

## Troubleshooting

### Common Issues

1. **Configuration errors**
   - Verify all environment variables are set
   - Check chain ID matches your network
   - Ensure contract addresses are correct

2. **Connection issues**
   - Verify RPC URL is accessible
   - Check wallet is connected to right network
   - Confirm contract is deployed

3. **Transaction failures**
   - Check allowance before paying
   - Verify sufficient balance
   - Ensure invoice hasn't expired

### Debug Mode

Enable debug logging:

```bash
NEXT_PUBLIC_LOG_LEVEL=debug pnpm dev
```

Check browser console for detailed logs.

## Production Checklist

- [ ] Deploy contracts to mainnet
- [ ] Update environment variables
- [ ] Configure monitoring/analytics
- [ ] Set up error tracking (Sentry)
- [ ] Enable rate limiting on API
- [ ] Configure caching strategy
- [ ] Set up CI/CD pipeline
- [ ] Review and update dependencies
- [ ] Security audit (optional but recommended)
- [ ] Performance testing
- [ ] Load testing
- [ ] Backup and disaster recovery plan

## Contributing

When contributing, please follow the architecture principles:

1. **Single Responsibility**: Each function/class has one job
2. **DRY**: Extract common logic into utilities/hooks
3. **Type Safety**: Use TypeScript strictly
4. **Error Handling**: Use custom error classes
5. **Testing**: Add tests for new features

## License

MIT

## Support

For issues and questions:
1. Check the [Architecture](#architecture) section
2. Review the [Troubleshooting](#troubleshooting) section
3. Check code comments and JSDoc
4. Review the [Avalanche C-Chain Docs](https://docs.avax.network/)
5. Contact the development team

---

**Built with:**
- [Foundry](https://getfoundry.sh/) - Smart contract development
- [Next.js 14](https://nextjs.org/) - React framework
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [Viem](https://viem.sh/) - TypeScript interface for Ethereum
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
