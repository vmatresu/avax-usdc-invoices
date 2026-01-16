/**
 * Central export point for shared package
 * Single Responsibility: Provides clean API for consumers
 */

// Types
export type {
  Invoice,
  CreateInvoiceParams,
  PaymentParams,
  NetworkConfig,
  DeploymentConfig,
  NetworkKey,
  InvoiceCreatedEvent,
  InvoicePaidEvent,
  InvoiceOperationState,
  ValidationResult,
} from './types';

export { InvoiceStatus } from './types';

// Constants
export {
  NETWORKS,
  USDC_ADDRESSES,
  USDC_DECIMALS,
  GAS_LIMITS,
  INVOICE_SETTINGS,
  UI_CONSTANTS,
  ERROR_MESSAGES,
  VALIDATION_PATTERNS,
  TRANSACTION_STATUS,
} from './constants';

// Validation utilities
export {
  validateAddress,
  validateBytes32,
  validateUUID,
  validateAmount,
  validateDueDate,
  validateCreateInvoice,
  isInvoiceExpired,
  formatUSDC,
  parseUSDC,
  formatTimestamp,
  shortenAddress,
  shortenTxHash,
  uuidToBytes32,
  generateUUID,
} from './utils/validation';

// Errors
export {
  AppError,
  WalletNotConnectedError,
  WrongNetworkError,
  InvoiceNotFoundError,
  InvoiceAlreadyPaidError,
  InvoiceExpiredError,
  InvoiceValidationError,
  InsufficientFundsError,
  InsufficientAllowanceError,
  TransactionFailedError,
  TransactionRevertedError,
  NetworkError,
  RPCError,
  ConfigurationError,
  isAppError,
  getErrorMessage,
  getErrorCode,
} from './errors';

// Interfaces
export type {
  IInvoiceRepository,
  IInvoiceService,
  ITransactionMonitor,
  INetworkConfig,
  ILogger,
  IAnalytics,
  ICache,
  IValidator,
} from './interfaces';

// Logger
export {
  ConsoleLogger,
  NoOpLogger,
  LogLevel,
  logger,
} from './logger';
