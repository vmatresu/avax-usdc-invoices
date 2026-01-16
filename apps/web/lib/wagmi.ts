import { publicClient, walletClient } from 'wagmi'
import { createPublicClient, createWalletClient, http } from 'viem'
import { avalancheFuji, avalanche } from 'wagmi/chains'

export const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '43113')
export const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
export const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_BASE_URL || 'https://testnet.snowtrace.io'
export const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`
export const invoiceManagerAddress = process.env.NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS as `0x${string}`

export const chain = chainId === 43114 ? avalanche : avalancheFuji

export const client = createPublicClient({
  chain,
  transport: http(rpcUrl),
})
