import { NextRequest } from 'next/server';
import { GET } from './route';
import { getMerchantInvoiceCreatedLogs, getInvoice } from '@/lib/contracts';
import { logger } from '@avax-usdc-invoices/shared';

// Mock dependencies
jest.mock('@/lib/contracts', () => ({
  getMerchantInvoiceCreatedLogs: jest.fn(),
  getInvoice: jest.fn(),
}));

jest.mock('@avax-usdc-invoices/shared', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock invoiceManagerAddress
jest.mock('@/lib/wagmi', () => ({
  invoiceManagerAddress: '0x1234567890abcdef1234567890abcdef12345678',
}));

describe('API: /api/invoices', () => {
  const mockMerchant = '0xabcdef1234567890abcdef1234567890abcdef12';
  const mockInvoiceId = '0x1111222233334444555566667777888899990000aaaaaaa';
  const mockLog = {
    args: {
      invoiceId: mockInvoiceId,
      merchant: mockMerchant,
      token: '0x5425890298aed601595a70AB815c96711a31Bc65',
      amount: 1000000n,
      dueAt: 1704067200,
    },
  };
  const mockInvoice = {
    merchant: mockMerchant,
    token: '0x5425890298aed601595a70AB815c96711a31Bc65',
    amount: 1000000n,
    dueAt: 1704067200,
    paid: false,
    payer: '0x0000000000000000000000000000000000000000000000000000000000000000000',
    paidAt: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET endpoint', () => {
    it('should return 400 if merchant parameter is missing', async () => {
      const request = new NextRequest(new URL('http://localhost/api/invoices'));
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: 'Merchant address is required' });
      expect(getMerchantInvoiceCreatedLogs).not.toHaveBeenCalled();
    });

    it('should return 500 if invoiceManagerAddress is not configured', async () => {
      // Temporarily mock undefined invoiceManagerAddress
      jest.doMock('@/lib/wagmi', () => ({
        invoiceManagerAddress: undefined,
      }));

      const request = new NextRequest(
        new URL(`http://localhost/api/invoices?merchant=${mockMerchant}`)
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Invoice manager contract address not configured' });
      expect(getMerchantInvoiceCreatedLogs).not.toHaveBeenCalled();
    });

    it('should fetch and return invoices for merchant', async () => {
      (getMerchantInvoiceCreatedLogs as jest.Mock).mockResolvedValue([mockLog]);
      (getInvoice as jest.Mock).mockResolvedValue(mockInvoice);

      const request = new NextRequest(
        new URL(`http://localhost/api/invoices?merchant=${mockMerchant}`)
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(getMerchantInvoiceCreatedLogs).toHaveBeenCalledWith(
        mockMerchant,
        '0x1234567890abcdef1234567890abcdef12345678'
      );
      expect(getInvoice).toHaveBeenCalledWith(
        mockInvoiceId,
        '0x1234567890abcdef1234567890abcdef12345678'
      );

      const data = await response.json();
      expect(data).toEqual({
        invoices: [
          {
            invoiceId: mockInvoiceId,
            uuid: mockInvoiceId,
            ...mockInvoice,
          },
        ],
      });
    });

    it('should return empty array if merchant has no invoices', async () => {
      (getMerchantInvoiceCreatedLogs as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest(
        new URL(`http://localhost/api/invoices?merchant=${mockMerchant}`)
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ invoices: [] });
    });

    it('should handle multiple invoices', async () => {
      const mockLog2 = {
        args: {
          invoiceId: '0x222233334444555566667777888899990000111122222',
          merchant: mockMerchant,
          token: '0x5425890298aed601595a70AB815c96711a31Bc65',
          amount: 2000000n,
          dueAt: 1704153600,
        },
      };
      const mockInvoice2 = {
        merchant: mockMerchant,
        token: '0x5425890298aed601595a70AB815c96711a31Bc65',
        amount: 2000000n,
        dueAt: 1704153600,
        paid: false,
        payer: '0x0000000000000000000000000000000000000000000000000000000000000000000',
        paidAt: 0,
      };

      (getMerchantInvoiceCreatedLogs as jest.Mock).mockResolvedValue([mockLog, mockLog2]);
      (getInvoice as jest.Mock)
        .mockResolvedValueOnce(mockInvoice)
        .mockResolvedValueOnce(mockInvoice2);

      const request = new NextRequest(
        new URL(`http://localhost/api/invoices?merchant=${mockMerchant}`)
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.invoices).toHaveLength(2);
      expect(data.invoices[0].invoiceId).toBe(mockInvoiceId);
      expect(data.invoices[1].invoiceId).toBe(mockLog2.args.invoiceId);
    });

    it('should return 500 if getMerchantInvoiceCreatedLogs throws error', async () => {
      const error = new Error('Failed to fetch logs');
      (getMerchantInvoiceCreatedLogs as jest.Mock).mockRejectedValue(error);

      const request = new NextRequest(
        new URL(`http://localhost/api/invoices?merchant=${mockMerchant}`)
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to fetch invoices' });
      expect(logger.error).toHaveBeenCalledWith('Error fetching invoices', error, {
        merchant: mockMerchant,
      });
    });

    it('should return 500 if getInvoice throws error', async () => {
      const error = new Error('Failed to fetch invoice');
      (getMerchantInvoiceCreatedLogs as jest.Mock).mockResolvedValue([mockLog]);
      (getInvoice as jest.Mock).mockRejectedValue(error);

      const request = new NextRequest(
        new URL(`http://localhost/api/invoices?merchant=${mockMerchant}`)
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to fetch invoices' });
      expect(logger.error).toHaveBeenCalledWith('Error fetching invoices', error, {
        merchant: mockMerchant,
      });
    });

    it('should handle valid merchant address format', async () => {
      (getMerchantInvoiceCreatedLogs as jest.Mock).mockResolvedValue([]);
      (getInvoice as jest.Mock).mockResolvedValue(mockInvoice);

      const request = new NextRequest(
        new URL(`http://localhost/api/invoices?merchant=${mockMerchant}`)
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should handle merchant address with mixed case', async () => {
      const mixedCaseMerchant = '0xABcDeF1234567890AbCdEf1234567890aBcDeF12';
      (getMerchantInvoiceCreatedLogs as jest.Mock).mockResolvedValue([]);
      (getInvoice as jest.Mock).mockResolvedValue(mockInvoice);

      const request = new NextRequest(
        new URL(`http://localhost/api/invoices?merchant=${mixedCaseMerchant}`)
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });
});
