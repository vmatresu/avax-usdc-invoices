import { InvoiceNotFoundError, logger } from '@avax-usdc-invoices/shared';
import { NetworkConfigService } from '../config/network';
import { INVOICE_MANAGER_ABI } from '../contracts/abi';
import { publicClient } from '../wagmi';
import { InvoiceRepository } from './InvoiceRepository';

// Mock dependencies
jest.mock('../wagmi', () => ({
  publicClient: {
    readContract: jest.fn(),
    getLogs: jest.fn(),
  },
}));

jest.mock('../config/network', () => ({
  NetworkConfigService: {
    getInstance: jest.fn(),
  },
}));

jest.mock('@avax-usdc-invoices/shared', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
  InvoiceNotFoundError: class InvoiceNotFoundError extends Error {
    constructor(invoiceId: string) {
      super(`Invoice not found: ${invoiceId}`);
      this.name = 'InvoiceNotFoundError';
    }
  },
  NetworkError: class NetworkError extends Error {
    constructor(message: string, _error?: unknown) {
      super(message);
      this.name = 'NetworkError';
    }
  },
}));

describe('InvoiceRepository', () => {
  let repository: InvoiceRepository;
  const mockContractAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const mockInvoiceId = '0x1111222233334444555566667777888899990000aaaaaaa';
  const mockMerchant = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
  const mockToken = '0x5425890298aed601595a70AB815c96711a31Bc65';

  const mockInvoiceData = [
    mockMerchant,
    mockToken,
    1000000n,
    1704067200,
    false,
    '0x0000000000000000000000000000000000000000000000000000000000000000000',
    0,
  ];

  const mockInvoiceCreatedLogs = [
    {
      args: {
        invoiceId: mockInvoiceId,
        merchant: mockMerchant,
        token: mockToken,
        amount: 1000000n,
        dueAt: 1704067200,
      },
      blockNumber: 12345n,
      transactionHash: '0xabcdef1234567890',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock NetworkConfigService
    (NetworkConfigService.getInstance as jest.Mock).mockReturnValue({
      getInvoiceManagerAddress: jest.fn(() => mockContractAddress),
    });

    repository = InvoiceRepository.getInstance();
  });

  describe('getInvoice', () => {
    it('should fetch invoice successfully', async () => {
      (publicClient.readContract as jest.Mock).mockResolvedValue(mockInvoiceData);

      const invoice = await repository.getInvoice(mockInvoiceId);

      expect(invoice).toEqual({
        id: mockInvoiceId,
        merchant: mockMerchant,
        token: mockToken,
        amount: 1000000n,
        dueAt: 1704067200,
        paid: false,
        payer: '0x0000000000000000000000000000000000000000000000000000000000000000000',
        paidAt: 0,
      });

      expect(publicClient.readContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: INVOICE_MANAGER_ABI,
        functionName: 'getInvoice',
        args: [mockInvoiceId],
      });

      expect(logger.debug).toHaveBeenCalledWith('Fetching invoice', {
        invoiceId: mockInvoiceId,
        contractAddress: mockContractAddress,
      });

      expect(logger.info).toHaveBeenCalledWith('Invoice fetched successfully', {
        invoiceId: mockInvoiceId,
        merchant: mockMerchant,
        paid: false,
      });
    });

    it('should throw InvoiceNotFoundError on error', async () => {
      const error = new Error('Invoice not found');
      (publicClient.readContract as jest.Mock).mockRejectedValue(error);

      await expect(repository.getInvoice(mockInvoiceId)).rejects.toThrow(InvoiceNotFoundError);

      expect(logger.error).toHaveBeenCalledWith('Failed to fetch invoice', error, {
        invoiceId: mockInvoiceId,
      });
    });

    it('should handle paid invoice', async () => {
      const paidInvoiceData = [
        mockMerchant,
        mockToken,
        1000000n,
        1704067200,
        true,
        mockMerchant,
        1704067200,
      ];

      (publicClient.readContract as jest.Mock).mockResolvedValue(paidInvoiceData);

      const invoice = await repository.getInvoice(mockInvoiceId);

      expect(invoice.paid).toBe(true);
      expect(invoice.payer).toBe(mockMerchant);
      expect(invoice.paidAt).toBe(1704067200);
    });
  });

  describe('invoiceExists', () => {
    it('should return true for existing invoice', async () => {
      (publicClient.readContract as jest.Mock).mockResolvedValue(true);

      const exists = await repository.invoiceExists(mockInvoiceId);

      expect(exists).toBe(true);

      expect(publicClient.readContract).toHaveBeenCalledWith({
        address: mockContractAddress,
        abi: INVOICE_MANAGER_ABI,
        functionName: 'invoiceExists',
        args: [mockInvoiceId],
      });
    });

    it('should return false for non-existing invoice', async () => {
      (publicClient.readContract as jest.Mock).mockResolvedValue(false);

      const exists = await repository.invoiceExists(mockInvoiceId);

      expect(exists).toBe(false);
    });

    it('should return false on error', async () => {
      (publicClient.readContract as jest.Mock).mockRejectedValue(new Error('Error'));

      const exists = await repository.invoiceExists(mockInvoiceId);

      expect(exists).toBe(false);

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to check invoice existence',
        expect.any(Error),
        { invoiceId: mockInvoiceId }
      );
    });
  });

  describe('getMerchantInvoices', () => {
    it('should fetch merchant invoices', async () => {
      (publicClient.getLogs as jest.Mock).mockResolvedValue(mockInvoiceCreatedLogs);
      (publicClient.readContract as jest.Mock).mockResolvedValue(mockInvoiceData);

      const invoices = await repository.getMerchantInvoices(mockMerchant);

      expect(invoices).toHaveLength(1);
      expect(invoices[0].id).toBe(mockInvoiceId);
      expect(invoices[0].merchant).toBe(mockMerchant);

      expect(logger.debug).toHaveBeenCalledWith('Fetching merchant invoices', {
        merchantAddress: mockMerchant,
      });

      expect(logger.info).toHaveBeenCalledWith('Merchant invoices fetched', {
        merchantAddress: mockMerchant,
        count: 1,
      });
    });

    it('should return empty array if no invoices', async () => {
      (publicClient.getLogs as jest.Mock).mockResolvedValue([]);

      const invoices = await repository.getMerchantInvoices(mockMerchant);

      expect(invoices).toHaveLength(0);
    });

    it('should handle multiple invoices', async () => {
      const mockInvoiceId2 = '0x222233334444555566667777888899990000111122222';
      const mockLog2 = {
        args: {
          invoiceId: mockInvoiceId2,
          merchant: mockMerchant,
          token: mockToken,
          amount: 2000000n,
          dueAt: 1704067200,
        },
        blockNumber: 12346n,
        transactionHash: '0xabcdef1234567891',
      };

      (publicClient.getLogs as jest.Mock).mockResolvedValue([mockInvoiceCreatedLogs[0], mockLog2]);
      (publicClient.readContract as jest.Mock).mockResolvedValue(mockInvoiceData);

      const invoices = await repository.getMerchantInvoices(mockMerchant);

      expect(invoices).toHaveLength(2);
    });

    it('should throw NetworkError on fetch failure', async () => {
      const error = new Error('Failed to fetch');
      (publicClient.getLogs as jest.Mock).mockRejectedValue(error);

      await expect(repository.getMerchantInvoices(mockMerchant)).rejects.toThrow(
        'Failed to fetch invoices'
      );

      // The logger receives the wrapped NetworkError, not the original error
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch merchant invoices',
        expect.any(Object), // NetworkError
        {
          merchantAddress: mockMerchant,
        }
      );
    });
  });

  describe('getInvoiceCreatedEvents', () => {
    it('should fetch invoice created events', async () => {
      (publicClient.getLogs as jest.Mock).mockResolvedValue(mockInvoiceCreatedLogs);

      const events = await repository.getInvoiceCreatedEvents(mockMerchant);

      expect(events).toHaveLength(1);
      expect(events[0].invoiceId).toBe(mockInvoiceId);
      expect(events[0].merchant).toBe(mockMerchant);

      expect(publicClient.getLogs).toHaveBeenCalledWith({
        address: mockContractAddress,
        event: expect.any(Object),
        args: { merchant: mockMerchant },
        fromBlock: 0n,
      });
    });

    it('should return empty array if no events', async () => {
      (publicClient.getLogs as jest.Mock).mockResolvedValue([]);

      const events = await repository.getInvoiceCreatedEvents(mockMerchant);

      expect(events).toHaveLength(0);
    });

    it('should handle multiple events', async () => {
      const mockLog2 = {
        args: {
          invoiceId: '0x222233334444555566667777888899990000111122222',
          merchant: mockMerchant,
          token: mockToken,
          amount: 2000000n,
          dueAt: 1704067200,
        },
        blockNumber: 12346n,
        transactionHash: '0xabcdef1234567891',
      };

      (publicClient.getLogs as jest.Mock).mockResolvedValue([mockInvoiceCreatedLogs[0], mockLog2]);

      const events = await repository.getInvoiceCreatedEvents(mockMerchant);

      expect(events).toHaveLength(2);
    });

    it('should throw NetworkError on fetch failure', async () => {
      const error = new Error('Failed to fetch logs');
      (publicClient.getLogs as jest.Mock).mockRejectedValue(error);

      await expect(repository.getInvoiceCreatedEvents(mockMerchant)).rejects.toThrow(
        'Failed to fetch invoice events'
      );

      expect(logger.error).toHaveBeenCalledWith('Failed to fetch invoice events', error, {
        merchantAddress: mockMerchant,
      });
    });
  });

  describe('getInvoicePaidEvent', () => {
    const mockInvoicePaidLog = {
      args: {
        invoiceId: mockInvoiceId,
        merchant: mockMerchant,
        payer: mockMerchant,
        token: mockToken,
        amount: 1000000n,
        paidAt: 1704067200,
      },
      blockNumber: 12347n,
      transactionHash: '0xabcdef1234567892',
    };

    it('should fetch invoice paid event', async () => {
      (publicClient.getLogs as jest.Mock).mockResolvedValue([mockInvoicePaidLog]);

      const event = await repository.getInvoicePaidEvent(mockInvoiceId);

      expect(event).not.toBeNull();
      expect(event?.invoiceId).toBe(mockInvoiceId);
      expect(event?.merchant).toBe(mockMerchant);
      expect(event?.payer).toBe(mockMerchant);

      expect(publicClient.getLogs).toHaveBeenCalledWith({
        address: mockContractAddress,
        event: expect.any(Object),
        args: { invoiceId: mockInvoiceId },
        fromBlock: 0n,
      });
    });

    it('should return null if no payment event', async () => {
      (publicClient.getLogs as jest.Mock).mockResolvedValue([]);

      const event = await repository.getInvoicePaidEvent(mockInvoiceId);

      expect(event).toBeNull();
    });

    it('should return first event if multiple', async () => {
      const mockLog2 = {
        args: {
          invoiceId: mockInvoiceId,
          merchant: mockMerchant,
          payer: mockMerchant,
          token: mockToken,
          amount: 1000000n,
          paidAt: 1704067200,
        },
        blockNumber: 12348n,
        transactionHash: '0xabcdef1234567893',
      };

      (publicClient.getLogs as jest.Mock).mockResolvedValue([mockInvoicePaidLog, mockLog2]);

      const event = await repository.getInvoicePaidEvent(mockInvoiceId);

      expect(event).not.toBeNull();
      expect(event?.blockNumber).toBe(12347n);
    });

    it('should handle error gracefully', async () => {
      (publicClient.getLogs as jest.Mock).mockRejectedValue(new Error('Error'));

      const event = await repository.getInvoicePaidEvent(mockInvoiceId);

      expect(event).toBeNull();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch payment event',
        expect.any(Error),
        { invoiceId: mockInvoiceId }
      );
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = InvoiceRepository.getInstance();
      const instance2 = InvoiceRepository.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
