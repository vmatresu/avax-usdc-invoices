# Code Style Guide

This document defines the coding standards and conventions used in Avalanche USDC Invoices project.

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Conventions](#typescript-conventions)
3. [React Conventions](#react-conventions)
4. [Solidity Conventions](#solidity-conventions)
5. [File Naming](#file-naming)
6. [Import Organization](#import-organization)
7. [Documentation](#documentation)
8. [Testing Conventions](#testing-conventions)

## General Principles

### 1. SOLID Principles

- **Single Responsibility**: Each function/class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes are substitutable
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions, not implementations

### 2. DRY (Don't Repeat Yourself)

- Extract common logic into functions/hooks
- Create reusable components
- Use shared utilities
- Avoid code duplication

### 3. KISS (Keep It Simple, Stupid)

- Write simple, readable code
- Avoid premature optimization
- Choose clarity over cleverness
- Document complex logic

### 4. YAGNI (You Aren't Gonna Need It)

- Implement only what's needed now
- Avoid over-engineering
- Build for requirements, not future possibilities
- Keep scope minimal

## TypeScript Conventions

### Type Definitions

```typescript
// Interface for data structures
interface Invoice {
  id: string;
  amount: bigint;
  merchant: string;
}

// Type for union types
type InvoiceStatus = 'pending' | 'paid' | 'expired';

// Type for function signatures
type CreateInvoiceParams = {
  amount: bigint;
  dueAt: number;
};

// Enum for constants
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
}
```

### Type Annotations

```typescript
// Always annotate function parameters and return types
function formatUSDC(amount: bigint): string {
  return (Number(amount) / 1e6).toLocaleString();
}

// Use type inference when obvious
const invoice = getInvoice(invoiceId); // Type inferred

// Use explicit types when unclear
const amount: bigint = parseUSDC(input);
```

### Type Safety

```typescript
// Avoid any - use unknown instead
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data;
  }
  throw new Error('Invalid data');
}

// Use type guards
function isInvoice(data: unknown): data is Invoice {
  return typeof data === 'object' && data !== null && 'id' in data;
}

// Use type assertions sparingly
const invoice = data as Invoice; // Only when sure
```

### Generics

```typescript
// Use generics for reusable types
interface Repository<T> {
  get(id: string): Promise<T>;
  getAll(): Promise<T[]>;
}

// Constrain generics
interface Validator<T extends { id: string }> {
  validate(value: T): boolean;
}
```

## React Conventions

### Component Structure

```typescript
// Imports: external → internal → components
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { Invoice } from '@avalanche-bridge/shared';
import { InvoiceStatusBadge } from '@/lib/components/InvoiceStatusBadge';

// Props interface
interface InvoiceCardProps {
  invoice: Invoice;
  className?: string;
}

// Component
export function InvoiceCard({ invoice, className }: InvoiceCardProps) {
  // Hooks at top
  const { status } = useInvoiceStatus(invoice);

  // Handlers
  const handleClick = () => {
    console.log('Clicked', invoice.id);
  };

  // Render
  return (
    <div className={className} onClick={handleClick}>
      <InvoiceStatusBadge status={status} />
      {/* ... */}
    </div>
  );
}
```

### Hooks

```typescript
// Custom hooks for reusable logic
export function useInvoice(invoiceId: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInvoice(invoiceId).then(setInvoice);
  }, [invoiceId]);

  return { invoice, isLoading };
}

// Hook return type
interface UseInvoiceReturn {
  invoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInvoice(invoiceId: string): UseInvoiceReturn {
  // ...
}
```

### State Management

```typescript
// Use local state for component-specific state
function Component() {
  const [isOpen, setIsOpen] = useState(false);

  // Use context for shared state
  const { user } = useAuthContext();

  // Use global state for app-wide state
  const { dispatch } = useAppDispatch();
}
```

### Event Handlers

```typescript
// Use useCallback for handlers
const handlePay = useCallback(async () => {
  try {
    await payInvoice(invoiceId);
    onSuccess();
  } catch (error) {
    onError(error);
  }
}, [invoiceId, onSuccess, onError]);

// Pass event when needed
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // ...
};
```

### Conditional Rendering

```typescript
// Use ternary for simple conditions
<div>{isLoggedIn ? <Dashboard /> : <Login />}</div>

// Use && for showing
{showDetails && <InvoiceDetails invoice={invoice} />}

// Use || for fallback
{amount || 'N/A'}

// Use early returns for complex conditions
function Component() {
  if (!invoice) return <LoadingState />;
  if (invoice.paid) return <Receipt invoice={invoice} />;

  return <PaymentFlow invoice={invoice} />;
}
```

## Solidity Conventions

### Contract Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract InvoiceManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Custom errors
    error InvoiceNotFound(bytes32 invoiceId);
    error InvalidAmount();

    // State variables
    mapping(bytes32 => Invoice) private invoices;

    // Structs
    struct Invoice {
        address merchant;
        uint256 amount;
    }

    // Events
    event InvoiceCreated(bytes32 indexed invoiceId, uint256 amount);

    // Modifiers
    modifier onlyValidInvoice(bytes32 invoiceId) {
        if (invoices[invoiceId].merchant == address(0)) {
            revert InvoiceNotFound(invoiceId);
        }
        _;
    }

    // Functions
    function createInvoice(...) external {
        // ...
    }
}
```

### Naming Conventions

```solidity
// Contracts: PascalCase
contract InvoiceManager { ... }

// Functions: camelCase
function createInvoice(...) external { ... }

// Events: PascalCase
event InvoiceCreated(bytes32 indexed invoiceId);

// Custom errors: PascalCase
error InvoiceNotFound(bytes32 invoiceId);

// State variables: camelCase
mapping(bytes32 => Invoice) private invoices;

// Constants: UPPER_SNAKE_CASE
uint256 constant MIN_AMOUNT = 1e6;
```

### Gas Optimization

```solidity
// Use uint256 instead of smaller types for public state
uint256 public totalInvoices;

// Use packed structs for private state
struct Invoice {
    address merchant;   // 20 bytes
    uint128 amount;     // 16 bytes (fits in same slot)
} // Total: 36 bytes, fits in one slot

// Use calldata for read-only parameters
function getInvoice(bytes32 calldata invoiceId) external view returns (Invoice memory) { ... }

// Use unchecked for loop increments (with careful overflow checks)
for (uint256 i = 0; i < length; unchecked { ++i }) { ... }
```

## File Naming

### TypeScript/React

```
Components: PascalCase.tsx
- InvoiceStatusBadge.tsx
- PaymentFlow.tsx

Hooks: useCamelCase.ts
- useInvoice.ts
- useWallet.ts

Services: PascalCase.ts
- InvoiceService.ts
- InvoiceRepository.ts

Utilities: camelCase.ts or specific.ts
- formatUSDC.ts
- validation.ts

Types: types.ts or index.ts
- types/index.ts
- types/invoice.ts

Tests: *.test.ts or *.spec.ts
- InvoiceRepository.test.ts
- useInvoice.test.ts
```

### Solidity

```
Contracts: PascalCase.sol
- InvoiceManager.sol
- MockUSDC.sol

Interfaces: IName.sol
- IInvoice.sol

Tests: Contract.t.sol
- InvoiceManager.t.sol

Scripts: ScriptName.s.sol
- Deploy.s.sol
```

### Configuration

```
Configuration files: .filename
- .eslintrc.js
- .prettierrc
- .env.example

Package files: package.json
- package.json
- tsconfig.json
```

## Import Organization

### Import Groups

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

// 2. Internal shared
import type { Invoice, InvoiceStatus } from '@avalanche-bridge/shared';
import { logger, InvoiceStatus } from '@avalanche-bridge/shared';

// 3. Internal hooks
import { useInvoice } from '@/lib/hooks/useInvoice';
import { useError } from '@/lib/hooks/useError';

// 4. Internal components
import { InvoiceStatusBadge } from '@/lib/components/InvoiceStatusBadge';
import { LoadingState } from '@/lib/components/LoadingState';

// 5. Internal services
import { InvoiceRepository } from '@/lib/services/InvoiceRepository';
import { NetworkConfigService } from '@/lib/config/network';

// 6. Internal utilities
import { formatUSDC, shortenAddress } from '@/lib/utils';
```

### Import Sorting

```typescript
// Sort alphabetically within groups
import { useState, useEffect } from 'react'; // alphabetical
import { useAccount, useReadContract } from 'wagmi'; // alphabetical
```

### Type Imports

```typescript
// Use type-only imports when possible
import type { Invoice, InvoiceStatus } from '@avalanche-bridge/shared';

// Import both types and values
import { InvoiceStatus, logger } from '@avalanche-bridge/shared';
```

## Documentation

### Function Documentation

```typescript
/**
 * Creates a new invoice
 *
 * @param invoiceId - Unique invoice identifier
 * @param token - Payment token address (USDC)
 * @param amount - Invoice amount in USDC (6 decimals)
 * @param dueAt - Expiration timestamp (0 = never)
 * @returns Transaction hash
 * @throws {InvoiceAlreadyPaid} If invoice already paid
 * @throws {InvoiceExpired} If invoice past due date
 *
 * @example
 * ```typescript
 * const result = await createInvoice(
 *   invoiceId,
 *   usdcAddress,
 *   1000000n, // 1 USDC
 *   Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 days
 * );
 * ```
 */
async function createInvoice(
  invoiceId: string,
  token: string,
  amount: bigint,
  dueAt: number
): Promise<{ hash: string }> {
  // ...
}
```

### Component Documentation

```typescript
/**
 * InvoiceStatusBadge Component
 *
 * Displays the status of an invoice with appropriate styling.
 *
 * @example
 * ```tsx
 * <InvoiceStatusBadge status={InvoiceStatus.PAID} />
 * ```
 *
 * @remarks
 * This component automatically selects the correct color scheme
 * based on the status type.
 */
export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  // ...
}
```

### Inline Comments

```typescript
// Good: Explains "why", not "what"
// Use exact-amount approval for security (not infinite)
await approveUSDC(invoiceAmount);

// Good: Explains complex logic
// Convert bytes32 invoice ID to UUID string
// by removing '0x' prefix and inserting hyphens
const uuid = bytes32ToUUID(invoiceId);

// Bad: Repeats obvious code
// Get invoice from repository
const invoice = repository.getInvoice(id);

// Bad: Outdated comments
// TODO: Remove this in v2.0 (if not going to be removed)
```

### JSDoc Tags

Commonly used tags:

- `@param` - Function parameter
- `@returns` - Return value
- `@throws` - Exceptions thrown
- `@example` - Usage example
- `@remarks` - Additional information
- `@see` - See also
- `@deprecated` - Deprecation notice
- `@since` - Version introduced
- `@author` - Author information

## Testing Conventions

### Test Structure

```typescript
// Arrange, Act, Assert (AAA) pattern
describe('InvoiceRepository', () => {
  beforeEach(() => {
    // Arrange: Set up test
    mockRepository.reset();
  });

  it('should get invoice by ID', async () => {
    // Arrange: Prepare data
    const invoiceId = '0x1234...';
    const expectedInvoice = mockInvoice(invoiceId);
    mockRepository.set(invoiceId, expectedInvoice);

    // Act: Execute function
    const result = await repository.getInvoice(invoiceId);

    // Assert: Verify result
    expect(result).toEqual(expectedInvoice);
  });
});
```

### Test Naming

```typescript
// Should statements
it('should create invoice successfully', async () => { ... });

// When... then... statements
it('when invoice not found, should throw error', async () => { ... });

// Error cases
it('should throw when amount is zero', async () => { ... });

// Edge cases
it('should handle maximum amount', async () => { ... });
```

### Test Coverage

- **Unit Tests**: Test functions and classes in isolation
- **Integration Tests**: Test interactions between components
- **Contract Tests**: Test all smart contract functions and events
- **E2E Tests**: Test complete user workflows

### Mocking

```typescript
// Mock services for isolated testing
const mockRepository = jest.mocked<InvoiceRepository>({
  getInvoice: jest.fn(),
  createInvoice: jest.fn(),
});

// Reset mocks between tests
beforeEach(() => {
  mockRepository.getInvoice.mockReset();
});
```

## Error Handling

### Error Types

```typescript
// Use custom error classes
export class InvoiceNotFoundError extends AppError {
  constructor(invoiceId: string) {
    super(`Invoice ${invoiceId} not found`, 'INVOICE_NOT_FOUND');
  }
}

// Throw specific errors
if (!invoice) {
  throw new InvoiceNotFoundError(invoiceId);
}
```

### Error Logging

```typescript
// Log errors with context
try {
  await createInvoice(params);
} catch (error) {
  logger.error('Failed to create invoice', error as Error, {
    params,
    userAddress,
  });
  throw error; // Re-throw for UI to handle
}
```

### User-Friendly Messages

```typescript
// Convert technical errors to user-friendly messages
function getErrorMessage(error: unknown): string {
  if (error instanceof InvoiceNotFoundError) {
    return 'Invoice not found. Please check the invoice ID.';
  }
  if (error instanceof InsufficientFundsError) {
    return 'Insufficient funds. Please top up your wallet.';
  }
  return 'An unexpected error occurred. Please try again.';
}
```

## Performance Considerations

### React Performance

```typescript
// Use React.memo for expensive components
export const InvoiceCard = React.memo(({ invoice }) => {
  // ...
});

// Use useCallback for handlers
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);

// Use useMemo for expensive calculations
const total = useMemo(() => {
  return invoices.reduce((sum, inv) => sum + inv.amount, 0n);
}, [invoices]);
```

### Code Splitting

```typescript
// Lazy load routes
const PaymentPage = dynamic(() => import('@/app/pay/[invoiceId]/page'));
const ReceiptPage = dynamic(() => import('@/app/receipt/[invoiceId]/page'));
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority
/>
```

## Security Considerations

### Input Validation

```typescript
// Validate all user inputs
function validateAmount(amount: bigint): ValidationResult {
  if (amount <= 0n) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  return { isValid: true };
}

// Use before processing
const validation = validateAmount(amount);
if (!validation.isValid) {
  throw new Error(validation.error);
}
```

### Type Safety

```typescript
// Never use `any` - use `unknown` instead
function process(data: unknown) {
  if (isInvoice(data)) {
    // Now TypeScript knows it's Invoice
    return data;
  }
}

// Type guard functions
function isInvoice(data: unknown): data is Invoice {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

### Secret Management

```typescript
// Never hardcode secrets
// BAD
const apiKey = 'secret-key-here';

// GOOD: Use environment variables
const apiKey = process.env.API_KEY;

// Never expose secrets to frontend
// Only backend can access secrets
```

## Code Review Checklist

Before submitting code, verify:

- [ ] No ESLint errors
- [ ] No Prettier formatting issues
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Functions documented with JSDoc
- [ ] Complex logic has comments
- [ ] No console.log statements (except in error handling)
- [ ] No debugger statements
- [ ] No hardcoded values (use constants)
- [ ] No `any` types (use `unknown`)
- [ ] No code duplication
- [ ] Single responsibility principle followed
- [ ] Proper error handling
- [ ] Security best practices followed

---

**Related Documentation**:
- [Linting Guide](./linting.md)
- [Development Setup](./setup.md)
- [Architecture Overview](../architecture/overview.md)
