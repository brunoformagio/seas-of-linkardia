'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  useSeasOfLinkardiaContract,
  usePlayerAccount,
  useUpgrades,
  useShipsAtLocation,
  useRanking,
  useContractActions,
  usePlayerStatus,
  useContractEvents,
} from '../hooks/useSeasOfLinkardia';
import {
  GAME_CONSTANTS,
  calculateCheckInReward,
  formatXTZ,
  getDiamondPackage,
} from '../lib/contracts';

interface GameDashboardProps {
  contractAddress: string;
  provider: ethers.Provider;
  signer?: ethers.Signer;
  playerAddress?: string;
}

export function GameDashboard({
  contractAddress,
  provider,
  signer,
  playerAddress
}: GameDashboardProps) {
  const [selectedLocation, setSelectedLocation] = useState(50);

  // ===== CONTRACT HOOKS =====
  const { contract, isLoading: contractLoading } = useSeasOfLinkardiaContract(
    contractAddress,
    signer || provider
  );

  const { account, isLoading: accountLoading, refetch: refetchAccount } = usePlayerAccount(
    contract,
    playerAddress || null
  );

  const { upgrades, isLoading: upgradesLoading } = useUpgrades(contract);
  
  const { ships, isLoading: shipsLoading } = useShipsAtLocation(
    contract,
    selectedLocation
  );

  const { ranking, isLoading: rankingLoading } = useRanking(contract, 10);

  const {
    isLoading: actionLoading,
    error: actionError,
    createAccount,
    checkIn,
    buyUpgrade,
    attack,
    travel,
    repairShip,
    buyDiamonds,
  } = useContractActions(contract);

  const playerStatus = usePlayerStatus(account);

  // Listen to events for this player
  const { events: checkInEvents } = useContractEvents(
    contract,
    'CheckIn',
    playerAddress ? [playerAddress] : undefined
  );

  // ===== COMPONENT STATE =====
  const [boatName, setBoatName] = useState('');
  const [isPirate, setIsPirate] = useState(true);
  const [startLocation, setStartLocation] = useState(50);
  const [travelDestination, setTravelDestination] = useState(0);

  // ===== HANDLERS =====
  const handleCreateAccount = async () => {
    if (!boatName.trim()) return;
    try {
      await createAccount(boatName, isPirate, startLocation);
      refetchAccount();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkIn();
      refetchAccount();
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  const handleBuyUpgrade = async (upgradeId: number) => {
    try {
      await buyUpgrade(upgradeId);
      refetchAccount();
    } catch (error) {
      console.error('Failed to buy upgrade:', error);
    }
  };

  const handleTravel = async (fast: boolean = false) => {
    if (travelDestination < 0 || travelDestination > 100) return;
    try {
      await travel(travelDestination, fast);
      refetchAccount();
    } catch (error) {
      console.error('Failed to travel:', error);
    }
  };

  const handleRepair = async () => {
    try {
      const location = account ? Number(account.location) : 0;
      const atPort = GAME_CONSTANTS.PORTS.includes(location as any);
      await repairShip(atPort, false);
      refetchAccount();
    } catch (error) {
      console.error('Failed to repair ship:', error);
    }
  };

  const handleBuyDiamonds = async (xtzAmount: number) => {
    try {
      await buyDiamonds(formatXTZ(xtzAmount));
      refetchAccount();
    } catch (error) {
      console.error('Failed to buy diamonds:', error);
    }
  };

  // ===== LOADING STATE =====
  if (contractLoading) {
    return <div className="p-4">Loading contract...</div>;
  }

  // ===== NO ACCOUNT STATE =====
  if (!account && !accountLoading) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Create Your Ship</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Boat Name (max 12 characters)
            </label>
            <input
              type="text"
              value={boatName}
              onChange={(e) => setBoatName(e.target.value)}
              maxLength={12}
              className="w-full p-2 border rounded"
              placeholder="Enter boat name..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Faction</label>
            <select
              value={isPirate ? 'pirate' : 'navy'}
              onChange={(e) => setIsPirate(e.target.value === 'pirate')}
              className="w-full p-2 border rounded"
            >
              <option value="pirate">🏴‍☠️ Pirate</option>
              <option value="navy">⚓ Navy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Starting Location</label>
            <input
              type="number"
              value={startLocation}
              onChange={(e) => setStartLocation(Number(e.target.value))}
              min={0}
              max={100}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            onClick={handleCreateAccount}
            disabled={!boatName.trim() || actionLoading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {actionLoading ? 'Creating...' : 'Create Account'}
          </button>
        </div>

        {actionError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {actionError}
          </div>
        )}
      </div>
    );
  }

  // ===== MAIN DASHBOARD =====
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Seas of Linkardia Dashboard</h1>

      {accountLoading ? (
        <div>Loading account...</div>
      ) : account ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PLAYER STATUS */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3">
              {account.boatName} {account.isPirate ? '🏴‍☠️' : '⚓'}
            </h2>
            
            <div className="space-y-2 text-sm">
              <div>Location: {account.location.toString()}</div>
              <div>HP: {account.hp.toString()}/100</div>
              <div>Gold: {account.gold.toString()}</div>
              <div>Diamonds: {account.diamonds.toString()}</div>
              <div>Level: {playerStatus.shipLevel}</div>
              <div>Crew: {account.crew.toString()}/{account.maxCrew.toString()}</div>
              <div>Check-in Streak: {account.checkInStreak.toString()}</div>
              
              {playerStatus.isWrecked && (
                <div className="text-red-600 font-bold">⚠️ Ship Wrecked!</div>
              )}
              
              {playerStatus.isTraveling && (
                <div className="text-blue-600">🚢 Traveling...</div>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-4 space-y-2">
              {playerStatus.canCheckIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="w-full bg-green-500 text-white p-2 rounded text-sm hover:bg-green-600"
                >
                  Check In (+{calculateCheckInReward(Number(account.crew), Number(account.checkInStreak) + 1)} gold)
                </button>
              )}

              {playerStatus.canRepair && (
                <button
                  onClick={handleRepair}
                  disabled={actionLoading}
                  className="w-full bg-red-500 text-white p-2 rounded text-sm hover:bg-red-600"
                >
                  Repair Ship
                </button>
              )}
            </div>
          </div>

          {/* UPGRADES */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3">Upgrades</h2>
            
            {upgradesLoading ? (
              <div>Loading upgrades...</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {upgrades.map((upgrade, index) => (
                  <div key={index} className="border p-2 rounded text-sm">
                    <div className="font-medium">{upgrade.name}</div>
                    <div className="text-gray-600">Cost: {upgrade.cost.toString()} gold</div>
                    <div className="text-xs text-gray-500">
                      {upgrade.hpBonus > 0 && `+${upgrade.hpBonus} HP `}
                      {upgrade.speedBonus > 0 && `+${upgrade.speedBonus} Speed `}
                      {upgrade.attackBonus > 0 && `+${upgrade.attackBonus} Attack `}
                      {upgrade.defenseBonus > 0 && `+${upgrade.defenseBonus} Defense `}
                    </div>
                    <button
                      onClick={() => handleBuyUpgrade(index)}
                      disabled={actionLoading || account.gold < upgrade.cost}
                      className="mt-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                    >
                      Buy
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRAVEL & MAP */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3">Travel & Map</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Travel Destination (0-100)
                </label>
                <input
                  type="number"
                  value={travelDestination}
                  onChange={(e) => setTravelDestination(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>

              {playerStatus.canTravel && (
                <div className="space-y-1">
                  <button
                    onClick={() => handleTravel(false)}
                    disabled={actionLoading}
                    className="w-full bg-blue-500 text-white p-2 rounded text-sm hover:bg-blue-600"
                  >
                    Travel (Normal)
                  </button>
                  <button
                    onClick={() => handleTravel(true)}
                    disabled={actionLoading || account.diamonds === 0n}
                    className="w-full bg-purple-500 text-white p-2 rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                  >
                    Fast Travel (1 Diamond)
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  View Location Ships
                </label>
                <input
                  type="number"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>

              {shipsLoading ? (
                <div className="text-sm">Loading ships...</div>
              ) : (
                <div className="max-h-32 overflow-y-auto text-sm">
                  <div className="font-medium">Ships at location {selectedLocation}:</div>
                  {ships.length === 0 ? (
                    <div className="text-gray-500">No ships here</div>
                  ) : (
                    ships.map((ship, index) => (
                      <div key={index} className="py-1 border-b">
                        {ship.name} (Level {ship.level.toString()})
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RANKING */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3">Top Players</h2>
            
            {rankingLoading ? (
              <div>Loading ranking...</div>
            ) : (
              <div className="space-y-1 text-sm">
                {ranking.map((entry, index) => (
                  <div key={index} className="flex justify-between py-1 border-b">
                    <span>#{index + 1}</span>
                    <span className="text-xs">{entry.address.slice(0, 8)}...</span>
                    <span>Level {entry.level.toString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DIAMONDS */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3">Buy Diamonds</h2>
            
            <div className="space-y-2">
              {GAME_CONSTANTS.DIAMOND_PACKAGES.map((pkg, index) => (
                <button
                  key={index}
                  onClick={() => handleBuyDiamonds(pkg.xtz)}
                  disabled={actionLoading}
                  className="w-full bg-yellow-500 text-white p-2 rounded text-sm hover:bg-yellow-600"
                >
                  {pkg.diamonds} 💎 for {pkg.xtz} XTZ
                </button>
              ))}
            </div>
          </div>

          {/* RECENT EVENTS */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3">Recent Check-ins</h2>
            
            <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
              {checkInEvents.length === 0 ? (
                <div className="text-gray-500">No recent check-ins</div>
              ) : (
                checkInEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="py-1 border-b">
                    Streak: {event.streak?.toString()} | Reward: {event.reward?.toString()} gold
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {actionError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {actionError}
        </div>
      )}
    </div>
  );
} 