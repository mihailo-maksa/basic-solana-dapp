import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import {
  RPC_URL_MAINNET,
  RPC_URL_RINKEBY,
  CHAIN_ID_MAINNET,
  CHAIN_ID_KOVAN,
  CHAIN_ID_ROPSTEN,
  CHAIN_ID_RINKEBY,
  CHAIN_ID_GOERLI,
} from '../../../constants'

// MetaMask
export const injected = new InjectedConnector({
  supportedChainIds: [
    CHAIN_ID_MAINNET,
    CHAIN_ID_KOVAN,
    CHAIN_ID_ROPSTEN,
    CHAIN_ID_RINKEBY,
    CHAIN_ID_GOERLI,
  ],
})

// WalletConnect
export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: RPC_URL_MAINNET,
    4: RPC_URL_RINKEBY,
  },
  qrcode: true,
  // pollingInterval: 15000,
})

export const resetWalletConnector = (connector: WalletConnectConnector) => {
  if (connector && connector instanceof WalletConnectConnector) {
    connector.walletConnectProvider = undefined
  }
}

// Coinbase Wallet
export const walletlink = new WalletLinkConnector({
  url: RPC_URL_RINKEBY,
  appName: 'Master Ethers.js',
  supportedChainIds: [CHAIN_ID_MAINNET, CHAIN_ID_RINKEBY],
})
