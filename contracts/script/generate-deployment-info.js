const fs = require('fs');
const path = require('path');

// Read broadcast directory to find deployment info
const broadcastDir = path.join(__dirname, '..', 'broadcast', 'Deploy.s.sol');
const deploymentInfoFile = path.join(__dirname, '..', '..', 'packages', 'shared', 'deployment-info.json');

// Find the latest run-latest.json file
const networkDirs = fs.readdirSync(broadcastDir).filter(dir => dir !== '.sol');
let latestDeployment = null;
let latestTimestamp = 0;

for (const networkDir of networkDirs) {
  const runDir = path.join(broadcastDir, networkDir, 'run-latest.json');
  if (fs.existsSync(runDir)) {
    const runInfo = JSON.parse(fs.readFileSync(runDir, 'utf8'));
    const tx = runInfo.transactions[0];

    if (tx.transactionType === 'CREATE' && tx.contractName === 'InvoiceManager') {
      const timestamp = new Date(runInfo.timestamp).getTime();
      if (timestamp > latestTimestamp) {
        latestTimestamp = timestamp;
        latestDeployment = {
          network: networkDir === '31337' ? 'FUJI' : 'MAINNET',
          address: tx.contractAddress,
          transactionHash: tx.hash,
          blockNumber: tx.blockNumber,
          deployedAt: runInfo.timestamp,
          chainId: networkDir
        };
      }
    }
  }
}

if (latestDeployment) {
  fs.writeFileSync(deploymentInfoFile, JSON.stringify(latestDeployment, null, 2));
  console.log('Deployment info written to:', deploymentInfoFile);
  console.log(JSON.stringify(latestDeployment, null, 2));
} else {
  console.log('No deployment found in broadcast directory');
  process.exit(1);
}
