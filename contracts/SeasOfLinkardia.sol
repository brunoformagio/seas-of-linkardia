// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SeasOfLinkardia is Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {}

    struct Account {
        string boatName;
        bool isPirate; // true = piracy, false = navy
        uint256 gold;
        uint256 diamonds;
        uint256 hp;
        uint256 maxHp;
        uint256 speed;
        uint256 attack;
        uint256 defense;
        uint256 crew;
        uint256 maxCrew;
        uint256 location;
        uint256 gpm;
        uint256 lastCheckIn;
        uint256 checkInStreak;
        uint256 lastWrecked;
        uint256 travelEnd; // timestamp when travel ends
        uint256 lastGPMClaim; // timestamp when GPM was last claimed
        uint256 repairEnd; // timestamp when repair completes
    }

    struct Upgrade {
        string name;
        uint256 cost;
        uint256 gpmBonus;
        uint256 maxHpBonus;
        uint256 speedBonus;
        uint256 attackBonus;
        uint256 defenseBonus;
        uint256 maxCrewBonus;
    }

    mapping(address => Account) public accounts;
    mapping(uint256 => Upgrade) public upgrades;
    mapping(address => mapping(uint256 => uint256)) public purchaseCounts;
    uint256 public nextUpgradeId;

    address[] public players;

    uint256 constant BASE_REPAIR_TIME = 5 hours;
    uint256 constant PORT_REPAIR_TIME = 1 hours;

    uint256 constant PORT25 = 25;
    uint256 constant PORT55 = 55;
    uint256 constant PORT89 = 89;

    event AccountCreated(address indexed user, string boatName, bool isPirate);
    event UpgradeAdded(uint256 indexed id, string name);
    event UpgradePurchased(address indexed user, uint256 indexed id);
    event CheckIn(address indexed user, uint256 streak, uint256 reward);
    event ShipAttacked(address indexed attacker, address indexed defender, bool destroyed);
    event TravelStarted(address indexed user, uint256 toLocation, uint256 arriveAt, bool fast);
    event GPMClaimed(address indexed user, uint256 amount, uint256 timeElapsed);
    event CrewHired(address indexed user, uint256 crewHired, uint256 cost);
    event ShipRepaired(address indexed user, uint256 repairType, uint256 cost, uint256 waitTime);
    
    // Repair types: 0 = free, 1 = gold, 2 = diamond
    enum RepairType { FREE, GOLD, DIAMOND }

    // Helper function to check if location is a port
    function isPort(uint256 location) public pure returns (bool) {
        return location == PORT25 || location == PORT55 || location == PORT89;
    }

    // Helper function to find nearest port
    function _getNearestPort(uint256 currentLocation) internal pure returns (uint256) {
        uint256 distanceToPort25 = currentLocation > PORT25 ? currentLocation - PORT25 : PORT25 - currentLocation;
        uint256 distanceToPort55 = currentLocation > PORT55 ? currentLocation - PORT55 : PORT55 - currentLocation;
        uint256 distanceToPort89 = currentLocation > PORT89 ? currentLocation - PORT89 : PORT89 - currentLocation;
        
        if (distanceToPort25 <= distanceToPort55 && distanceToPort25 <= distanceToPort89) {
            return PORT25;
        } else if (distanceToPort55 <= distanceToPort89) {
            return PORT55;
        } else {
            return PORT89;
        }
    }

    // Criação de conta
    function createAccount(string calldata _boatName, bool _isPirate, uint256 _startLocation) external {
        require(bytes(_boatName).length > 0 && bytes(_boatName).length <= 12, "Boat name invalid length");
        require(_startLocation <= 100, "Location must be 0-100");
        require(accounts[msg.sender].hp == 0 && accounts[msg.sender].crew == 0, "Already has account");
        accounts[msg.sender] = Account({
            boatName: _boatName,
            isPirate: _isPirate,
            gold: 100,
            diamonds: 0,
            hp: 100,
            maxHp: 100,
            speed: 1,
            attack: 1,
            defense: 1,
            crew: 1,
            maxCrew: 10,
            location: _startLocation,
            gpm: 0,
            lastCheckIn: 0,
            checkInStreak: 0,
            lastWrecked: 0,
            travelEnd: 0,
            lastGPMClaim: block.timestamp,
            repairEnd: 0
        });
        players.push(msg.sender);
        emit AccountCreated(msg.sender, _boatName, _isPirate);
    }

    // Adicionar melhorias (admin)
    function addUpgrade(
        string calldata name,
        uint256 cost,
        uint256 gpmBonus,
        uint256 maxHpBonus,
        uint256 speedBonus,
        uint256 attackBonus,
        uint256 defenseBonus,
        uint256 maxCrewBonus
    ) external onlyOwner {
        upgrades[nextUpgradeId] = Upgrade(name, cost, gpmBonus, maxHpBonus, speedBonus, attackBonus, defenseBonus, maxCrewBonus);
        emit UpgradeAdded(nextUpgradeId, name);
        nextUpgradeId++;
    }

    // Comprar melhoria
    function buyUpgrade(uint256 id) external nonReentrant {
        Upgrade storage u = upgrades[id];
        Account storage a = accounts[msg.sender];
        require(u.cost > 0, "Upgrade not exist");
        
        // Auto-claim any pending GPM before spending gold
        _autoClaimGPM(msg.sender);
        
        // Calculate exponential cost: baseCost * (1.5 ^ purchaseCount)
        uint256 purchaseCount = purchaseCounts[msg.sender][id];
        uint256 actualCost = _calculateUpgradeCost(u.cost, purchaseCount);
        
        require(a.gold >= actualCost, "Not enough gold");
        a.gold -= actualCost;

        // Increment purchase count
        purchaseCounts[msg.sender][id]++;

        a.gpm += u.gpmBonus;
        a.maxHp += u.maxHpBonus;
        a.hp += u.maxHpBonus; // Also increase current HP when maxHp increases
        a.speed += u.speedBonus;
        a.attack += u.attackBonus;
        a.defense += u.defenseBonus;
        a.maxCrew += u.maxCrewBonus;
        if (a.crew > a.maxCrew) {
            a.crew = a.maxCrew;
        }
        emit UpgradePurchased(msg.sender, id);
    }

    // NEW: Hire crew function (only at ports)
    function hireCrew() external nonReentrant {
        Account storage a = accounts[msg.sender];
        require(a.hp > 0, "Ship wrecked");
        require(isPort(a.location), "Must be at a port");
        require(a.crew < a.maxCrew, "Crew already at maximum");
        
        // Auto-claim any pending GPM before spending gold
        _autoClaimGPM(msg.sender);
        
        // Calculate how many crew members can be hired
        uint256 crewNeeded = a.maxCrew - a.crew;
        uint256 costPerCrew = 10; // 10 gold per crew member
        uint256 totalCost = crewNeeded * costPerCrew;
        
        require(a.gold >= totalCost, "Not enough gold");
        
        // Hire all missing crew
        a.gold -= totalCost;
        a.crew = a.maxCrew;
        
        emit CrewHired(msg.sender, crewNeeded, totalCost);
    }

    // Check-in diário
    function checkIn() external {
        Account storage a = accounts[msg.sender];
        require(a.hp > 0, "Ship wrecked");
        uint256 today = block.timestamp / 1 days;
        require(a.lastCheckIn / 1 days < today, "Already checked in today");

        if (a.lastCheckIn / 1 days == today - 1) {
            a.checkInStreak += 1;
        } else {
            a.checkInStreak = 1;
        }
        a.lastCheckIn = block.timestamp;
        uint256 reward = a.crew * 25 + 5 * a.checkInStreak;
        a.gold += reward;
        emit CheckIn(msg.sender, a.checkInStreak, reward);
    }

    // GPM System - Claim accumulated gold per minute
    function claimGPM() external nonReentrant {
        Account storage a = accounts[msg.sender];
        require(a.hp > 0, "Ship wrecked");
        require(a.gpm > 0, "No GPM to claim");
        
        uint256 timeElapsed = block.timestamp - a.lastGPMClaim;
        require(timeElapsed > 0, "No time elapsed");
        
        // Calculate claimable gold: GPM * minutes elapsed
        uint256 minutesElapsed = timeElapsed / 60;
        uint256 claimableGold = a.gpm * minutesElapsed;
        
        require(claimableGold > 0, "No gold to claim");
        
        // Update last claim timestamp to current time
        a.lastGPMClaim = block.timestamp;
        
        // Award the gold
        a.gold += claimableGold;
        
        emit GPMClaimed(msg.sender, claimableGold, timeElapsed);
    }

    // View function to check how much gold can be claimed from GPM
    function getClaimableGold(address player) external view returns (uint256) {
        Account storage a = accounts[player];
        
        if (a.hp == 0 || a.gpm == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - a.lastGPMClaim;
        uint256 minutesElapsed = timeElapsed / 60;
        
        return a.gpm * minutesElapsed;
    }

    // View function to get time until next GPM can be claimed (in seconds)
    function getTimeUntilNextGPM(address player) external view returns (uint256) {
        Account storage a = accounts[player];
        
        if (a.hp == 0 || a.gpm == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - a.lastGPMClaim;
        uint256 secondsUntilNextMinute = 60 - (timeElapsed % 60);
        
        return secondsUntilNextMinute;
    }

    // NEW: Get hire crew cost for a player
    function getHireCrewCost(address player) external view returns (uint256) {
        Account storage a = accounts[player];
        
        if (a.hp == 0 || a.crew >= a.maxCrew) {
            return 0;
        }
        
        uint256 crewNeeded = a.maxCrew - a.crew;
        return crewNeeded * 10; // 10 gold per crew member
    }

    // Ataque - MODIFIED: No attacks at ports (safe areas)
    function attack(address defender) external nonReentrant {
        Account storage atk = accounts[msg.sender];
        Account storage def = accounts[defender];

        require(atk.hp > 0 && def.hp > 0, "One ship is wrecked");
        require(atk.isPirate != def.isPirate, "Same affiliation");
        require(atk.location == def.location, "Must be same location");
        require(block.timestamp >= atk.travelEnd && block.timestamp >= def.travelEnd, "In travel");
        
        // NEW: Ports are safe areas - no attacks allowed
        require(!isPort(atk.location), "Cannot attack at ports - safe area");

        uint256 damageToDef = atk.attack > def.defense ? atk.attack - def.defense : 0;
        uint256 damageToAtk = def.attack > atk.defense ? def.attack - atk.defense : 0;

        // aplicar dano
        if (damageToDef >= def.hp) {
            def.hp = 0;
        } else {
            def.hp -= damageToDef;
        }
        if (damageToAtk >= atk.hp) {
            atk.hp = 0;
        } else {
            atk.hp -= damageToAtk;
        }

        bool destroyed = false;
        if (def.hp == 0) {
            def.crew = 1; // NEW: Keep 1 crew member instead of 0
            def.lastWrecked = block.timestamp;
            def.location = _getNearestPort(def.location); // NEW: Teleport to nearest port
            uint256 steal = atk.crew * 50;
            if (steal > def.gold) steal = def.gold;
            def.gold -= steal;
            atk.gold += steal;
            destroyed = true;
        }
        if (atk.hp == 0) {
            atk.crew = 1; // NEW: Keep 1 crew member instead of 0
            atk.lastWrecked = block.timestamp;
            atk.location = _getNearestPort(atk.location); // NEW: Teleport to nearest port
        }

        emit ShipAttacked(msg.sender, defender, destroyed);
    }

    // Viagem
    function travel(uint256 toLocation, bool fast) external payable nonReentrant {
        Account storage a = accounts[msg.sender];
        require(a.hp > 0, "Ship wrecked");
        require(block.timestamp >= a.travelEnd, "Already traveling");
        require(toLocation <= 100, "Location invalid");
        require(toLocation != a.location, "Same location");

        uint256 distance = toLocation > a.location ? toLocation - a.location : a.location - toLocation;
        uint256 time = distance * 1 hours;
        uint256 discount = a.speed * 5 minutes * distance;
        if (discount >= time) {
            time = 0;
        } else {
            time -= discount;
        }

        uint256 expectedDiamonds = 0;
        if (fast) {
            expectedDiamonds = time / 1 hours;
            require(msg.value == 0, "Pay via diamond");
            require(a.diamonds >= expectedDiamonds, "Not enough diamonds");
            a.diamonds -= expectedDiamonds;
        } else {
            require(msg.value == 0, "Don't send XTZ");
        }

        a.travelEnd = block.timestamp + time;
        a.location = toLocation;
        emit TravelStarted(msg.sender, toLocation, a.travelEnd, fast);
    }

    // Mapa
    function getShipsAt(uint256 loc) external view returns (address[] memory, string[] memory, uint256[] memory) {
        uint256 count;
        for (uint i = 0; i < players.length; i++) {
            if (accounts[players[i]].location == loc && block.timestamp >= accounts[players[i]].travelEnd) {
                count++;
            }
        }
        address[] memory addrs = new address[](count);
        string[] memory names = new string[](count);
        uint256[] memory levels = new uint256[](count);
        uint idx;
        for (uint i = 0; i < players.length; i++) {
            if (accounts[players[i]].location == loc && block.timestamp >= accounts[players[i]].travelEnd) {
                addrs[idx] = players[i];
                names[idx] = accounts[players[i]].boatName;
                levels[idx] = accounts[players[i]].speed + accounts[players[i]].attack + accounts[players[i]].defense;
                idx++;
            }
        }
        return (addrs, names, levels);
    }

    // NEW: Get repair options for a player
    function getRepairOptions(address player) external view returns (uint256[3] memory costs, uint256[3] memory waitTimes) {
        Account storage a = accounts[player];
        
        if (a.hp > 0) {
            return ([uint256(0), uint256(0), uint256(0)], [uint256(0), uint256(0), uint256(0)]);
        }
        
        // Calculate wait times based on maxHp (per 25 maxHp)
        uint256 baseTimeUnits = (a.maxHp + 24) / 25; // Round up
        
        // Free repair: 30 minutes per 25 maxHp
        waitTimes[0] = baseTimeUnits * 30 minutes;
        
        // Gold repair: 5 minutes per 25 maxHp  
        waitTimes[1] = baseTimeUnits * 5 minutes;
        
        // Diamond repair: instant
        waitTimes[2] = 0;
        
        // Costs
        costs[0] = 0; // Free
        costs[1] = a.maxHp * 20; // 20 gold per maxHp
        costs[2] = 1; // 1 diamond
        
        return (costs, waitTimes);
    }

    // NEW: Repair ship with chosen option
    function repairShip(RepairType repairType) external nonReentrant {
        Account storage a = accounts[msg.sender];
        require(a.hp == 0, "Ship not wrecked");
        require(block.timestamp >= a.repairEnd, "Repair in progress");
        require(isPort(a.location), "Must be at port");

        uint256 cost = 0;
        uint256 waitTime = 0;
        
        (uint256[3] memory costs, uint256[3] memory waitTimes) = this.getRepairOptions(msg.sender);
        
        if (repairType == RepairType.FREE) {
            // Free repair: 30 minutes per 25 maxHp, 50% crew recovery
            waitTime = waitTimes[0];
            a.repairEnd = block.timestamp + waitTime;
            // Crew recovery will happen when repair completes
            
        } else if (repairType == RepairType.GOLD) {
            // Gold repair: 5 minutes per 25 maxHp, full crew recovery
            cost = costs[1];
            waitTime = waitTimes[1];
            
            _autoClaimGPM(msg.sender);
            require(a.gold >= cost, "Not enough gold");
            a.gold -= cost;
            a.repairEnd = block.timestamp + waitTime;
            
        } else if (repairType == RepairType.DIAMOND) {
            // Diamond repair: instant, full crew recovery
            cost = costs[2];
            require(a.diamonds >= cost, "Not enough diamonds");
            a.diamonds -= cost;
            a.repairEnd = block.timestamp; // Instant
        }

        emit ShipRepaired(msg.sender, uint256(repairType), cost, waitTime);
    }

    // NEW: Complete repair (call when repair time is up)
    function completeRepair() external nonReentrant {
        Account storage a = accounts[msg.sender];
        require(a.hp == 0, "Ship not wrecked");
        require(block.timestamp >= a.repairEnd, "Repair not ready");
        require(a.repairEnd > 0, "No repair in progress");

        // Restore HP
        a.hp = a.maxHp;
        a.lastWrecked = 0;
        
        // Determine crew recovery based on repair type used
        // We need to check the last repair type from the repair timing
        uint256 timeTaken = a.repairEnd - a.lastWrecked;
        
        if (timeTaken == 0) {
            // Diamond repair - full crew recovery
            a.crew = a.maxCrew;
        } else {
            // Calculate expected time for free repair
            uint256 baseTimeUnits = (a.maxHp + 24) / 25;
            uint256 freeRepairTime = baseTimeUnits * 30 minutes;
            
            if (timeTaken >= freeRepairTime - 1 minutes) {
                // Free repair - 50% crew recovery
                a.crew = (a.maxCrew + 1) / 2; // Round up
                if (a.crew < 1) a.crew = 1; // Minimum 1 crew
            } else {
                // Gold repair - full crew recovery
                a.crew = a.maxCrew;
            }
        }
        
        a.repairEnd = 0; // Reset repair timer
    }

    // NEW: Check if repair is ready to complete
    function isRepairReady(address player) external view returns (bool) {
        Account storage a = accounts[player];
        return a.hp == 0 && a.repairEnd > 0 && block.timestamp >= a.repairEnd;
    }

    // Comprar diamantes
    receive() external payable nonReentrant {
        uint256 count;
        if (msg.value == 10 ether) count = 1;
        else if (msg.value == 45 ether) count = 5;
        else if (msg.value == 90 ether) count = 10;
        else revert("Invalid diamond package");

        accounts[msg.sender].diamonds += count;

        // distribuir XTZ
        address top1 = _getTop(0);
        address top2 = _getTop(1);
        address top3 = _getTop(2);

        payable(top1).transfer(4 ether);
        payable(top2).transfer(2 ether);
        payable(top3).transfer(1 ether);
        // o restante 3 XTZ fica no contrato
    }

    // Ranking
    function getRanking(uint256 n) public view returns (address[] memory, uint256[] memory) {
        uint256 len = players.length < n ? players.length : n;
        // simples sort bubble até n
        address[] memory leaders = new address[](len);
        uint256[] memory scores = new uint256[](len);
        for (uint i; i < players.length; ++i) {
            uint256 lvl = accounts[players[i]].speed + accounts[players[i]].attack + accounts[players[i]].defense;
            for (uint j; j < len; ++j) {
                if (lvl > scores[j]) {
                    for (uint k = len - 1; k > j; --k) {
                        leaders[k] = leaders[k-1];
                        scores[k] = scores[k-1];
                    }
                    leaders[j] = players[i];
                    scores[j] = lvl;
                    break;
                }
            }
        }
        return (leaders, scores);
    }

    // Admin resgata XTZ
    function rescueXTZ() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Get the current cost for an upgrade for a specific player
    function getUpgradeCost(uint256 id, address player) public view returns (uint256) {
        Upgrade storage u = upgrades[id];
        require(u.cost > 0, "Upgrade not exist");
        uint256 purchaseCount = purchaseCounts[player][id];
        return _calculateUpgradeCost(u.cost, purchaseCount);
    }

    // Internal function to auto-claim GPM before spending gold
    function _autoClaimGPM(address player) internal {
        Account storage a = accounts[player];
        
        // Only auto-claim if player has GPM and ship is not wrecked
        if (a.hp == 0 || a.gpm == 0) {
            return;
        }
        
        uint256 timeElapsed = block.timestamp - a.lastGPMClaim;
        if (timeElapsed == 0) {
            return;
        }
        
        // Calculate claimable gold: GPM * minutes elapsed
        uint256 minutesElapsed = timeElapsed / 60;
        uint256 claimableGold = a.gpm * minutesElapsed;
        
        if (claimableGold > 0) {
            // Update last claim timestamp to current time
            a.lastGPMClaim = block.timestamp;
            
            // Award the gold
            a.gold += claimableGold;
            
            emit GPMClaimed(player, claimableGold, timeElapsed);
        }
    }

    // Calculate exponential cost: baseCost * (1.5 ^ purchaseCount)
    // Using fixed-point arithmetic to handle decimals: 1.5 = 15/10
    function _calculateUpgradeCost(uint256 baseCost, uint256 purchaseCount) internal pure returns (uint256) {
        if (purchaseCount == 0) {
            return baseCost;
        }
        
        // Calculate 1.5^purchaseCount using fixed-point arithmetic
        // 1.5 = 15/10, so we calculate (15^purchaseCount) / (10^purchaseCount)
        uint256 numerator = baseCost;
        uint256 denominator = 1;
        
        for (uint256 i = 0; i < purchaseCount; i++) {
            numerator *= 15;
            denominator *= 10;
        }
        
        return numerator / denominator;
    }

    // helper para ranking interno
    function _getTop(uint idx) internal view returns (address) {
        (address[] memory l, ) = getRanking(idx+1);
        if (l.length > idx) return l[idx];
        return owner();
    }
}