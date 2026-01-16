# Testing Guide

Complete guide for running and writing tests in Avalanche USDC Invoices project.

## Table of Contents

1. [Test Overview](#test-overview)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Writing Tests](#writing-tests)
5. [Coverage](#coverage)
6. [CI/CD Integration](#cicd-integration)

## Test Overview

### Test Suite Coverage

| Test Suite | Type | Coverage Target | Status |
|------------|-------|----------------|--------|
| Validation Utilities | Unit | 80% | ✅ Created |
| Hooks (useInvoice) | Unit | 70% | ✅ Created |
| Hooks (useInvoiceOperations) | Unit | 70% | ✅ Created |
| InvoiceRepository | Integration | 70% | ⏳ Planned |
| NetworkConfig | Unit | 80% | ⏳ Planned |
| Components | Unit/Integration | 70% | ⏳ Planned |
| Contracts (InvoiceManager) | Unit | 100% | ✅ Complete |

### Test Frameworks

- **Jest**: Testing framework
- **React Testing Library**: Component and hook testing
- **Foundry**: Smart contract testing
- **Testing Library Hooks**: React hooks testing

## Running Tests

### Install Test Dependencies

```bash
# Install all dependencies including test dependencies
pnpm install
```

### Run All Tests

```bash
# Run all tests (contracts, shared, web)
pnpm test
```

### Run Specific Test Suites

```bash
# Run shared package tests only
pnpm test:shared

# Run web app tests only
pnpm test:web

# Run contract tests only
pnpm test:contracts
```

### Watch Mode

```bash
# Run shared tests in watch mode
pnpm --filter shared test:watch

# Run web tests in watch mode
pnpm --filter web test:watch

# Run contract tests in watch mode
pnpm --filter contracts test:watch
```

### Coverage Reports

```bash
# Generate coverage for all tests
pnpm test:coverage

# Generate coverage for shared package
pnpm --filter shared test:coverage

# Generate coverage for web app
pnpm --filter web test:coverage
```

## Test Structure

### Directory Structure

```
apps/web/
├── lib/
│   ├── hooks/
│   │   ├── useInvoice.test.ts
│   │   ├── useInvoiceOperations.test.ts
│   │   └── useError.test.ts
│   ├── services/
│   │   ├── InvoiceRepository.test.ts
│   │   └── NetworkConfig.test.ts
│   └── components/
│       └── *.test.tsx
├── jest.config.js
├── jest.setup.js
└── package.json

packages/shared/
├── utils/
│   └── validation.test.ts
├── types/
│   └── *.test.ts
├── constants/
│   └── *.test.ts
├── jest.config.js
└── package.json

contracts/
├── test/
│   └── InvoiceManager.t.sol
└── foundry.toml
```

### Test File Naming

- Unit tests: `filename.test.ts`
- Integration tests: `filename.test.ts` (for services)
- Contract tests: `ContractName.t.sol`

## Writing Tests

### Unit Tests

#### Example: Utility Function Test

```typescript
// utils/validation.test.ts
import { validateAddress, validateAmount } from './validation';

describe('validateAddress', () => {
  it('should accept valid Ethereum address', () => {
    const validAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
    const result = validateAddress(validAddress);
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid address format', () => {
    const invalidAddress = '0xinvalid';
    const result = validateAddress(invalidAddress);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('validateAmount', () => {
  it('should accept valid amount', () => {
    const result = validateAmount(1000000n); // 1 USDC
    expect(result.isValid).toBe(true);
  });

  it('should reject zero amount', () => {
    const result = validateAmount(0n);
    expect(result.isValid).toBe(false);
  });
});
```

### Hook Tests

#### Example: Custom Hook Test

```typescript
// hooks/useInvoice.test.ts
import { renderHook, waitFor, act } from '@testing-library/react';
import { useInvoice } from './useInvoice';

// Mock dependencies
jest.mock('../services/InvoiceRepository', () => ({
  InvoiceRepository: {
    getInstance: jest.fn(() => ({
      getInvoice: jest.fn(),
    })),
  },
}));

describe('useInvoice', () => {
  const mockInvoice = {
    id: '0x123...',
    merchant: '0xB97...',
    amount: 1000000n,
    dueAt: 1704067200,
    paid: false,
    payer: '0x000...',
    paidAt: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch invoice on mount', async () => {
    const invoiceId = '0x123...';
    const repository = InvoiceRepository.getInstance();
    repository.getInvoice.mockResolvedValue(mockInvoice);

    const { result } = renderHook(() => useInvoice(invoiceId));

    await waitFor(() => {
      expect(result.current.invoice).toEqual(mockInvoice);
    });

    expect(repository.getInvoice).toHaveBeenCalledWith(invoiceId);
  });

  it('should handle fetch error', async () => {
    const invoiceId = '0x123...';
    const repository = InvoiceRepository.getInstance();
    repository.getInvoice.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useInvoice(invoiceId));

    await waitFor(() => {
      expect(result.current.error).toBe('Not found');
    });
  });

  it('should refetch when refetch is called', async () => {
    const invoiceId = '0x123...';
    const repository = InvoiceRepository.getInstance();
    repository.getInvoice.mockResolvedValue(mockInvoice);

    const { result } = renderHook(() => useInvoice(invoiceId));

    await waitFor(() => {
      expect(repository.getInvoice).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(repository.getInvoice).toHaveBeenCalledTimes(2);
    });
  });
});
```

### Service Tests

#### Example: Repository Test

```typescript
// services/InvoiceRepository.test.ts
import { InvoiceRepository } from './InvoiceRepository';

// Mock wagmi client
jest.mock('../wagmi', () => ({
  client: {
    readContract: jest.fn(),
    getLogs: jest.fn(),
  },
}));

// Mock NetworkConfigService
jest.mock('../config/network', () => ({
  NetworkConfigService: {
    getInstance: jest.fn(() => ({
      getInvoiceManagerAddress: jest.fn(() => '0x123...'),
      getUSDCAddress: jest.fn(() => '0x542...'),
    })),
  },
}));

describe('InvoiceRepository', () => {
  let repository: InvoiceRepository;

  beforeEach(() => {
    repository = InvoiceRepository.getInstance();
    jest.clearAllMocks();
  });

  it('should get invoice by ID', async () => {
    const mockData = [
      '0xB97...', // merchant
      '0x542...', // token
      1000000n, // amount
      1704067200, // dueAt
      false, // paid
      '0x000...', // payer
      0, // paidAt
    ];

    const { client } = require('../wagmi');
    client.readContract.mockResolvedValue(mockData);

    const invoice = await repository.getInvoice('0x123...');

    expect(invoice).toEqual({
      id: '0x123...',
      merchant: '0xB97...',
      token: '0x542...',
      amount: 1000000n,
      dueAt: 1704067200,
      paid: false,
      payer: '0x000...',
      paidAt: 0,
    });
  });

  it('should throw InvoiceNotFoundError when invoice not found', async () => {
    const { client } = require('../wagmi');
    client.readContract.mockRejectedValue(new Error('not found'));

    await expect(repository.getInvoice('0x123...'))
      .rejects.toThrow('Invoice not found');
  });
});
```

## Coverage

### Coverage Thresholds

| Package | Branches | Functions | Lines | Statements |
|----------|-----------|------------|--------|-------------|
| Shared | 80% | 80% | 80% | 80% |
| Web | 70% | 70% | 70% | 70% |
| Contracts | 100% | 100% | 100% | 100% |

### Generating Coverage Reports

```bash
# Generate coverage for all packages
pnpm test:coverage

# Coverage reports are generated in:
# - packages/shared/coverage/
# - apps/web/coverage/
```

### Viewing Coverage Reports

```bash
# Open HTML coverage report (web app)
open apps/web/coverage/lcov-report/index.html

# Open HTML coverage report (shared)
open packages/shared/coverage/lcov-report/index.html
```

### Coverage Report Example

```bash
% Coverage report from ...
-------------------|---------|----------|---------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
utils/validation.ts |   95.45 |    92.31 |   93.75 |   95.24 | 45-48
types/index.ts    |   85.71 |     62.5 |      80 |   88.89 | 15-20
-------------------|---------|----------|---------|---------|-------------------
All files         |   91.67 |    84.62 |   90.48 |   92.31 |
```

## Test Best Practices

### AAA Pattern

Arrange, Act, Assert pattern for clear tests:

```typescript
it('should validate amount', () => {
  // Arrange: Set up test data
  const amount = 1000000n;

  // Act: Execute function
  const result = validateAmount(amount);

  // Assert: Verify result
  expect(result.isValid).toBe(true);
});
```

### Test Naming

Use clear, descriptive test names:

```typescript
// Good: Describes what and expected behavior
it('should accept valid Ethereum address', () => { });

it('should reject zero amount', () => { });

it('should throw error when invoice not found', () => { });

// Bad: Vague
it('should work', () => { });
```

### Test Isolation

Each test should be independent:

```typescript
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});
```

### Mocking Dependencies

Mock external dependencies to test in isolation:

```typescript
// Mock service
jest.mock('../services/InvoiceRepository', () => ({
  InvoiceRepository: {
    getInstance: jest.fn(),
  },
}));

// Mock wagmi
jest.mock('wagmi', () => ({
  useWriteContract: jest.fn(),
}));

// Mock logger
jest.mock('@avalanche-bridge/shared', () => ({
  ...jest.requireActual('@avalanche-bridge/shared'),
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));
```

## CI/CD Integration

### GitHub Actions Workflow

Add `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  test-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: foundry-rs/foundry-toolchain@v1
        with:
          version: nightly
      - run: pnpm --filter contracts test

  test-shared:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm test:shared
      - run: pnpm --filter shared test:coverage

  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm test:web
      - run: pnpm --filter web test:coverage

  coverage:
    runs-on: ubuntu-latest
    needs: [test-shared, test-web]
    steps:
      - uses: actions/checkout@v3
      - uses: codecov/codecov-action@v3
        with:
          files: ./packages/shared/coverage/lcov.info,./apps/web/coverage/lcov.info
```

### Required Checks

Configure GitHub to require:

- ✅ All tests pass
- ✅ Coverage thresholds met
- ✅ Contract tests pass
- ✅ Type checking passes

## Troubleshooting

### Tests Failing

**Issue**: Tests fail with "undefined" errors

**Solution**:
```bash
# Check mock setup
# Verify all dependencies are mocked
# Ensure jest configuration is correct
```

**Issue**: Tests fail with timeout

**Solution**:
```typescript
// Increase timeout
it('should complete within time', async () => {
  // Increase timeout if needed
}, 10000);
```

### Coverage Not Generated

**Issue**: Coverage report not created

**Solution**:
```bash
# Install dependencies
pnpm install

# Check jest configuration
cat jest.config.js

# Ensure coverage paths are correct
```

### Mock Not Working

**Issue**: Mock not applied correctly

**Solution**:
```typescript
// Clear mock before test
beforeEach(() => {
  jest.clearAllMocks();
});

// Ensure mock is defined before import
jest.mock('../module', () => ({
  functionName: jest.fn(),
}));

// Use jest.requireActual for partial mocks
jest.mock('@avalanche-bridge/shared', () => ({
  ...jest.requireActual('@avalanche-bridge/shared'),
  logger: {
    debug: jest.fn(),
  },
}));
```

## Test Scripts Reference

### Root Scripts

```bash
pnpm test              # Run all tests
pnpm test:shared       # Run shared package tests
pnpm test:web          # Run web app tests
pnpm test:contracts    # Run contract tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Generate coverage reports
```

### Shared Package Scripts

```bash
pnpm --filter shared test           # Run shared tests
pnpm --filter shared test:watch     # Watch mode
pnpm --filter shared test:coverage  # Generate coverage
```

### Web App Scripts

```bash
pnpm --filter web test           # Run web tests
pnpm --filter web test:watch     # Watch mode
pnpm --filter web test:coverage  # Generate coverage
```

### Contracts Scripts

```bash
pnpm --filter contracts test        # Run contract tests
pnpm --filter contracts test:watch  # Watch mode
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Foundry Testing](https://book.getfoundry.sh/forge/writing-tests)
- [Testing Library Hooks](https://react-hooks-testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Related Documentation**:
- [Development Setup](./setup.md)
- [Code Style Guide](./code-style.md)
- [Linting Guide](./linting.md)
