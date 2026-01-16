/**
 * Invoice service implementation
 * Single Responsibility: Handles invoice business logic operations
 */

import type { IInvoiceService } from '@avalanche-bridge/shared';
import { NetworkConfigService } from '../config/network';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import {
  InvoiceAlreadyPaidError,
  InvoiceExpiredError,
  InvoiceValidationError,
  TransactionFailedError,
  logger,
  GAS_LIMITS,
} from '@avalanche-bridge/shared';
import { INVOICE_MANAGER_ABI, USDC_ABI } from '../contracts/abi';

export class InvoiceService implements IInvoiceService {
  private static instance: InvoiceService;
  private readonly networkConfig: NetworkConfigService;

  private constructor() {
    this.networkConfig = NetworkConfigService.getInstance();
  }

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  async createInvoice(
    invoiceId: string,
    tokenAddress: string,
    amount: bigint,
    dueAt: number
  ): Promise<{ hash: string }> {
    try {
      logger.info('Creating invoice', { invoiceId, amount, dueAt });

      const contractAddress =
        this.networkConfig.getInvoiceManagerAddress();

      const { writeContract } = useWriteContract();
      const result = await writeContract({
        address: contractAddress as `0x${string}`,
        abi: INVOICE_MANAGER_ABI,
        functionName: 'createInvoice',
        args: [
          invoiceId as `0x${string}`,
          tokenAddress as `0x${string}`,
          amount,
          dueAt,
        ],
        gas: GAS_LIMITS.CREATE_INVOICE,
      });

      logger.info('Invoice creation transaction submitted', {
        invoiceId,
        hash: result,
      });

      return result;
    } catch (error) {
      logger.error('Failed to create invoice', error as Error, { invoiceId });
      throw new TransactionFailedError(undefined, getErrorMessage(error));
    }
  }

  async payInvoice(invoiceId: string): Promise<{ hash: string }> {
    try {
      logger.info('Paying invoice', { invoiceId });

      const contractAddress =
        this.networkConfig.getInvoiceManagerAddress();

      const { writeContract } = useWriteContract();
      const result = await writeContract({
        address: contractAddress as `0x${string}`,
        abi: INVOICE_MANAGER_ABI,
        functionName: 'payInvoice',
        args: [invoiceId as `0x${string}`],
        gas: GAS_LIMITS.PAY_INVOICE,
      });

      logger.info('Invoice payment transaction submitted', {
        invoiceId,
        hash: result,
      });

      return result;
    } catch (error) {
      logger.error('Failed to pay invoice', error as Error, { invoiceId });
      throw new TransactionFailedError(undefined, getErrorMessage(error));
    }
  }

  async approveUSDC(
    spenderAddress: string,
    amount: bigint
  ): Promise<{ hash: string }> {
    try {
      logger.info('Approving USDC', { spenderAddress, amount });

      const usdcAddress = this.networkConfig.getUSDCAddress();

      const { writeContract } = useWriteContract();
      const result = await writeContract({
        address: usdcAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [spenderAddress as `0x${string}`, amount],
        gas: GAS_LIMITS.APPROVE_USDC,
      });

      logger.info('USDC approval transaction submitted', {
        spenderAddress,
        hash: result,
      });

      return result;
    } catch (error) {
      logger.error('Failed to approve USDC', error as Error, { spenderAddress });
      throw new TransactionFailedError(undefined, getErrorMessage(error));
    }
  }

  async getAllowance(owner: string, spender: string): Promise<bigint> {
    try {
      const usdcAddress = this.networkConfig.getUSDCAddress();

      const { data: allowance } = useReadContract({
        address: usdcAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: [owner as `0x${string}`, spender as `0x${string}`],
        enabled: !!owner && !!spender,
      });

      return (allowance as bigint) || 0n;
    } catch (error) {
      logger.error('Failed to fetch allowance', error as Error, {
        owner,
        spender,
      });
      return 0n;
    }
  }

  async getBalance(address: string): Promise<bigint> {
    try {
      const usdcAddress = this.networkConfig.getUSDCAddress();

      const { data: balance } = useReadContract({
        address: usdcAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        enabled: !!address,
      });

      return (balance as bigint) || 0n;
    } catch (error) {
      logger.error('Failed to fetch balance', error as Error, { address });
      return 0n;
    }
  }
}

/**
 * Helper function to extract error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}
