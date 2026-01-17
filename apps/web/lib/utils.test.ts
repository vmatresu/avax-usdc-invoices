import { cn, formatDate, formatUSDC, shortenAddress, uuidToBytes32 } from './utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge classes correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const condition = false;
      const result = cn('class1', condition && 'class2', 'class3');
      expect(result).toBe('class1 class3');
    });

    it('should merge Tailwind classes', () => {
      const result = cn('px-4', 'px-2');
      expect(result).toBe('px-2'); // Later class wins
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

    it('should format 1000.25 USDC', () => {
      const result = formatUSDC(1_000_250_000n);
      expect(result).toBe('1000.25');
    });

    it('should format large amounts', () => {
      const result = formatUSDC(1_000_000_000_000_000n);
      expect(result).toBe('1,000,000,000.00');
    });

    it('should format with decimals', () => {
      const result = formatUSDC(1_000_001n);
      expect(result).toBe('1.00'); // 1 USDC + 1 wei
    });

    it('should handle very small amounts', () => {
      const result = formatUSDC(1n);
      expect(result).toBe('0.00');
    });
  });

  describe('formatDate', () => {
    it('should format timestamp zero', () => {
      const result = formatDate(0);
      expect(result).toBeDefined();
    });

    it('should format current timestamp', () => {
      const now = Math.floor(Date.now() / 1000);
      const result = formatDate(now);
      expect(result).toBeDefined();
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should format specific timestamp', () => {
      const timestamp = 1704067200; // 2024-01-01 00:00:00
      const result = formatDate(timestamp);
      expect(result).toBeDefined();
      expect(result).toContain('2024');
    });

    it('should format timestamp with time', () => {
      const timestamp = 1704067200;
      const result = formatDate(timestamp);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should handle different timezones', () => {
      const now = Math.floor(Date.now() / 1000);
      const result = formatDate(now);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('shortenAddress', () => {
    const address = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';

    it('should shorten address', () => {
      const result = shortenAddress(address);
      expect(result).toBe('0xB97E...48a6E');
    });

    it('should return full address if too short', () => {
      const shortAddress = '0xB97E';
      const result = shortenAddress(shortAddress);
      expect(result).toBe(shortAddress);
    });

    it('should handle empty string', () => {
      const result = shortenAddress('');
      expect(result).toBe('');
    });

    it('should handle invalid address', () => {
      const invalidAddress = 'not-an-address';
      const result = shortenAddress(invalidAddress);
      expect(result).toBe('not-an...');
    });
  });

  describe('uuidToBytes32', () => {
    it('should convert UUID to bytes32', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = uuidToBytes32(uuid);
      expect(result).toBe('0x550e8400e29b41d4a716446655440000');
    });

    it('should handle UUID without dashes', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = uuidToBytes32(uuid);
      expect(result.startsWith('0x')).toBe(true);
      expect(result).not.toContain('-');
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
});
