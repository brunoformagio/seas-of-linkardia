<div align="center">
  <img src="./public/logo_high.png" alt="Seas of Linkardia Logo" width="300" height="300">
  
  # 🏴‍☠️ Seas of Linkardia
  
  **A Fully On-Chain Naval Strategy Game on Etherlink**
  
  *Command your ship, explore the seas, engage in epic battles, and rise through the ranks in this immersive blockchain-powered maritime adventure!*

  ### 🎮 [**PLAY NOW →**](https://seas-of-linkardia.vercel.app/)

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Solidity](https://img.shields.io/badge/Solidity-0.8.17-gray?logo=solidity)](https://soliditylang.org/)
  [![Thirdweb](https://img.shields.io/badge/Thirdweb-5.92.1-purple?logo=thirdweb)](https://thirdweb.com/)
  [![Etherlink](https://img.shields.io/badge/Etherlink-Tezos%20L2-green)](https://etherlink.com/)
  [![Hardhat](https://img.shields.io/badge/Hardhat-2.19.5-yellow?logo=hardhat)](https://hardhat.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-blue?logo=tailwindcss)](https://tailwindcss.com/)
</div>

---

## 🌊 Overview

Seas of Linkardia is a fully on-chain strategy game where players become naval commanders, choosing between the disciplined Navy or the rebellious Pirates. Battle for supremacy, upgrade your ships, explore vast oceans, and claim your place in maritime history—all powered by smart contracts on Etherlink, Tezos's high-performance Layer 2.

### ✨ Key Features

- **🏴‍☠️ Choose Your Faction**: Join the Navy or become a Pirate
- **⚔️ Naval Combat**: Strategic battles with damage calculations
- **🚢 Ship Upgrades**: Enhance attack, defense, speed, and crew capacity  
- **🗺️ Ocean Exploration**: Travel between locations with realistic timing
- **💰 Economic System**: Gold Per Minute (GPM), daily check-ins, and crew management
- **🔧 Repair System**: Multiple repair options with different costs and timing
- **💎 Diamond Economy**: Premium currency with revenue sharing
- **🏆 Ranking System**: Compete for the top leaderboard positions
- **🛡️ Safe Ports**: Protected areas for repairs and crew hiring

---

## 🛠️ Technology Stack

### 🎯 Frontend Technologies

- **[Next.js 15.3.2](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://reactjs.org/)** - Latest React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations and transitions
- **[PixiJS](https://pixijs.com/)** - High-performance 2D rendering for game graphics
- **[Sonner](https://sonner.emilkowal.ski/)** - Beautiful toast notifications

### ⛓️ Blockchain & Web3

- **[Thirdweb SDK v5](https://thirdweb.com/)** - Complete Web3 development platform
- **[Viem](https://viem.sh/)** - Type-safe Ethereum client
- **[Solidity ^0.8.17](https://soliditylang.org/)** - Smart contract development
- **[OpenZeppelin](https://openzeppelin.com/)** - Security-audited contract libraries
- **[Etherlink](https://etherlink.com/)** - Tezos Layer 2 for low fees and fast transactions

### 🔧 Development Tools

- **[Hardhat](https://hardhat.org/)** - Ethereum development environment
- **[TypeChain](https://github.com/dethcrypto/TypeChain)** - TypeScript bindings for contracts
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[Jest](https://jestjs.io/)** - Testing framework

### 💳 Wallet Integration

- **MetaMask** - Browser extension wallet
- **Thirdweb In-App Wallet** - Social login with:
  - Google, Discord, Telegram
  - X (Twitter), Farcaster, Coinbase
  - Apple, Facebook, Email

---

## 🎮 Game Mechanics

### 🏗️ Account Creation
- Choose your ship name (up to 12 characters)
- Select faction: Navy ⚓ or Pirates 🏴‍☠️
- Pick starting location (0-100 on the map)
- Begin with basic stats and 100 gold

### ⚔️ Combat System
- **Strategic Battles**: Attack = damage dealt, Defense = damage reduced
- **Ship Destruction**: Ships with 0 HP are wrecked and teleported to nearest port
- **Safe Zones**: Ports (locations 25, 55, 89) are attack-free areas
- **Loot System**: Winners steal gold based on crew size

### 🚢 Ship Management
- **Upgrades**: Exponential pricing system (1.5x multiplier per purchase)
- **Crew Hiring**: Hire crew at ports (10 gold per crew member)
- **Repair Options**:
  - **Free**: 30 minutes per 25 maxHP, 50% crew recovery
  - **Gold**: 5 minutes per 25 maxHP, full crew recovery  
  - **Diamond**: Instant repair, full crew recovery

### 💰 Economic Features
- **Daily Check-ins**: Earn gold based on crew size and streak bonus
- **Gold Per Minute (GPM)**: Passive income from upgrades
- **Diamond Purchases**: Premium currency with XTZ
- **Revenue Sharing**: Top 3 players receive diamond purchase rewards

### 🗺️ Travel & Exploration
- **Distance-based Travel**: Time calculated by location difference
- **Speed Bonuses**: Upgrades reduce travel time
- **Fast Travel**: Instant travel using diamonds
- **Strategic Positioning**: Location affects combat opportunities

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MetaMask or compatible Web3 wallet
- Some XTZ for transactions on Etherlink

### Installation

```bash
# Clone the repository
git clone https://github.com/brunoformagio/seas-of-linkardia.git
cd seas-of-linkardia

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your Thirdweb client ID and other config
```

### Development

```bash
# Start the development server
pnpm dev

# Compile smart contracts
pnpm compile

# Run tests
pnpm test

# Generate TypeScript types
pnpm generate-types
```

### Deployment

```bash
# Deploy to testnet
pnpm deploy:testnet

# Deploy to mainnet
pnpm deploy:mainnet

# Verify contracts
pnpm verify:mainnet
```

---

## 🏗️ Smart Contract Architecture

The game is powered by the `SeasOfLinkardia.sol` contract featuring:

### Core Structures
- **Account**: Player state (gold, diamonds, HP, stats, location)
- **Upgrade**: Ship enhancement definitions with bonuses
- **Purchase Tracking**: Exponential pricing per player

### Key Functions
- `createAccount()` - Ship registration
- `buyUpgrade()` - Ship improvements with auto-GPM claiming
- `attack()` - Combat between different factions
- `travel()` - Movement with optional fast travel
- `repairShip()` - Multiple repair options
- `checkIn()` - Daily rewards system
- `claimGPM()` - Passive income collection

### Security Features
- OpenZeppelin's `Ownable` and `ReentrancyGuard`
- Input validation and bounds checking
- Time-based action protection
- Faction-based combat restrictions

---

## 💎 Diamond Economy

| Package | Cost | Diamonds | Value |
|---------|------|----------|-------|
| Starter | 10 XTZ | 1 💎 | Fast travel, instant repairs |
| Adventurer | 45 XTZ | 5 💎 | 10% discount per diamond |
| Captain | 90 XTZ | 10 💎 | 12.5% discount per diamond |

**Revenue Distribution:**
- 40% → #1 Ranked Player
- 20% → #2 Ranked Player  
- 10% → #3 Ranked Player
- 30% → Contract Treasury

---

## 🏆 Ranking System

Players are ranked by **Total Combat Power** (Attack + Defense + Speed).

**Leaderboard Benefits:**
- Revenue sharing from diamond purchases
- Prestige and recognition
- Strategic advantage in faction wars

---

## 🔐 Security & Testing

```bash
# Run comprehensive test suite
pnpm test:all

# Gas optimization analysis
pnpm test:gas

# Integration testing
pnpm test:integration

# Test coverage report
pnpm test:coverage
```

**Security Measures:**
- Reentrancy protection on all state-changing functions
- Input validation and sanitization
- Time-based action cooldowns
- Owner-only administrative functions

---

## 🌐 Network Configuration

### Etherlink Mainnet
- **Chain ID**: 42793
- **RPC**: https://node.mainnet.etherlink.com
- **Explorer**: https://explorer.etherlink.com
- **Currency**: XTZ

### Etherlink Testnet
- **Chain ID**: 128123  
- **RPC**: https://node.ghostnet.etherlink.com
- **Explorer**: https://testnet.explorer.etherlink.com
- **Currency**: XTZ (Testnet)

---

## 📁 Project Structure

```
seas-of-linkardia/
├── app/                          # Next.js app directory
│   ├── components/              # React components
│   │   ├── game/               # Game-specific components
│   │   ├── ui/                 # Reusable UI components
│   │   └── modals/             # Modal components
│   ├── libs/                   # Utility libraries
│   │   ├── hooks/              # Custom React hooks
│   │   ├── providers/          # Context providers
│   │   └── constants/          # Game constants
│   └── globals.css            # Global styles
├── contracts/                  # Smart contracts
│   └── SeasOfLinkardia.sol    # Main game contract
├── scripts/                   # Deployment scripts
├── test/                      # Contract tests
├── types/                     # TypeScript definitions
└── public/                    # Static assets
    ├── ships/                 # Ship sprites
    ├── ui/                    # UI elements
    └── sounds/                # Audio files
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Update documentation for new features

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Copyright © 2025 Bruno Formagio**

---

## 🔗 Links & Resources

- 🎮 **[Play Seas of Linkardia](https://seas-of-linkardia.vercel.app)** *(Coming Soon)*
- 📱 **[Contract Explorer](https://explorer.etherlink.com)** *(Post-deployment)*
- 🐦 **[Follow Updates](https://twitter.com/brunoformagio)** 
- 📚 **[Thirdweb Documentation](https://portal.thirdweb.com/)**
- 🌊 **[Etherlink Documentation](https://docs.etherlink.com/)**

---

<div align="center">
  <p><strong>⚓ Set sail and conquer the Seas of Linkardia! ⚓</strong></p>
  <p><em>May the winds be at your back and your cannons ever true.</em></p>
</div>
