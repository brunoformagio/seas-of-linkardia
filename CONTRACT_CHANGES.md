# Seas Of Linkardia Contract Changes

## Overview
This document outlines the major changes made to the SeasOfLinkardia smart contract based on the requested improvements to the crew and repair systems.

## Changes Made

### 1. **Fixed Crew Hiring System**
- **Removed**: "Hire Crew" from modular upgrades system
- **Added**: Fixed `hireCrew()` function that works only at ports
- **Mechanics**:
  - Only available at ports (locations 25, 55, 89)
  - Costs 10 gold per crew member to hire
  - Instantly fills crew to maximum capacity
  - Requires ship to not be wrecked

**New Functions:**
```solidity
function hireCrew() external nonReentrant
function getHireCrewCost(address player) external view returns (uint256)
```

### 2. **Dynamic Repair Costs**
- **Changed**: Fixed repair cost from 1000 gold to dynamic pricing
- **New Formula**: 5 gold per 10 maxHp (rounded up)
- **Examples**:
  - 100 maxHp = 50 gold
  - 110 maxHp = 55 gold
  - 200 maxHp = 100 gold

**Updated Functions:**
```solidity
function getRepairCost(address player) external view returns (uint256)
function repairShip(bool atPort, bool useDiamond) external payable // Now uses dynamic cost
```

### 3. **Safe Port Areas**
- **Added**: Ports are now safe zones where combat is prohibited
- **Affected Locations**: 25, 55, 89
- **Impact**: Players cannot attack each other at ports

**New Helper Function:**
```solidity
function isPort(uint256 location) public pure returns (bool)
```

### 4. **Enhanced Events**
- **Added**: `CrewHired` event for crew hiring tracking
- **Added**: `ShipRepaired` event for repair tracking

```solidity
event CrewHired(address indexed user, uint256 crewHired, uint256 cost);
event ShipRepaired(address indexed user, uint256 cost, bool atPort);
```

## Updated Game Mechanics

### **Crew System**
1. **Crew Capacity**: Increased through "Crew Quarters" upgrades (renamed from "Hire Crew")
2. **Crew Hiring**: Fixed 10 gold per crew member at ports only
3. **Daily Income**: Each crew member generates 25 gold per day via check-ins
4. **Combat Impact**: Crew affects gold stealing potential (crew * 50 gold per victory)

### **Repair System**
1. **Cost Scaling**: Repair cost now scales with ship's maximum HP
2. **Port Benefits**: Same repair cost but at safe locations
3. **Diamond Option**: Still available for instant repair without gold cost

### **Port Strategy**
1. **Safe Havens**: No combat allowed at ports
2. **Crew Management**: Only place to hire crew
3. **Strategic Value**: Important for ship maintenance and crew recruitment

## Contract Deployment

**New Contract Address (Testnet)**: `0x47d2Fa420A381079bCe9A3D3830b8ADC58966106`

### Initial Upgrades Available:
1. **Hull Reinforcement** - 50 gold: +10 maxHp, +1 GPM
2. **Crew Quarters** - 100 gold: +1 maxCrew, +1 GPM  
3. **Crew Training** - 100 gold: +1 defense, +1 GPM
4. **Cannon Upgrade** - 100 gold: +1 attack, +1 GPM
5. **Deck Upgrade** - 250 gold: +5 maxCrew, +1 GPM
6. **Sails Upgrade** - 500 gold: +1 speed, +1 GPM

## Frontend Integration

### New UI Components Added:
1. **Crew Hiring Button**: Shows at ports when crew is needed
2. **Dynamic Repair Costs**: Displays actual repair cost based on maxHp
3. **Port Indicators**: Visual indicators for safe port areas
4. **Crew Status**: Shows current/max crew with hiring costs

### Updated Game Flow:
1. Players must visit ports to hire crew
2. Repair costs are now transparent and scale with ship power
3. Ports provide strategic safe zones for planning and maintenance
4. Crew management becomes a key economic decision

## Benefits of Changes

1. **Strategic Depth**: Ports become important strategic locations
2. **Economic Balance**: Repair costs scale with ship power level
3. **Simplified Crew Management**: Clear, fixed-cost crew hiring system
4. **Safe Zones**: Provides respite areas for new/rebuilding players
5. **Transparent Costs**: Players can see exact costs before committing

These changes create a more balanced and strategic gameplay experience while maintaining the core maritime adventure theme. 