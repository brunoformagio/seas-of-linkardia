"use client";

import { useState, useEffect, useRef } from "react";
import { usePlayer } from "../libs/providers/player-provider";

interface AnimatedGoldCounterProps {
  className?: string;
}

export const AnimatedGoldCounter = ({ className = "" }: AnimatedGoldCounterProps) => {
  const { playerAccount } = usePlayer();
  
  const [displayGold, setDisplayGold] = useState<number>(0);
  const [targetGold, setTargetGold] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(Date.now());

  // Calculate real-time gold including accumulated GPM
  const calculateRealTimeGold = () => {
    if (!playerAccount || playerAccount.gpm === 0 || playerAccount.hp === 0) {
      return playerAccount?.gold || 0;
    }

    const now = Date.now() / 1000; // Current time in seconds
    const lastClaim = playerAccount.lastGPMClaim; // Last claim time in seconds
    const timeElapsed = now - lastClaim;
    const minutesElapsed = Math.floor(timeElapsed / 60);
    const accumulatedGold = playerAccount.gpm * minutesElapsed;
    
    return playerAccount.gold + accumulatedGold;
  };

  // Smooth animation function
  const animateToTarget = (start: number, target: number, duration: number = 1000) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = Date.now();
    setIsAnimating(true);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + (target - start) * easeOutQuart;
      
      setDisplayGold(Math.floor(current));
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setDisplayGold(target);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Update target gold and animate
  useEffect(() => {
    if (!playerAccount) return;

    const newTarget = calculateRealTimeGold();
    
    // Only animate if there's a significant change (more than 1 gold difference)
    if (Math.abs(newTarget - targetGold) > 1) {
      setTargetGold(newTarget);
      animateToTarget(displayGold, newTarget, 800);
    } else {
      setTargetGold(newTarget);
      setDisplayGold(newTarget);
    }
  }, [playerAccount?.gold, playerAccount?.lastGPMClaim, playerAccount?.gpm]);

  // Real-time updates for GPM accumulation
  useEffect(() => {
    if (!playerAccount || playerAccount.gpm === 0 || playerAccount.hp === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      
      // Only update if at least 5 seconds have passed
      if (now - lastUpdateRef.current >= 5000) {
        const newTarget = calculateRealTimeGold();
        
        if (newTarget > targetGold && !isAnimating) {
          setTargetGold(newTarget);
          animateToTarget(displayGold, newTarget, 500); // Faster animation for real-time updates
        }
        
        lastUpdateRef.current = now;
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [playerAccount?.gpm, playerAccount?.lastGPMClaim, targetGold, displayGold, isAnimating]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Initialize display gold
  useEffect(() => {
    if (playerAccount && displayGold === 0) {
      const initialGold = calculateRealTimeGold();
      setDisplayGold(initialGold);
      setTargetGold(initialGold);
    }
  }, [playerAccount]);

  const formatGold = (gold: number) => {
    return Math.floor(gold).toLocaleString();
  };

  const isAccumulating = playerAccount && playerAccount.gpm > 0 && playerAccount.hp > 0;

  return (
    <span className={`${className} ${isAnimating ? 'animate-pulse' : ''} ${isAccumulating ? 'text-yellow-300' : ''}`}>
      {formatGold(displayGold)}
      {isAccumulating && (
        <span className="text-xs text-green-400 ml-1 animate-pulse">
          +{playerAccount.gpm}/min
        </span>
      )}
    </span>
  );
}; 