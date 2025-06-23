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
    const [isHiringCrew, setIsHiringCrew] = useState(false);
    const [hireCrewCost, setHireCrewCost] = useState<number>(0);




    // Handle ship repair
    const handleRepair = async () => {
      if (!gameContract.isReady || !("repairShip" in gameContract) || !playerAccount) {
        setNotification("❌ Game not ready or no account found");
        return;
      }

      if (playerAccount.hp > 0) {
        setNotification("❌ Ship is not wrecked");
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
          setNotification("✅ Ship repaired at port!");
        } else {
          setNotification("✅ Ship repaired!");
        }
        
        console.log(`Ship repair completed. At port: ${isAtPort}`);
      } catch (error: any) {
        console.error("Error during repair:", error);
        
        if (error.message?.includes("Ship not wrecked")) {
          setNotification("❌ Ship is not wrecked");
        } else if (error.message?.includes("Not enough gold")) {
          setNotification("❌ Not enough gold for repair");
        } else if (error.message?.includes("Not ready for basic repair")) {
          setNotification("❌ Must wait 5 hours before repair");
        } else {
          setNotification("❌ Failed to repair ship");
        }
      } finally {
        setIsRepairing(false);
      }
    };

    // Handle crew hiring
    const handleHireCrew = async () => {
      if (!gameContract.isReady || !("hireCrew" in gameContract) || !playerAccount) {
        setNotification("❌ Game not ready or no account found");
        return;
      }

      if (playerAccount.crew >= playerAccount.maxCrew) {
        setNotification("❌ Crew is already at maximum");
        return;
      }

      if (![25, 55, 89].includes(playerAccount.location)) {
        setNotification("❌ Must be at a port to hire crew");
        return;
      }

      setIsHiringCrew(true);
      try {
        setNotification("👥 Hiring crew...");
        
        await gameContract.hireCrew();
        
        // Refresh player data to show updated crew
        await refreshPlayerData();
        
        const crewHired = playerAccount.maxCrew - playerAccount.crew;
        setNotification(`✅ Hired ${crewHired} crew members for ${hireCrewCost} gold!`);
        
        console.log(`Crew hired: ${crewHired} members for ${hireCrewCost} gold`);
      } catch (error: any) {
        console.error("Error hiring crew:", error);
        
        if (error.message?.includes("Must be at a port")) {
          setNotification("❌ Must be at a port to hire crew");
        } else if (error.message?.includes("Not enough gold")) {
          setNotification("❌ Not enough gold to hire crew");
        } else if (error.message?.includes("Crew already at maximum")) {
          setNotification("❌ Crew is already at maximum");
        } else {
          setNotification("❌ Failed to hire crew");
        }
      } finally {
        setIsHiringCrew(false);
      }
    };

    // Fetch hire crew cost when component mounts or player account changes
    useEffect(() => {
      const fetchHireCrewCost = async () => {
        if (gameContract.isReady && "getHireCrewCost" in gameContract && playerAccount) {
          try {
            const cost = await gameContract.getHireCrewCost();
            setHireCrewCost(Number(cost));
          } catch (error) {
            console.error("Error fetching hire crew cost:", error);
          }
        }
      };

      fetchHireCrewCost();
    }, [gameContract.isReady, playerAccount?.crew, playerAccount?.maxCrew]);

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

    // Helper functions
    const isAtPort = playerAccount ? [25, 55, 89].includes(playerAccount.location) : false;
    const needsCrew = playerAccount ? playerAccount.crew < playerAccount.maxCrew : false;
    const canHireCrew = isAtPort && needsCrew && !isWrecked;


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
                  <div className="flex flex-col gap-2 mt-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowTravelModal(true)}
                      disabled={isWrecked}
                    >
                      Travel to...
                    </Button>
                    <Button
                          onClick={handleRepair}
                          disabled={(playerAccount?.hp || 0) > 0 || isRepairing}
                    >
                          {isRepairing ? "Repairing..." : (playerAccount?.hp || 0) > 0 ? "Not Wrecked" : "Repair"}
                        </Button>
                    </div>
                    
                    {/* Crew Hiring Button - Only show at ports */}
                    {isAtPort && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleHireCrew}
                          disabled={!canHireCrew || isHiringCrew || hireCrewCost === 0}
                          className={`${!canHireCrew ? 'opacity-50' : ''}`}
                        >
                          {isHiringCrew 
                            ? "Hiring..." 
                            : needsCrew 
                              ? `Hire Crew (${hireCrewCost} 🪙)` 
                              : "Crew Full"
                          }
                    </Button>
                                                 {needsCrew && hireCrewCost > 0 && (
                           <span className="text-sm text-gray-300 self-center">
                             Need {(playerAccount?.maxCrew || 0) - (playerAccount?.crew || 0)} crew
                           </span>
                         )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
    )
}