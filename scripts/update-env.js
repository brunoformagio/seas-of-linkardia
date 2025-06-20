// This script updates the .env file with contract addresses after deployment
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

async function updateEnvFile(networkType, contractAddresses) {
  // Load the current .env file
  const envPath = path.resolve(process.cwd(), '.env');
  
  // Check if .env file exists, if not create it
  if (!fs.existsSync(envPath)) {
    console.log(".env file not found, creating a new one...");
    const defaultEnvContent = `# Contract addresses will be populated by deploy script
PRIVATE_KEY=
NETWORK_TYPE=${networkType}

# Etherlink RPC URLs
ETHERLINK_RPC_URL_LOCALHOST=http://localhost:8545
ETHERLINK_RPC_URL_MAINNET=https://node.mainnet.etherlink.com
ETHERLINK_RPC_URL_TESTNET=https://node.ghostnet.etherlink.com

# Etherlink Chain IDs
ETHERLINK_CHAIN_ID_LOCALHOST=31337
ETHERLINK_CHAIN_ID_MAINNET=42793
ETHERLINK_CHAIN_ID_TESTNET=128123

# Etherlink Explorer URLs
ETHERLINK_EXPLORER_API_URL_MAINNET=https://explorer.etherlink.com/api
ETHERLINK_EXPLORER_BROWSER_URL_MAINNET=https://explorer.etherlink.com
ETHERLINK_EXPLORER_API_URL_TESTNET=https://explorer.ghostnet.etherlink.com/api
ETHERLINK_EXPLORER_BROWSER_URL_TESTNET=https://explorer.ghostnet.etherlink.com
`;
    fs.writeFileSync(envPath, defaultEnvContent);
  }

  // Read the current content
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Parse the current content
  const envConfig = dotenv.parse(envContent);
  
  // Update the appropriate values based on network type
  const networkSuffix = networkType.toUpperCase();
  
  // Set network type
  envConfig.NETWORK_TYPE = networkType;
  
  // Update environment variables for LinkTown contract
  envConfig[`NEXT_PUBLIC_GAME_CONTRACT_ADDRESS_${networkSuffix}`] = contractAddresses.gameContract;
  
  // Convert back to string
  const newEnvContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Write back to .env file
  fs.writeFileSync(envPath, newEnvContent);
  
  console.log(`Updated .env file with ${networkSuffix} contract addresses`);
}

module.exports = { updateEnvFile }; 