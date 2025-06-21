# Seas of Linkardia - Test Suite

This directory contains comprehensive tests for the Seas of Linkardia smart contract game. The test suite is organized into multiple files covering different aspects of the contract functionality.

## Test Files Overview

### 📊 Core Functionality Tests
- **`SeasOfLinkardia.test.js`** - Unit tests for all basic contract functions
- **`SeasOfLinkardia.integration.test.js`** - Complex scenarios and multi-system interactions
- **`SeasOfLinkardia.gas.test.js`** - Gas optimization and performance benchmarking

### 🛠️ Helper Files
- **`helpers/test-helpers.js`** - Utility functions for common test operations

## Test Categories

### 🚢 Core Game Mechanics
- **Account Creation** - Creating pirate/navy accounts with validation
- **Check-in System** - Daily rewards and streak management
- **Upgrade System** - Ship improvements and stat bonuses
- **Combat System** - Pirate vs Navy battles with damage calculation
- **Travel System** - Movement across the map with time mechanics
- **Repair System** - Ship restoration after being wrecked

### 💎 Economic Systems
- **Diamond Purchases** - Real money transactions with XTZ
- **Revenue Distribution** - Payments to top players
- **Gold Management** - In-game currency mechanics

### 🏆 Social Features
- **Ranking System** - Player leaderboards
- **Map Viewing** - Ships at locations
- **Fleet Management** - Multi-player interactions

## Running Tests

### Quick Commands
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit           # Basic functionality tests
npm run test:integration    # Complex scenario tests
npm run test:gas           # Gas optimization tests
npm run test:all           # All SeasOfLinkardia tests

# Generate coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Hardhat Commands
```bash
# Run specific test file
npx hardhat test test/SeasOfLinkardia.test.js

# Run with gas reporting
npx hardhat test --gas-report

# Run on specific network
npx hardhat test --network localhost

# Verbose output
npx hardhat test --verbose
```

## Test Structure

Each test file follows a consistent structure:

```javascript
describe("Contract Section", function () {
  beforeEach(async function () {
    // Setup contract and accounts
  });

  describe("Feature Group", function () {
    it("Should perform specific action", async function () {
      // Test implementation
    });
  });
});
```

## Key Test Scenarios

### 🎮 Player Journey Tests
- Complete player lifecycle from account creation to endgame
- Daily check-in streaks and reward accumulation
- Ship upgrades and combat progression
- Travel and exploration mechanics

### ⚔️ Combat Scenarios
- Pirate vs Navy faction warfare
- Ship destruction and repair cycles
- Gold stealing mechanics
- Travel restrictions during combat

### 💰 Economic Tests
- Diamond purchase packages (1, 5, 10 diamonds)
- XTZ distribution to top players
- Gold accumulation and spending
- Upgrade cost balancing

### 🗺️ Map and Travel
- Travel time calculations based on distance and speed
- Port-specific mechanics (faster repairs)
- Fast travel with diamonds
- Location-based ship discovery

## Gas Optimization

The gas tests monitor performance and ensure efficient contract execution:

- **Account Creation**: < 200k gas
- **Check-in**: < 100k gas  
- **Combat**: < 200k gas
- **Travel**: < 100k gas
- **Upgrades**: < 150k gas
- **Diamond Purchase**: < 400k gas (includes transfers)

## Helper Functions

The test helpers provide convenient utilities:

```javascript
// Account creation
await createPirateAccount(contract, signer, "ShipName", location);
await createNavyAccount(contract, signer, "ShipName", location);

// Combat simulation
const result = await simulateBattle(contract, pirate, navy, location);

// Time manipulation
await advanceTimeAndCheckIn(contract, signer, days);
await waitForTravel(contract, playerAddress);

// Economy
await giveDiamonds(contract, signer, amount);
const level = await getPlayerLevel(contract, playerAddress);
```

## Test Coverage Goals

The test suite aims for comprehensive coverage:

- ✅ **Function Coverage**: All public functions tested
- ✅ **Branch Coverage**: All conditional paths covered
- ✅ **Edge Cases**: Invalid inputs and boundary conditions
- ✅ **Error Handling**: All revert conditions tested
- ✅ **Integration**: Multi-function workflows tested
- ✅ **Gas Optimization**: Performance monitoring

## Development Workflow

### Adding New Tests

1. **Choose the appropriate test file**:
   - Unit tests → `SeasOfLinkardia.test.js`
   - Complex scenarios → `SeasOfLinkardia.integration.test.js`
   - Performance tests → `SeasOfLinkardia.gas.test.js`

2. **Use helper functions** from `test-helpers.js` when possible

3. **Follow naming conventions**:
   - Descriptive test names starting with "Should"
   - Group related tests in `describe` blocks
   - Use `beforeEach` for common setup

4. **Test both success and failure cases**:
   ```javascript
   it("Should succeed with valid input", async function () {
     // Test success path
   });

   it("Should revert with invalid input", async function () {
     await expect(contract.function()).to.be.revertedWith("Error message");
   });
   ```

### Best Practices

- **Arrange, Act, Assert** pattern for test structure
- **Isolated tests** that don't depend on each other
- **Clear expectations** with specific error messages
- **Gas monitoring** for performance-critical functions
- **Event verification** for important state changes

## Debugging Tests

### Common Issues

1. **Time-based tests failing**:
   ```javascript
   // Use time helpers for consistent results
   await time.increase(24 * 3600); // 24 hours
   ```

2. **Transaction revert without clear reason**:
   ```javascript
   // Add try-catch for better error messages
   try {
     await contract.function();
   } catch (error) {
     console.log("Detailed error:", error.reason);
   }
   ```

3. **Gas estimation issues**:
   ```javascript
   // Check account balances and contract state
   const balance = await contract.accounts(player.address);
   console.log("Player state:", balance);
   ```

### Debug Commands
```bash
# Run single test with full output
npx hardhat test test/SeasOfLinkardia.test.js --grep "specific test name"

# Run with console logging
npx hardhat test --logs

# Check contract compilation
npx hardhat compile
```

## Continuous Integration

The test suite is designed to run in CI/CD environments:

```bash
# CI test command
npm run test:all && npm run test:coverage
```

## Contributing

When adding new game features:

1. Add corresponding unit tests
2. Create integration scenarios if needed
3. Monitor gas usage impact
4. Update this README if new test patterns are introduced
5. Ensure all tests pass before submitting PRs

---

**Happy Testing!** 🧪⚓️

The seas await your code... make sure it's seaworthy! 🚢 