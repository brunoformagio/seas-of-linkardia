import Image from "next/image";
import Button from "./Button";
import { useThirdweb } from "../libs/hooks/useThirdweb";
import { useState } from "react";
import { TravelModal } from "./TravelModal";
import { TravelCountdown } from "./TravelCountdown";
import { usePlayer } from "../libs/providers/player-provider";

const NamePlate = ({ boatName }: { boatName: string }) => {
  return (
    <div className="absolute text-white top-[-50px] left-[-50px] bg-[url('/parchment.webp')] capitalize text-shadow-full-outline !text-2xl flex items-center justify-center bg-no-repeat bg-[length:auto_90px] bg-center w-[384px] h-[90px]">
      {boatName || "Unnamed boat"}
    </div>
  );
};

const AffiliationFlag = ({
  affiliation,
  className,
}: {
  affiliation: "pirates" | "navy";
  className?: string;
}) => {
  return (
    <Image
      unoptimized
      src={`/flags/${affiliation}_flag.webp`}
      alt={affiliation}
      width={32}
      height={32}
      className={className}
    />
  );
};

const UserBoatPanelContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex p-7 flex-col bottom-[20px] left-[20px] w-[calc(100dvw-40px)] items-center justify-center  ui1 fixed h-[300px]">
      <div className="flex pt-[60px] pl-[10px] flex-col items-center justify-center w-full h-full relative">
        {children}
      </div>
    </div>
  );
};



export default function UserBoatPanel() {
  const { isConnected, address } = useThirdweb();
  const {
    playerAccount,
    isLoading,
    error,
    lastUpdated,
    isRefreshing,
    isTraveling,
    isWrecked,
    maxHp,
    level,
    refreshPlayerData,
    forceRefresh,
    notification,
    setNotification,
  } = usePlayer();
  
    const [showTravelModal, setShowTravelModal] = useState(false);

  const handleTravelStart = () => {
    // Show travel notification
    setNotification("⛵ Setting sail! Updating ship status...");

    // Immediate refresh to show travel state
    refreshPlayerData();

    // Additional refresh after delay to ensure blockchain state is updated
    setTimeout(() => {
      forceRefresh();
    }, 2000);
  };

  const handleTravelComplete = () => {
    // Refresh player data when travel completes
    refreshPlayerData();
  };

  if (!isConnected || !address || !playerAccount) {
    return null;
  }

  if (isLoading) {
    return (
      <UserBoatPanelContainer>
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-white text-lg">Loading ship data...</div>
        </div>
      </UserBoatPanelContainer>
    );
  }

  if (error) {
    return (
      <UserBoatPanelContainer>
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      </UserBoatPanelContainer>
    );
  }

  return (
    <>
      <UserBoatPanelContainer>
        <NamePlate boatName={playerAccount.boatName} />
        <AffiliationFlag
          affiliation={playerAccount.isPirate ? "pirates" : "navy"}
          className="absolute top-[-50px] left-[290px] w-[90px] h-[90px]"
        />
        <div className="flex flex-col w-full mt-[120px] md:mt-0">
          <div className="flex w-full justify-end md:absolute md:top-0 md:right-0">

                         <div className="ui2 p-5 text-white">
               Level {level}
             </div>
            <div className="ui2 p-5 text-white">
              Crew: {playerAccount.crew}/{playerAccount.maxCrew}
            </div>
            <div className="ui2 p-5 text-white">
              GPM:{" "}
              <span className="text-yellow-400">{playerAccount.gpm || 0}</span>
            </div>
            <div className="ui2 p-5 text-white">
              Gold: {playerAccount.gold.toLocaleString()}
            </div>
            <div className="ui2 p-5 text-white">
              Diamonds: {playerAccount.diamonds}
            </div>
                         <button
               onClick={refreshPlayerData}
               disabled={isRefreshing}
               className={`ui2 p-3 text-white hover:scale-105 transition-all duration-100 ${
                 isRefreshing ? 'animate-spin' : ''
               }`}
               title={`Last updated: ${
                 lastUpdated?.toLocaleTimeString() || "Never"
               }${isRefreshing ? " - Refreshing..." : ""}`}
             >
               🔄
             </button>
             {isRefreshing && (
               <div className="ui2 p-3 text-yellow-400 text-sm">Updating...</div>
             )}
             {notification && (
               <div className="ui2 p-3 text-green-400 text-sm animate-pulse">
                 {notification}
               </div>
             )}
          </div>
          <div className="md:flex-row flex-col flex w-full h-full">
            {/* STATS */}
            <div className="flex flex-col w-full ui2 items-center justify-center p-6 h-full gap-2 text-white">
              <div className="flex flex-col [&_*]:!text-xl justify-start w-full h-full">
                <div>
                  HP:{" "}
                  <span
                    className={`${
                      isWrecked
                        ? "text-red-600"
                        : playerAccount.hp <= 25
                        ? "text-red-400"
                        : "text-red-500"
                    }`}
                  >
                    {playerAccount.hp}/{maxHp}
                  </span>
                  {isWrecked && (
                    <span className="text-red-600 ml-2">WRECKED!</span>
                  )}
                </div>
                <div>
                  Location:{" "}
                  <span className="text-yellow-500">
                    {playerAccount.location}
                  </span>
                                     {[25, 55, 89].includes(playerAccount.location) && (
                     <span className="text-blue-400 ml-2">⚓ PORT</span>
                   )}
                </div>
                <div>
                  Attack:{" "}
                  <span className="text-red-500">{playerAccount.attack}</span>
                </div>
                <div>
                  Defense:{" "}
                  <span className="text-blue-500">{playerAccount.defense}</span>
                </div>
                <div>
                  Speed:{" "}
                  <span className="text-green-500">{playerAccount.speed}</span>
                </div>

                {playerAccount.checkInStreak > 0 && (
                  <div>
                    Streak:{" "}
                    <span className="text-purple-400">
                      {playerAccount.checkInStreak} days
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* ACTIONS */}
            <div className="flex flex-col w-full ui2 items-center justify-center p-6 h-full gap-2 text-white">
              {isTraveling ? (
                <>
                  <div className="text-white !text-xl mb-4">
                    En Route to Destination
                  </div>
                  <TravelCountdown
                    travelEndTime={playerAccount.travelEnd}
                    onTravelComplete={handleTravelComplete}
                  />
                </>
              ) : (
                <>
                  <div className="text-white !text-xl">
                    Coordinate {playerAccount.location} - Actions:
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowTravelModal(true)}
                      disabled={isWrecked}
                    >
                      Travel to...
                    </Button>
                    <Button
                      onClick={() => {}}
                      disabled={playerAccount.hp >= maxHp}
                    >
                      {playerAccount.hp >= maxHp ? "Full HP" : "Repair"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Travel Modal */}
      </UserBoatPanelContainer>

      <TravelModal
        isOpen={showTravelModal}
        onClose={() => setShowTravelModal(false)}
        currentLocation={playerAccount.location}
        onTravelStart={handleTravelStart}
      />
    </>
  );
}
