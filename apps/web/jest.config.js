/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Jest configuration for web app
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@avax-usdc-invoices/shared$': '<rootDir>/../../packages/shared/index.ts',
    '^@avax-usdc-invoices/shared/(.*)$': '<rootDir>/../../packages/shared/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!lib/**/*.test.{ts,tsx}',
    '!lib/**/*.spec.{ts,tsx}',
    '!lib/**/*.stories.{ts,tsx}',
    '!lib/wagmi.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!.*(viem|wagmi|@wagmi|@avax-usdc-invoices))',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
