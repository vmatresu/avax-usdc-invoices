/**
 * Core interfaces for contract interactions
 * Interface Segregation Principle: Small, focused interfaces
 */

import type { Invoice, InvoiceCreatedEvent, InvoicePaidEvent } from '../types';

/**
 * Interface for invoice repository
 * Dependency Inversion: Depends on abstraction, not implementation
 */
export interface IInvoiceRepository {
  /**
   * Retrieves an invoice by ID
   */
  getInvoice(invoiceId: string): Promise<Invoice>;

  /**
   * Checks if an invoice exists
   */
  invoiceExists(invoiceId: string): Promise<boolean>;

  /**
   * Retrieves invoices for a merchant
   */
  getMerchantInvoices(merchantAddress: string): Promise<Invoice[]>;

  /**
   * Retrieves invoice creation events
   */
  getInvoiceCreatedEvents(merchantAddress: string): Promise<InvoiceCreatedEvent[]>;

  /**
   * Retrieves invoice payment event
   */
  getInvoicePaidEvent(invoiceId: string): Promise<InvoicePaidEvent | null>;
}

/**
 * Interface for invoice operations
 * Single Responsibility: Defines contract for invoice operations
 */
export interface IInvoiceService {
  /**
   * Creates a new invoice
   */
  createInvoice(
    invoiceId: string,
    tokenAddress: string,
    amount: bigint,
    dueAt: number
  ): Promise<{ hash: string }>;

  /**
   * Pays an existing invoice
   */
  payInvoice(invoiceId: string): Promise<{ hash: string }>;

  /**
   * Approves USDC spending
   */
  approveUSDC(spenderAddress: string, amount: bigint): Promise<{ hash: string }>;

  /**
   * Gets current allowance
   */
  getAllowance(owner: string, spender: string): Promise<bigint>;

  /**
   * Gets token balance
   */
  getBalance(address: string): Promise<bigint>;
}

/**
 * Interface for transaction monitoring
 */
export interface ITransactionMonitor {
  /**
   * Waits for transaction confirmation
   */
  waitForTransaction(hash: string): Promise<void>;

  /**
   * Estimates gas for transaction
   */
  estimateGas(functionName: string, args: unknown[]): Promise<bigint>;
}

/**
 * Interface for network configuration
 */
export interface INetworkConfig {
  getChainId(): number;
  getRpcUrl(): string;
  getExplorerUrl(): string;
  getUSDCAddress(): string;
  getInvoiceManagerAddress(): string;
}

/**
 * Interface for logger
 */
export interface ILogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
}

/**
 * Interface for analytics/event tracking
 */
export interface IAnalytics {
  trackEvent(eventName: string, properties?: Record<string, unknown>): void;
  trackError(error: Error, context?: Record<string, unknown>): void;
}

/**
 * Interface for caching layer
 */
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Interface for validation
 */
export interface IValidator<T> {
  validate(value: T): { isValid: boolean; error?: string };
}
