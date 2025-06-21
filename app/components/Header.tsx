"use client";

import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { useThirdweb } from "../libs/hooks/useThirdweb";
import { Logo } from "./Logo";

// Configure supported wallets (SSO and MetaMask only as requested)
const wallets = [
  createWallet("io.metamask"), // MetaMask
  inAppWallet({
    auth: {
      options: ["google", "discord", "telegram", "farcaster", "email", "x", "coinbase", "apple", "facebook"],
    },
  }), // SSO options
];

export const Header = () => {
  const { isConnected, shortAddress, client, activeChain, networkName } = useThirdweb();

  return (
    <header className="flex items-center justify-between p-10 w-screen">
      <Logo/>
      
      <div className="flex items-center gap-4">
        
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
              backgroundColor: "white",
              color: "black",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
            },
          }}
        />
      </div>
    </header>
  );
};
