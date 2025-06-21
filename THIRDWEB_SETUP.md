# Thirdweb Integration for Seas Of Linkardia

This document explains how Thirdweb has been integrated into the Seas Of Linkardia dApp for Etherlink network support.

## Setup Complete ✅

The following components have been set up:

### 1. Thirdweb Provider (`app/libs/providers/thirdweb-provider.tsx`)
- Configured for Etherlink Mainnet and Testnet
- Uses Thirdweb v5 SDK
- Supports network switching based on environment variables

### 2. Updated Header Component (`app/components/Header.tsx`)
- Connect wallet button with SSO and MetaMask support
- Displays connected wallet address and network
- Branded connect modal with game assets

### 3. Custom Hooks
- `useThirdweb()` - Main hook for wallet state and chain info
- `useSeasOfLinkardiaContract()` - Contract interaction helper
- `useGameContract()` - Game-specific contract utilities

## Supported Wallets

As requested, only the following wallets are supported:
- **MetaMask** - Browser extension wallet
- **SSO Options** - Google, Discord, Telegram, Farcaster, Email, X (Twitter), Coinbase, Apple, Facebook

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=8e4c6055d827f6e5603e2dfbe4a8b766
THIRDWEB_SECRET_KEY=7uanm9VsmOYJHpbK3HpPY5YmUG2WEPlNBpVL5BQE-zYMUjDwA_gI7mJrC-z8zg3rbfnUFebgqfAujI-On6Eztw

# Network Configuration
NEXT_PUBLIC_NETWORK_TYPE=testnet

# Contract Addresses (set after deployment)
NEXT_PUBLIC_SEASOFLINKARDIA_CONTRACT_ADDRESS_TESTNET=your_testnet_contract_address
NEXT_PUBLIC_SEASOFLINKARDIA_CONTRACT_ADDRESS_MAINNET=your_mainnet_contract_address
```

## Usage Examples

### Basic Wallet Connection
```tsx
import { useThirdweb } from "../libs/hooks/useThirdweb";

function MyComponent() {
  const { isConnected, address, shortAddress, networkName } = useThirdweb();
  
  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }
  
  return (
    <div>
      <p>Connected: {shortAddress}</p>
      <p>Network: {networkName}</p>
    </div>
  );
}
```

### Contract Interaction
```tsx
import { useGameContract } from "../libs/hooks/useContract";

function GameComponent() {
  const { contract, isReady, playerAddress } = useGameContract();
  
  if (!isReady) {
    return <div>Connect wallet to play</div>;
  }
  
  // Use contract for game interactions
  // Example: const result = await readContract({ contract, method: "getPlayerData", args: [playerAddress] });
  
  return <div>Game ready for {playerAddress}</div>;
}
```

## Network Configuration

The app automatically switches between:
- **Testnet**: Etherlink Testnet (Chain ID: 128123)
- **Mainnet**: Etherlink Mainnet (Chain ID: 42793)

Based on the `NEXT_PUBLIC_NETWORK_TYPE` environment variable.

## Next Steps

1. Deploy your contracts to both networks
2. Update the contract address environment variables
3. Test wallet connections on both networks
4. Implement game-specific contract interactions using the provided hooks

## Troubleshooting

- Ensure `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` is set correctly
- Check network configuration matches your deployment
- Verify contract addresses are set for the active network
- Make sure wallet is connected to the correct Etherlink network 