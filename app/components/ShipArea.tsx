import React, { useState, useEffect } from "react";
import { RenderShip } from "./RenderShip";
import { useGameContract } from "../libs/hooks/useGameContract";
import { usePlayer } from "../libs/providers/player-provider";
import { useThirdweb } from "../libs/hooks/useThirdweb";

interface Ship {
  address: string;
  name: string;
  hp: number;
  level: number;
}

export const ShipArea = () => {
  const { playerAccount, isTraveling, setNotification, forceRefresh } = usePlayer();
  const { address } = useThirdweb();
  const gameContract = useGameContract();
  const [ships, setShips] = useState<Ship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);

  // Fetch ships at current location
  const fetchShipsAtLocation = async (location: number) => {
    if (!gameContract.isReady || !("getShipsAtLocation" in gameContract)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // getShipsAt returns (address[], string[], uint256[]) - addresses, names, hp values
      const result = await gameContract.getShipsAtLocation(location);
      
      if (result && result.length >= 3) {
        const [addresses, names, hpValues] = result;
        
        // Combine the arrays into ship objects
        const shipsData: Ship[] = addresses.map((address: string, index: number) => ({
          address,
          name: names[index] || `Ship ${index + 1}`,
          hp: Number(hpValues[index]) || 0,
          level: Math.min(Math.floor(Number(hpValues[index]) / 20), 1), // Calculate level based on HP, max level 1 for now
        })).filter(ship => 
          ship.address && 
          ship.name
          // Note: We now include the player's own ship in the display
        );

        setShips(shipsData);
        console.log(`Found ${shipsData.length} ships at location ${location}:`, shipsData);
      } else {
        setShips([]);
        console.log(`No ships found at location ${location}`);
      }
    } catch (error) {
      console.error("Error fetching ships at location:", error);
      setError("Failed to load ships at location");
      setShips([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch ships when player location changes
  useEffect(() => {
    if (playerAccount && !isTraveling) {
      fetchShipsAtLocation(playerAccount.location);
    } else {
      // Clear ships if player is traveling or no account
      setShips([]);
    }
  }, [playerAccount?.location, isTraveling, gameContract.isReady]);

  // Auto-refresh ships every 30 seconds
  useEffect(() => {
    if (!playerAccount || isTraveling) return;

    const interval = setInterval(() => {
      fetchShipsAtLocation(playerAccount.location);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [playerAccount?.location, isTraveling, gameContract.isReady]);

  // Handle ship interaction (click to select/attack)
  const handleShipClick = (ship: Ship) => {
    setSelectedShip(ship);
    console.log("Selected ship:", ship);
  };

  // Handle attack functionality
  const handleAttack = async (targetAddress: string) => {
    if (!gameContract.isReady || !("attackPlayer" in gameContract)) {
      setNotification("⚠️ Game contract not ready");
      return;
    }

    if (!playerAccount || playerAccount.hp === 0) {
      setNotification("⚠️ Your ship is wrecked! Repair before attacking.");
      return;
    }

    setIsAttacking(true);
    try {
      setNotification("⚔️ Engaging in combat...");
      
      await gameContract.attackPlayer(targetAddress);
      
      setNotification("🎯 Attack successful! Checking battle results...");
      
      // Close the action panel
      setSelectedShip(null);
      
      // Refresh player data and ships at location
      forceRefresh();
      if (playerAccount) {
        fetchShipsAtLocation(playerAccount.location);
      }
      
      // Additional refresh after delay for blockchain confirmation
      setTimeout(() => {
        forceRefresh();
        if (playerAccount) {
          fetchShipsAtLocation(playerAccount.location);
        }
      }, 3000);
      
    } catch (error) {
      console.error("Attack error:", error);
      setNotification(`⚠️ Attack failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAttacking(false);
    }
  };

  // Don't render anything if player is traveling
  if (isTraveling || !playerAccount) {
    return null;
  }

  // Show loading state
  if (isLoading && ships.length === 0) {
    return (
      <div className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2">
        <div className="ui2 p-4 text-white text-center">
          <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
          Scanning waters for ships...
        </div>
      </div>
    );
  }

  // Show error state
  if (error && ships.length === 0) {
    return (
      <div className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2">
        <div className="ui2 p-4 text-red-300 text-center">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  // Show empty state
  if (ships.length === 0) {
    return (
      <div className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2">
        <div className="ui2 p-4 text-gray-300 text-center">
          🌊 No other ships in these waters
          <div className="text-sm mt-1">
            Location: Coordinate {playerAccount.location}
            {[25, 55, 89].includes(playerAccount.location) && (
              <span className="text-blue-400 ml-2">⚓ PORT</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (<>      {/* Location Info */}
    <div className="text-center mb-4 fixed top-[40px] left-1/2 transform -translate-x-1/2">
      <div className="ui2 inline-block p-5 text-white">
        📍 Coordinate {playerAccount.location}
        {[25, 55, 89].includes(playerAccount.location) && (
          <span className="text-blue-400 ml-2">⚓ PORT</span>
        )}
        <span className="text-gray-300 ml-2">• {ships.length} ship{ships.length !== 1 ? 's' : ''} nearby</span>
      </div>
    </div>
    <div className=" w-screen px-10 absolute bottom-[40px]">


             {/* Ships Grid */}
       <div 
         className="grid gap-4 content-start justify-center"
         style={{
           gridTemplateColumns: `repeat(${Math.min(ships.length, 6)}, minmax(0, 1fr))`,
           maxWidth: '1200px',
           margin: '0 auto'
         }}
       >
         {ships.slice(0, 6).map((ship, index) => {
           const isOwnShip = ship.address.toLowerCase() === address?.toLowerCase();
           
           return (
             <div 
               key={`${ship.address}-${index}`} 
               className={`group flex flex-col items-center cursor-pointer relative ${
                 selectedShip?.address === ship.address ? 'scale-105 brightness-125' : ''
               } `}
               onClick={() => handleShipClick(ship)}
             >
             <RenderShip 
               ship={ship}
             />
             
             {/* Own Ship Badge */}
             
             {/* Ship Info */}
             <div className="hidden group-hover:block ui1 mt-2 p-6 text-center absolute min-w-[200px] z-20">
               <div className="text-white font-bold text-sm truncate" title={ship.name}>
                 {ship.name}
               </div>
               <div className="text-gray-300 text-xs mt-1">
                 HP: <span className={ship.hp > 50 ? 'text-green-400' : ship.hp > 20 ? 'text-yellow-400' : 'text-red-400'}>
                   {ship.hp}/100
                 </span>
               </div>
               <div className="text-gray-400 text-xs truncate" title={ship.address}>
                 {ship.address.slice(0, 6)}...{ship.address.slice(-4)}
               </div>
               {selectedShip?.address === ship.address && (
                 <div className="mt-2 text-yellow-400 text-xs animate-pulse">
                   ⚔️ Selected
                 </div>
               )}
             </div>
           </div>
         );
         })}
       </div>

      {/* Show count if more than 6 ships */}
      {ships.length > 6 && (
        <div className="text-center mt-2">
          <div className="ui2 inline-block px-3 py-1 text-gray-300 text-sm">
            +{ships.length - 6} more ships in the area
          </div>
        </div>
      )}

             {/* Selected Ship Actions */}
       {selectedShip && (
         <div className="fixed bottom-[350px] right-[20px] z-50">
           <div className="ui1 p-6 text-white max-w-xs">
             <div className="flex items-center justify-between mb-3">
               <h3 className="font-bold text-yellow-400">Ship Actions</h3>
               <button 
                 onClick={() => setSelectedShip(null)}
                 className="text-gray-400 hover:text-white"
               >
                 ✕
               </button>
             </div>
             
             <div className="text-sm mb-3">
               <div className="font-bold">{selectedShip.name}</div>
               <div className="text-gray-300">
                 HP: {selectedShip.hp}/100
               </div>
               <div className="text-gray-400 text-xs">
                 {selectedShip.address.slice(0, 8)}...{selectedShip.address.slice(-6)}
               </div>
             </div>

             <div className="space-y-2">
               {selectedShip.address.toLowerCase() === address?.toLowerCase() ? (
                 // Player's own ship - show different options
                 <>
                   <div className="w-full ui2 p-4 text-center text-yellow-400">
                     🚢 This is your ship
                   </div>

                 </>
               ) : (
                 // Other player's ship - show attack options
                 <>
                   <button 
                     className="w-full ui1 p-2 text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     onClick={() => handleAttack(selectedShip.address)}
                     disabled={playerAccount?.hp === 0 || isAttacking}
                   >
                     {isAttacking ? (
                       <>
                         <div className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full mr-2"></div>
                         Attacking...
                       </>
                     ) : (
                       '⚔️ Attack Ship'
                     )}
                   </button>
                   
                   <button 
                     className="w-full ui2 p-2 text-white hover:scale-105 transition-all"
                     onClick={() => {
                       console.log("View ship details:", selectedShip.address);
                       // TODO: Show detailed ship info
                     }}
                   >
                     🔍 View Details
                   </button>
                 </>
               )}
             </div>

             {selectedShip.address.toLowerCase() !== address?.toLowerCase() && playerAccount?.hp === 0 && (
               <div className="text-red-400 text-xs mt-2">
                 ⚠️ Your ship is wrecked! Repair before attacking.
               </div>
             )}
           </div>
         </div>
       )}

       {/* Refresh indicator */}
       {isLoading && ships.length > 0 && (
         <div className="absolute top-2 right-4">
           <div className="ui2 px-2 py-1 text-yellow-400 text-xs">
             <div className="animate-spin inline-block w-3 h-3 border border-yellow-400 border-t-transparent rounded-full mr-1"></div>
             Updating...
           </div>
         </div>
       )}
     </div></>
  );
};