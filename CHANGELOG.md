# Changelog

All notable changes to Avalanche USDC Invoices will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Add invoice metadata (IPFS for descriptions)
- Implement batch invoice creation
- Add invoice cancellation feature
- Create merchant profile system
- Add email notifications for payments
- Implement multi-currency support
- Add escrow functionality
- Create mobile app (React Native)
- Add analytics dashboard
- Implement role-based access control

## [1.0.0] - 2024-01-15

### Added
- Initial release of Avalanche USDC Invoices system
- InvoiceManager smart contract with OpenZeppelin integration
- On-chain invoice creation and payment
- Direct USDC transfers (payer → merchant)
- Verifiable receipts with transaction hashes and decoded events
- No backend, no database, pure on-chain data
- Native USDC support (not USDC.e)

### Smart Contract Features
- `createInvoice()` - Create on-chain invoices
- `payInvoice()` - Pay invoices with USDC
- `getInvoice()` - Retrieve invoice data
- `invoiceExists()` - Check invoice existence
- `isInvoicePaid()` - Check payment status
- `getMerchantInvoices()` - Batch invoice queries
- `InvoiceCreated` event - Emitted on invoice creation
- `InvoicePaid` event - Emitted on payment

### Smart Contract Security
- ReentrancyGuard protection
- SafeERC20 token handling
- No admin keys or upgradability
- Direct transfers (funds never held)
- Input validation
- Custom error types

### Web Application Features
- Landing page with project overview
- Merchant dashboard for invoice management
- Invoice creation form with amount and due date
- Payment flow with approval and payment steps
- Receipt page with transaction details
- Wallet connection support (MetaMask, WalletConnect, etc.)
- Network mismatch detection
- Chain ID validation
- Transaction status tracking
- Error handling and user feedback

### Frontend Architecture
- Next.js 14 with App Router
- TypeScript for type safety
- Wagmi for Ethereum hooks
- Viem for contract interactions
- Tailwind CSS for styling
- Component-based design
- Custom hooks for state management
- Service layer for business logic
- Repository pattern for data access
- Singleton configuration service

### Shared Package
- Centralized type definitions
- Application constants
- Validation utilities
- Custom error classes
- Core service interfaces
- Logging infrastructure

### Documentation
- Comprehensive README
- Architecture documentation
- Contract documentation
- API documentation
- Deployment guides
- Development guides
- Contributing guidelines
- Troubleshooting guides

### Testing
- Foundry test suite with 100% coverage
- Test scenarios for all functions
- Reentrancy attack tests
- ERC-20 failure behavior tests
- Mock contracts for testing

### Deployment
- Foundry deployment scripts
- Fuji testnet deployment
- Mainnet deployment support
- Contract verification scripts
- Deployment info generation

### Developer Experience
- pnpm workspace configuration
- Hot module replacement
- TypeScript strict mode
- ESLint configuration
- Git attributes for line endings
- Environment variable templates
- Pre-commit hooks (planned)

### Security
- Secure private key handling
- No hardcoded secrets
- Environment variable configuration
- Input validation on all endpoints
- Rate limiting ready (planned)
- CORS configuration ready (planned)

### Performance
- Optimized contract storage (packed structs)
- Efficient event queries (indexed parameters)
- React.memo for component optimization
- useCallback for function optimization
- Lazy route loading
- Optimistic UI updates

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Networks Supported
- Avalanche Fuji Testnet (Chain ID: 43113)
- Avalanche Mainnet C-Chain (Chain ID: 43114)

### Tokens Supported
- Circle-issued native USDC (Fuji: 0x5425890298aed601595a70AB815c96711a31Bc65)
- Circle-issued native USDC (Mainnet: 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E)

### Gas Optimization
- Packed structs (3 slots per invoice vs. 6)
- Custom errors (~26 gas savings per error)
- Efficient event indexing
- Minimal contract size

### Known Limitations
- No invoice cancellation (create new invoice instead)
- No invoice modification (immutable once created)
- No partial payments (must pay full amount)
- No refunds (separate contract required)
- No automatic reminders (manual or third-party)
- No metadata storage (future IPFS integration)
- Limited query efficiency for large datasets
- No caching (every query hits blockchain)
- No pagination for event queries

### Future Enhancements (Planned)
- Invoice metadata and descriptions
- Invoice cancellation and modification
- Partial payment support
- Refund mechanism
- Automatic payment reminders
- Email/SMS notifications
- Merchant profiles and branding
- Customer management
- Invoice history and reporting
- Analytics dashboard
- Multi-currency support
- Escrow and dispute resolution
- Batch invoice creation and payment
- Subscriptions and recurring invoices
- Integration with payment processors
- Mobile app (React Native)
- Desktop app (Electron)
- Event indexing (The Graph)
- Caching layer (Redis)
- Rate limiting and DDoS protection
- Advanced error tracking (Sentry)
- Performance monitoring (Datadog)
- A/B testing framework
- Internationalization (i18n)
- Accessibility improvements (WCAG 2.1)

## [0.0.0] - 2024-01-10

### Project Initialization
- Monorepo structure with pnpm workspace
- Foundry smart contract project setup
- Next.js 14 web app setup
- TypeScript configuration
- Tailwind CSS configuration
- ESLint configuration
- Git repository initialization
- README documentation
- Environment variable templates

### Smart Contract Setup
- InvoiceManager.sol contract
- OpenZeppelin dependencies
- Foundry configuration
- Test structure setup
- Deployment script skeleton

### Frontend Setup
- Next.js App Router
- Wagmi configuration
- Viem integration
- Tailwind CSS setup
- Component library skeleton
- Page structure (landing, merchant, pay, receipt)
- API route structure

### Development Setup
- pnpm workspace configuration
- Root package.json
- Shared package setup
- Type definitions
- Utility functions
- Git attributes configuration

### Documentation
- README with quickstart guide
- Contract documentation skeleton
- API documentation skeleton
- Deployment guide skeleton
- Development guide skeleton

---

## Version History

| Version | Date | Release Notes |
|---------|-------|---------------|
| 1.0.0 | 2024-01-15 | Initial production release |
| 0.0.0 | 2024-01-10 | Project initialization |

## Release Schedule

- **Minor releases (0.x.y)**: Monthly (or as needed)
- **Patch releases (x.y.z)**: As needed for bug fixes
- **Major releases (x.0.0)**: Semi-annually (or for breaking changes)

## Change Types

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerabilities

## Contributors

See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for list of contributors.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Last Updated:** 2024-01-15
**Changelog Version:** 1.0.0
