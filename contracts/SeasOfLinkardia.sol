// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @title SeasOfLinkardia
/// @author Bruno Formagio
/// @notice Game about sea piracy
contract SeasOfLinkardia {
    address public immutable admin;

    uint256 public constant DAY = 86400;
    uint256 public constant HOUR = 3600;
    uint256 public constant REPAIR_TIME = 5 * HOUR;

    struct Account {
        string boatName;
        uint256 gold;
        uint256 diamonds;
        uint256 hp;
        uint256 speed;
        uint256 attack;
        uint256 defense;
        uint256 crew;
        uint256 maxCrew;
        uint256 location;
        uint256 gpm;
        uint256 lastPillage;
        uint256 lastWrecked;
        bool traveling;
        uint256 travelArrive;
    }

    enum BonusType { GPM, HP, SPEED, ATTACK, DEFENSE, MAXCREW, CREW }

    struct Upgrade {
        string name;
        uint256 cost;
        uint256 bonus;
        BonusType bonusType;
        bool exists;
    }

    mapping(address => Account) public accounts;
    mapping(uint256 => Upgrade) public upgrades;
    uint256 public upgradesCount;

    address[] public players;           // lista para ranking
    mapping(address => bool) public isPlayer;

    event AccountCreated(address indexed player, string name, uint256 startLoc);
    event UpgradeAdded(uint256 indexed id, string name, uint256 cost, BonusType);
    event UpgradeBought(address indexed player, uint256 indexed upgradeId);
    event Pillaged(address indexed player, uint256 gold);
    event BattleResult(address indexed attacker, address indexed defender,
        bool attackerWon, uint256 goldStolen);
    event TravelStart(address indexed player, uint256 from, uint256 to, uint256 arriveAt);
    event TravelArrived(address indexed player, uint256 location);
    event RepairUsed(address indexed player);
    event DiamondsBought(address indexed player, uint256 amount);
    event FundsWithdrawn(address indexed admin, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyExisting() {
        require(bytes(accounts[msg.sender].boatName).length != 0, "Account not exists");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// Cria conta de jogador
    function createAccount(string calldata boatName, uint256 startLocation) external {
        require(bytes(boatName).length > 0 && bytes(boatName).length <= 12, "Invalid Name");
        require(!isPlayer[msg.sender], "Already Registered");
        accounts[msg.sender] = Account({
            boatName: boatName,
            gold: 100,
            diamonds: 0,
            hp: 100,
            speed: 1,
            attack: 1,
            defense: 1,
            crew: 1,
            maxCrew: 10,
            location: startLocation,
            gpm: 0,
            lastPillage: 0,
            lastWrecked: 0,
            traveling: false,
            travelArrive: 0
        });
        players.push(msg.sender);
        isPlayer[msg.sender] = true;
        emit AccountCreated(msg.sender, boatName, startLocation);
    }

    /// Admin insere upgrade
    function addUpgrade(
        string calldata name,
        uint256 cost,
        uint256 bonus,
        BonusType bonusType
    ) external onlyAdmin {
        upgrades[upgradesCount] = Upgrade(name, cost, bonus, bonusType, true);
        emit UpgradeAdded(upgradesCount, name, cost, bonusType);
        upgradesCount++;
    }

    /// Compra upgrade
    function buyUpgrade(uint256 upgradeId) external onlyExisting {
        Upgrade storage upg = upgrades[upgradeId];
        require(upg.exists, "Invalid Upgrade");
        Account storage acc = accounts[msg.sender];
        require(acc.gold >= upg.cost, "Not enough gold");
        acc.gold -= upg.cost;

        if (upg.bonusType == BonusType.GPM) acc.gpm += upg.bonus;
        else if (upg.bonusType == BonusType.HP) acc.hp += upg.bonus;
        else if (upg.bonusType == BonusType.SPEED) acc.speed += upg.bonus;
        else if (upg.bonusType == BonusType.ATTACK) acc.attack += upg.bonus;
        else if (upg.bonusType == BonusType.DEFENSE) acc.defense += upg.bonus;
        else if (upg.bonusType == BonusType.MAXCREW) acc.maxCrew += upg.bonus;
        else if (upg.bonusType == BonusType.CREW) {
            acc.crew = acc.crew + upg.bonus > acc.maxCrew ? acc.maxCrew : acc.crew + upg.bonus;
        }

        emit UpgradeBought(msg.sender, upgradeId);
    }

    /// Pilhagem diária
    function pillage() external onlyExisting {
        Account storage acc = accounts[msg.sender];
        require(block.timestamp / DAY > acc.lastPillage / DAY, "already pillaged today");
        uint256 reward = acc.crew * 25 + acc.gpm * ((block.timestamp - acc.lastPillage) / 60);
        acc.gold += reward;
        acc.lastPillage = block.timestamp;
        emit Pillaged(msg.sender, reward);
    }

    /// Batalha contra outro jogador
    function attack(address target) external onlyExisting {
        require(isPlayer[target], "target not registered");

        Account storage atk = accounts[msg.sender];
        Account storage def = accounts[target];
        require(atk.location == def.location, "Locations diferentes");
        require(!atk.traveling && !def.traveling, "Em viagem");
        require(atk.hp > 0 && def.hp > 0, "HP zero");

        uint256 dmgToDef = atk.attack > def.defense ? atk.attack - def.defense : 0;
        uint256 dmgToAtk = def.attack > atk.defense ? def.attack - atk.defense : 0;

        if (dmgToDef >= def.hp) {
            def.hp = 0; def.crew = 0; def.lastWrecked = block.timestamp;
        } else def.hp -= dmgToDef;

        if (dmgToAtk >= atk.hp) {
            atk.hp = 0; atk.crew = 0; atk.lastWrecked = block.timestamp;
        } else atk.hp -= dmgToAtk;

        bool atkWon = def.hp == 0 && atk.hp > 0;
        uint256 loot = 0;
        if (atkWon) {
            loot = atk.crew * 50;
            if (def.gold >= loot) {
                def.gold -= loot;
                atk.gold += loot;
            }
        }

        emit BattleResult(msg.sender, target, atkWon, loot);
    }

    /// Inicia viagem
    function travel(uint256 destination) external onlyExisting {
        Account storage acc = accounts[msg.sender];
        require(!acc.traveling, "already travelling");
        require(acc.hp > 0, "HP zero");
        require(destination != acc.location, "same place");

        uint256 dist = destination > acc.location ? destination - acc.location : acc.location - destination;
        uint256 required = dist * HOUR;
        uint256 discount = acc.speed * 300;
        uint256 finalTime = required > discount ? required - discount : 0;

        acc.traveling = true;
        acc.travelArrive = block.timestamp + finalTime;
        emit TravelStart(msg.sender, acc.location, destination, acc.travelArrive);
    }

    /// Check-in chegada
    function finishTravel() external onlyExisting {
        Account storage acc = accounts[msg.sender];
        require(acc.traveling, "not travelling");
        require(block.timestamp >= acc.travelArrive, "still travelling");
        acc.location = acc.location; // recalculação segura
        acc.traveling = false;
        emit TravelArrived(msg.sender, acc.location);
    }

    /// Reparo com tempo ou diamante
    function repair() external onlyExisting {
        Account storage acc = accounts[msg.sender];
        require(acc.hp == 0, "active ship");
        require(block.timestamp >= acc.lastWrecked + REPAIR_TIME, "awaiting cooldown");
        _doRepair(acc);
    }
    function repairWithDiamond() external onlyExisting {
        Account storage acc = accounts[msg.sender];
        require(acc.hp == 0, "active ship");
        require(acc.diamonds >= 1, "Not enought diamonds");
        acc.diamonds--;
        _doRepair(acc);
    }
    function _doRepair(Account storage acc) internal {
        acc.hp = 100;
        acc.crew = 1;
        emit RepairUsed(msg.sender);
    }

    /// Compra de pacotes de diamantes
    function buyDiamonds(uint8 pkg) external payable onlyExisting {
        require(pkg >= 1 && pkg <= 3, "invalid package");
        uint256 xtz = msg.value;
        uint256 amount;
        if (pkg == 1) { require(xtz == 10 ether); amount = 1; }
        else if (pkg == 2) { require(xtz == 45 ether); amount = 5; }
        else { require(xtz == 90 ether); amount = 10; }

        Account storage acc = accounts[msg.sender];
        acc.diamonds += amount;
        _distributeFunds(xtz);

        emit DiamondsBought(msg.sender, amount);
    }

    /// Redistribui XTZ para ranking top 3 e contrato
    function _distributeFunds(uint256 xtz) internal {
        (address t1, address t2, address t3) = _getTop3();
        uint256 v1 = (xtz * 40) / 100;
        uint256 v2 = (xtz * 20) / 100;
        uint256 v3 = (xtz * 10) / 100;
        if (t1 != address(0) && v1 > 0) payable(t1).transfer(v1);
        if (t2 != address(0) && v2 > 0) payable(t2).transfer(v2);
        if (t3 != address(0) && v3 > 0) payable(t3).transfer(v3);
        // 30% ficam no contrato
    }

    /// Lê top 3 por soma (attack+defense+speed)
    function _getTop3() internal view returns(address t1, address t2, address t3) {
        uint256 s1; uint256 s2; uint256 s3;
        for (uint i = 0; i < players.length; i++) {
            Account storage a = accounts[players[i]];
            uint256 score = a.attack + a.defense + a.speed;
            if (score > s1) {
                s3 = s2; t3 = t2;
                s2 = s1; t2 = t1;
                s1 = score; t1 = players[i];
            } else if (score > s2) {
                s3 = s2; t3 = t2;
                s2 = score; t2 = players[i];
            } else if (score > s3) {
                s3 = score; t3 = players[i];
            }
        }
    }

    /// Ranking público
    function getRanking() external view returns(address[] memory sorted, uint256[] memory scores) {
        sorted = players;
        scores = new uint256[](players.length);
        // bubble sort
        for (uint i = 0; i < sorted.length; i++) {
            scores[i] = _getScore(sorted[i]);
        }
        for (uint i = 0; i < sorted.length; i++) {
            for (uint j = i + 1; j < sorted.length; j++) {
                if (scores[j] > scores[i]) {
                    (scores[i], scores[j]) = (scores[j], scores[i]);
                    (sorted[i], sorted[j]) = (sorted[j], sorted[i]);
                }
            }
        }
    }

    function _getScore(address player) internal view returns(uint256) {
        Account storage a = accounts[player];
        return a.attack + a.defense + a.speed;
    }

    /// Admin retira fundos
    function withdraw() external onlyAdmin {
        uint256 bal = address(this).balance;
        payable(admin).transfer(bal);
        emit FundsWithdrawn(admin, bal);
    }

    receive() external payable {}
}