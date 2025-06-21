# SeasOfLinkardia TypeScript Types

This directory contains auto-generated TypeScript types for the SeasOfLinkardia smart contract, created using TypeChain and ethers-v6.

## 📁 **Generated Files**

```
types/
├── artifacts/
│   └── contracts/
│       └── SeasOfLinkardia.ts          # Main contract interface
├── factories/
│   └── artifacts/
│       └── contracts/
│           └── SeasOfLinkardia__factory.ts  # Contract factory
├── index.ts                            # Exports all types
├── common.ts                          # Common TypeChain types
└── hardhat.d.ts                       # Hardhat type augmentations
```

## 🔧 **Setup & Generation**

### Prerequisites
- Node.js >= 16
- TypeScript >= 4.5
- Hardhat configured with TypeChain

### Generate Types
```bash
# Compile contracts and generate types
npm run generate-types

# Or run individually
npm run compile
npm run types
```

### Configuration
The types are configured in `hardhat.config.js`:
```javascript
typechain: {
  outDir: "types",
  target: "ethers-v6",
  alwaysGenerateOverloads: false,
  externalArtifacts: ["node_modules/@openzeppelin/contracts/build/contracts/*.json"],
  dontOverrideCompile: false
}
```

## 🎯 **Usage Examples**

### Basic Contract Interaction
```typescript
import { ethers } from 'ethers';
import { SeasOfLinkardia, SeasOfLinkardia__factory } from '../types';

// Connect to deployed contract
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);
const contractAddress = '0x...';

const contract: SeasOfLinkardia = SeasOfLinkardia__factory.connect(
  contractAddress,
  signer
);

// All contract methods are now typed!
const account = await contract.accounts('0x...');
console.log(account.boatName); // ✅ Typed
```

### Deploy New Contract
```typescript
import { SeasOfLinkardia__factory } from '../types';

async function deployContract(signer: ethers.Signer): Promise<SeasOfLinkardia> {
  const factory = new SeasOfLinkardia__factory(signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  return contract;
}
```

### Type-Safe Event Listening
```typescript
// Listen to specific events with full typing
contract.on('AccountCreated', (user, boatName, isPirate, event) => {
  console.log(`New ${isPirate ? 'pirate' : 'navy'}: ${boatName} by ${user}`);
  // All parameters are properly typed!
});

// Query past events
const filter = contract.filters.ShipAttacked(null, null, true);
const events = await contract.queryFilter(filter, -1000);
events.forEach(event => {
  console.log(`Ship destroyed: ${event.args.defender}`);
});
```

## 🎨 **Frontend Integration**

### With React Hooks
```typescript
import { useSeasOfLinkardiaContract, usePlayerAccount } from '../hooks/useSeasOfLinkardia';

function GameComponent() {
  const { contract } = useSeasOfLinkardiaContract(contractAddress, signer);
  const { account, isLoading } = usePlayerAccount(contract, playerAddress);

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{account?.boatName} {account?.isPirate ? '🏴‍☠️' : '⚓'}</h1>
      <p>Gold: {account?.gold.toString()}</p>
      <p>HP: {account?.hp.toString()}/100</p>
    </div>
  );
}
```

### With Contract Utilities
```typescript
import {
  createSeasOfLinkardiaContract,
  formatPlayerAccount,
  calculateShipLevel,
  type PlayerAccount
} from '../lib/contracts';

const contract = createSeasOfLinkardiaContract(contractAddress, signer);
const rawAccount = await contract.accounts(playerAddress);
const account: PlayerAccount = formatPlayerAccount(rawAccount);
const shipLevel = calculateShipLevel(account);
```

## 📋 **Core Types**

### Contract Interface
```typescript
interface SeasOfLinkardia extends BaseContract {
  // View functions
  accounts(address: string): Promise<AccountStruct>;
  upgrades(id: BigNumberish): Promise<UpgradeStruct>;
  getRanking(n: BigNumberish): Promise<[string[], bigint[]]>;
  getShipsAt(location: BigNumberish): Promise<[string[], string[], bigint[]]>;
  
  // Write functions  
  createAccount(name: string, isPirate: boolean, location: BigNumberish): Promise<ContractTransactionResponse>;
  checkIn(): Promise<ContractTransactionResponse>;
  buyUpgrade(id: BigNumberish): Promise<ContractTransactionResponse>;
  attack(defender: string): Promise<ContractTransactionResponse>;
  travel(location: BigNumberish, fast: boolean): Promise<ContractTransactionResponse>;
  repairShip(atPort: boolean, useDiamond: boolean): Promise<ContractTransactionResponse>;
  
  // Events
  on(event: 'AccountCreated', listener: (user: string, boatName: string, isPirate: boolean) => void): this;
  on(event: 'CheckIn', listener: (user: string, streak: bigint, reward: bigint) => void): this;
  on(event: 'ShipAttacked', listener: (attacker: string, defender: string, destroyed: boolean) => void): this;
  // ... more events
}
```

### Data Structures
```typescript
// Account data from contract
interface AccountStruct {
  boatName: string;
  isPirate: boolean;
  gold: bigint;
  diamonds: bigint;
  hp: bigint;
  speed: bigint;
  attack: bigint;
  defense: bigint;
  crew: bigint;
  maxCrew: bigint;
  location: bigint;
  gpm: bigint;
  lastCheckIn: bigint;
  checkInStreak: bigint;
  lastWrecked: bigint;
  travelEnd: bigint;
}

// Upgrade data from contract
interface UpgradeStruct {
  name: string;
  cost: bigint;
  gpmBonus: bigint;
  hpBonus: bigint;
  speedBonus: bigint;
  attackBonus: bigint;
  defenseBonus: bigint;
  maxCrewBonus: bigint;
}
```

### Event Types
```typescript
// Type-safe event objects
type AccountCreatedEvent = TypedContractEvent<
  [user: string, boatName: string, isPirate: boolean],
  { user: string; boatName: string; isPirate: boolean }
>;

type CheckInEvent = TypedContractEvent<
  [user: string, streak: bigint, reward: bigint],
  { user: string; streak: bigint; reward: bigint }
>;

type ShipAttackedEvent = TypedContractEvent<
  [attacker: string, defender: string, destroyed: boolean],
  { attacker: string; defender: string; destroyed: boolean }
>;
```

## 🛡️ **Error Handling**

### Contract Errors
```typescript
try {
  await contract.createAccount("TestShip", true, 50);
} catch (error: any) {
  // Typed error messages
  if (error.reason === "Boat name invalid length") {
    console.log("Name too long or empty");
  } else if (error.reason === "Already has account") {
    console.log("Player already has an account");
  }
}
```

### Custom Error Types
```typescript
import { CONTRACT_ERRORS } from '../lib/contracts';

function handleContractError(error: any) {
  switch (error.reason) {
    case CONTRACT_ERRORS.BOAT_NAME_INVALID_LENGTH:
      return "Please use a boat name between 1-12 characters";
    case CONTRACT_ERRORS.NOT_ENOUGH_GOLD:
      return "Insufficient gold for this action";
    case CONTRACT_ERRORS.SHIP_WRECKED:
      return "Your ship is wrecked! Repair it first.";
    default:
      return `Transaction failed: ${error.reason || error.message}`;
  }
}
```

## 🧪 **Testing with Types**

```typescript
import { ethers } from 'hardhat';
import { SeasOfLinkardia, SeasOfLinkardia__factory } from '../types';

describe("SeasOfLinkardia", function () {
  let contract: SeasOfLinkardia;
  let owner: ethers.Signer;
  
  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const factory = new SeasOfLinkardia__factory(owner);
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  it("Should create account with typed response", async function () {
    await contract.createAccount("TestShip", true, 50);
    
    const account = await contract.accounts(await owner.getAddress());
    // All properties are typed!
    expect(account.boatName).to.equal("TestShip");
    expect(account.isPirate).to.be.true;
    expect(account.hp).to.equal(100n);
  });
});
```

## 🚀 **Advanced Usage**

### Custom Hooks with Types
```typescript
function useGameActions(contract: SeasOfLinkardia | null) {
  const createAccount = useCallback(async (
    name: string, 
    isPirate: boolean, 
    location: number
  ): Promise<void> => {
    if (!contract) throw new Error('Contract not available');
    
    const tx = await contract.createAccount(name, isPirate, location);
    await tx.wait();
  }, [contract]);

  return { createAccount };
}
```

### Type Guards
```typescript
import { PlayerAccount } from '../lib/contracts';

function isShipWrecked(account: PlayerAccount): boolean {
  return account.hp === 0n;
}

function canTravel(account: PlayerAccount): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return account.hp > 0n && account.travelEnd <= now;
}
```

## 🔄 **Regenerating Types**

Types are automatically regenerated when you compile contracts:

```bash
# After modifying contracts
npm run compile  # Regenerates types automatically

# Force regeneration
rm -rf types/ && npm run generate-types
```

## 📚 **References**

- [TypeChain Documentation](https://github.com/dethcrypto/TypeChain)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [Hardhat TypeScript Support](https://hardhat.org/guides/typescript.html)

---

## 🎮 **Game-Specific Types**

### Game Constants
```typescript
export const GAME_CONSTANTS = {
  BASE_REPAIR_TIME: 5 * 3600, // 5 hours
  PORT_REPAIR_TIME: 1 * 3600, // 1 hour  
  PORTS: [25, 55, 89] as const,
  MAX_LOCATION: 100,
  MIN_LOCATION: 0,
  DIAMOND_PACKAGES: [
    { xtz: 10, diamonds: 1 },
    { xtz: 45, diamonds: 5 },
    { xtz: 90, diamonds: 10 },
  ] as const,
} as const;
```

### Helper Functions
```typescript
// Calculate ship level
function calculateShipLevel(account: PlayerAccount): number {
  return Number(account.speed + account.attack + account.defense);
}

// Calculate travel time
function calculateTravelTime(from: number, to: number, speed: number): number {
  const distance = Math.abs(to - from);
  const baseTime = distance * 3600;
  const discount = speed * 5 * 60 * distance;
  return Math.max(0, baseTime - discount);
}

// Calculate check-in reward
function calculateCheckInReward(crew: number, streak: number): number {
  return crew * 25 + 5 * streak;
}
```

These types provide complete type safety and IntelliSense support for your SeasOfLinkardia frontend! 🚢⚓ 