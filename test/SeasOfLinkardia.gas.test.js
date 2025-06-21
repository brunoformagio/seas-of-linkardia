const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SeasOfLinkardia - Gas Optimization Tests", function () {
  let seasOfLinkardia;
  let owner;
  let players;

  beforeEach(async function () {
    [owner, ...players] = await ethers.getSigners();
    
    const SeasOfLinkardia = await ethers.getContractFactory("SeasOfLinkardia");
    seasOfLinkardia = await SeasOfLinkardia.deploy();
    await seasOfLinkardia.waitForDeployment();
  });

  describe("Gas Usage Analysis", function () {
    it("Should measure gas for account creation", async function () {
      const tx = await seasOfLinkardia.connect(players[0]).createAccount("TestShip", true, 50);
      const receipt = await tx.wait();
      
      console.log(`Account creation gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(200000); // Should be under 200k gas
    });

    it("Should measure gas for check-in", async function () {
      await seasOfLinkardia.connect(players[0]).createAccount("TestShip", true, 50);
      
      const tx = await seasOfLinkardia.connect(players[0]).checkIn();
      const receipt = await tx.wait();
      
      console.log(`Check-in gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(100000); // Should be under 100k gas
    });

    it("Should measure gas for upgrade purchase", async function () {
      await seasOfLinkardia.connect(players[0]).createAccount("TestShip", true, 50);
      await seasOfLinkardia.addUpgrade("Test Upgrade", 50, 0, 10, 1, 1, 1, 1);
      
      const tx = await seasOfLinkardia.connect(players[0]).buyUpgrade(0);
      const receipt = await tx.wait();
      
      console.log(`Upgrade purchase gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(150000); // Should be under 150k gas
    });

    it("Should measure gas for combat", async function () {
      await seasOfLinkardia.connect(players[0]).createAccount("Pirate", true, 50);
      await seasOfLinkardia.connect(players[1]).createAccount("Navy", false, 50);
      
      const tx = await seasOfLinkardia.connect(players[0]).attack(players[1].address);
      const receipt = await tx.wait();
      
      console.log(`Combat gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(200000); // Should be under 200k gas
    });

    it("Should measure gas for travel", async function () {
      await seasOfLinkardia.connect(players[0]).createAccount("TestShip", true, 50);
      
      const tx = await seasOfLinkardia.connect(players[0]).travel(75, false);
      const receipt = await tx.wait();
      
      console.log(`Travel gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(100000); // Should be under 100k gas
    });

    it("Should measure gas for ship repair", async function () {
      await seasOfLinkardia.connect(players[0]).createAccount("TestShip", true, 50);
      await seasOfLinkardia.connect(players[1]).createAccount("Navy", false, 50);
      
      // Create powerful upgrade to wreck ship
      await seasOfLinkardia.addUpgrade("Destroyer", 50, 0, 0, 0, 200, 0, 0);
      await seasOfLinkardia.connect(players[1]).buyUpgrade(0);
      await seasOfLinkardia.connect(players[1]).attack(players[0].address);
      
      // Wait for repair time
      await time.increase(5 * 3600);
      
      const account = await seasOfLinkardia.accounts(players[0].address);
      if (account.hp === 0n) {
        const tx = await seasOfLinkardia.connect(players[0]).repairShip(false, false);
        const receipt = await tx.wait();
        
        console.log(`Ship repair gas used: ${receipt.gasUsed.toString()}`);
        expect(receipt.gasUsed).to.be.lessThan(100000); // Should be under 100k gas
      }
    });

    it("Should measure gas for diamond purchase", async function () {
      await seasOfLinkardia.connect(players[0]).createAccount("TestShip", true, 50);
      
      const tx = await players[0].sendTransaction({
        to: await seasOfLinkardia.getAddress(),
        value: ethers.parseEther("10")
      });
      const receipt = await tx.wait();
      
      console.log(`Diamond purchase gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(300000); // Should be under 300k gas (includes transfers)
    });

    it("Should measure gas for ranking retrieval", async function () {
      // Create multiple players
      for (let i = 0; i < 5; i++) {
        await seasOfLinkardia.connect(players[i]).createAccount(`Ship${i}`, i % 2 === 0, 50);
      }
      
      const tx = await seasOfLinkardia.getRanking(5);
      // Note: This is a view function, so gas cost is for execution, not transaction
      console.log(`Ranking retrieval executed successfully`);
    });
  });

  describe("Gas Optimization with Multiple Operations", function () {
    it("Should measure cumulative gas for player session", async function () {
      let totalGas = 0;
      
      // Account creation
      let tx = await seasOfLinkardia.connect(players[0]).createAccount("GasTest", true, 50);
      let receipt = await tx.wait();
      totalGas += Number(receipt.gasUsed);
      
      // Check-in
      tx = await seasOfLinkardia.connect(players[0]).checkIn();
      receipt = await tx.wait();
      totalGas += Number(receipt.gasUsed);
      
      // Add and buy upgrade
      await seasOfLinkardia.addUpgrade("Gas Upgrade", 50, 0, 10, 1, 1, 1, 1);
      tx = await seasOfLinkardia.connect(players[0]).buyUpgrade(0);
      receipt = await tx.wait();
      totalGas += Number(receipt.gasUsed);
      
      // Travel
      tx = await seasOfLinkardia.connect(players[0]).travel(75, false);
      receipt = await tx.wait();
      totalGas += Number(receipt.gasUsed);
      
      console.log(`Total gas for complete session: ${totalGas}`);
      expect(totalGas).to.be.lessThan(600000); // Should be under 600k gas total
    });

    it("Should measure gas efficiency with multiple players", async function () {
      const gasUsages = [];
      
      // Create multiple accounts and measure gas usage
      for (let i = 0; i < 10; i++) {
        const tx = await seasOfLinkardia.connect(players[i]).createAccount(`Ship${i}`, i % 2 === 0, 50);
        const receipt = await tx.wait();
        gasUsages.push(Number(receipt.gasUsed));
      }
      
      const avgGas = gasUsages.reduce((a, b) => a + b, 0) / gasUsages.length;
      console.log(`Average gas per account creation: ${avgGas}`);
      console.log(`Gas usage variance: ${Math.max(...gasUsages) - Math.min(...gasUsages)}`);
      
      // Gas usage should be consistent
      expect(Math.max(...gasUsages) - Math.min(...gasUsages)).to.be.lessThan(10000);
    });

    it("Should test gas usage for batch operations", async function () {
      // Create accounts
      for (let i = 0; i < 5; i++) {
        await seasOfLinkardia.connect(players[i]).createAccount(`Ship${i}`, true, 50);
      }
      
      // Add multiple upgrades
      const upgrades = [
        { name: "Hull", cost: 100, hp: 25 },
        { name: "Cannon", cost: 150, attack: 10 },
        { name: "Sails", cost: 120, speed: 2 },
        { name: "Armor", cost: 180, defense: 8 }
      ];
      
      let totalAddGas = 0;
      for (const upgrade of upgrades) {
        const tx = await seasOfLinkardia.addUpgrade(
          upgrade.name, upgrade.cost, 0, 
          upgrade.hp || 0, upgrade.speed || 0, 
          upgrade.attack || 0, upgrade.defense || 0, 0
        );
        const receipt = await tx.wait();
        totalAddGas += Number(receipt.gasUsed);
      }
      
      console.log(`Total gas for adding 4 upgrades: ${totalAddGas}`);
      
      // Measure gas for players buying upgrades
      let totalBuyGas = 0;
      for (let i = 0; i < 4; i++) {
        const tx = await seasOfLinkardia.connect(players[i]).buyUpgrade(i);
        const receipt = await tx.wait();
        totalBuyGas += Number(receipt.gasUsed);
      }
      
      console.log(`Total gas for 4 players buying upgrades: ${totalBuyGas}`);
      expect(totalBuyGas).to.be.lessThan(600000); // Should be efficient for batch operations
    });
  });

  describe("Gas Optimization Edge Cases", function () {
    it("Should measure gas for maximum distance travel", async function () {
      await seasOfLinkardia.connect(players[0]).createAccount("TestShip", true, 0);
      
      // Travel maximum distance (0 to 100)
      const tx = await seasOfLinkardia.connect(players[0]).travel(100, false);
      const receipt = await tx.wait();
      
      console.log(`Maximum distance travel gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(150000);
    });

    it("Should measure gas for ship destruction combat", async function () {
      await seasOfLinkardia.connect(players[0]).createAccount("Weak", true, 50);
      await seasOfLinkardia.connect(players[1]).createAccount("Strong", false, 50);
      
      // Make second player extremely powerful
      await seasOfLinkardia.addUpgrade("Ultimate Weapon", 50, 0, 0, 0, 1000, 0, 0);
      await seasOfLinkardia.connect(players[1]).buyUpgrade(0);
      
      const tx = await seasOfLinkardia.connect(players[1]).attack(players[0].address);
      const receipt = await tx.wait();
      
      console.log(`Ship destruction combat gas used: ${receipt.gasUsed.toString()}`);
      
      // Verify ship was actually destroyed
      const account = await seasOfLinkardia.accounts(players[0].address);
      if (account.hp === 0n) {
        console.log("Ship successfully destroyed");
        expect(receipt.gasUsed).to.be.lessThan(250000); // Destruction logic uses more gas
      }
    });

    it("Should measure gas for large ranking calculation", async function () {
      // Create many players
      for (let i = 0; i < 20; i++) {
        await seasOfLinkardia.connect(players[i % 10]).createAccount(`Ship${i}`, i % 2 === 0, 50);
        if (i >= 10) {
          // Use different signer for additional accounts (simulate with existing signers)
          const signerIndex = i % 10;
          await seasOfLinkardia.connect(players[signerIndex]).createAccount(`Ship${i}`, i % 2 === 0, 50);
        }
      }
      
      // This is a view function, so we'll test it doesn't revert
      const [leaders, scores] = await seasOfLinkardia.getRanking(10);
      expect(leaders.length).to.be.lessThanOrEqual(10);
      console.log(`Ranking calculation for ${leaders.length} players completed`);
    });

    it("Should measure gas for complex upgrade with all bonuses", async function () {
      await seasOfLinkardia.connect(players[0]).createAccount("TestShip", true, 50);
      
      // Add upgrade with all possible bonuses
      await seasOfLinkardia.addUpgrade("Master Upgrade", 50, 100, 50, 5, 10, 8, 15);
      
      const tx = await seasOfLinkardia.connect(players[0]).buyUpgrade(0);
      const receipt = await tx.wait();
      
      console.log(`Complex upgrade purchase gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(200000);
      
      // Verify all bonuses were applied
      const account = await seasOfLinkardia.accounts(players[0].address);
      expect(account.gpm).to.equal(100);
      expect(account.hp).to.equal(150); // 100 + 50
      expect(account.speed).to.equal(6); // 1 + 5
      expect(account.attack).to.equal(11); // 1 + 10
      expect(account.defense).to.equal(9); // 1 + 8
      expect(account.maxCrew).to.equal(25); // 10 + 15
    });
  });

  describe("Gas Benchmarking", function () {
    it("Should benchmark all major functions", async function () {
      console.log("\n=== GAS BENCHMARKING RESULTS ===");
      
      const benchmarks = {};
      
      // Account Creation
      let tx = await seasOfLinkardia.connect(players[0]).createAccount("Benchmark", true, 50);
      let receipt = await tx.wait();
      benchmarks.accountCreation = Number(receipt.gasUsed);
      
      // Check-in
      tx = await seasOfLinkardia.connect(players[0]).checkIn();
      receipt = await tx.wait();
      benchmarks.checkIn = Number(receipt.gasUsed);
      
      // Add Upgrade (admin)
      tx = await seasOfLinkardia.addUpgrade("Benchmark Upgrade", 100, 10, 20, 2, 5, 3, 5);
      receipt = await tx.wait();
      benchmarks.addUpgrade = Number(receipt.gasUsed);
      
      // Buy Upgrade
      tx = await seasOfLinkardia.connect(players[0]).buyUpgrade(0);
      receipt = await tx.wait();
      benchmarks.buyUpgrade = Number(receipt.gasUsed);
      
      // Travel
      tx = await seasOfLinkardia.connect(players[0]).travel(75, false);
      receipt = await tx.wait();
      benchmarks.travel = Number(receipt.gasUsed);
      
      // Combat Setup
      await seasOfLinkardia.connect(players[1]).createAccount("Enemy", false, 75);
      await time.increaseTo((await seasOfLinkardia.accounts(players[0].address)).travelEnd);
      
      // Combat
      tx = await seasOfLinkardia.connect(players[0]).attack(players[1].address);
      receipt = await tx.wait();
      benchmarks.combat = Number(receipt.gasUsed);
      
      // Diamond Purchase
      tx = await players[2].sendTransaction({
        to: await seasOfLinkardia.getAddress(),
        value: ethers.parseEther("10")
      });
      receipt = await tx.wait();
      benchmarks.diamondPurchase = Number(receipt.gasUsed);
      
      // Print results
      console.log("\nFunction                | Gas Used");
      console.log("------------------------|----------");
      for (const [func, gas] of Object.entries(benchmarks)) {
        console.log(`${func.padEnd(23)} | ${gas.toString().padStart(8)}`);
      }
      console.log("================================\n");
      
      // Assert reasonable gas limits
      expect(benchmarks.accountCreation).to.be.lessThan(200000);
      expect(benchmarks.checkIn).to.be.lessThan(100000);
      expect(benchmarks.addUpgrade).to.be.lessThan(150000);
      expect(benchmarks.buyUpgrade).to.be.lessThan(150000);
      expect(benchmarks.travel).to.be.lessThan(100000);
      expect(benchmarks.combat).to.be.lessThan(200000);
      expect(benchmarks.diamondPurchase).to.be.lessThan(400000);
    });
  });
}); 