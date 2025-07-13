import { useEffect, useState } from "react";
import { usePlayer } from "../libs/providers/player-provider";
import Button from "./Button";
import { useGameContract } from "../libs/hooks/useGameContract";
import { Icon } from "./Icons";


interface CheckInCountdownProps {
    lastCheckIn: number;
    onCheckInAvailable: () => void;
  }
  
  const CheckInCountdown = ({ lastCheckIn, onCheckInAvailable }: CheckInCountdownProps) => {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isAvailable, setIsAvailable] = useState(false);
  
    useEffect(() => {
      const updateCountdown = () => {
        const now = Date.now() / 1000; // Current time in seconds
        const nextCheckIn = lastCheckIn + (24 * 60 * 60); // 24 hours after last check-in
        const timeRemaining = nextCheckIn - now;
  
        if (timeRemaining <= 0) {
          setIsAvailable(true);
          setTimeLeft("Available!");
          onCheckInAvailable();
        } else {
          setIsAvailable(false);
          const hours = Math.floor(timeRemaining / 3600);
          const minutes = Math.floor((timeRemaining % 3600) / 60);
          const seconds = Math.floor(timeRemaining % 60);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      };
  
      // Update immediately
      updateCountdown();
  
      // Update every second
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }, [lastCheckIn, onCheckInAvailable]);
  
    return timeLeft ? timeLeft : "Check In";
  };

export const DailyCheckInSection = () => {  
    const { playerAccount, setNotification, refreshPlayerData } = usePlayer();
    const gameContract = useGameContract();

    const [canCheckIn, setCanCheckIn] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isWrecked, setIsWrecked] = useState(false);

        // Check if daily check-in is available
        const checkCheckInAvailability = () => {
            if (!playerAccount) return false;
            
            const now = Date.now() / 1000;
            const lastCheckIn = playerAccount.lastCheckIn;
            const timeSinceLastCheckIn = now - lastCheckIn;
            const twentyFourHours = 24 * 60 * 60; // 24 hours in seconds
            
            return timeSinceLastCheckIn >= twentyFourHours;
          };


    // Handle daily check-in
    const handleCheckIn = async () => {
        if (!gameContract.isReady || !("dailyCheckIn" in gameContract) || !playerAccount) {
          setNotification("❌ Game not ready or no account found");
          return;
        }
  
        if (!canCheckIn) {
          setNotification("❌ Check-in not available yet");
          return;
        }
  
        setIsCheckingIn(true);
        try {
          setNotification("�� Checking in...");
          
          await gameContract.dailyCheckIn();
          
          // Refresh player data to show updated streak and gold
          await refreshPlayerData();
          
          // Calculate reward (this matches the contract logic)
          const reward = playerAccount.crew * 25 + 5 * (playerAccount.checkInStreak + 1);
          const newStreak = playerAccount.checkInStreak + 1;
          
          setNotification(`✅ Daily check-in complete! +${reward} gold (${newStreak} day streak)`);
          setCanCheckIn(false);
          
          console.log(`Daily check-in completed. Reward: ${reward} gold, Streak: ${newStreak}`);
        } catch (error: any) {
          console.error("Error during check-in:", error);
          
          if (error.message?.includes("Already checked in today")) {
            setNotification("❌ Already checked in today");
          } else {
            setNotification("❌ Failed to check in");
          }
        } finally {
          setIsCheckingIn(false);
        }
      };


    // Update check-in availability
    useEffect(() => {
        setCanCheckIn(checkCheckInAvailability());
      }, [playerAccount?.lastCheckIn]);

return <div className="backdrop-blur-sm flex flex-col items-center gap-2 fixed top-[120px] right-[35px] ">
  
  
  {playerAccount && <Button
    onClick={handleCheckIn}
    disabled={!canCheckIn || isCheckingIn || isWrecked}
    variant={!canCheckIn || isCheckingIn || isWrecked ? "secondary" : "primary"}
    className={`${canCheckIn && !isWrecked ? 'bg-green-600 hover:bg-green-700' : ''} flex flex-col items-center justify-center`}
  >
      <div className=" text-yellow-400">{!canCheckIn ? "Next Check-in" : "Check-in Ready!"}</div>
    <div className="flex items-center justify-center">{isCheckingIn ? "Checking in..." : canCheckIn ? playerAccount && `collect ${playerAccount?.crew * 25 + 5 * (playerAccount?.checkInStreak + 1)} gold` : <CheckInCountdown
      lastCheckIn={playerAccount.lastCheckIn}
      onCheckInAvailable={() => setCanCheckIn(true)}
    />}    {canCheckIn && <span className="flex items-center justify-center ml-2 group">
    <Icon iconName="info" className="text-yellow-400 w-4 h-4" />
    <span className="text-xs absolute bottom-[20px] backdrop-blur-md left-0 bg-black/75 p-1 w-[200px] text-gray-300 hidden group-hover:block">
      ({playerAccount?.crew} crew × 25 + {playerAccount?.checkInStreak + 1} streak × 5)
    </span>
    </span>} </div>

  </Button>}
  
</div>;
}