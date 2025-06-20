const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Authorizing contracts with the account:", deployer.address);

  // Get contract instances
  const SeasOfLinkardiaContract = await ethers.getContractFactory("SeasOfLinkardia");

  // Get deployed contract addresses
  const seasOfLinkardiaAddress = SeasOfLinkardiaContract.getAddress ? await SeasOfLinkardiaContract.getAddress() : (await SeasOfLinkardiaContract.deployed()).address;

  console.log("Seas Of Linkardia Address:", seasOfLinkardiaAddress);

  // Get contract instances
  const seasOfLinkardia = await SeasOfLinkardiaContract.attach(seasOfLinkardiaAddress);

  // Authorize contracts
  await seasOfLinkardia.authorizeContract(seasOfLinkardiaAddress);
  console.log("Seas Of Linkardia contract authorized in Seas Of Linkardia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 