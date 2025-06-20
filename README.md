# 🏴‍☠️ Seas of Linkardia — On-chain Naval Battles on Etherlink

**Seas of Linkardia** is a fully on-chain strategy game deployed on [Etherlink](https://etherlink.com) (a Tezos Layer 2). Players become captains of pirate ships, fight naval battles, explore distant waters, and collect loot — all enforced by a Solidity smart contract.

This repository contains the production-grade smart contract powering the game.

---

## ⚓ Game Mechanics

* **Account Creation**: Each wallet can register a pirate ship (name, location, and stats are stored on-chain).
* **Stats**: Includes gold, diamonds, health (HP), speed, attack, defense, crew, max crew, and GPM (gold per minute).
* **Upgrades**: Admin can add ship upgrades. Players spend gold to improve their ships.
* **Pillaging**: Once per day, players can pillage to earn gold (based on crew + passive income).
* **Battles**: Ships can attack others at the same location. Damage is calculated based on attack and defense stats.
* **Traveling**: Players can sail between locations, with travel time depending on distance and ship speed.
* **Repair**: Ships with 0 HP can be repaired after a cooldown or by spending diamonds.
* **Diamonds Shop**: Players can purchase diamond packs with XTZ. A portion of the payment is distributed to the top 3 ranked players.
* **Ranking System**: Leaderboard based on combined stats (attack + defense + speed).
* **Admin Controls**: Add upgrades and withdraw game revenue.

---

## 🧠 Architecture

* **Language**: Solidity `^0.8.17`
* **Framework**: Compatible with [Hardhat](https://hardhat.org) or [Foundry](https://book.getfoundry.sh/)
* **Contract name**: `SeasOfLinkardia`
* **Storage**:

  * Player state is stored in a mapping (`accounts`).
  * Upgrade catalog is managed on-chain.
  * `players[]` holds all registered player addresses for ranking.

---

## 💎 Diamond Purchase Logic

* 10 XTZ → 1 Diamond
* 45 XTZ → 5 Diamonds
* 90 XTZ → 10 Diamonds

> Revenue split:

* 40% to top 1 player
* 20% to top 2
* 10% to top 3
* 30% remains in the contract (can be withdrawn by admin)

---

## 🚀 Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/brunoformagio/seas-of-linkardia.git
cd seas-of-linkardia  
npm install
```

Compile the contract:

```bash
npx hardhat compile
```

Run tests (if provided):

```bash
npx hardhat test
```

Deploy to testnet or Etherlink L2 using your preferred deploy script.

---

## 🛡 Security Notes

* All user actions are permissioned by wallet address.
* Only the `admin` address can add upgrades and withdraw funds.
* Time-based actions use `block.timestamp`.
* Rankings are calculated on-chain but rely on an in-memory player list (`players[]`), which can grow large. Consider off-chain indexing for scalability.

---

## 📝 License

MIT © \[Your Name or Studio]

---

## 🌐 Links

* 🔗 Live Game (coming soon)
* 📜 Contract Explorer (once deployed)
* 🧠 Project Concept \[PDF / Wiki coming soon]
