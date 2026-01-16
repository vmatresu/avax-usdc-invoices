# Development Setup Guide

Complete guide for setting up development environment for Avalanche USDC Invoices project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Project](#running-the-project)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**:
  - macOS 10.15+ (Catalina or later)
  - Windows 10+ with WSL2
  - Ubuntu 20.04+ or other Linux distributions

- **Node.js**:
  - Version: >= 18.0.0
  - Recommendation: Use [nvm](https://github.com/nvm-sh/nvm) for version management

- **Package Manager**:
  - Version: >= 8.0.0
  - [Installation Guide](https://pnpm.io/installation)

- **Git**:
  - Version: >= 2.30.0
  - [Installation Guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

### Required Software

**Foundry** (for smart contract development):
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Add to PATH
export PATH="$HOME/.foundry/bin:$PATH"

# Verify installation
forge --version
```

**VS Code** (recommended editor):
```bash
# Install from https://code.visualstudio.com/
# Extensions required:
- ES7+ React/Redux/React-Native snippets
- TypeScript and JavaScript Language Features
- Solidity
- ESLint
- Prettier
```

**Browser** (for web app):
- Chrome/Brave (recommended for MetaMask)
- Firefox (with MetaMask)
- Safari (with WalletConnect)

### Optional Software

**Docker** (for containerized development):
```bash
# Install Docker Desktop
# Download from https://www.docker.com/products/docker-desktop
```

**Postman** (for API testing):
```bash
# Install from https://www.postman.com/downloads/
```

## Project Structure

### Monorepo Overview

```
avax-usdc-invoices/
├── apps/
│   └── web/              # Next.js web application
├── packages/
│   └── shared/           # Shared types and utilities
├── contracts/             # Foundry smart contracts
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

### Web App Structure

```
apps/web/
├── app/                  # Next.js app directory
│   ├── merchant/         # Merchant dashboard
│   ├── pay/             # Payment flow
│   └── layout.tsx       # Root layout
├── lib/
│   ├── config/          # Configuration files
│   ├── contracts/       # Contract ABIs
│   ├── hooks/          # React hooks
│   ├── services/       # Data services
│   └── wagmi.ts        # Wagmi configuration
├── public/              # Static assets
├── components/          # React components
└── package.json         # Web app dependencies
```

### Contracts Structure

```
contracts/
├── src/
│   ├── InvoiceManager.sol    # Main contract
│   └── mock/
│       ├── MockUSDC.sol      # USDC mock for testing
│       └── MockManager.sol   # Manager mock for testing
├── script/             # Deployment scripts
│   ├── Deploy.s.sol
│   └── DeployFuji.s.sol
└── test/
    └── InvoiceManager.t.sol  # Contract tests
```

### Shared Package Structure

```
packages/shared/
├── types/               # TypeScript types
├── constants/           # Application constants
├── utils/              # Utility functions
│   └── validation.ts   # Input validation
├── errors/             # Error classes
├── interfaces/          # TypeScript interfaces
└── index.ts            # Central exports
```

## Installation

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/vmatresu/avax-usdc-invoices.git
cd avax-usdc-invoices

# Or use SSH
git clone git@github.com:vmatresu/avax-usdc-invoices.git
cd avax-usdc-invoices
```

### Step 2: Install Node.js (if needed)

```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js 18
nvm install 18
nvm use 18

# Verify installation
node --version  # Should be v18.x.x
```

### Step 3: Install pnpm (if needed)

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version  # Should be 8.x.x
```

### Step 4: Install Dependencies

```bash
# Install all dependencies
pnpm install

# This will install:
# - Root dependencies
# - Web app dependencies
# - Shared package dependencies
# - Contract dependencies
```

### Step 5: Install Git Hooks

```bash
# Initialize Husky for pre-commit hooks
pnpm prepare

# This sets up:
# - ESLint on commit
# - Prettier on commit
# - Type checking on commit
```

### Step 6: Verify Installation

```bash
# Check all dependencies are installed
pnpm list

# Check Foundry is installed
forge --version

# Check Node.js version
node --version

# Check pnpm version
pnpm --version
```

## Configuration

### Environment Variables

#### 1. Copy Environment Templates

```bash
# Root environment file
cp .env.example .env

# Contract environment file
cp contracts/.env.fuji.example contracts/.env.fuji
```

#### 2. Configure Root `.env`

```bash
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=43113                    # Fuji testnet: 43113, Mainnet: 43114
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_EXPLORER_BASE_URL=https://testnet.snowtrace.io

# Contract Configuration (set after deployment)
NEXT_PUBLIC_USDC_ADDRESS=0x5425890298aed601595a70AB815c96711a31Bc65
NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=

# Application Configuration
NEXT_PUBLIC_APP_NAME="Avalanche USDC Invoices"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 3. Configure Contracts `.env.fuji`

```bash
# RPC URL
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Deployer Private Key (NEVER commit this!)
# Use a throwaway account for testing
PRIVATE_KEY=0x...

# Explorer URL
EXPLORER_URL=https://testnet.snowtrace.io

# Network Configuration
CHAIN_ID=43113
VERIFIER_URL=https://api-testnet.snowtrace.io/api
```

**Security Warning**: Never commit `.env.fuji` with real private keys. Use `.env.fuji.example` for templates.

#### 4. Configure VS Code

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "solidity.compileUsingRemoteVersion": "v0.8.23",
  "solidity.packageDefaultDependenciesContractsDirectory": "src",
  "solidity.packageDefaultDependenciesDirectory": "lib"
}
```

### Build Configuration

#### TypeScript Configuration

TypeScript is already configured in:
- `apps/web/tsconfig.json`
- `packages/shared/tsconfig.json`
- `tsconfig.json` (root)

#### ESLint Configuration

ESLint is already configured in:
- `.eslintrc.js` (root)
- `eslint.config.mjs` (root)
- `apps/web/.eslintrc.json`
- `packages/shared/.eslintrc.json`

#### Prettier Configuration

Prettier is already configured in:
- `.prettierrc` (root)
- `.prettierrc.js` (root)
- `apps/web/.prettierrc`
- `packages/shared/.prettierrc`

## Running the Project

### Development Server

#### Start Web App

```bash
# Start Next.js development server
pnpm dev

# This starts:
# - Next.js on http://localhost:3000
# - Hot module replacement
# - Fast refresh
```

Visit `http://localhost:3000` to see the application.

#### Start Contracts Watch Mode

```bash
# Watch contract changes and rebuild
cd contracts
forge build --watch
```

### Build Commands

#### Build All Packages

```bash
# Build web app and shared package
pnpm build

# This builds:
# - apps/web (Next.js production build)
# - packages/shared (TypeScript compilation)
```

#### Build Contracts

```bash
# Build smart contracts
cd contracts
forge build

# Output in:
# - contracts/out/
```

#### Clean Build Artifacts

```bash
# Clean all build artifacts
pnpm clean

# This removes:
# - apps/web/.next/
# - contracts/out/
# - packages/shared/dist/
```

### Test Commands

#### Run All Tests

```bash
# Run all tests (contracts, shared, web)
pnpm test

# This runs:
# - Contract tests (Foundry)
# - Shared package tests (Jest)
# - Web app tests (Jest)
```

#### Run Specific Test Suites

```bash
# Run shared package tests
pnpm test:shared

# Run web app tests
pnpm test:web

# Run contract tests
pnpm test:contracts
```

#### Run Tests in Watch Mode

```bash
# Run shared tests in watch mode
pnpm --filter shared test:watch

# Run web tests in watch mode
pnpm --filter web test:watch

# Run contract tests in watch mode
pnpm --filter contracts test:watch
```

#### Generate Coverage Reports

```bash
# Generate coverage for all tests
pnpm test:coverage

# Coverage reports generated in:
# - packages/shared/coverage/
# - apps/web/coverage/
```

## Development Workflow

### 1. Start Development

```bash
# Terminal 1: Start web app
pnpm dev

# Terminal 2: Run tests in watch mode
pnpm test:watch

# Terminal 3: Run contracts in watch mode (if needed)
cd contracts
forge build --watch
```

### 2. Make Changes

**For Web App**:
- Edit files in `apps/web/`
- Changes hot-reload automatically
- Browser updates automatically

**For Contracts**:
- Edit files in `contracts/src/`
- Run `forge build` to compile
- Run `forge test` to test
- Deploy to testnet for testing

**For Shared Package**:
- Edit files in `packages/shared/`
- Changes reflect immediately in web app
- Run `pnpm --filter shared typecheck` to verify types

### 3. Run Linting

```bash
# Check for linting errors
pnpm lint

# Auto-fix linting errors
pnpm lint:fix

# Format code
pnpm format:fix
```

### 4. Run Type Checking

```bash
# Type check all packages
pnpm typecheck

# Type check web app
pnpm typecheck:web

# Type check shared package
pnpm typecheck:shared
```

### 5. Run Tests

```bash
# Run all tests
pnpm test

# Run specific tests
pnpm test:shared
pnpm test:web
pnpm test:contracts
```

### 6. Commit Changes

```bash
# Stage changes
git add .

# Pre-commit hooks run automatically:
# - ESLint checks
# - Prettier formatting
# - Type checking
# - Tests (optional)

# Commit
git commit -m "feat: add new feature"
```

### 7. Push Changes

```bash
# Push to remote
git push origin main
# Or push to your fork
git push origin your-branch
```

## Testing

### Running Tests Locally

#### Contract Tests (Foundry)

```bash
# Run all contract tests
cd contracts
forge test

# Run tests with output
forge test -vv

# Run specific test
forge test --match test_CreateInvoice

# Run tests with gas report
forge test --gas-report
```

#### Shared Package Tests (Jest)

```bash
# Run all tests
pnpm --filter shared test

# Run tests in watch mode
pnpm --filter shared test:watch

# Run tests with coverage
pnpm --filter shared test:coverage

# Run specific test file
pnpm --filter shared test validation
```

#### Web App Tests (Jest)

```bash
# Run all tests
pnpm --filter web test

# Run tests in watch mode
pnpm --filter web test:watch

# Run tests with coverage
pnpm --filter web test:coverage

# Run specific test file
pnpm --filter web test useInvoice
```

### Testing on Testnet

#### 1. Get Testnet Funds

**Get Fuji Testnet AVAX**:
1. Visit [Fuji Faucet](https://faucet.avax.network/)
2. Enter your wallet address
3. Complete CAPTCHA
4. Receive 2 AVAX

**Get Fuji Testnet USDC**:
1. Visit [Circle Test Bridge](https://testbridge.circle.com/)
2. Select Ethereum → Avalanche Fuji
3. Enter amount (e.g., 10,000 USDC)
4. Approve and transfer
5. Receive USDC on Fuji

#### 2. Deploy Contract

```bash
# Deploy to Fuji testnet
cd contracts
forge script script/Deploy.s.sol:DeployFuji \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

#### 3. Update Environment

Add deployed contract address to `.env`:

```bash
NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS=0xYourDeployedContractAddress
```

#### 4. Test Web App

```bash
# Start development server
pnpm dev

# Connect wallet (MetaMask, WalletConnect, etc.)
# Switch to Fuji testnet
# Create test invoice
# Pay test invoice
# Verify on block explorer
```

## Troubleshooting

### Common Issues

**Issue: Dependencies Not Found**

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules
rm -rf apps/web/node_modules
rm -rf packages/shared/node_modules
rm pnpm-lock.yaml
pnpm install
```

**Issue: TypeScript Errors**

**Solution**:
```bash
# Clear TypeScript cache
rm -rf apps/web/.next
rm -rf packages/shared/dist
rm -rf contracts/out
pnpm typecheck
```

**Issue: Linting Errors**

**Solution**:
```bash
# Auto-fix linting errors
pnpm lint:fix

# Format code
pnpm format:fix

# Run type checking
pnpm typecheck
```

**Issue: Build Fails**

**Solution**:
```bash
# Clear build artifacts
pnpm clean

# Rebuild
pnpm build

# If still fails, check for:
# - Environment variables set correctly
# - All dependencies installed
# - TypeScript errors resolved
```

**Issue: Tests Failing**

**Solution**:
```bash
# Run tests with verbose output
pnpm test --verbose

# Check for:
# - Mocks set up correctly
# - Async/await used properly
# - Test data valid

# If contract tests fail:
cd contracts
forge test -vv
```

**Issue: Cannot Connect Wallet**

**Solution**:
```bash
# Check:
# - Wallet extension installed
# - Wallet connected to correct network (Fuji/Mainnet)
# - Browser supports wallet (Chrome/Brave recommended)

# Try:
# - Refresh page
# - Disable/enable wallet extension
# - Try different browser
# - Check console for errors
```

**Issue: Gas Fees Too High**

**Solution**:
```bash
# Check:
# - Network congestion (Avalanche usually fast/cheap)
# - Correct RPC endpoint (Fuji vs Mainnet)

# Try:
# - Lower gas limit in wallet
# - Use alternative RPC endpoint
# - Wait for network to clear
```

### Getting Help

**Documentation**:
- [Code Style Guide](./code-style.md)
- [Linting Guide](./linting.md)
- [Testing Guide](./testing.md)
- [Architecture Overview](../architecture/overview.md)

**Resources**:
- [Avalanche Documentation](https://docs.avax.network/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)

**Support**:
- [GitHub Issues](https://github.com/vmatresu/avax-usdc-invoices/issues)
- [Discord Community](https://discord.gg/)
- [Email Support](mailto:support@example.com)

## Next Steps

### After Setup

1. **Explore Code**:
   - Review architecture in `docs/architecture/`
   - Understand contract design in `contracts/src/`
   - Explore web app in `apps/web/`

2. **Run Tests**:
   - Execute `pnpm test` to verify all tests pass
   - Run `pnpm test:coverage` to see coverage reports
   - Fix any failing tests

3. **Make First Change**:
   - Add a small feature or fix a bug
   - Run linting: `pnpm lint:fix`
   - Run tests: `pnpm test`
   - Commit changes: `git commit -m "feat: my first change"`

4. **Deploy to Testnet**:
   - Follow [Fuji Deployment Guide](../deployment/fuji.md)
   - Deploy contract to Fuji testnet
   - Test all functionality
   - Verify on block explorer

5. **Contribute**:
   - Fork the repository
   - Create feature branch
   - Make your changes
   - Submit pull request

## Additional Resources

### Development Tools

- **[VS Code](https://code.visualstudio.com/)**: Recommended editor
- **[Foundry](https://book.getfoundry.sh/)**: Smart contract development
- **[Next.js](https://nextjs.org/docs)**: React framework
- **[Wagmi](https://wagmi.sh)**: React hooks for web3
- **[Viem](https://viem.sh)**: TypeScript interface for Ethereum

### Learning Resources

- **[Solidity by Example](https://solidity-by-example.org/)**: Learn Solidity
- **[React Documentation](https://react.dev/learn)**: Learn React
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**: Learn TypeScript
- **[Avalanche Developer Portal](https://developers.avax.network/)**: Avalanche development

### Community

- **[Avalanche Discord](https://discord.gg/avalanche)**: Avalanche community
- **[Foundry Discord](https://discord.gg/foundry)**: Foundry community
- **[Web3.js](https://web3js.readthedocs.io/)**: Web3 documentation

---

**Related Documentation**:
- [Code Style Guide](./code-style.md)
- [Linting Guide](./linting.md)
- [Testing Guide](./testing.md)
- [Architecture Overview](../architecture/overview.md)
- [Fuji Deployment Guide](../deployment/fuji.md)

**Last Updated**: 2024-01-15
**Version**: 1.0.0
