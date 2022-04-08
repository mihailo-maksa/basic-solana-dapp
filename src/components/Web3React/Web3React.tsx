import React from 'react'
import { useWeb3React } from '@web3-react/core'
import {
  injected,
  walletconnect,
  resetWalletConnector,
  walletlink,
} from './Helpers/connectors'
import { getContract } from './Helpers/contract'

interface Props {}

// Known Issues:
// 1.) MetaMask: /
// 2.) WalletConnect: HTTPS (solution: use a library that allows you to go to localhost via HTTPS)
// 3.) WalletLink (Coinbase Wallet): logout is not reflected in the localStorage (solution: clear it manuallu)

const Web3React: React.FC<Props> = (): JSX.Element => {
  const web3React = useWeb3React()

  const {
    active,
    account,
    chainId,
    library,
    error,
    connector,
    activate,
    deactivate,
  } = web3React

  console.log({
    active,
    account,
    chainId,
    library,
    error,
    connector,
    activate,
    deactivate,
  })

  const disconnect = () => {
    try {
      deactivate()
    } catch (error) {
      console.error(error)
    }
  }

  const writeContract = async () => {
    try {
      const randomNumber = Math.floor(Math.random() * 100)
      const testContract = getContract(library, account)

      const tx = await testContract.setData(randomNumber)
      await tx.wait()

      console.log({ tx })
      alert('Random number set to ' + randomNumber)
    } catch (error) {
      console.error(error)
    }
  }

  const connectMetaMask = async () => {
    try {
      await activate(injected)
    } catch (error) {
      console.error(error)
    }
  }

  const connectWalletConnect = async () => {
    try {
      resetWalletConnector(walletconnect)
      await activate(walletconnect)
    } catch (error) {
      console.error(error)
    }
  }

  const connectCoinbaseWallet = async () => {
    try {
      await activate(walletlink)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="App">
      <h1>Web3React</h1>
      <p>{account ? account : 'Not Connected'}</p>
      <button type="button" onClick={writeContract}>
        Write Contract
      </button>
      <br />
      <br />
      <button type="button" onClick={disconnect}>
        Disconnect
      </button>
      <br />
      <br />
      <button type="button" onClick={connectMetaMask}>
        Connect MetaMask
      </button>
      <br />
      <br />
      <button type="button" onClick={connectWalletConnect}>
        Connect WalletConnect
      </button>
      <br />
      <br />
      <button type="button" onClick={connectCoinbaseWallet}>
        Connect Coinbase Wallet
      </button>
    </div>
  )
}

export default Web3React
