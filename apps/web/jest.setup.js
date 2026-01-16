/**
 * Jest setup file
 * Runs before all tests
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_CHAIN_ID = '43113';
process.env.NEXT_PUBLIC_RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc';
process.env.NEXT_PUBLIC_USDC_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65';
process.env.NEXT_PUBLIC_EXPLORER_BASE_URL = 'https://testnet.snowtrace.io';
process.env.NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
