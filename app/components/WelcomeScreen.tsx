"use client";

import { useState, useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { Modal } from "./Modal";
import Button from "./Button";
import { useThirdweb } from "../libs/hooks/useThirdweb";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { AccountCreationModal } from "./AccountCreationModal";
import { usePlayer } from "../libs/providers/player-provider";
import Image from "next/image";

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
  const { isConnected, address, client, activeChain, isTestnet, isMainnet, balance, isLoadingBalance } = useThirdweb();
  const { playerAccount, isLoading: playerLoading, forceRefresh } = usePlayer();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [isRecheckingAccount, setIsRecheckingAccount] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // Audio ref for background music
  const audioRef = useRef<HTMLAudioElement>(null);

  // Determine if user has account based on playerAccount from provider
  const hasAccount = playerAccount !== null;

  // The PlayerProvider handles account checking automatically

  // Determine when to show the modal
  useEffect(() => {
    if (!isConnected) {
      // Show modal if wallet not connected
      setShowModal(true);
    } else if (!hasAccount && !playerLoading) {
      // Show modal if connected but no account (and not loading)
      setShowModal(true);
    } else if (hasAccount) {
      // Hide modal if user has account
      setShowModal(false);
    }
    // If still loading, keep current state
  }, [isConnected, hasAccount, playerLoading]);

  // Handle background music when modal shows/hides
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (showModal) {
      // Try to play music when modal shows
      const playMusic = async () => {
        try {
          await audio.play();
          setIsMusicPlaying(true);
        } catch (error) {
          console.log("Auto-play prevented by browser policy:", error);
          setIsMusicPlaying(false);
        }
      };
      playMusic();
    } else {
      // Stop music when modal hides
      audio.pause();
      audio.currentTime = 0;
      setIsMusicPlaying(false);
    }
  }, [showModal]);

  // Add click handler to play music when modal is showing
  useEffect(() => {
    if (!showModal) return;

    const handleClick = () => {
      const audio = audioRef.current;
      if (!audio || isMusicPlaying) return;

      audio.play().then(() => {
        setIsMusicPlaying(true);
      }).catch((error) => {
        console.error("Failed to play music on click:", error);
      });
    };

    // Add click listener to document
    document.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [showModal, isMusicPlaying]);

  // Cleanup audio on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Toggle music function
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      audio.play().then(() => {
        setIsMusicPlaying(true);
      }).catch((error) => {
        console.error("Failed to play music:", error);
      });
    }
  };

  // Faucet URL and zero-balance detection (Etherlink Testnet)
  const faucetUrl = process.env.NEXT_PUBLIC_ETHERLINK_FAUCET_URL || "https://faucet.etherlink.com";
  const getNumericBalance = () => {
    if (!balance) return 0;
    const anyBal: any = balance;
    if (typeof anyBal?.value === "bigint") return Number(anyBal.value);
    if (typeof anyBal?.value === "number") return anyBal.value;
    if (typeof anyBal?.displayValue === "string") return parseFloat(anyBal.displayValue);
    return 0;
  };
  const hasZeroBalance = isConnected && isTestnet && !isLoadingBalance && getNumericBalance() <= 0;

  const handleLogin = async () => {
    // Since PlayerProvider handles account checking, we can simplify this
    if (!isConnected || !address) {
      setLoginError("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    try {
      if (playerAccount) {
        // Account exists, proceed to game
        console.log("Account found:", {
          boatName: playerAccount.boatName,
          isPirate: playerAccount.isPirate,
          gold: playerAccount.gold,
          hp: playerAccount.hp,
          location: playerAccount.location
        });
        
        alert(`Welcome back, ${playerAccount.boatName}! Proceeding to game...`);
        setShowModal(false);
      } else {
        // No account found
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
    setShowAccountCreation(true);
  };

  const handleAccountCreated = () => {
    // Refresh account status after successful creation
    setShowAccountCreation(false);
    setIsRecheckingAccount(true);
    // Add a small delay to ensure transaction is processed
    setTimeout(() => {
      forceRefresh(); // This will trigger a recheck
    }, 2000); // 2 second delay
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

    if (playerLoading && isConnected) {
      return {
        title: "Welcome to Seas of Linkardia",
        subtitle: isRecheckingAccount ? "Account created! Verifying on blockchain..." : "Checking your account...",
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
    <>
      {/* Background Music Audio Element */}
      <audio
        ref={audioRef}
        src="/songs/s1.mp3"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />
      
      {showModal && (
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
                    <span className="ui2 hover:scale-105 transition-all duration-100 relative p-3">
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
                        label: "Connect Wallet",
                        style: {
                          backgroundColor: "transparent",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "500",
                        },
                      }}
                    /></span>
                  ) : (
                    <Button 
                      variant="secondary" 
                      onClick={handleLogin}
                      disabled={playerLoading || isLoading}
                    >
                      {isLoading ? "Checking..." : "Login"}
                    </Button>
                  )}
                </>
              )}
              {content.showCreateButton && (
                <Button 
                  className={hasZeroBalance ? "opacity-50 cursor-not-allowed" : ""}
                  onClick={handleCreateAccount}
                  disabled={isLoading || hasZeroBalance}
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
          {playerLoading && isConnected && (
            <p className="text-yellow-300 text-sm">
              Loading player data...
            </p>
          )}

          <div className="mb-5 "/>

          {/* Network Warning - Only show if connected but not on Etherlink Testnet */}
          {isConnected && !isTestnet && (
            <div className="text-white text-sm bg-red-500/20 border border-red-500 rounded-md p-2">
              You're not connected to Etherlink Testnet. Please switch to Etherlink Testnet to play.
            </div>
          )}

          {/* Zero balance warning and faucet link (Testnet only) */}
          {isConnected && isTestnet && hasZeroBalance && (
            <div className="flex flex-col items-center justify-center px-4 pb-4 mt-3">
            <div className=" p-3 bg-yellow-500/10  text-left">
              <p className="text-yellow-300 text-sm mb-2">
                Your wallet ( {address} ) has 0 XTZ on Etherlink Testnet. You need at least 0.1 testnet XTZ to play (to cover on-chain actions).
              </p>
              <a
                href={faucetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block ui2 w-full text-center  p-4 text-white hover:brightness-110"
              >
                Get Testnet XTZ from Faucet
              </a>
            </div></div>
          )}
        </Modal>
      )}
      
      {showAccountCreation && (
        <AccountCreationModal
          isOpen={showAccountCreation}
          onClose={() => setShowAccountCreation(false)}
          onAccountCreated={handleAccountCreated}
        />
      )}


                {/* Music Control Button */}
                <button
            onClick={toggleMusic}
            className={`absolute ${showModal ? "top-4 right-4" : "top-[40px] right-[220px]"} z-10 p-2 text-white hover:scale-110 transition-transform duration-200`}
            title={isMusicPlaying ? "Mute Music" : "Play Music"}
          >
            {isMusicPlaying ? <Image src="/music_on.gif" alt="Sound" width={40} height={40} /> : <Image src="/music_off.gif" alt="Mute" width={40} height={40} />}
          </button>
          {showModal && <button className="hover:opacity-100 transition-opacity duration-200 text-white opacity-50 absolute text-center  border-white/10 bottom-0 left-0 w-full h-[50px] z-10">
          Made with love and rum using <a href="https://www.etherlink.com/" target="_blank" className="text-[hsla(152,100%,62%,1)] !cursor-pointer">Etherlink</a>  by <a href="http://github.com/brunoformagio/" target="_blank" className="text-[hsla(152,100%,62%,1)] !cursor-pointer">Bruno Formagio</a>
          </button>}
    </>
  );
}; 