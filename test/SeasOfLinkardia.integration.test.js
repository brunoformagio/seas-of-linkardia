const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
  createPirateAccount,
  createNavyAccount,
  createTestWorld,
  giveDiamonds,
  advanceTimeAndCheckIn,
  simulateBattle,
  fastTravel,
  waitForTravel,
  calculateCheckInReward
} = require("./helpers/test-helpers");

describe("SeasOfLinkardia - Integration Tests", function () {
  let seasOfLinkardia;
  let owner;
  let signers;

  beforeEach(async function () {
    [owner, ...signers] = await ethers.getSigners();
    
    const SeasOfLinkardia = await ethers.getContractFactory("SeasOfLinkardia");
    seasOfLinkardia = await SeasOfLinkardia.deploy();
    await seasOfLinkardia.waitForDeployment();
  });

  describe("Complete Player Journey", function () {
    it("Should handle a full player lifecycle", async function () {
      const player = signers[0];
      
      // 1. Create account
      await createPirateAccount(seasOfLinkardia, player, "Adventure", 50);
      let account = await seasOfLinkardia.accounts(player.address);
      expect(account.boatName).to.equal("Adventure");
      expect(account.gold).to.equal(100);
      
      // 2. Daily check-ins for a week
      for (let day = 1; day <= 7; day++) {
        await advanceTimeAndCheckIn(seasOfLinkardia, player, 1);
        account = await seasOfLinkardia.accounts(player.address);
        const expectedReward = calculateCheckInReward(1, day);
        expect(account.checkInStreak).to.equal(day);
      }
      
      // 3. Buy upgrades
      await seasOfLinkardia.addUpgrade("Power Combo", 200, 10, 25, 2, 5, 5, 2);
      await seasOfLinkardia.connect(player).buyUpgrade(0);
      
      account = await seasOfLinkardia.accounts(player.address);
      expect(account.speed).to.equal(3); // 1 + 2
      expect(account.attack).to.equal(6); // 1 + 5
      expect(account.defense).to.equal(6); // 1 + 5
      expect(account.hp).to.equal(125); // 100 + 25
      expect(account.maxCrew).to.equal(12); // 10 + 2
      
      // 4. Travel to different locations
      await seasOfLinkardia.connect(player).travel(75, false);
      account = await seasOfLinkardia.accounts(player.address);
      expect(account.location).to.equal(75);
      
      // 5. Wait for travel to complete
      await waitForTravel(seasOfLinkardia, player.address);
      
      // 6. Buy diamonds and fast travel
      await giveDiamonds(seasOfLinkardia, player, 5);
      account = await seasOfLinkardia.accounts(player.address);
      expect(account.diamonds).to.equal(5);
      
      // 7. Fast travel to port
      await seasOfLinkardia.connect(player).travel(25, true);
      account = await seasOfLinkardia.accounts(player.address);
      expect(account.location).to.equal(25);
    });
  });

  describe("Multi-Player Warfare", function () {
    it("Should handle complex battle scenarios", async function () {
      const world = await createTestWorld(seasOfLinkardia, signers);
      
      // Create upgrades
      await seasOfLinkardia.addUpgrade("Pirate Cannon", 100, 0, 0, 0, 15, 0, 0);
      await seasOfLinkardia.addUpgrade("Navy Armor", 100, 0, 20, 0, 0, 10, 0);
      
      // Pirates buy cannons
      for (const pirate of world.pirates) {
        await seasOfLinkardia.connect(pirate).buyUpgrade(0);
      }
      
      // Navy buys armor
      for (const navy of world.navy) {
        await seasOfLinkardia.connect(navy).buyUpgrade(1);
      }
      
      // Battle at port 25
      const pirate1 = world.pirates[0];
      const navy1 = world.navy[0];
      
      const pirateAccountBefore = await seasOfLinkardia.accounts(pirate1.address);
      const navyAccountBefore = await seasOfLinkardia.accounts(navy1.address);
      
      await seasOfLinkardia.connect(pirate1).attack(navy1.address);
      
      const pirateAccountAfter = await seasOfLinkardia.accounts(pirate1.address);
      const navyAccountAfter = await seasOfLinkardia.accounts(navy1.address);
      
      // Verify battle effects
      expect(pirateAccountAfter.hp).to.be.lessThan(pirateAccountBefore.hp);
      expect(navyAccountAfter.hp).to.be.lessThan(navyAccountBefore.hp);
    });

    it("Should handle ship destruction and repair cycle", async function () {
      const pirate = signers[0];
      const navy = signers[1];
      
      // Create accounts
      await createPirateAccount(seasOfLinkardia, pirate, "Destroyer", 50);
      await createNavyAccount(seasOfLinkardia, navy, "Victim", 50);
      
      // Make pirate very powerful
      await seasOfLinkardia.addUpgrade("Mega Cannon", 50, 0, 0, 0, 200, 0, 0);
      await seasOfLinkardia.connect(pirate).buyUpgrade(0);
      
      // Attack and destroy navy ship
      await seasOfLinkardia.connect(pirate).attack(navy.address);
      
      let navyAccount = await seasOfLinkardia.accounts(navy.address);
      expect(navyAccount.hp).to.equal(0);
      expect(navyAccount.crew).to.equal(0);
      
      // Try to repair immediately (should fail)
      await expect(seasOfLinkardia.connect(navy).repairShip(false, false))
        .to.be.revertedWith("Not ready for basic repair");
      
      // Wait 5 hours and repair
      await time.increase(5 * 3600);
      await seasOfLinkardia.connect(navy).repairShip(false, false);
      
      navyAccount = await seasOfLinkardia.accounts(navy.address);
      expect(navyAccount.hp).to.equal(100);
      expect(navyAccount.lastWrecked).to.equal(0);
    });
  });

  describe("Economic Systems Integration", function () {
    it("Should handle diamond economy and revenue distribution", async function () {
      // Create multiple players to establish ranking
      const players = signers.slice(0, 5);
      
      for (let i = 0; i < players.length; i++) {
        await createPirateAccount(seasOfLinkardia, players[i], `Ship${i}`, 50);
      }
      
      // Create upgrades and make players different strength levels
      await seasOfLinkardia.addUpgrade("Level 1", 50, 0, 0, 1, 1, 1, 0);
      await seasOfLinkardia.addUpgrade("Level 2", 100, 0, 0, 2, 2, 2, 0);
      await seasOfLinkardia.addUpgrade("Level 3", 150, 0, 0, 3, 3, 3, 0);
      
      // Player 0 becomes strongest
      await seasOfLinkardia.connect(players[0]).buyUpgrade(0);
      await seasOfLinkardia.connect(players[0]).buyUpgrade(1);
      await seasOfLinkardia.connect(players[0]).buyUpgrade(2);
      
      // Player 1 becomes second strongest
      await seasOfLinkardia.connect(players[1]).buyUpgrade(0);
      await seasOfLinkardia.connect(players[1]).buyUpgrade(1);
      
      // Player 2 becomes third strongest
      await seasOfLinkardia.connect(players[2]).buyUpgrade(0);
      
      // Check ranking
      const [leaders, scores] = await seasOfLinkardia.getRanking(3);
      expect(leaders[0]).to.equal(players[0].address);
      expect(leaders[1]).to.equal(players[1].address);
      expect(leaders[2]).to.equal(players[2].address);
      
      // Record initial balances
      const initialBalances = [];
      for (let i = 0; i < 3; i++) {
        initialBalances.push(await ethers.provider.getBalance(players[i].address));
      }
      
      // Player 4 buys diamonds
      await players[4].sendTransaction({
        to: await seasOfLinkardia.getAddress(),
        value: ethers.parseEther("10")
      });
      
      // Check that diamonds were added
      const buyerAccount = await seasOfLinkardia.accounts(players[4].address);
      expect(buyerAccount.diamonds).to.equal(1);
      
      // Check that top players received XTZ (balances should increase)
      const finalBalances = [];
      for (let i = 0; i < 3; i++) {
        finalBalances.push(await ethers.provider.getBalance(players[i].address));
        if (i === 0) {
          expect(finalBalances[i]).to.be.greaterThan(initialBalances[i]);
        }
      }
    });

    it("Should handle check-in streaks and gold accumulation", async function () {
      const player = signers[0];
      await createPirateAccount(seasOfLinkardia, player, "Collector", 50);
      
      // Upgrade to have more crew for higher rewards
      await seasOfLinkardia.addUpgrade("Crew Expansion", 50, 0, 0, 0, 0, 0, 5);
      await seasOfLinkardia.connect(player).buyUpgrade(0);
      
      let account = await seasOfLinkardia.accounts(player.address);
      const crew = Number(account.crew);
      let expectedGold = Number(account.gold);
      
      // Check in for 10 consecutive days
      for (let day = 1; day <= 10; day++) {
        await advanceTimeAndCheckIn(seasOfLinkardia, player, 1);
        
        const reward = calculateCheckInReward(crew, day);
        expectedGold += reward;
        
        account = await seasOfLinkardia.accounts(player.address);
        expect(Number(account.gold)).to.equal(expectedGold);
        expect(Number(account.checkInStreak)).to.equal(day);
      }
      
      // Break streak by skipping 2 days
      await time.increase(48 * 3600);
      await seasOfLinkardia.connect(player).checkIn();
      
      account = await seasOfLinkardia.accounts(player.address);
      expect(Number(account.checkInStreak)).to.equal(1);
    });
  });

  describe("Travel and Map Integration", function () {
    it("Should handle complex travel scenarios", async function () {
      const player = signers[0];
      await createPirateAccount(seasOfLinkardia, player, "Explorer", 0);
      
      // Upgrade speed for faster travel
      await seasOfLinkardia.addUpgrade("Super Sails", 100, 0, 0, 10, 0, 0, 0);
      await seasOfLinkardia.connect(player).buyUpgrade(0);
      
      // Travel across the map
      const destinations = [25, 50, 75, 100, 55, 89, 0];
      
      for (const destination of destinations) {
        await seasOfLinkardia.connect(player).travel(destination, false);
        
        // Wait for travel to complete
        await waitForTravel(seasOfLinkardia, player.address);
        
        const account = await seasOfLinkardia.accounts(player.address);
        expect(Number(account.location)).to.equal(destination);
      }
    });

    it("Should handle port-specific mechanics", async function () {
      const player = signers[0];
      const enemy = signers[1];
      
      await createPirateAccount(seasOfLinkardia, player, "Victim", 25);
      await createNavyAccount(seasOfLinkardia, enemy, "Destroyer", 25);
      
      // Wreck the pirate ship
      await seasOfLinkardia.addUpgrade("Port Cannon", 50, 0, 0, 0, 200, 0, 0);
      await seasOfLinkardia.connect(enemy).buyUpgrade(0);
      await seasOfLinkardia.connect(enemy).attack(player.address);
      
      let account = await seasOfLinkardia.accounts(player.address);
      if (account.hp === 0n) {
        // Wait for basic repair time
        await time.increase(5 * 3600);
        
        // Repair at port with gold
        await seasOfLinkardia.connect(player).repairShip(true, false);
        
        account = await seasOfLinkardia.accounts(player.address);
        expect(account.hp).to.equal(100);
        expect(account.gold).to.be.lessThan(100); // Should have spent gold
      }
    });
  });

  describe("Ranking and Leaderboard", function () {
    it("Should maintain accurate rankings through gameplay", async function () {
      const players = signers.slice(0, 6);
      
      // Create diverse fleet
      for (let i = 0; i < players.length; i++) {
        const isPirate = i % 2 === 0;
        const name = isPirate ? `Pirate${i}` : `Navy${i}`;
        await seasOfLinkardia.connect(players[i]).createAccount(name, isPirate, 50);
      }
      
      // Create different upgrade levels
      const upgrades = [
        { name: "Basic", cost: 50, stats: [1, 1, 1] },
        { name: "Advanced", cost: 100, stats: [2, 2, 2] },
        { name: "Elite", cost: 150, stats: [3, 3, 3] }
      ];
      
      for (let i = 0; i < upgrades.length; i++) {
        await seasOfLinkardia.addUpgrade(
          upgrades[i].name,
          upgrades[i].cost,
          0, 0,
          upgrades[i].stats[0],
          upgrades[i].stats[1],
          upgrades[i].stats[2],
          0
        );
      }
      
      // Distribute upgrades to create hierarchy
      // Player 0: All upgrades (level 18: 3+6+9 = 18 total bonus + 3 base = 21)
      await seasOfLinkardia.connect(players[0]).buyUpgrade(0);
      await seasOfLinkardia.connect(players[0]).buyUpgrade(1);
      await seasOfLinkardia.connect(players[0]).buyUpgrade(2);
      
      // Player 1: Two upgrades (level 12: 3+6 = 9 total bonus + 3 base = 12)
      await seasOfLinkardia.connect(players[1]).buyUpgrade(0);
      await seasOfLinkardia.connect(players[1]).buyUpgrade(1);
      
      // Player 2: One upgrade (level 6: 3 total bonus + 3 base = 6)
      await seasOfLinkardia.connect(players[2]).buyUpgrade(0);
      
      // Remaining players: Base level (3)
      
      // Check rankings
      const [leaders, scores] = await seasOfLinkardia.getRanking(6);
      
      expect(leaders[0]).to.equal(players[0].address);
      expect(leaders[1]).to.equal(players[1].address);
      expect(leaders[2]).to.equal(players[2].address);
      
      expect(Number(scores[0])).to.equal(21);
      expect(Number(scores[1])).to.equal(12);
      expect(Number(scores[2])).to.equal(6);
      expect(Number(scores[3])).to.equal(3);
      expect(Number(scores[4])).to.equal(3);
      expect(Number(scores[5])).to.equal(3);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle concurrent operations correctly", async function () {
      const players = signers.slice(0, 3);
      
      // Create accounts
      for (let i = 0; i < players.length; i++) {
        await createPirateAccount(seasOfLinkardia, players[i], `Ship${i}`, 50);
      }
      
      // Try to have multiple players buy the same upgrade simultaneously
      await seasOfLinkardia.addUpgrade("Popular Upgrade", 50, 0, 0, 1, 1, 1, 0);
      
      // All should succeed
      await Promise.all([
        seasOfLinkardia.connect(players[0]).buyUpgrade(0),
        seasOfLinkardia.connect(players[1]).buyUpgrade(0),
        seasOfLinkardia.connect(players[2]).buyUpgrade(0)
      ]);
      
      // Verify all received upgrades
      for (let i = 0; i < players.length; i++) {
        const account = await seasOfLinkardia.accounts(players[i].address);
        expect(account.speed).to.equal(2);
        expect(account.attack).to.equal(2);
        expect(account.defense).to.equal(2);
      }
    });

    it("Should prevent exploitation of game mechanics", async function () {
      const player = signers[0];
      await createPirateAccount(seasOfLinkardia, player, "Exploiter", 50);
      
      // Try to check in multiple times
      await seasOfLinkardia.connect(player).checkIn();
      await expect(seasOfLinkardia.connect(player).checkIn())
        .to.be.revertedWith("Already checked in today");
      
      // Try to attack self (should fail because same faction)
      await expect(seasOfLinkardia.connect(player).attack(player.address))
        .to.be.revertedWith("Same affiliation");
      
      // Try to buy non-existent upgrade
      await expect(seasOfLinkardia.connect(player).buyUpgrade(999))
        .to.be.revertedWith("Upgrade not exist");
      
      // Try to travel while already traveling
      await seasOfLinkardia.connect(player).travel(75, false);
      await expect(seasOfLinkardia.connect(player).travel(25, false))
        .to.be.revertedWith("Already traveling");
    });
  });
}); 