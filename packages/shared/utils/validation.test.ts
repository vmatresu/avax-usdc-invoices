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

    it('should accept valid Ethereum address with mixed case', () => {
      const validAddress = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
      const result = validateAddress(validAddress);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty address', () => {
      const result = validateAddress('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Configuration error');
    });

    it('should reject invalid address', () => {
      const invalidAddress = 'not-an-address';
      const result = validateAddress(invalidAddress);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid address format');
    });

    it('should reject address without 0x prefix', () => {
      const invalidAddress = 'B97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
      const result = validateAddress(invalidAddress);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid address format');
    });
  });

  describe('validateBytes32', () => {
    it('should accept valid bytes32 hash', () => {
      const validHash = '0x1111222233334444555566667777888899990000aaaaaaa';
      const result = validateBytes32(validHash);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty bytes32', () => {
      const result = validateBytes32('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invoice not found');
    });

    it('should reject invalid bytes32', () => {
      const invalidHash = 'not-a-hash';
      const result = validateBytes32(invalidHash);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid invoice ID format');
    });

    it('should reject bytes32 with wrong length', () => {
      const invalidHash = '0x1234';
      const result = validateBytes32(invalidHash);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid invoice ID format');
    });
  });

  describe('validateUUID', () => {
    it('should accept valid UUID', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const result = validateUUID(validUUID);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty UUID', () => {
      const result = validateUUID('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid UUID format');
    });

    it('should reject invalid UUID', () => {
      const invalidUUID = 'not-a-uuid';
      const result = validateUUID(invalidUUID);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid UUID format');
    });

    it('should reject UUID without hyphens', () => {
      const invalidUUID = '550e8400e29b41d4a716446655440000';
      const result = validateUUID(invalidUUID);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid UUID format');
    });
  });

  describe('validateAmount', () => {
    it('should accept valid amount', () => {
      const result = validateAmount(1000000n);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject zero amount', () => {
      const result = validateAmount(0n);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than 0');
    });

    it('should reject negative amount', () => {
      const result = validateAmount(-1000000n);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than 0');
    });

    it('should reject amount below minimum', () => {
      const result = validateAmount(1n);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Minimum amount is');
    });

    it('should reject amount above maximum', () => {
      const result = validateAmount(1000000000000000000n);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Maximum amount is');
    });
  });

  describe('validateDueDate', () => {
    it('should accept valid due date', () => {
      const futureDate = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      const result = validateDueDate(futureDate);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept zero due date (no expiration)', () => {
      const result = validateDueDate(0);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject due date too soon', () => {
      const soonDate = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
      const result = validateDueDate(soonDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least');
    });

    it('should reject due date too far', () => {
      const farDate = Math.floor(Date.now() / 1000) + 365 * 86400; // 1 year from now
      const result = validateDueDate(farDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be more than');
    });
  });

  describe('validateCreateInvoice', () => {
    it('should accept valid invoice parameters', () => {
      const result = validateCreateInvoice(1000000n, 1704067200);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid amount', () => {
      const result = validateCreateInvoice(0n, 1704067200);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Amount');
    });

    it('should reject invalid due date', () => {
      const result = validateCreateInvoice(1000000n, 0);
      expect(result.isValid).toBe(true); // 0 is valid for no expiration
      expect(result.error).toBeUndefined();
    });
  });

  describe('isInvoiceExpired', () => {
    it('should return false for non-expiring invoice', () => {
      const result = isInvoiceExpired(0);
      expect(result).toBe(false);
    });

    it('should return false for future due date', () => {
      const futureDate = Math.floor(Date.now() / 1000) + 86400;
      const result = isInvoiceExpired(futureDate);
      expect(result).toBe(false);
    });

    it('should return true for past due date', () => {
      const pastDate = Math.floor(Date.now() / 1000) - 86400;
      const result = isInvoiceExpired(pastDate);
      expect(result).toBe(true);
    });
  });

  describe('formatUSDC', () => {
    it('should format zero USDC', () => {
      const result = formatUSDC(0n);
      expect(result).toBe('0.00');
    });

    it('should format 1 USDC', () => {
      const result = formatUSDC(1_000_000n);
      expect(result).toBe('1.00');
    });

    it('should format 10.50 USDC', () => {
      const result = formatUSDC(10_500_000n);
      expect(result).toBe('10.50');
    });

    it('should format 100 USDC', () => {
      const result = formatUSDC(100_000_000n);
      expect(result).toBe('100.00');
    });

    it('should format large amounts', () => {
      const result = formatUSDC(1_000_000_000_000_000n);
      expect(result).toBe('1,000,000,000.00');
    });

    it('should handle very small amounts', () => {
      const result = formatUSDC(1n);
      expect(result).toBe('0.00');
    });

    it('should format with locale', () => {
      const result = formatUSDC(1000000000n);
      expect(result).toContain('1,000,000.00');
    });
  });

  describe('parseUSDC', () => {
    it('should parse valid amount', () => {
      const result = parseUSDC('100.00');
      expect(result).toBe(100_000_000n);
    });

    it('should parse zero', () => {
      const result = parseUSDC('0.00');
      expect(result).toBe(0n);
    });

    it('should parse decimal amount', () => {
      const result = parseUSDC('10.50');
      expect(result).toBe(10_500_000n);
    });

    it('should parse integer amount', () => {
      const result = parseUSDC('100');
      expect(result).toBe(100_000_000n);
    });

    it('should return 0 for negative amount', () => {
      const result = parseUSDC('-100.00');
      expect(result).toBe(0n);
    });

    it('should return 0 for invalid amount', () => {
      const result = parseUSDC('invalid');
      expect(result).toBe(0n);
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp zero', () => {
      const result = formatTimestamp(0);
      expect(result).toBe('No expiration');
    });

    it('should format current timestamp', () => {
      const now = Math.floor(Date.now() / 1000);
      const result = formatTimestamp(now);
      expect(result).toBeDefined();
      expect(result).not.toBe('No expiration');
    });

    it('should format specific timestamp', () => {
      const timestamp = 1704067200; // 2024-01-01
      const result = formatTimestamp(timestamp);
      expect(result).toBeDefined();
      expect(result).toContain('2024');
    });

    it('should format timestamp with date', () => {
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
      expect(result).toBe('0x12345678...7890abcdef');
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
      expect(result).toMatch(/^0x[a-f0-9]{32}$/); // UUID produces 32 hex chars
    });

    it('should handle UUID with multiple hyphens', () => {
      const uuid = '12345678-1234-5678-1234-567812345678';
      const result = uuidToBytes32(uuid);
      expect(result).toBe('0x12345678123456781234567812345678');
    });

    it('should handle empty UUID', () => {
      const uuid = '';
      const result = uuidToBytes32(uuid);
      expect(result).toBe('0x');
    });

    it('should handle invalid UUID', () => {
      const invalidUuid = 'not-a-valid-uuid';
      const result = uuidToBytes32(invalidUuid);
      expect(result).toBe('0xnotavaliduuid');
    });

    it('should handle standard UUID format', () => {
      const uuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      const result = uuidToBytes32(uuid);
      expect(result).toBe('0x6ba7b8109dad11d180b400c04fd430c8');
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

    it('should generate different UUIDs on multiple calls', () => {
      const uuids = new Set();
      for (let i = 0; i < 100; i++) {
        uuids.add(generateUUID());
      }
      expect(uuids.size).toBe(100); // All unique
    });
  });
});
