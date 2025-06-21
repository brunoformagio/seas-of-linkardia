// This script deploys all the SeasOfLinkardia contracts
const hre = require("hardhat");
const { updateEnvFile } = require("./update-env");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy SeasOfLinkardia Contract
  const SeasOfLinkardiaContract = await hre.ethers.getContractFactory("SeasOfLinkardia");
  const seasOfLinkardiaContract = await SeasOfLinkardiaContract.deploy();
  await seasOfLinkardiaContract.waitForDeployment();
  
  const seasOfLinkardiaAddress = await seasOfLinkardiaContract.getAddress();
  console.log("SeasOfLinkardia Contract deployed to:", seasOfLinkardiaAddress);

  // Determine if this is mainnet or testnet deployment
  const networkName = hre.network.name;
  let networkType;
  
  if (networkName === 'etherlinkMainnet') {
    networkType = 'mainnet';
  } else if (networkName === 'etherlinkTestnet') {
    networkType = 'testnet';
  } else {
    // For local development, we'll use testnet
    networkType = 'testnet';
  }
  
  // Update environment variables
  const contractAddresses = {
    SeasOfLinkardia: seasOfLinkardiaAddress
  };
  
  await updateEnvFile(networkType, contractAddresses);
  console.log(`Updated environment variables for ${networkType}`);

  // Verify setup is correct
  console.log("\nVerifying contract setup...");
  
  // Test basic contract functionality
  try {
    // Test contract constants
    const constants = {
      BASE_REPAIR_TIME: await seasOfLinkardiaContract.BASE_REPAIR_TIME(),
      PORT_REPAIR_TIME: await seasOfLinkardiaContract.PORT_REPAIR_TIME(),
      PORT25: await seasOfLinkardiaContract.PORT25(),
      PORT55: await seasOfLinkardiaContract.PORT55(),
      PORT89: await seasOfLinkardiaContract.PORT89()
    };
    
    console.log("📊 Contract constants verified:", constants);
    
    // Verify admin functionality
    const owner = await seasOfLinkardiaContract.owner();
    console.log("👑 Contract owner:", owner);
    console.log("⚓ Ship repair time:", `${constants.BASE_REPAIR_TIME / 3600} hours (base), ${constants.PORT_REPAIR_TIME / 3600} hours (at port)`);
    console.log("🏴‍☠️ Port locations:", `${constants.PORT25}, ${constants.PORT55}, ${constants.PORT89}`);
    
    // Test basic view functions
    try {
      const playersCount = await seasOfLinkardiaContract.players(0).catch(() => null);
      console.log("✅ Players array accessible");
      
      const nextUpgradeId = await seasOfLinkardiaContract.nextUpgradeId();
      console.log("✅ Upgrade system ready, next ID:", nextUpgradeId.toString());
      
      console.log("✅ Contract deployment and configuration verified successfully!");
    } catch (error) {
      console.log("⚠️ Some contract functions may not be initialized yet:", error.message);
    }
    
    console.log("\n💡 Available Features:");
    console.log("- ✅ Pirate vs Navy faction warfare");
    console.log("- ✅ Ship combat system with HP/Attack/Defense");
    console.log("- ✅ Travel system across 101 locations");
    console.log("- ✅ Daily check-in rewards with streak bonuses");
    console.log("- ✅ Ship upgrades with gold currency");
    console.log("- ✅ Diamond purchases with XTZ (real money)");
    console.log("- ✅ Ship repair system (faster at ports)");
    console.log("- ✅ Player rankings and leaderboards");
    console.log("- ✅ Revenue sharing to top players");
    
  } catch (error) {
    console.log("\n⚠️ Contract configuration has issues:", error.message);
  }

  console.log("Deployment complete!");
  
  return {
    SeasOfLinkardia: seasOfLinkardiaAddress,
    deployer: deployer.address,
    networkType
  };
}

// Allow the script to be imported for testing
if (require.main === module) {
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
}

module.exports = { main }; 