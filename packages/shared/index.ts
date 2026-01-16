// Network Configuration
export const NETWORKS = {
  FUJI: {
    chainId: 43113,
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
  },
  MAINNET: {
    chainId: 43114,
    name: 'Avalanche Mainnet C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
  },
} as const;

export type NetworkKey = keyof typeof NETWORKS;

// Invoice Types
export interface Invoice {
  merchant: string;
  token: string;
  amount: bigint;
  dueAt: number;
  paid: boolean;
  payer: string;
  paidAt: number;
}

export interface InvoiceCreatedEvent {
  invoiceId: string;
  merchant: string;
  token: string;
  amount: bigint;
  dueAt: number;
}

export interface InvoicePaidEvent {
  invoiceId: string;
  merchant: string;
  payer: string;
  token: string;
  amount: bigint;
  paidAt: number;
}

// Contract ABIs (will be populated after compilation)
export const INVOICE_MANAGER_ABI = [
  {
    type: 'function',
    name: 'createInvoice',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'invoiceId', type: 'bytes32' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'dueAt', type: 'uint64' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'payInvoice',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'invoiceId', type: 'bytes32' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getInvoice',
    stateMutability: 'view',
    inputs: [{ name: 'invoiceId', type: 'bytes32' }],
    outputs: [
      { name: 'merchant', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'dueAt', type: 'uint64' },
      { name: 'paid', type: 'bool' },
      { name: 'payer', type: 'address' },
      { name: 'paidAt', type: 'uint64' },
    ],
  },
  {
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
  {
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
] as const;

// USDC Decimals
export const USDC_DECIMALS = 6;

// Deployment info file path (will be generated)
export const DEPLOYMENT_INFO_PATH = './deployment-info.json';

export interface DeploymentInfo {
  network: NetworkKey;
  address: string;
  transactionHash: string;
  blockNumber: number;
  deployedAt: string;
}
