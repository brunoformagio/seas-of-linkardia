"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import Button from "./Button";
import { useGameContract } from "../libs/hooks/useGameContract";
import { usePlayer } from "../libs/providers/player-provider";

interface TravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: number;
  onTravelStart: () => void;
}

export function TravelModal({ isOpen, onClose, currentLocation, onTravelStart }: TravelModalProps) {
  const [destination, setDestination] = useState<number>(0);
  const [useFastTravel, setUseFastTravel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const gameContract = useGameContract();
  const { playerAccount, forceRefresh, setNotification } = usePlayer();

  const handleClose = () => {
    setDestination(0);
    setUseFastTravel(false);
    setError(null);
    onClose();
  };

  const calculateTravelTime = (from: number, to: number, speed: number = 1) => {
    const distance = Math.abs(to - from);
    const baseTime = distance * 60 * 60; // 1 hour per location
    const speedReduction = speed * 5 * 60 * distance; // 5 minutes per speed point per distance
    return Math.max(0, baseTime - speedReduction);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleTravel = async () => {
    if (!gameContract.isReady || !('travelToLocation' in gameContract)) {
      setError('Game contract not ready');
      return;
    }

    if (destination === currentLocation) {
      setError('Cannot travel to current location');
      return;
    }

    if (destination < 0 || destination > 100) {
      setError('Invalid destination (0-100)');
      return;
    }

    // Check if player has enough diamonds for fast travel
    if (useFastTravel) {
      const playerDiamonds = playerAccount?.diamonds ?? 0;
      if (playerDiamonds < diamondCost) {
        setError(`Not enough diamonds. Need ${diamondCost}, have ${playerDiamonds}`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      await gameContract.travelToLocation(destination, useFastTravel);
      
      // Close modal first
      handleClose();
      
      // Show travel notification
      setNotification("⛵ Setting sail! Updating ship status...");
      
      // Trigger immediate refresh to show updated travel state
      onTravelStart();
      forceRefresh();
      
      // Additional refresh after a short delay to ensure blockchain state is updated
      setTimeout(() => {
        forceRefresh();
      }, 2000);
    } catch (error) {
      console.error('Travel error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start travel');
    } finally {
      setIsLoading(false);
    }
  };

  // Port locations for quick selection
  const ports = [
    { location: 25, name: "Port Royal" },
    { location: 55, name: "Tortuga Bay" }, 
    { location: 89, name: "Nassau Harbor" }
  ];

  // Popular destinations
  const popularDestinations = [
    { location: 0, name: "The Edge" },
    { location: 50, name: "Central Seas" },
    { location: 75, name: "Treasure Cove" },
    { location: 100, name: "World's End" }
  ];

  const distance = Math.abs(destination - currentLocation);
  const playerSpeed = playerAccount?.speed ?? 1; // Use player's actual speed or fallback to 1
  const estimatedTime = calculateTravelTime(currentLocation, destination, playerSpeed);
  
  // Calculate diamond cost for fast travel (minimum 1 diamond)
  const baseDiamondCost = Math.floor(estimatedTime / 3600); // 1 diamond per hour of travel time
  const diamondCost = Math.max(1, baseDiamondCost); // Minimum 1 diamond for fast travel

  return (
    <Modal 
      open={isOpen} 
      setOpen={handleClose}
      removeCloseButton={isLoading}
    >
      <div className="w-full max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-[#fbc988] mb-6 text-center">
          Set Sail to New Waters
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-4 text-center">
            Current Location: <span className="text-yellow-400">Coordinate {currentLocation}</span>
          </p>
          
          {/* Quick Port Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">⚓ Major Ports</h3>
            <div className="grid grid-cols-3 gap-2">
              {ports.map((port) => (
                <button
                  key={port.location}
                  onClick={() => setDestination(port.location)}
                  disabled={port.location === currentLocation}
                  className={`ui2 p-3 text-center transition-all hover:scale-105 ${
                    destination === port.location 
                      ? 'scale-105 !brightness-125' 
                      : port.location === currentLocation
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                  }`}
                >
                  <div className="text-white font-bold">{port.name}</div>
                  <div className="text-gray-300 text-sm">Coord {port.location}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">🗺️ Popular Destinations</h3>
            <div className="grid grid-cols-2 gap-2">
              {popularDestinations.map((dest) => (
                <button
                  key={dest.location}
                  onClick={() => setDestination(dest.location)}
                  disabled={dest.location === currentLocation}
                  className={`ui2 p-3 text-center transition-all hover:scale-105 ${
                    destination === dest.location 
                      ? 'scale-105 !brightness-125' 
                      : dest.location === currentLocation
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                  }`}
                >
                  <div className="text-white font-bold">{dest.name}</div>
                  <div className="text-gray-300 text-sm">Coord {dest.location}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Destination Input */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">🧭 Custom Destination</h3>
            <div className="flex items-center gap-3">
              <label className="text-white">Coordinate:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={destination}
                onChange={(e) => setDestination(Number(e.target.value))}
                className="ui5 px-3 py-2 w-20 text-center text-black"
                placeholder="0-100"
              />
              <div className="text-gray-300 text-sm">
                Distance: {distance} {distance === 1 ? 'league' : 'leagues'}
              </div>
            </div>
          </div>

          {/* Travel Options */}
          {destination > 0 && destination !== currentLocation && (
            <div className="mb-6 ui2 p-4">
              <h3 className="text-lg font-bold text-white mb-3">⛵ Travel Options</h3>
              
              {/* Normal Travel */}
              <div 
                className={`p-3 border-2 rounded cursor-pointer transition-all ${
                  !useFastTravel ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600'
                }`}
                onClick={() => setUseFastTravel(false)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">⛵ Normal Travel</div>
                    <div className="text-gray-300 text-sm">Safe and steady journey</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">Free</div>
                    <div className="text-gray-300 text-sm">~{formatTime(estimatedTime)}</div>
                  </div>
                </div>
              </div>

              {/* Fast Travel */}
              <div 
                className={`p-3 border-2 rounded transition-all mt-2 ${
                  useFastTravel ? 'border-yellow-500 bg-yellow-500/20' : 'border-gray-600'
                } ${
                  (playerAccount?.diamonds ?? 0) < diamondCost
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
                onClick={() => {
                  if ((playerAccount?.diamonds ?? 0) >= diamondCost) {
                    setUseFastTravel(true);
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">⚡ Fast Travel</div>
                    <div className="text-gray-300 text-sm">
                      {(playerAccount?.diamonds ?? 0) < diamondCost
                        ? "Insufficient diamonds"
                        : "Instant arrival with diamonds"
                      }
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400">
                      {diamondCost} Diamond{diamondCost === 1 ? "" : "s"}
                    </div>
                    <div className="text-gray-300 text-sm">
                      <div className="mb-1">You have: {playerAccount?.diamonds ?? 0}</div>
                      Instant
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTravel}
            disabled={
              isLoading || 
              destination === currentLocation || 
              destination < 0 || 
              destination > 100 ||
              (useFastTravel && (playerAccount?.diamonds ?? 0) < diamondCost)
            }
          >
            {isLoading ? 'Setting Sail...' : `Travel to ${destination}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 