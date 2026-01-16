/**
 * Core domain types for the Avalanche USDC Invoice system
 * Single Responsibility: Defines the domain model
 */

/**
 * Represents a complete invoice state from the blockchain
 */
export interface Invoice {
  readonly id: string;
  readonly merchant: string;
  readonly token: string;
  readonly amount: bigint;
  readonly dueAt: number;
  readonly paid: boolean;
  readonly payer: string;
  readonly paidAt: number;
}

/**
 * Represents invoice creation parameters
 */
export interface CreateInvoiceParams {
  readonly amount: bigint;
  readonly dueAt: number;
  readonly invoiceId: string;
}

/**
 * Represents payment flow parameters
 */
export interface PaymentParams {
  readonly invoiceId: string;
  readonly amount: bigint;
}

/**
 * Represents network configuration
 */
export interface NetworkConfig {
  readonly chainId: number;
  readonly name: string;
  readonly rpcUrl: string;
  readonly explorerUrl: string;
  readonly nativeTokenSymbol: string;
}

/**
 * Represents deployment information
 */
export interface DeploymentConfig {
  readonly network: NetworkKey;
  readonly address: string;
  readonly transactionHash: string;
  readonly blockNumber: number;
  readonly deployedAt: string;
}

/**
 * Supported network keys
 */
export type NetworkKey = 'FUJI' | 'MAINNET';

/**
 * Invoice status enumeration for type-safe status checks
 */
export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  NOT_FOUND = 'not_found',
}

/**
 * Represents event data for InvoiceCreated
 */
export interface InvoiceCreatedEvent {
  readonly invoiceId: string;
  readonly merchant: string;
  readonly token: string;
  readonly amount: bigint;
  readonly dueAt: number;
  readonly blockNumber: bigint;
  readonly transactionHash: string;
}

/**
 * Represents event data for InvoicePaid
 */
export interface InvoicePaidEvent {
  readonly invoiceId: string;
  readonly merchant: string;
  readonly payer: string;
  readonly token: string;
  readonly amount: bigint;
  readonly paidAt: number;
  readonly blockNumber: bigint;
  readonly transactionHash: string;
}

/**
 * UI state for invoice operations
 */
export interface InvoiceOperationState {
  readonly isLoading: boolean;
  readonly isPending: boolean;
  readonly error: string | null;
}

/**
 * Validation result with optional error message
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}
