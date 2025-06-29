"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "./Button";
import { useGameContract } from "../libs/hooks/useGameContract";
import { usePlayer } from "../libs/providers/player-provider";
import { Icon } from "./Icons";

interface Upgrade {
  id: number;
  name: string;
  baseCost: number;
  actualCost: number;
  purchaseCount: number;
  gpmBonus: number;
  maxHpBonus: number;
  speedBonus: number;
  attackBonus: number;
  defenseBonus: number;
  maxCrewBonus: number;
}

const UpgradeItem = ({ 
  upgrade, 
  playerGold, 
  onPurchase, 
  isPurchasing 
}: { 
  upgrade: Upgrade; 
  playerGold: number; 
  onPurchase: (upgradeId: number) => Promise<void>;
  isPurchasing: boolean;
}) => {
  const canAfford = playerGold >= upgrade.actualCost;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!canAfford || isProcessing || isPurchasing) return;
    
    setIsProcessing(true);
    try {
      await onPurchase(upgrade.id);
    } catch (error) {
      console.error("Failed to purchase upgrade:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getBonusText = () => {
    const bonuses = [];
    if (upgrade.maxHpBonus > 0) bonuses.push(`+${upgrade.maxHpBonus} Max HP`);
    if (upgrade.speedBonus > 0) bonuses.push(`+${upgrade.speedBonus} Speed`);
    if (upgrade.attackBonus > 0) bonuses.push(`+${upgrade.attackBonus} Attack`);
    if (upgrade.defenseBonus > 0) bonuses.push(`+${upgrade.defenseBonus} Defense`);
    if (upgrade.gpmBonus > 0) bonuses.push(`+${upgrade.gpmBonus} GPM`);
    if (upgrade.maxCrewBonus > 0) bonuses.push(`+${upgrade.maxCrewBonus} Max Crew`);
    
    return bonuses.join(", ") || "No bonuses";
  };

    return (
    <div className="flex ui2 w-full gap-2 !brightness-120 p-4 items-center justify-between">
            <div className="flex items-center justify-center gap-2">
        <Image 
          unoptimized 
          src={`/upgrades/${upgrade.id}.webp`} // Cycle through available images
          alt={upgrade.name} 
          width={48} 
          height={48} 
        />
                 <div className="text-white !text-lg text-shadow-[0_2px_0px_#291414,0_1px_0px_#291414] flex flex-col items-start justify-center">
           <div className="flex items-center gap-2">
             <div className="text-white !text-lg font-bold">{upgrade.name}</div>
             {upgrade.purchaseCount > 0 && (
               <div className="bg-yellow-600 text-black !text-sm text-shadow-none px-2 py-1 flex items-center justify-center font-bold">
                 Lv.{upgrade.purchaseCount}
               </div>
             )}
           </div>
           <div className="text-white !text-sm opacity-90">{getBonusText()}</div>
            </div>
            </div>
            <div className="flex items-center justify-center gap-2">
        <Button 
          onClick={handlePurchase}
          disabled={!canAfford || isProcessing || isPurchasing}
          className={`${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-2">
            {isProcessing ? "Buying..." : <>{upgrade.actualCost} <Icon iconName="gold" className="w-4 h-4" /></>}
          </div>
        </Button>
            </div>
        </div>
  );
};

export const ShipUpgradesSection = () => {
  const gameContract = useGameContract();
  const { playerAccount, refreshPlayerData, setNotification, forceRefresh } = usePlayer();
  
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [realTimeGold, setRealTimeGold] = useState<number>(0);

  // Calculate real-time gold including accumulated GPM (per second for smooth experience)
  const calculateRealTimeGold = () => {
    if (!playerAccount || playerAccount.gpm === 0 || playerAccount.hp === 0) {
      return playerAccount?.gold || 0;
    }

    const now = Date.now() / 1000; // Current time in seconds
    const lastClaim = playerAccount.lastGPMClaim; // Last claim time in seconds
    const timeElapsed = now - lastClaim;
    
    // Calculate gold per second (GPM / 60) and multiply by seconds elapsed
    const goldPerSecond = playerAccount.gpm / 60;
    const accumulatedGold = goldPerSecond * timeElapsed;
    
    return playerAccount.gold + accumulatedGold;
  };

  // Update real-time gold periodically
  useEffect(() => {
    const updateRealTimeGold = () => {
      setRealTimeGold(calculateRealTimeGold());
    };

    // Initial update
    updateRealTimeGold();

    // Update every second if player has GPM and is alive for smooth experience
    if (playerAccount && playerAccount.gpm > 0 && playerAccount.hp > 0) {
      const interval = setInterval(updateRealTimeGold, 1000);
      return () => clearInterval(interval);
    }
  }, [playerAccount?.gold, playerAccount?.gpm, playerAccount?.lastGPMClaim, playerAccount?.hp]);

  // Fetch all available upgrades from the contract
  const fetchUpgrades = async () => {
    if (!gameContract.isReady || !("getNextUpgradeId" in gameContract)) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Get the next upgrade ID to know how many upgrades exist
      const nextUpgradeId = await gameContract.getNextUpgradeId();
      const totalUpgrades = Number(nextUpgradeId);
      
      if (totalUpgrades === 0) {
        setUpgrades([]);
        setIsLoading(false);
        return;
      }

      // Fetch all upgrades with their current costs and purchase counts
      const upgradePromises = [];
      const costPromises = [];
      const countPromises = [];
      
      for (let i = 0; i < totalUpgrades; i++) {
        upgradePromises.push(gameContract.getUpgrade(i));
        costPromises.push(gameContract.getUpgradeCost(i));
        countPromises.push(gameContract.getPurchaseCount(i));
      }

      const [upgradeResults, costResults, countResults] = await Promise.all([
        Promise.all(upgradePromises),
        Promise.all(costPromises),
        Promise.all(countPromises)
      ]);
      
      const formattedUpgrades: Upgrade[] = upgradeResults.map((upgrade: any, index: number) => ({
        id: index,
        name: upgrade[0],
        baseCost: Number(upgrade[1]),
        actualCost: Number(costResults[index]),
        purchaseCount: Number(countResults[index]),
        gpmBonus: Number(upgrade[2]),
        maxHpBonus: Number(upgrade[3]),
        speedBonus: Number(upgrade[4]),
        attackBonus: Number(upgrade[5]),
        defenseBonus: Number(upgrade[6]),
        maxCrewBonus: Number(upgrade[7]),
      }));

      setUpgrades(formattedUpgrades);
    } catch (error) {
      console.error("Error fetching upgrades:", error);
      setError("Failed to load upgrades");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upgrade purchase
  const handlePurchaseUpgrade = async (upgradeId: number) => {
    if (!gameContract.isReady || !("buyUpgrade" in gameContract) || !playerAccount) {
      setNotification("❌ Game not ready or no account found");
      return;
    }

    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) {
      setNotification("❌ Upgrade not found");
      return;
    }

    if (realTimeGold < upgrade.actualCost) {
      setNotification("❌ Not enough gold");
      return;
    }

    setIsPurchasing(true);
    try {
      setNotification("🔧 Purchasing upgrade...");
      
      // Log pre-purchase stats for debugging
      console.log("Pre-purchase stats:", {
        attack: playerAccount.attack,
        defense: playerAccount.defense,
        speed: playerAccount.speed,
        maxHp: playerAccount.maxHp,
        gold: playerAccount.gold,
        gpm: playerAccount.gpm,
      });
      
      await gameContract.buyUpgrade(upgradeId);
      
      // Wait a moment for blockchain state to be consistent
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh both player data and upgrades list to show updated values
      await Promise.all([
        refreshPlayerData(),
        fetchUpgrades()
      ]);
      
      // Force refresh after upgrade to ensure all components update
      forceRefresh();
      setTimeout(async () => {
        await refreshPlayerData();
        forceRefresh();
        
        // Log post-purchase stats for debugging
        console.log("Post-purchase stats check complete");
      }, 2000);
      
      // Update real-time gold immediately after purchase
      setRealTimeGold(calculateRealTimeGold());
      
      // Special message for GPM upgrades
      if (upgrade.gpmBonus > 0) {
        setNotification(`✅ ${upgrade.name} purchased! +${upgrade.gpmBonus} GPM (automatic gold earning)`);
      } else {
        setNotification(`✅ ${upgrade.name} purchased successfully!`);
      }
      
      console.log(`Upgrade purchased: ${upgrade.name} for ${upgrade.actualCost} gold`);
    } catch (error: any) {
      console.error("Error purchasing upgrade:", error);
      
      // Handle specific error messages
      if (error.message?.includes("Not enough gold")) {
        setNotification("❌ Not enough gold");
      } else if (error.message?.includes("Upgrade not exist")) {
        setNotification("❌ Upgrade no longer available");
      } else {
        setNotification("❌ Failed to purchase upgrade");
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // Fetch upgrades when component mounts or game contract becomes ready
  useEffect(() => {
    fetchUpgrades();
  }, [gameContract.isReady]);

  // Refresh upgrades when player account changes (after purchases)
  useEffect(() => {
    if (playerAccount && gameContract.isReady) {
      fetchUpgrades();
    }
  }, [playerAccount?.gold, playerAccount?.gpm, gameContract.isReady]);

  // Show loading state
  if (isLoading) {
    return (
      <section className="flex flex-col w-full ui2 items-center justify-center h-[200px] overflow-y-auto p-4 gap-2 text-white">
        <div className="text-white !text-lg animate-pulse">Loading upgrades...</div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="flex flex-col w-full ui2 items-center justify-center h-[200px] overflow-y-auto p-4 gap-2 text-white">
        <div className="text-red-400 !text-lg">{error}</div>
        <Button onClick={fetchUpgrades} className="mt-2">
          Retry
        </Button>
      </section>
    );
  }

  // Show empty state
  if (upgrades.length === 0) {
    return (
      <section className="flex flex-col w-full ui2 items-center justify-center h-[200px] overflow-y-auto p-4 gap-2 text-white">
        <div className="text-gray-400 !text-lg">No upgrades available</div>
        <div className="text-gray-500 !text-sm">Check back later for new ship upgrades!</div>
      </section>
    );
  }

  return (
    <section className="flex flex-col w-full ui2 items-center justify-center h-[200px] overflow-y-auto p-4 gap-2 text-white">
      <div className="text-white !text-xl w-full h-full">
        <div className="flex flex-col w-full gap-2 max-h-full">
          {upgrades.map((upgrade) => (
            <UpgradeItem
              key={upgrade.id}
              upgrade={upgrade}
              playerGold={realTimeGold}
              onPurchase={handlePurchaseUpgrade}
              isPurchasing={isPurchasing}
            />
          ))}
                </div>
            </div>
        </section>
  );
};