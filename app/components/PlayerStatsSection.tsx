import { useState, useEffect } from "react";
import { usePlayer } from "../libs/providers/player-provider";
import { Icon } from "./Icons";
import { AnimatedGoldCounter } from "./AnimatedGoldCounter";
import { DiamondPurchaseModal } from "./DiamondPurchaseModal";
import Button from "./Button";

export const PlayerStatsSection = ({setShowDiamondModal}: {setShowDiamondModal: (show: boolean) => void}) => {
  const {
    playerAccount,
    isRefreshing,
    lastUpdated,
    refreshPlayerData,
    notification,
  } = usePlayer();
  
  // Debug logging for component re-renders
  useEffect(() => {
    if (playerAccount) {
      console.log("PlayerStatsSection re-rendered with stats:", {
        gpm: playerAccount.gpm,
        gold: playerAccount.gold,
        diamonds: playerAccount.diamonds,
      });
    }
  }, [playerAccount?.gpm, playerAccount?.gold, playerAccount?.diamonds]);
  
  
  const level =
    (playerAccount?.speed || 0) +
    (playerAccount?.attack || 0) +
    (playerAccount?.defense || 0);

  return (
    <>
    <section className="flex w-full justify-end md:absolute md:top-0 md:right-0">

      <div className="ui4 p-5 text-white !text-lg">
        GPM: <span className="text-yellow-400 !text-lg">{playerAccount?.gpm || 0}</span>
      </div>
      <div className="ui4 p-5 text-white flex items-center gap-2 !text-lg">
      <Icon iconName="gold" />
        <span className="!text-lg md:flex hidden ">Gold:</span> <AnimatedGoldCounter />
      </div>
      <div className="ui4 p-5 text-white flex items-center gap-2 !text-lg">
        <Icon iconName="diamond" />
        <span className="!text-lg md:flex hidden ">Diamonds:</span> {playerAccount?.diamonds}
        <button 
          className="!h-[20px] !w-[20px] bg-green-700 hover:bg-green-600 flex items-center justify-center !text-xl !text-white transition-colors duration-200" 
          onClick={() => setShowDiamondModal(true)}
          title="Purchase Diamonds"
        >
          +
        </button>
      </div>
      <button
        onClick={refreshPlayerData}
        disabled={isRefreshing}
        className={`ui4 p-3 w-[40px] text-white hover:scale-105 transition-all duration-100 ${
          isRefreshing ? "" : ""
        }`}
        title={`Last updated: ${lastUpdated?.toLocaleTimeString() || "Never"}${
          isRefreshing ? " - Refreshing..." : ""
        }`}
      >
        🔄
      </button>
      {isRefreshing && (
        <div className="ui4 p-3 text-yellow-400 text-sm">Updating...</div>
      )}
      {notification && (
        <div className="ui2 p-3 text-green-400 text-sm animate-pulse">
          {notification}
        </div>
      )}
      
      
    </section>


</>
  );
};
