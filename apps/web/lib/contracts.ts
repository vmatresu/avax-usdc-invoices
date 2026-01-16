import { parseAbi } from 'viem'
import { client } from './wagmi'

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
    type: 'function',
    name: 'getMerchantInvoices',
    stateMutability: 'view',
    inputs: [
      { name: 'merchant', type: 'address' },
      { name: 'invoiceIds', type: 'bytes32[]' },
    ],
    outputs: [
      {
        components: [
          { name: 'merchant', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'dueAt', type: 'uint64' },
          { name: 'paid', type: 'bool' },
          { name: 'payer', type: 'address' },
          { name: 'paidAt', type: 'uint64' },
        ],
        name: '',
        type: 'tuple[]',
      },
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
])

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
])

export async function getInvoice(invoiceId: `0x${string}`, contractAddress: `0x${string}`) {
  const [merchant, token, amount, dueAt, paid, payer, paidAt] = await client.readContract({
    address: contractAddress,
    abi: INVOICE_MANAGER_ABI,
    functionName: 'getInvoice',
    args: [invoiceId],
  })

  return { merchant, token, amount: amount as bigint, dueAt, paid, payer, paidAt }
}

export async function getMerchantInvoiceCreatedLogs(
  merchantAddress: `0x${string}`,
  contractAddress: `0x${string}`,
  fromBlock: bigint = 0n
) {
  const logs = await client.getLogs({
    address: contractAddress,
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
      merchant: merchantAddress,
    },
    fromBlock,
  })

  return logs
}

export async function getInvoicePaidLog(invoiceId: `0x${string}`, contractAddress: `0x${string}`) {
  const logs = await client.getLogs({
    address: contractAddress,
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
      invoiceId,
    },
    fromBlock: 0n,
  })

  return logs[0]
}
