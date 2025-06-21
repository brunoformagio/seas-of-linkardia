"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "./Modal";
import Button from "./Button";
import { useGameContract } from "../libs/hooks/useGameContract";
import { usePlayer } from "../libs/providers/player-provider";

interface AccountCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: () => void;
}

type Step = 'faction' | 'ship-name' | 'creating' | 'success';

export function AccountCreationModal({ isOpen, onClose, onAccountCreated }: AccountCreationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('faction');
  const [selectedFaction, setSelectedFaction] = useState<'pirate' | 'navy' | null>(null);
  const [shipName, setShipName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  
  const gameContract = useGameContract();
  const { forceRefresh } = usePlayer();

  const resetModal = () => {
    setCurrentStep('faction');
    setSelectedFaction(null);
    setShipName('');
    setIsCreating(false);
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleFactionSelect = (faction: 'pirate' | 'navy') => {
    setSelectedFaction(faction);
    setCurrentStep('ship-name');
  };

  const handleShipNameSubmit = () => {
    if (shipName.trim().length === 0) {
      setError('Ship name cannot be empty');
      return;
    }
    if (shipName.length > 12) {
      setError('Ship name must be 12 characters or less');
      return;
    }
    setError('');
    setCurrentStep('creating');
    createAccount();
  };

  const createAccount = async () => {
    if (!gameContract.isReady || !selectedFaction) return;
    
    setIsCreating(true);
    try {
      // Generate random starting location (0-100)
      const startLocation = Math.floor(Math.random() * 101);
      const isPirate = selectedFaction === 'pirate';
      
      // Check if createAccount exists before calling it
      if ('createAccount' in gameContract) {
        await gameContract.createAccount(shipName.trim(), isPirate, startLocation);
      } else {
        throw new Error('Contract not ready');
      }
      
      setCurrentStep('success');
      
      // Force refresh player data immediately
      forceRefresh();
      
      // Also trigger the parent callback
      onAccountCreated();
    } catch (error) {
      console.error('Error creating account:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
      setCurrentStep('ship-name'); // Go back to previous step
    } finally {
      setIsCreating(false);
    }
  };

  const renderFactionStep = () => (
    <div className="text-center">
      <h2 className="!text-2xl font-bold text-[#fbc988] mb-6">Choose Your Faction</h2>
      <p className="text-gray-300 mb-8">
        Will you sail under the black flag of piracy, or serve with honor in the navy?
      </p>
      
      <div className="flex gap-6 justify-center mb-8">
        {/* Pirates Option */}
        <div 
          className={`cursor-pointer p-4 ui2 rounded-lg  flex flex-col items-center justify-center hover:scale-105 ${
            selectedFaction === 'pirate' 
              ? 'scale-105 !brightness-125' 
              : 'scale-100'
          }`}
          onClick={() => setSelectedFaction('pirate')}
        >
          <Image 
          unoptimized
            src="/flags/pirates_flag.webp" 
            alt="Pirates Flag" 
            width={120} 
            height={80}
            className="mb-3"
          />
          <h3 className="text-lg font-bold text-[#fbc988]">Pirates</h3>
          <p className="text-sm mt-2">
            Freedom and chaos.
            Plunder and adventure await!
          </p>
        </div>

        {/* Navy Option */}
        <div 
          className={`cursor-pointer p-4 ui2 rounded-lg  flex flex-col items-center justify-center hover:scale-105 ${
            selectedFaction === 'navy' 
              ? 'scale-105 !brightness-125' 
              : 'scale-100'
          }`}
          onClick={() => setSelectedFaction('navy')}
        >
          <Image 
          unoptimized
            src="/flags/navy_flag.webp" 
            alt="Navy Flag" 
            width={120} 
            height={80}
            className="mb-3"
          />
          <h3 className="!text-lg font-bold text-[#fbc988]">Navy</h3>
          <p className="text-sm  mt-2">
            Honor and discipline.
            Protect the innocent seas!
          </p>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={() => selectedFaction && handleFactionSelect(selectedFaction)}
          disabled={!selectedFaction}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderShipNameStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-6">Name Your Ship</h2>
      <p className="text-gray-300 mb-6">
        Every great {selectedFaction === 'pirate' ? 'pirate' : 'naval'} vessel needs a legendary name.
        Choose wisely, captain!
      </p>

      <div className="mb-6 h-[128px]  overflow-hidden relative flex items-center justify-center">
        <Image 
          src="/ships/0.gif" 
          alt="Your Ship" 
          width={256} 
          height={256}
          className="min-h-[256px] absolute bottom-0 mx-auto mb-4"
        />
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={shipName}
          onChange={(e) => setShipName(e.target.value)}
          placeholder="Enter ship name..."
          maxLength={12}
          className="ui5 w-full max-w-xs mx-auto p-4 rounded-md text-black placeholder-gray-400 focus:outline-none focus:border-blue-500"
          autoFocus
        />
        <p className="text-sm text-gray-400 mt-2">
          {shipName.length}/12 characters
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={() => setCurrentStep('faction')}>
          Back
        </Button>
        <Button 
          variant="primary" 
          onClick={handleShipNameSubmit}
          disabled={shipName.trim().length === 0}
        >
          Create Account
        </Button>
      </div>
    </div>
  );

  const renderCreatingStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-6">Creating Your Account</h2>
      
      <div className="mb-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-300 mb-2">
          Setting sail for the Seas of Linkardia...
        </p>
        <p className="text-sm text-gray-400">
          Your ship "{shipName}" is being prepared for {selectedFaction === 'pirate' ? 'piracy' : 'naval service'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-green-400 mb-6">Welcome Aboard, Captain!</h2>
      
      <div className="mb-6">
        <Image 
          src="/ships/0.gif" 
          alt="Your Ship" 
          width={150} 
          height={100}
          className="mx-auto mb-4"
        />
        <p className="text-lg text-white mb-2">
          The "{shipName}" is ready for adventure!
        </p>
        <p className="text-sm text-gray-400">
          {selectedFaction === 'pirate' ? 'Pirate' : 'Navy'} • Starting Location: Random Port
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
        <h3 className="text-lg font-bold text-white mb-3">Captain's Tips:</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• Check in daily to earn gold and maintain your crew</li>
          <li>• Visit ports (locations 25, 55, 89) for faster repairs</li>
          <li>• Attack other players to steal their gold, but beware retaliation!</li>
          <li>• Upgrade your ship with Hull, Cannons, Speed, and Crew improvements</li>
          <li>• Travel to different locations to find the best opportunities</li>
          <li>• Use diamonds for instant repairs and premium upgrades</li>
        </ul>
      </div>

      <Button variant="primary" onClick={handleClose} className="w-full">
        Set Sail! ⚓
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'faction':
        return renderFactionStep();
      case 'ship-name':
        return renderShipNameStep();
      case 'creating':
        return renderCreatingStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderFactionStep();
    }
  };

  return (
    <Modal removeCloseButton open={isOpen} setOpen={currentStep !== 'creating' ? () => handleClose() : () => {}}>
      <div className="w-full max-w-2xl mx-auto p-6">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {['faction', 'ship-name', 'creating', 'success'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    currentStep === step 
                      ? 'bg-blue-500' 
                      : ['faction', 'ship-name', 'creating', 'success'].indexOf(currentStep) > index
                        ? 'bg-green-500'
                        : 'bg-gray-600'
                  }`}
                />
                {index < 3 && (
                  <div 
                    className={`w-8 h-0.5 ${
                      ['faction', 'ship-name', 'creating', 'success'].indexOf(currentStep) > index
                        ? 'bg-green-500'
                        : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {renderCurrentStep()}
      </div>
    </Modal>
  );
} 