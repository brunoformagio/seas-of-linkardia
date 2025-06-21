const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Helper functions for SeasOfLinkardia tests
 */

/**
 * Creates a basic pirate account for testing
 */
async function createPirateAccount(contract, signer, name = "TestPirate", location = 50) {
  return await contract.connect(signer).createAccount(name, true, location);
}

/**
 * Creates a basic navy account for testing
 */
async function createNavyAccount(contract, signer, name = "TestNavy", location = 50) {
  return await contract.connect(signer).createAccount(name, false, location);
}

/**
 * Creates a powerful upgrade for testing combat
 */
async function createPowerfulUpgrade(contract, name = "Super Weapon", attackBonus = 100) {
  return await contract.addUpgrade(name, 50, 0, 0, 0, attackBonus, 0, 0);
}

/**
 * Wrecks a ship by attacking it with a powerful ship
 */
async function wreckShip(contract, attackerSigner, defenderAddress, defenderSigner) {
  // Create powerful upgrade
  await createPowerfulUpgrade(contract, "Destroyer", 200);
  
  // Buy upgrade for attacker
  await contract.connect(attackerSigner).buyUpgrade(0);
  
  // Attack to wreck the ship
  await contract.connect(attackerSigner).attack(defenderAddress);
  
  // Verify ship is wrecked
  const account = await contract.accounts(defenderAddress);
  return account.hp === 0n;
}

/**
 * Advances time and performs check-in
 */
async function advanceTimeAndCheckIn(contract, signer, days = 1) {
  await time.increase(days * 24 * 3600);
  return await contract.connect(signer).checkIn();
}

/**
 * Gives diamonds to a player by simulating purchase
 */
async function giveDiamonds(contract, signer, amount = 1) {
  const value = amount === 1 ? "10" : amount === 5 ? "45" : "90";
  return await signer.sendTransaction({
    to: await contract.getAddress(),
    value: ethers.parseEther(value)
  });
}

/**
 * Gets the total level (speed + attack + defense) of a player
 */
async function getPlayerLevel(contract, playerAddress) {
  const account = await contract.accounts(playerAddress);
  return account.speed + account.attack + account.defense;
}

/**
 * Deploys contract with initial setup
 */
async function deployWithSetup() {
  const [owner, ...signers] = await ethers.getSigners();
  
  const SeasOfLinkardia = await ethers.getContractFactory("SeasOfLinkardia");
  const contract = await SeasOfLinkardia.deploy();
  await contract.waitForDeployment();
  
  // Add some basic upgrades
  const upgrades = [
    { name: "Hull Upgrade", cost: 200, gpm: 0, hp: 25, speed: 0, attack: 0, defense: 5, crew: 0 },
    { name: "Cannon Upgrade", cost: 300, gpm: 0, hp: 0, speed: 0, attack: 10, defense: 0, crew: 0 },
    { name: "Speed Sails", cost: 250, gpm: 0, hp: 0, speed: 2, attack: 0, defense: 0, crew: 0 },
    { name: "Crew Quarters", cost: 150, gpm: 25, hp: 0, speed: 0, attack: 0, defense: 0, crew: 3 }
  ];
  
  for (const upgrade of upgrades) {
    await contract.addUpgrade(
      upgrade.name,
      upgrade.cost,
             upgrade.gpm,
      upgrade.hp,
      upgrade.speed,
      upgrade.attack,
      upgrade.defense,
      upgrade.crew
    );
  }
  
  return { contract, owner, signers };
}

/**
 * Simulates a full battle scenario
 */
async function simulateBattle(contract, pirateSigner, navySigner, pirateLocation = 50) {
  // Create accounts
  await createPirateAccount(contract, pirateSigner, "Pirate Ship", pirateLocation);
  await createNavyAccount(contract, navySigner, "Navy Ship", pirateLocation);
  
  // Make pirate stronger
  await createPowerfulUpgrade(contract, "Battle Cannon", 5);
  await contract.connect(pirateSigner).buyUpgrade(0);
  
  // Battle
  const tx = await contract.connect(pirateSigner).attack(navySigner.address);
  
  // Return battle results
  const pirateAccount = await contract.accounts(pirateSigner.address);
  const navyAccount = await contract.accounts(navySigner.address);
  
  return {
    transaction: tx,
    pirateHp: pirateAccount.hp,
    navyHp: navyAccount.hp,
    pirateGold: pirateAccount.gold,
    navyGold: navyAccount.gold
  };
}

/**
 * Creates a test scenario with multiple players at different locations
 */
async function createTestWorld(contract, signers) {
  const players = [];
  
  // Create pirates
  await createPirateAccount(contract, signers[0], "BlackPearl", 25);
  await createPirateAccount(contract, signers[1], "Revenge", 50);
  await createPirateAccount(contract, signers[2], "Crimson", 89);
  
  // Create navy
  await createNavyAccount(contract, signers[3], "Victory", 25);
  await createNavyAccount(contract, signers[4], "Constitution", 50);
  await createNavyAccount(contract, signers[5], "Enterprise", 89);
  
  return {
    pirates: [signers[0], signers[1], signers[2]],
    navy: [signers[3], signers[4], signers[5]],
    ports: [25, 50, 89]
  };
}

/**
 * Fast travel helper
 */
async function fastTravel(contract, signer, destination, diamonds = 10) {
  // Give diamonds first
  await giveDiamonds(contract, signer, diamonds);
  
  // Travel
  return await contract.connect(signer).travel(destination, true);
}

/**
 * Waits for travel to complete
 */
async function waitForTravel(contract, playerAddress) {
  const account = await contract.accounts(playerAddress);
  const currentTime = await time.latest();
  
  if (account.travelEnd > currentTime) {
    await time.increaseTo(account.travelEnd);
  }
}

/**
 * Utility to check if a ship is at a port
 */
function isAtPort(location) {
  return location === 25 || location === 55 || location === 89;
}

/**
 * Calculate expected travel time
 */
function calculateTravelTime(distance, speed) {
  const baseTime = distance * 3600; // 1 hour per unit distance
  const speedDiscount = speed * 5 * 60 * distance; // 5 minutes per speed per distance
  return Math.max(0, baseTime - speedDiscount);
}

/**
 * Calculate expected check-in reward
 */
function calculateCheckInReward(crew, streak) {
  return crew * 25 + 5 * streak;
}

module.exports = {
  createPirateAccount,
  createNavyAccount,
  createPowerfulUpgrade,
  wreckShip,
  advanceTimeAndCheckIn,
  giveDiamonds,
  getPlayerLevel,
  deployWithSetup,
  simulateBattle,
  createTestWorld,
  fastTravel,
  waitForTravel,
  isAtPort,
  calculateTravelTime,
  calculateCheckInReward
}; 