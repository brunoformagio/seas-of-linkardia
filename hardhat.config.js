require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Load environment variables or provide defaults
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1  // Optimize for size, not gas efficiency
      }
    }
  },
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
      mining: {
        auto: true,
        interval: 5000
      }
    },
    // Local test network
    localhost: {
      url: process.env.ETHERLINK_RPC_URL_LOCALHOST,
      chainId: Number(process.env.ETHERLINK_CHAIN_ID_LOCALHOST) || 31337
    },
    etherlinkMainnet: {
        chainId: Number(process.env.ETHERLINK_CHAIN_ID_MAINNET) || 42793,
        url: process.env.ETHERLINK_RPC_URL_MAINNET || "https://node.mainnet.etherlink.com",
        accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
    },
    etherlinkTestnet: {
        chainId: Number(process.env.ETHERLINK_CHAIN_ID_TESTNET) || 128123,
        url: process.env.ETHERLINK_RPC_URL_TESTNET || "https://node.ghostnet.etherlink.com",
        accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
    }
  },
  // Contract verification settings
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
        {
            network: "etherlinkMainnet",
            chainId: Number(process.env.ETHERLINK_CHAIN_ID_MAINNET) || 42793,
            urls: {
              apiURL: process.env.ETHERLINK_EXPLORER_API_URL_MAINNET,
              browserURL: process.env.ETHERLINK_EXPLORER_BROWSER_URL_MAINNET,
            },
          },{
            network: "etherlinkTestnet",
            chainId: Number(process.env.ETHERLINK_CHAIN_ID_TESTNET) || 128123,
            urls: {
              apiURL: process.env.ETHERLINK_EXPLORER_API_URL_TESTNET,
              browserURL: process.env.ETHERLINK_EXPLORER_BROWSER_URL_TESTNET,
            },
          },
    ]
  },
  // Gas reporting for optimization
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice"
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
}; 