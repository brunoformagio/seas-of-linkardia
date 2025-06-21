"use client";

import { getContract } from "thirdweb";
import { useThirdweb } from "./useThirdweb";

/**
 * Hook to get the SeasOfLinkardia contract instance
 * Returns the contract ready for read/write operations
 */
export function useSeasOfLinkardiaContract() {
  const { client, activeChain, isMainnet, isTestnet } = useThirdweb();

  // Get contract address based on network
  const getContractAddress = () => {
    if (isMainnet) {
      return process.env.NEXT_PUBLIC_SEASOFLINKARDIA_CONTRACT_ADDRESS_MAINNET;
    }
    if (isTestnet) {
      return process.env.NEXT_PUBLIC_SEASOFLINKARDIA_CONTRACT_ADDRESS_TESTNET;
    }
    return process.env.NEXT_PUBLIC_SEASOFLINKARDIA_CONTRACT_ADDRESS_LOCALHOST;
  };

  const contractAddress = getContractAddress();

  // Return contract instance if address is available
  if (!contractAddress) {
    console.warn(`Contract address not set for current network: ${activeChain.name}`);
    return null;
  }

  const contract = getContract({
    client,
    chain: activeChain,
    address: contractAddress,
  });

  return {
    contract,
    contractAddress,
    isMainnet,
    isTestnet,
    networkName: activeChain.name,
  };
}

/**
 * Example usage hook - demonstrates common contract interactions
 * You can expand this with your specific game functions
 */
export function useGameContract() {
  const contractData = useSeasOfLinkardiaContract();
  const { isConnected, account } = useThirdweb();

  if (!contractData || !isConnected) {
    return {
      contract: null,
      isReady: false,
      ...contractData,
    };
  }

  return {
    ...contractData,
    isReady: true,
    playerAddress: account?.address,
  };
} 