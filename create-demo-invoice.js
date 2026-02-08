import { ethers } from 'ethers';

async function createDemoInvoice() {
  // Connect to local blockchain
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const wallet = new ethers.Wallet(privateKey, provider);

  // Contract ABI (only the functions we need)
  const abi = [
    'function createInvoice(bytes32 invoiceId, address token, uint256 amount, uint64 dueAt)',
    'function getInvoice(bytes32 invoiceId) view returns (tuple(address merchant, bool paid, address token, uint64 dueAt, address payer, uint64 paidAt, uint128 amount))',
  ];

  // Contract address and instance
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  // Mock USDC address
  const usdcAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

  // Create invoice ID from "ETFC"
  const invoiceIdString = 'ETFC';
  const invoiceId = ethers.keccak256(ethers.toUtf8Bytes(invoiceIdString));

  console.log('Creating demo invoice...');
  console.log('Invoice ID (ETFC):', invoiceId);
  console.log('Invoice ID (string):', invoiceIdString);

  try {
    // Create invoice with 100 USDC amount (6 decimals = 100000000)
    const amount = ethers.parseUnits('100', 6); // 100 USDC with 6 decimals
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now

    const tx = await contract.createInvoice(invoiceId, usdcAddress, amount, dueAt);
    console.log('Transaction hash:', tx.hash);

    await tx.wait();
    console.log('Demo invoice created successfully!');

    // Verify the invoice was created
    const invoice = await contract.getInvoice(invoiceId);
    console.log('Invoice details:');
    console.log('- Merchant:', invoice.merchant);
    console.log('- Token:', invoice.token);
    console.log('- Amount:', ethers.formatUnits(invoice.amount, 6), 'USDC');
    console.log('- Due At:', new Date(Number(invoice.dueAt) * 1000).toLocaleString());
    console.log('- Paid:', invoice.paid);
  } catch (error) {
    console.error('Error creating demo invoice:', error);
  }
}

createDemoInvoice().catch(console.error);
