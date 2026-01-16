/**
 * Invoice repository implementation
 * Single Responsibility: Handles all invoice data access
 */

import type {
  IInvoiceRepository,
  Invoice,
  InvoiceCreatedEvent,
  InvoicePaidEvent,
} from '@avalanche-bridge/shared';
import { NetworkConfigService } from '../config/network';
import { client } from '../wagmi';
import { INVOICE_MANAGER_ABI } from '../contracts/abi';
import {
  InvoiceNotFoundError,
  NetworkError,
  logger,
} from '@avalanche-bridge/shared';

export class InvoiceRepository implements IInvoiceRepository {
  private static instance: InvoiceRepository;
  private readonly networkConfig: NetworkConfigService;

  private constructor() {
    this.networkConfig = NetworkConfigService.getInstance();
  }

  static getInstance(): InvoiceRepository {
    if (!InvoiceRepository.instance) {
      InvoiceRepository.instance = new InvoiceRepository();
    }
    return InvoiceRepository.instance;
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const contractAddress = this.networkConfig.getInvoiceManagerAddress();

      logger.debug('Fetching invoice', { invoiceId, contractAddress });

      const [merchant, token, amount, dueAt, paid, payer, paidAt] =
        await client.readContract({
          address: contractAddress as `0x${string}`,
          abi: INVOICE_MANAGER_ABI,
          functionName: 'getInvoice',
          args: [invoiceId as `0x${string}`],
        });

      logger.info('Invoice fetched successfully', {
        invoiceId,
        merchant,
        paid,
      });

      return {
        id: invoiceId,
        merchant: merchant as string,
        token: token as string,
        amount: amount as bigint,
        dueAt: dueAt as number,
        paid: paid as boolean,
        payer: payer as string,
        paidAt: paidAt as number,
      };
    } catch (error) {
      logger.error('Failed to fetch invoice', error as Error, { invoiceId });
      throw new InvoiceNotFoundError(invoiceId);
    }
  }

  async invoiceExists(invoiceId: string): Promise<boolean> {
    try {
      const contractAddress = this.networkConfig.getInvoiceManagerAddress();

      const exists = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: INVOICE_MANAGER_ABI,
        functionName: 'invoiceExists',
        args: [invoiceId as `0x${string}`],
      });

      return exists as boolean;
    } catch (error) {
      logger.error('Failed to check invoice existence', error as Error, {
        invoiceId,
      });
      return false;
    }
  }

  async getMerchantInvoices(merchantAddress: string): Promise<Invoice[]> {
    try {
      logger.debug('Fetching merchant invoices', { merchantAddress });

      const events = await this.getInvoiceCreatedEvents(merchantAddress);

      const invoices = await Promise.all(
        events.map((event) => this.getInvoice(event.invoiceId))
      );

      logger.info('Merchant invoices fetched', {
        merchantAddress,
        count: invoices.length,
      });

      return invoices;
    } catch (error) {
      logger.error(
        'Failed to fetch merchant invoices',
        error as Error,
        { merchantAddress }
      );
      throw new NetworkError('Failed to fetch invoices', error);
    }
  }

  async getInvoiceCreatedEvents(
    merchantAddress: string
  ): Promise<InvoiceCreatedEvent[]> {
    try {
      const contractAddress = this.networkConfig.getInvoiceManagerAddress();

      const logs = await client.getLogs({
        address: contractAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'InvoiceCreated',
          inputs: [
            { name: 'invoiceId', type: 'bytes32', indexed: true },
            { name: 'merchant', type: 'address', indexed: true },
            { name: 'token', type: 'address', indexed: false },
            { name: 'amount', type: 'uint256', indexed: false },
            { name: 'dueAt', type: 'uint64', indexed: false },
          ],
        },
        args: {
          merchant: merchantAddress as `0x${string}`,
        },
        fromBlock: 0n,
      });

      return logs.map((log) => ({
        invoiceId: log.args.invoiceId as string,
        merchant: log.args.merchant as string,
        token: log.args.token as string,
        amount: log.args.amount as bigint,
        dueAt: log.args.dueAt as number,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      }));
    } catch (error) {
      logger.error('Failed to fetch invoice events', error as Error, {
        merchantAddress,
      });
      throw new NetworkError('Failed to fetch invoice events', error);
    }
  }

  async getInvoicePaidEvent(
    invoiceId: string
  ): Promise<InvoicePaidEvent | null> {
    try {
      const contractAddress = this.networkConfig.getInvoiceManagerAddress();

      const logs = await client.getLogs({
        address: contractAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'InvoicePaid',
          inputs: [
            { name: 'invoiceId', type: 'bytes32', indexed: true },
            { name: 'merchant', type: 'address', indexed: true },
            { name: 'payer', type: 'address', indexed: true },
            { name: 'token', type: 'address', indexed: false },
            { name: 'amount', type: 'uint256', indexed: false },
            { name: 'paidAt', type: 'uint64', indexed: false },
          ],
        },
        args: {
          invoiceId: invoiceId as `0x${string}`,
        },
        fromBlock: 0n,
      });

      if (logs.length === 0) {
        return null;
      }

      const log = logs[0];
      return {
        invoiceId: log.args.invoiceId as string,
        merchant: log.args.merchant as string,
        payer: log.args.payer as string,
        token: log.args.token as string,
        amount: log.args.amount as bigint,
        paidAt: log.args.paidAt as number,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      };
    } catch (error) {
      logger.error('Failed to fetch payment event', error as Error, {
        invoiceId,
      });
      return null;
    }
  }
}
