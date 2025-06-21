"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import type { ReactNode } from "react";

interface ThirdwebProviderWrapperProps {
  children: ReactNode;
}

// Create Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Define Etherlink Mainnet chain
const etherlinkMainnet = defineChain({
  id: 42793,
  name: "Etherlink Mainnet",
  nativeCurrency: {
    name: "XTZ",
    symbol: "XTZ",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ETHERLINK_RPC_URL_MAINNET || "https://node.mainnet.etherlink.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherlink Explorer",
      url: process.env.NEXT_PUBLIC_ETHERLINK_EXPLORER_BROWSER_URL_MAINNET || "https://explorer.etherlink.com",
    },
  },
  testnet: false,
});

// Define Etherlink Testnet chain
const etherlinkTestnet = defineChain({
  id: 128123,
  name: "Etherlink Testnet",
  nativeCurrency: {
    name: "XTZ",
    symbol: "XTZ",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ETHERLINK_RPC_URL_TESTNET || "https://node.ghostnet.etherlink.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherlink Testnet Explorer",
      url: process.env.NEXT_PUBLIC_ETHERLINK_EXPLORER_BROWSER_URL_TESTNET || "https://testnet.explorer.etherlink.com",
    },
  },
  testnet: true,
});

export function ThirdwebProviderWrapper({ children }: ThirdwebProviderWrapperProps) {
  if (!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID) {
    console.error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set");
    return <>{children}</>;
  }

  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}

// Export the client and chains for use in other components
export { client, etherlinkMainnet, etherlinkTestnet }; 