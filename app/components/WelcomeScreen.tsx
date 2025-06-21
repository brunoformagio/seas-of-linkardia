"use client";

import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { Modal } from "./Modal";
import Button from "./Button";
import { useThirdweb } from "../libs/hooks/useThirdweb";
import { useGameContract } from "../libs/hooks/useGameContract";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";

// Configure supported wallets (same as Header)
const wallets = [
  createWallet("io.metamask"), // MetaMask
  inAppWallet({
    auth: {
      options: ["google", "discord", "telegram", "farcaster", "email", "x", "coinbase", "apple", "facebook"],
    },
  }), // SSO options
];

export const WelcomeScreen = () => {
  const { isConnected, address, client, activeChain } = useThirdweb();
  const gameContract = useGameContract();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check if user has an account when wallet connects
  useEffect(() => {
    const checkUserAccount = async () => {
      if (!isConnected || !address || !gameContract.isReady) {
        setHasAccount(null);
        return;
      }

      if (!('getPlayerAccount' in gameContract)) {
        setHasAccount(false);
        return;
      }

      try {
        const account = await gameContract.getPlayerAccount(address);
        // Check if account exists (hp > 0 indicates an active account)
        const accountExists = account && Number(account[4]) > 0;
        setHasAccount(accountExists);
      } catch (error) {
        console.error("Error checking account:", error);
        setHasAccount(false);
      }
    };

    checkUserAccount();
  }, [isConnected, address, gameContract.isReady]);

  // Determine when to show the modal
  useEffect(() => {
    if (!isConnected) {
      // Show modal if wallet not connected
      setShowModal(true);
    } else if (hasAccount === false) {
      // Show modal if connected but no account
      setShowModal(true);
    } else if (hasAccount === true) {
      // Hide modal if user has account
      setShowModal(false);
    }
    // If hasAccount is null (loading), keep current state
  }, [isConnected, hasAccount]);

  const handleLogin = async () => {
    // If wallet not connected, this function won't be called
    // The ConnectButton will handle connection
    if (!gameContract.isReady || !address) {
      setLoginError("Game contract not ready. Please wait a moment.");
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    try {
      if (!('getPlayerAccount' in gameContract)) {
        setLoginError("Game contract not available");
        return;
      }
      
      const account = await gameContract.getPlayerAccount(address);
      
      // Check if account exists (hp > 0 indicates an active account)
      if (account && Number(account[4]) > 0) {
        // Account exists, proceed to game
        console.log("Account found:", {
          boatName: account[0],
          isPirate: account[1],
          gold: Number(account[2]),
          hp: Number(account[4]),
          location: Number(account[10])
        });
        
        setHasAccount(true);
        alert(`Welcome back, ${account[0]}! Proceeding to game...`);
      } else {
        // No account found
        setHasAccount(false);
        setLoginError("Oops! No account found for this wallet. Please create an account first.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Failed to check account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    // TODO: Navigate to account creation form
    alert("Account creation form coming soon!");
  };

  // Render different content based on connection status
  const renderContent = () => {
    if (!isConnected) {
      return {
        title: "Welcome to Seas of Linkardia",
        subtitle: "Connect your wallet to start your maritime adventure and explore the seas!",
        showLoginButton: true, // Show connect wallet button
        showCreateButton: false,
        showConnectPrompt: false
      };
    }

    if (hasAccount === null && gameContract.isReady) {
      return {
        title: "Welcome to Seas of Linkardia",
        subtitle: "Checking your account...",
        showLoginButton: false,
        showCreateButton: false,
        showConnectPrompt: false
      };
    }

    if (hasAccount === false) {
      return {
        title: "Welcome to Seas of Linkardia",
        subtitle: "A game about exploring, fighting, and upgrading your ship to become the most powerful authority in the seas. Are you ready to set sail, captain?",
        showLoginButton: true,
        showCreateButton: true,
        showConnectPrompt: false
      };
    }

    // This case shouldn't show the modal, but just in case
    return {
      title: "Welcome back!",
      subtitle: "Loading your ship...",
      showLoginButton: false,
      showCreateButton: false,
      showConnectPrompt: false
    };
  };

  const content = renderContent();

  return (
    showModal && (
      <Modal
        containerClassName="mt-10 md:mt-0 !overflow-visible text-center flex items-center justify-center"
        removeCloseButton
        open={true}
        setOpen={() => {}}
      >
        <Logo className="mt-[-90px]" />
        <h1 className="text-white !text-2xl font-bold mt-5">
          {content.title}
        </h1>
        <p className="text-white text-lg">
          {content.subtitle}
        </p>
        
        {content.showConnectPrompt && (
          <div className="my-6 p-4 bg-blue-500/20 border border-blue-500 rounded-md">
            <p className="text-blue-300 text-sm">
              Please connect your wallet using the "Connect Wallet" button in the top right corner.
            </p>
          </div>
        )}
        

        
        {(content.showLoginButton || content.showCreateButton) && (
          <div className="mt-10 flex gap-2">
            {content.showLoginButton && (
              <>
                {!isConnected ? (
                  <ConnectButton
                    client={client}
                    wallets={wallets}
                    chain={activeChain}
                    connectModal={{
                      size: "wide",
                      title: "Connect to Seas Of Linkardia",
                      welcomeScreen: {
                        title: "Welcome to Seas Of Linkardia",
                        subtitle: "Connect your wallet to start your maritime adventure",
                        img: {
                          src: "/logo.png",
                          width: 150,
                          height: 150,
                        },
                      },
                    }}
                    theme="dark"
                    connectButton={{
                      label: "Login / Connect Wallet",
                      style: {
                        backgroundColor: "#374151",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "1px solid #4B5563",
                        cursor: "pointer",
                        fontWeight: "500",
                      },
                    }}
                  />
                ) : (
                  <Button 
                    variant="secondary" 
                    onClick={handleLogin}
                    disabled={!gameContract.isReady || isLoading}
                  >
                    {isLoading ? "Checking..." : "Login"}
                  </Button>
                )}
              </>
            )}
            {content.showCreateButton && (
              <Button 
                onClick={handleCreateAccount}
                disabled={isLoading}
              >
                Create an Account
              </Button>
            )}
          </div>
        )}
                {loginError && (
          <div className="m-4 p-3 bg-red-500/20 border border-red-500 ">
            <p className="text-red-300 text-sm">{loginError}</p>
          </div>
        )}
        {!gameContract.isReady && isConnected && (
          <p className="text-yellow-300 text-sm">
            Loading contract...
          </p>
        )}

        <div className="mb-5 "/>
      </Modal>
    )
  );
}; 