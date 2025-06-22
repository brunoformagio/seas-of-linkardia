import { useEffect, useState } from "react";
import { usePlayer } from "../libs/providers/player-provider";
import Button from "./Button";
import { useGameContract } from "../libs/hooks/useGameContract";


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

return <div className="backdrop-blur-sm flex flex-col items-center gap-2 p-3 bg-black/20  border border-yellow-600/30 fixed bottom-[420px] left-[20px] ">
  <div className="text-yellow-400 !text-sm font-bold">
    Daily Check-in {playerAccount?.checkInStreak ? `(${playerAccount.checkInStreak} day streak)` : ''}
  </div>
  
  
  {playerAccount && <Button
    onClick={handleCheckIn}
    disabled={!canCheckIn || isCheckingIn || isWrecked}
    variant={!canCheckIn || isCheckingIn || isWrecked ? "secondary" : "primary"}
    className={`${canCheckIn && !isWrecked ? 'bg-green-600 hover:bg-green-700' : ''}`}
  >
      
    {isCheckingIn ? "Checking in..." : canCheckIn ? playerAccount && `collect ${playerAccount?.crew * 25 + 5 * (playerAccount?.checkInStreak + 1)} gold` : <CheckInCountdown
      lastCheckIn={playerAccount.lastCheckIn}
      onCheckInAvailable={() => setCanCheckIn(true)}
    />}
  </Button>}
  
  {playerAccount && (
    <div className="text-xs text-gray-300 text-center">
      ({playerAccount.crew} crew × 25 + {playerAccount.checkInStreak + 1} streak × 5)
    </div>
  )}
</div>;
}