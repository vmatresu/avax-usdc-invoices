/**
 * Contract exports and utility functions
 * Re-exports ABI definitions and provides helper functions for contract interactions
 */

import { createPublicClient, http } from 'viem';
import { avalanche, avalancheFuji } from 'viem/chains';
import { INVOICE_MANAGER_ABI, USDC_ABI } from './abi';

export { INVOICE_MANAGER_ABI, USDC_ABI };

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '43113');
const chain = chainId === 43114 ? avalanche : avalancheFuji;

const client = createPublicClient({
  chain,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

/**
 * Get InvoiceCreated logs for a merchant
 */
export async function getMerchantInvoiceCreatedLogs(
  merchantAddress: `0x${string}`,
  contractAddress: `0x${string}`
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
    fromBlock: 0n,
  });

  return logs;
}

/**
 * Get invoice details from contract
 */
export async function getInvoice(invoiceId: `0x${string}`, contractAddress: `0x${string}`) {
  const [merchant, token, amount, dueAt, paid, payer, paidAt] = await client.readContract({
    address: contractAddress,
    abi: INVOICE_MANAGER_ABI,
    functionName: 'getInvoice',
    args: [invoiceId],
  });

  return {
    merchant: merchant as string,
    token: token as string,
    amount: amount as bigint,
    dueAt: Number(dueAt),
    paid: paid as boolean,
    payer: payer as string,
    paidAt: Number(paidAt),
  };
}

/**
 * Get InvoicePaid log for a specific invoice
 */
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
      invoiceId: invoiceId,
    },
    fromBlock: 0n,
  });

  if (logs.length === 0) {
    return null;
  }

  return logs[0];
}
