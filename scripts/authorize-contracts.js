const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Setting up contracts with the account:", deployer.address);

  // Get contract factory
  const SeasOfLinkardiaContract = await ethers.getContractFactory("SeasOfLinkardia");

  // Get the deployed contract address from environment or deployment
  let seasOfLinkardiaAddress;
  
  // Try to get from environment first
  const networkType = process.env.NETWORK_TYPE || 'testnet';
  const envVarName = `NEXT_PUBLIC_SEASOFLINKARDIA_CONTRACT_ADDRESS_${networkType.toUpperCase()}`;
  seasOfLinkardiaAddress = process.env[envVarName];
  
  if (!seasOfLinkardiaAddress) {
    console.error(`Contract address not found in environment variable: ${envVarName}`);
    console.log("Please deploy the contract first or set the environment variable");
    process.exit(1);
  }

  console.log("Seas Of Linkardia Address:", seasOfLinkardiaAddress);

  // Get contract instance
  const seasOfLinkardia = await SeasOfLinkardiaContract.attach(seasOfLinkardiaAddress);

  // Add some initial upgrades for the game
  console.log("Adding initial ship upgrades...");
  
  const initialUpgrades = [
    {
      name: "Hull Reinforcement",
      cost: 500,
      gpmBonus: 0,
      hpBonus: 25,
      speedBonus: 0,
      attackBonus: 0,
      defenseBonus: 5,
      maxCrewBonus: 0
    },
    {
      name: "Cannon Upgrade",
      cost: 750,
      gpmBonus: 0,
      hpBonus: 0,
      speedBonus: 0,
      attackBonus: 10,
      defenseBonus: 0,
      maxCrewBonus: 0
    },
    {
      name: "Speed Sails",
      cost: 600,
      gpmBonus: 0,
      hpBonus: 0,
      speedBonus: 2,
      attackBonus: 0,
      defenseBonus: 0,
      maxCrewBonus: 0
    },
    {
      name: "Crew Quarters",
      cost: 400,
      gpmBonus: 50,
      hpBonus: 0,
      speedBonus: 0,
      attackBonus: 0,
      defenseBonus: 0,
      maxCrewBonus: 5
    }
  ];

  for (const upgrade of initialUpgrades) {
    try {
      const tx = await seasOfLinkardia.addUpgrade(
        upgrade.name,
        upgrade.cost,
        upgrade.gpmBonus,
        upgrade.hpBonus,
        upgrade.speedBonus,
        upgrade.attackBonus,
        upgrade.defenseBonus,
        upgrade.maxCrewBonus
      );
      await tx.wait();
      console.log(`✅ Added upgrade: ${upgrade.name} (${upgrade.cost} gold)`);
    } catch (error) {
      console.log(`⚠️ Failed to add upgrade ${upgrade.name}:`, error.message);
    }
  }

  console.log("✅ Contract setup completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 