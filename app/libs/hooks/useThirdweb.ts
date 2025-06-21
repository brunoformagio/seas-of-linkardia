"use client";

import { useActiveAccount, useActiveWallet, useWalletBalance } from "thirdweb/react";
import { client, etherlinkMainnet, etherlinkTestnet } from "../providers/thirdweb-provider";

/**
 * Custom hook to simplify Thirdweb usage in the Seas Of Linkardia app
 * Provides wallet connection state, balance, and network information
 */
export function useThirdweb() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  
  // Determine active chain based on environment
  const getActiveChain = () => {
    const networkType = process.env.NEXT_PUBLIC_NETWORK_TYPE || process.env.NEXT_PUBLIC_NETWORK;
    return networkType === "mainnet" ? etherlinkMainnet : etherlinkTestnet;
  };

  const activeChain = getActiveChain();
  
  // Get wallet balance for the active chain
  const { data: balance, isLoading: isLoadingBalance } = useWalletBalance({
    client,
    chain: activeChain,
    address: account?.address,
  });

  // Helper functions
  const isConnected = !!account && !!wallet;
  const address = account?.address;
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;
  
  const isMainnet = activeChain.id === etherlinkMainnet.id;
  const isTestnet = activeChain.id === etherlinkTestnet.id;
  
  const networkName = isMainnet ? "Etherlink Mainnet" : "Etherlink Testnet";
  const explorerUrl = isMainnet 
    ? process.env.NEXT_PUBLIC_ETHERLINK_EXPLORER_BROWSER_URL_MAINNET || "https://explorer.etherlink.com"
    : process.env.NEXT_PUBLIC_ETHERLINK_EXPLORER_BROWSER_URL_TESTNET || "https://testnet.explorer.etherlink.com";

  return {
    // Connection state
    isConnected,
    account,
    wallet,
    address,
    shortAddress,
    
    // Balance
    balance,
    isLoadingBalance,
    
    // Network info
    activeChain,
    isMainnet,
    isTestnet,
    networkName,
    explorerUrl,
    
    // Thirdweb client
    client,
    
    // Available chains
    chains: {
      mainnet: etherlinkMainnet,
      testnet: etherlinkTestnet,
    },
  };
} 