/**
 * Validation utilities tests
 * Tests all validation functions with various inputs
 */

import {
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
} from './validation';

describe('Validation Utilities', () => {
  describe('validateAddress', () => {
    it('should accept valid Ethereum address', () => {
      const validAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
      const result = validateAddress(validAddress);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid address format', () => {
      const invalidAddress = '0xinvalid';
      const result = validateAddress(invalidAddress);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid address format');
    });

    it('should reject empty address', () => {
      const result = validateAddress('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject undefined address', () => {
      const result = validateAddress(undefined as string);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateBytes32', () => {
    it('should accept valid bytes32 hash', () => {
      const validHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const result = validateBytes32(validHash);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid bytes32 format', () => {
      const invalidHash = '0x123';
      const result = validateBytes32(invalidHash);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid invoice ID format');
    });

    it('should reject empty bytes32', () => {
      const result = validateBytes32('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateUUID', () => {
    it('should accept valid UUID v4', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const result = validateUUID(validUUID);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const invalidUUID = 'not-a-uuid';
      const result = validateUUID(invalidUUID);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid UUID format');
    });

    it('should reject empty UUID', () => {
      const result = validateUUID('');
      expect(result.isValid).toBe(false);
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
      expect(result.error).toContain('greater than 0');
    });

    it('should reject negative amount', () => {
      const result = validateAmount(-1n);
      expect(result.isValid).toBe(false);
    });

    it('should reject amount below minimum', () => {
      const result = validateAmount(0n);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateDueDate', () => {
    beforeAll(() => {
      // Mock current time for consistent tests
      jest.spyOn(Date, 'now').mockReturnValue(1000000000000);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should accept zero (no expiration)', () => {
      const result = validateDueDate(0);
      expect(result.isValid).toBe(true);
    });

    it('should accept valid future due date', () => {
      const now = Math.floor(Date.now() / 1000);
      const future = now + 7 * 24 * 60 * 60; // 7 days
      const result = validateDueDate(future);
      expect(result.isValid).toBe(true);
    });

    it('should reject due date too soon', () => {
      const now = Math.floor(Date.now() / 1000);
      const tooSoon = now + 60 * 60; // 1 hour
      const result = validateDueDate(tooSoon);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least');
    });

    it('should reject past due date', () => {
      const now = Math.floor(Date.now() / 1000);
      const past = now - 24 * 60 * 60;
      const result = validateDueDate(past);
      expect(result.isValid).toBe(false);
    });

    it('should reject due date too far', () => {
      const now = Math.floor(Date.now() / 1000);
      const tooFar = now + 366 * 24 * 60 * 60; // 366 days
      const result = validateDueDate(tooFar);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('more than');
    });
  });

  describe('validateCreateInvoice', () => {
    it('should accept valid invoice parameters', () => {
      const now = Math.floor(Date.now() / 1000);
      const dueAt = now + 7 * 24 * 60 * 60;
      const result = validateCreateInvoice(1000000n, dueAt);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid amount', () => {
      const now = Math.floor(Date.now() / 1000);
      const dueAt = now + 7 * 24 * 60 * 60;
      const result = validateCreateInvoice(0n, dueAt);
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid due date', () => {
      const now = Math.floor(Date.now() / 1000);
      const past = now - 24 * 60 * 60;
      const result = validateCreateInvoice(1000000n, past);
      expect(result.isValid).toBe(false);
    });
  });

  describe('isInvoiceExpired', () => {
    beforeAll(() => {
      jest.spyOn(Date, 'now').mockReturnValue(1000000000000);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return false for zero due date (no expiration)', () => {
      const result = isInvoiceExpired(0);
      expect(result).toBe(false);
    });

    it('should return true for past due date', () => {
      const now = Math.floor(Date.now() / 1000);
      const past = now - 24 * 60 * 60;
      const result = isInvoiceExpired(past);
      expect(result).toBe(true);
    });

    it('should return false for future due date', () => {
      const now = Math.floor(Date.now() / 1000);
      const future = now + 24 * 60 * 60;
      const result = isInvoiceExpired(future);
      expect(result).toBe(false);
    });
  });

  describe('formatUSDC', () => {
    it('should format basic USDC amount', () => {
      const result = formatUSDC(1000000n); // 1 USDC
      expect(result).toBe('1');
    });

    it('should format USDC with decimals', () => {
      const result = formatUSDC(1234567n); // 1.234567 USDC
      expect(result).toContain('1.23');
    });

    it('should format large USDC amount', () => {
      const result = formatUSDC(1000000000000n); // 1,000,000 USDC
      expect(result).toContain('1,000,000');
    });

    it('should format zero USDC', () => {
      const result = formatUSDC(0n);
      expect(result).toBe('0');
    });
  });

  describe('parseUSDC', () => {
    it('should parse valid USDC string', () => {
      const result = parseUSDC('1.5');
      expect(result).toBe(1500000n);
    });

    it('should parse integer USDC string', () => {
      const result = parseUSDC('100');
      expect(result).toBe(100000000n);
    });

    it('should parse zero USDC', () => {
      const result = parseUSDC('0');
      expect(result).toBe(0n);
    });

    it('should return zero for invalid input', () => {
      const result = parseUSDC('invalid');
      expect(result).toBe(0n);
    });

    it('should return zero for negative input', () => {
      const result = parseUSDC('-10');
      expect(result).toBe(0n);
    });

    it('should parse USDC with many decimals', () => {
      const result = parseUSDC('0.123456');
      expect(result).toBe(123456n);
    });
  });

  describe('formatTimestamp', () => {
    it('should format valid timestamp', () => {
      const timestamp = 1000000000;
      const result = formatTimestamp(timestamp);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return "No expiration" for zero timestamp', () => {
      const result = formatTimestamp(0);
      expect(result).toBe('No expiration');
    });

    it('should format timestamp with date and time', () => {
      const timestamp = 1000000000;
      const result = formatTimestamp(timestamp);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format
    });
  });

  describe('shortenAddress', () => {
    it('should shorten long address', () => {
      const address = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
      const result = shortenAddress(address);
      expect(result).toBe('0xB97E...48a6E');
    });

    it('should not shorten short address', () => {
      const shortAddress = '0xB97E48a6E';
      const result = shortenAddress(shortAddress);
      expect(result).toBe(shortAddress);
    });

    it('should use custom length', () => {
      const address = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
      const result = shortenAddress(address, 4);
      expect(result).toBe('0xB97F...a6E');
    });

    it('should handle empty address', () => {
      const result = shortenAddress('');
      expect(result).toBe('');
    });
  });

  describe('shortenTxHash', () => {
    it('should shorten transaction hash', () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const result = shortenTxHash(txHash);
      expect(result).toBe('0x12345678...cdef');
    });

    it('should use default length of 8', () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const result = shortenTxHash(txHash);
      expect(result).toContain('...');
      expect(result.length).toBeLessThan(txHash.length);
    });
  });

  describe('uuidToBytes32', () => {
    it('should convert UUID to bytes32', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = uuidToBytes32(uuid);
      expect(result).toBe('0x550e8400e29b41d4a716446655440000');
      expect(result).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('should handle UUID with multiple hyphens', () => {
      const uuid = '12345678-1234-5678-1234-567812345678';
      const result = uuidToBytes32(uuid);
      expect(result).toBe('0x12345678123456781234567812345678');
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUID v4', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });

    it('should generate 36 character UUID', () => {
      const uuid = generateUUID();
      expect(uuid.length).toBe(36);
    });
  });
});
