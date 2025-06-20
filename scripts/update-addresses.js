// This script can be run to manually update contract addresses in .env file
const hre = require("hardhat");
const { updateEnvFile } = require("./update-env");

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.error("Usage: npx hardhat run scripts/update-addresses.js --network <network> <networkType> <nftAddress> <metadataAddress> <gameAddress>");
    process.exit(1);
  }
  
  const networkType = args[0];
  const gameContractAddress = args[1];
  
  if (networkType !== 'mainnet' && networkType !== 'testnet') {
    console.error("Network type must be 'mainnet' or 'testnet'");
    process.exit(1);
  }
  
  // Create contract addresses object   
  const contractAddresses = {
    gameContract: gameContractAddress
  };
  
  // Update environment variables
  await updateEnvFile(networkType, contractAddresses);
  console.log(`Updated environment variables for ${networkType}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 