/**
 * Contract ABIs extracted for type safety
 * Single Responsibility: Provides contract ABI definitions
 */

import { parseAbi } from 'viem';

/**
 * InvoiceManager contract ABI
 */
export const INVOICE_MANAGER_ABI = parseAbi([
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
    type: 'function',
    name: 'invoiceExists',
    stateMutability: 'view',
    inputs: [{ name: 'invoiceId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'isInvoicePaid',
    stateMutability: 'view',
    inputs: [{ name: 'invoiceId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
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
] as const);

/**
 * USDC contract ABI (ERC20 subset)
 */
export const USDC_ABI = parseAbi([
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const);
