# Architecture Documentation

This document explains the production-grade architecture of the Avalanche USDC Invoices system, focusing on SOLID principles, DRY code, and modular design.

## Table of Contents

1. [SOLID Principles](#solid-principles)
2. [DRY Implementation](#dry-implementation)
3. [Layered Architecture](#layered-architecture)
4. [Design Patterns](#design-patterns)
5. [Code Organization](#code-organization)
6. [Testing Strategy](#testing-strategy)

## SOLID Principles

### Single Responsibility Principle (SRP)

Each class, function, and component has exactly one reason to change.

#### Examples:

**InvoiceRepository**
```typescript
// GOOD: Only handles data access
class InvoiceRepository implements IInvoiceRepository {
  async getInvoice(invoiceId: string): Promise<Invoice> { ... }
  async getMerchantInvoices(merchant: string): Promise<Invoice[]> { ... }
}

// BAD: Handles data access + formatting + business logic
class InvoiceRepository {
  async getInvoice(invoiceId: string): Promise<FormattedInvoice> {
    const invoice = await this.fetchFromChain(invoiceId);
    const formatted = this.formatInvoice(invoice);
    const validated = this.validateInvoice(formatted);
    return validated;
  }
}
```

**InvoiceStatusBadge**
```typescript
// GOOD: Only displays status
function InvoiceStatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status];
  return <span className={`${config.className} ${className}`}>{config.label}</span>;
}

// BAD: Displays status + fetches invoice + handles payment
function InvoiceStatusBadge({ invoiceId }) {
  const invoice = useInvoice(invoiceId);
  const pay = usePayment();
  return (
    <div>
      <span>{invoice.status}</span>
      <button onClick={() => pay(invoiceId)}>Pay</button>
    </div>
  );
}
```

### Open/Closed Principle (OCP)

Software entities are open for extension but closed for modification.

#### Examples:

**Logger Interface**
```typescript
// GOOD: New loggers can be added without modifying code
interface ILogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
}

class ConsoleLogger implements ILogger { ... }
class FileLogger implements ILogger { ... }
class RemoteLogger implements ILogger { ... } // Can be added later

// BAD: New loggers require modifying logger implementation
class Logger {
  log(level: string, message: string) {
    if (level === 'console') { ... }
    if (level === 'file') { ... }
    if (level === 'remote') { ... } // Must add this for new logger
  }
}
```

**Network Configuration**
```typescript
// GOOD: Networks can be added via configuration
const NETWORKS: Record<string, NetworkConfig> = {
  FUJI: { ... },
  MAINNET: { ... },
  SEPOLIA: { ... }, // Can be added without changing code
};

// BAD: Network selection requires code changes
function getNetworkConfig() {
  if (chainId === 43113) return fujiConfig;
  if (chainId === 43114) return mainnetConfig;
  // Must add if statement for each new network
}
```

### Liskov Substitution Principle (LSP)

Objects should be replaceable with instances of their subtypes without affecting correctness.

#### Examples:

**Logger Implementations**
```typescript
// GOOD: Both implementations can be used interchangeably
function logMessage(logger: ILogger, message: string) {
  logger.info(message);
}

const consoleLogger = new ConsoleLogger();
const noOpLogger = new NoOpLogger();

logMessage(consoleLogger, "Hello"); // Works
logMessage(noOpLogger, "Hello"); // Works

// BAD: Different behavior breaks substitution
function logMessage(logger: any, message: string) {
  logger.log(message);
}

const logger1 = { log: (msg) => console.log(msg) };
const logger2 = { log: (msg) => null }; // Silently drops messages

logMessage(logger1, "Hello"); // Logs
logMessage(logger2, "Hello"); // Doesn't log (unexpected)
```

### Interface Segregation Principle (ISP)

Clients shouldn't depend on interfaces they don't use.

#### Examples:

**Invoice Interfaces**
```typescript
// GOOD: Small, focused interfaces
interface IInvoiceReader {
  getInvoice(invoiceId: string): Promise<Invoice>;
  getMerchantInvoices(merchant: string): Promise<Invoice[]>;
}

interface IInvoiceWriter {
  createInvoice(params: CreateInvoiceParams): Promise<{ hash: string }>;
  payInvoice(invoiceId: string): Promise<{ hash: string }>;
}

interface IInvoiceValidator {
  validate(params: CreateInvoiceParams): ValidationResult;
}

// BAD: Large interface with unused methods
interface IInvoiceManager {
  getInvoice(invoiceId: string): Promise<Invoice>;
  getMerchantInvoices(merchant: string): Promise<Invoice[]>;
  createInvoice(params: CreateInvoiceParams): Promise<{ hash: string }>;
  payInvoice(invoiceId: string): Promise<{ hash: string }>;
  approveUSDC(amount: bigint): Promise<{ hash: string }>;
  getAllowance(): Promise<bigint>;
  // A component that only reads shouldn't need write methods
}
```

### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions.

#### Examples:

**Service Dependencies**
```typescript
// GOOD: Depends on interfaces
class InvoiceService {
  constructor(
    private readonly repository: IInvoiceRepository,
    private readonly logger: ILogger
  ) {}
}

// Can inject any implementation
const service = new InvoiceService(
  new InvoiceRepository(),
  new FileLogger()
);

// BAD: Depends on concrete implementations
class InvoiceService {
  constructor(
    private readonly repository: InvoiceRepository, // Concrete
    private readonly logger: ConsoleLogger // Concrete
  ) {}
}
```

## DRY Implementation

### Shared Types Package

Prevents duplication of type definitions across frontend and backend.

```typescript
// packages/shared/types/index.ts
export interface Invoice { ... }
export interface CreateInvoiceParams { ... }

// apps/web/lib/invoice/types.ts (BAD - duplication)
export interface Invoice { ... }
export interface CreateInvoiceParams { ... }
```

### Custom Hooks

Encapsulates reusable stateful logic.

```typescript
// GOOD: Reusable hook
export function useInvoice(invoiceId: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchInvoice(invoiceId, setInvoice, setIsLoading); }, [invoiceId]);

  return { invoice, isLoading };
}

// BAD: Duplicated logic in components
function ComponentA() {
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => { fetchInvoice(id1, setInvoice, setIsLoading); }, [id1]);
}

function ComponentB() {
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => { fetchInvoice(id2, setInvoice, setIsLoading); }, [id2]);
}
```

### Service Layer

Reusable business logic across components.

```typescript
// GOOD: Service layer
export class InvoiceService {
  async createInvoice(params: CreateInvoiceParams) {
    this.validate(params);
    return this.repository.create(params);
  }
}

// Used in multiple places
const service = new InvoiceService();
service.createInvoice(params1);
service.createInvoice(params2);

// BAD: Logic duplicated in components
function ComponentA() {
  const create = async () => {
    validate(params1);
    repository.create(params1);
  };
}

function ComponentB() {
  const create = async () => {
    validate(params2);
    repository.create(params2);
  };
}
```

### Reusable Components

Small, focused components that can be composed.

```typescript
// GOOD: Reusable components
<InvoiceStatusBadge status={status} />
<AddressLink address={address} />
<TxHashLink hash={hash} />

// BAD: Duplicated UI code
function InvoiceCard({ invoice }) {
  return (
    <div className="...">
      {invoice.paid && <span className="bg-green">Paid</span>}
      {!invoice.paid && <span className="bg-yellow">Pending</span>}
      <a href={`/address/${invoice.merchant}`}>{invoice.merchant.slice(0,6)}...</a>
    </div>
  );
}
```

## Layered Architecture

### Presentation Layer (Next.js Pages)

**Responsibility:**
- Renders UI components
- Handles user interactions
- Manages page state
- Delegates to hooks for data

**Examples:**
- `app/page.tsx` - Landing page
- `app/merchant/page.tsx` - Merchant dashboard
- `app/pay/[invoiceId]/page.tsx` - Payment flow

### Hooks Layer (Custom Hooks)

**Responsibility:**
- Encapsulates stateful logic
- Bridges components and services
- Manages side effects
- Provides data transformations

**Examples:**
- `useInvoice` - Invoice data fetching
- `useInvoiceOperations` - Invoice write operations
- `useError` - Error handling logic

### Service Layer (Business Logic)

**Responsibility:**
- Implements business rules
- Coordinates data operations
- Validates inputs
- Handles transactions

**Examples:**
- `InvoiceService` - Invoice operations
- `InvoiceRepository` - Data access
- `NetworkConfigService` - Configuration

### Contracts Layer (Smart Contracts)

**Responsibility:**
- On-chain data storage
- Business logic execution
- Event emission
- Security enforcement

**Examples:**
- `InvoiceManager.sol` - Invoice contract
- `MockUSDC.sol` - Test token

### Shared Package (Foundation)

**Responsibility:**
- Type definitions
- Constants
- Validation utilities
- Error classes

**Examples:**
- `types/index.ts` - Domain types
- `constants/index.ts` - App constants
- `utils/validation.ts` - Validation logic

## Design Patterns

### Repository Pattern

Separates data access logic from business logic.

```typescript
interface IInvoiceRepository {
  getInvoice(invoiceId: string): Promise<Invoice>;
  getMerchantInvoices(merchant: string): Promise<Invoice[]>;
}

class InvoiceRepository implements IInvoiceRepository {
  async getInvoice(invoiceId: string): Promise<Invoice> {
    // Fetch from blockchain
  }
}
```

### Singleton Pattern

Ensures single instance of services.

```typescript
class NetworkConfigService {
  private static instance: NetworkConfigService;

  private constructor(private readonly chainId: number) {}

  static getInstance(): NetworkConfigService {
    if (!NetworkConfigService.instance) {
      NetworkConfigService.instance = new NetworkConfigService(chainId);
    }
    return NetworkConfigService.instance;
  }
}
```

### Factory Pattern

Creates objects without specifying exact class.

```typescript
class LoggerFactory {
  static createLogger(): ILogger {
    if (process.env.NODE_ENV === 'test') {
      return new NoOpLogger();
    }
    return new ConsoleLogger();
  }
}
```

### Strategy Pattern

Defines family of algorithms and makes them interchangeable.

```typescript
interface IValidationStrategy {
  validate(value: unknown): ValidationResult;
}

class AddressValidationStrategy implements IValidationStrategy {
  validate(value: unknown): ValidationResult {
    // Validate address
  }
}

class AmountValidationStrategy implements IValidationStrategy {
  validate(value: unknown): ValidationResult {
    // Validate amount
  }
}
```

### Observer Pattern

Components subscribe to state changes.

```typescript
// React's built-in pattern
function useInvoice(invoiceId: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    // Subscribe to invoice changes
    const unsubscribe = subscribeToInvoice(invoiceId, setInvoice);
    return unsubscribe;
  }, [invoiceId]);

  return invoice;
}
```

## Code Organization

### File Naming

- **PascalCase**: React components, classes
- **camelCase**: Functions, variables, hooks
- **kebab-case**: Files, folders
- **UPPER_SNAKE_CASE**: Constants

```typescript
// Components
export function InvoiceStatusBadge() { ... }

// Classes
export class InvoiceRepository implements IInvoiceRepository { ... }

// Functions
export function formatUSDC(amount: bigint): string { ... }

// Hooks
export function useInvoice(invoiceId: string) { ... }

// Constants
export const ERROR_MESSAGES = { ... }
```

### Folder Structure

Each folder has a clear purpose and contains related files.

```
lib/
├── hooks/           # Stateful logic
├── services/        # Business logic
├── config/          # Configuration
├── components/      # Reusable components
├── contracts/       # Contract ABIs
└── utils/          # Utility functions
```

### Import Organization

Imports are grouped by type and sorted alphabetically within groups.

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

// 2. Internal shared
import type { Invoice, InvoiceStatus } from '@avalanche-bridge/shared';
import { logger, InvoiceStatus } from '@avalanche-bridge/shared';

// 3. Internal hooks
import { useInvoice, useInvoiceOperations } from '@/lib/hooks';

// 4. Internal components
import { InvoiceStatusBadge } from '@/lib/components/InvoiceStatusBadge';

// 5. Internal utils
import { formatUSDC, parseUSDC } from '@/lib/utils';
```

## Testing Strategy

### Unit Tests

Test individual functions and classes in isolation.

```typescript
// Validation tests
describe('validateAmount', () => {
  it('rejects zero amount', () => {
    const result = validateAmount(0n);
    expect(result.isValid).toBe(false);
  });

  it('accepts valid amount', () => {
    const result = validateAmount(1000000n);
    expect(result.isValid).toBe(true);
  });
});
```

### Integration Tests

Test interactions between components.

```typescript
// Service tests
describe('InvoiceService', () => {
  it('creates invoice and returns hash', async () => {
    const service = new InvoiceService(mockRepository);
    const result = await service.createInvoice(params);
    expect(result.hash).toBeDefined();
  });
});
```

### Contract Tests

Test smart contract logic with Foundry.

```solidity
// Foundry tests
function test_CreateInvoiceHappyPath() public {
    vm.prank(merchant);
    invoiceManager.createInvoice(INVOICE_ID, usdcAddress, AMOUNT, DUE_AT);

    // Verify state
    (address merchant, , uint256 amount, , bool paid, , ) =
        invoiceManager.getInvoice(INVOICE_ID);
    assertEq(merchant, merchant);
    assertEq(amount, AMOUNT);
    assertEq(paid, false);
}
```

### Component Tests

Test React components with mocking.

```typescript
// Component tests
describe('InvoiceStatusBadge', () => {
  it('renders pending status', () => {
    render(<InvoiceStatusBadge status={InvoiceStatus.PENDING} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
```

## Best Practices

### Error Handling

- Use custom error classes
- Provide user-friendly messages
- Log errors with context
- Graceful degradation

### Performance

- Use React.memo for expensive components
- Implement virtualization for lists
- Cache expensive computations
- Lazy load routes

### Security

- Validate all inputs
- Sanitize user data
- Use HTTPS in production
- Never expose private keys

### Accessibility

- Use semantic HTML
- Provide ARIA labels
- Support keyboard navigation
- Ensure color contrast

---

This architecture ensures the codebase is maintainable, scalable, and follows industry best practices.
