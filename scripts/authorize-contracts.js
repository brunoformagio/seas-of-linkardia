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
      cost: 50,
      gpmBonus: 1,
      maxHpBonus: 10,
      speedBonus: 0,
      attackBonus: 0,
      defenseBonus: 0,
      maxCrewBonus: 0
    },
    {
      name: "Hire Crew",
      cost: 100,
      gpmBonus: 1,
      maxHpBonus: 0,
      speedBonus: 0,
      attackBonus: 0,
      defenseBonus: 0,
      maxCrewBonus: 1
    },
    {
      name: "Crew Training",
      cost: 100,
      gpmBonus: 1,
      maxHpBonus: 0,
      speedBonus: 0,
      attackBonus: 0,
      defenseBonus: 1,
      maxCrewBonus: 0
    },
    {
      name: "Cannon Upgrade",
      cost: 100,
      gpmBonus: 1,
      maxHpBonus: 0,
      speedBonus: 0,
      attackBonus: 1,
      defenseBonus: 0,
      maxCrewBonus: 0
    },
    {
      name: "Deck Upgrade",
      cost: 250,
      gpmBonus: 1,
      maxHpBonus: 0,
      speedBonus: 0,
      attackBonus: 0,
      defenseBonus: 0,
      maxCrewBonus: 5
    },
    {
      name: "Sails Upgrade",
      cost: 500,
      gpmBonus: 1,
      maxHpBonus: 0,
      speedBonus: 1,
      attackBonus: 0,
      defenseBonus: 0,
      maxCrewBonus: 0
    }
  ];

  for (const upgrade of initialUpgrades) {
    try {
      const tx = await seasOfLinkardia.addUpgrade(
        upgrade.name,
        upgrade.cost,
        upgrade.gpmBonus,
        upgrade.maxHpBonus,
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