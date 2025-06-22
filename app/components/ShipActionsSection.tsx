"use client";

import { useState, useEffect } from "react";
import { TravelCountdown } from "./TravelCountdown"
import { usePlayer } from "../libs/providers/player-provider"
import { useGameContract } from "../libs/hooks/useGameContract"
import Button from "./Button"
import { DailyCheckInSection } from "./DailyCheckInSection";


export const ShipActionsSection = ({showTravelModal, setShowTravelModal, handleTravelComplete}: {showTravelModal: boolean, setShowTravelModal: (show: boolean) => void, handleTravelComplete: () => void}) => {
    const { playerAccount, isTraveling, isWrecked, maxHp, refreshPlayerData, setNotification } = usePlayer();
    const gameContract = useGameContract();
    const [isRepairing, setIsRepairing] = useState(false);




    // Handle ship repair
    const handleRepair = async () => {
      if (!gameContract.isReady || !("repairShip" in gameContract) || !playerAccount) {
        setNotification("❌ Game not ready or no account found");
        return;
      }

      if ((playerAccount.hp || 0) >= maxHp) {
        setNotification("❌ Ship is already at full HP");
        return;
      }

      setIsRepairing(true);
      try {
        setNotification("🔧 Repairing ship...");
        
        // Check if at port for faster/cheaper repair
        const isAtPort = [25, 55, 89].includes(playerAccount.location);
        
        await gameContract.repairShip(isAtPort, false); // atPort, useDiamond
        
        // Refresh player data to show updated HP
        await refreshPlayerData();
        
        if (isAtPort) {
          setNotification("✅ Ship repaired at port! (1 hour repair time)");
        } else {
          setNotification("✅ Ship repair started! (5 hour repair time)");
        }
        
        console.log(`Ship repair initiated. At port: ${isAtPort}`);
      } catch (error: any) {
        console.error("Error during repair:", error);
        
        if (error.message?.includes("Ship is not damaged")) {
          setNotification("❌ Ship is not damaged");
        } else if (error.message?.includes("Already repairing")) {
          setNotification("❌ Ship is already being repaired");
        } else {
          setNotification("❌ Failed to repair ship");
        }
      } finally {
        setIsRepairing(false);
      }
    };

    //knots conversion
    const speedToKnots = (speed: number) => {
        if (speed === 1) return "4";
        if (speed === 2) return "6.5";
        if (speed === 3) return "8.5";
        if (speed === 4) return "10";
        if (speed === 5) return "11";
        if (speed === 6) return "11.8";
        if (speed === 7) return "12.3";
        if (speed === 8) return "12.7";
        if (speed === 9) return "13";
        if (speed === 10) return "13.2";
        return "13.2+";
    }


    return (
        <section className="flex flex-col w-full ui2 items-center justify-center p-6 h-full gap-2 text-white">
              {isTraveling ? (
                <>
                  <div className="text-white !text-xl mb-4">
                    En Route to Coordinate {playerAccount?.location}
                  </div>
                  <TravelCountdown
                    travelEndTime={playerAccount?.travelEnd || 0}
                    onTravelComplete={handleTravelComplete}
                    suffix={`at ${speedToKnots(playerAccount?.speed || 0)} knots`}
                  />
                </>
              ) : (
                <>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => setShowTravelModal(true)}
                      disabled={isWrecked}
                    >
                      Travel to...
                    </Button>
                    <Button
                      onClick={handleRepair}
                      disabled={(playerAccount?.hp || 0) >= maxHp || isRepairing}
                    >
                      {isRepairing ? "Repairing..." : (playerAccount?.hp || 0) >= maxHp ? "Full HP" : "Repair"}
                    </Button>
                  </div>
                </>
              )}
            </section>
    )
}