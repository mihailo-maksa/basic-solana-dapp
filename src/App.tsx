import React, { useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import { ethers } from 'ethers'
import { RPC_URL } from './constants'
import json from './contracts/tutorial.json'
import { Web3ReactProvider } from '@web3-react/core'
import Web3React from './components/Web3React/Web3React'
import Web3Modal from './components/Web3Modal/Web3Modal'
import Solana from './components/Solana/Solana'
import Web3js from './components/Web3js/Web3js'
import IPFS from './components/IPFS/IPFS'

interface Props {}

const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
const myAddress = '0x2cD3d676F4C53D645aa523cadBf00BA049f4E8eB'
const account2 = '0x2E7b6533641b120E88Bd9d97Aa2D7Fd0091Cf32e'

const Home: React.FC<Props> = (): JSX.Element => {
  useEffect(() => {
    const main = async () => {
      // 1_accounts
      const etherBalance = await provider.getBalance(myAddress)
      console.log(ethers.utils.formatEther(etherBalance) + ' ETH')

      // 2_read_smart_contract
      const DAI = new ethers.Contract(
        json.rinkeby.DAI.address,
        json.rinkeby.DAI.abi,
        provider,
      )
      const daiName = await DAI.name()
      const daiSymbol = await DAI.symbol()
      const daiTotalSupply = await DAI.totalSupply()
      console.log({
        daiName,
        daiSymbol,
        daiTotalSupply: ethers.utils.formatEther(daiTotalSupply),
      })
      const daiBalance = await DAI.balanceOf(myAddress)
      console.log(ethers.utils.formatEther(daiBalance) + ' DAI')

      // 6_contract_event_stream
      // Default ERC20 events:
      // Transfer(address indexed _from, address indexed _to, uint256 _value)
      // Approval(address indexed _owner, address indexed _spender, uint256 _value)

      // Fetch event info
      const latestBlockNumber = await provider.getBlockNumber()

      const allDaiTransfers = await DAI.queryFilter(
        { address: '' },
        latestBlockNumber - 100,
        latestBlockNumber,
      )
      console.log({ allDaiTransfers })

      // Event listeners
      DAI.on('Transfer', async (from, to, value) => {
        console.log('Transfer:', from, to, value)
      })

      DAI.on('Approval', async (owner, spender, value) => {
        console.log('Approval:', owner, spender, value)
      })

      // 7_inspecting_blocks
      const latestBlock = await provider.getBlock(latestBlockNumber)
      console.log({ latestBlock })

      const { transactions } = await provider.getBlockWithTransactions(
        latestBlockNumber,
      )
      console.log({ latestBlockTxs: transactions, firstTx: transactions[0] })

      // 4_deploy_contract (Test)
      const testContract = new ethers.Contract(
        json.rinkeby.TestContract.address,
        json.rinkeby.TestContract.abi,
        provider,
      )
      console.log({ testContract })
    }

    main()
  }, [])

  // 3_send_signed_transaction
  const sendEther = async () => {
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      await web3Provider.send('eth_requestAccounts', [])

      const signer = web3Provider.getSigner()
      const tx = await signer.sendTransaction({
        to: account2,
        value: ethers.utils.parseEther('0.01'),
      })

      await tx.wait()
      console.log({ txInfo: tx })
    } catch (err) {
      console.error(err)
    }
  }

  // 5_write_contract
  const sendDai = async () => {
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      await web3Provider.send('eth_requestAccounts', [])

      const signer = web3Provider.getSigner()
      const DAISigner = new ethers.Contract(
        json.rinkeby.DAI.address,
        json.rinkeby.DAI.abi,
        signer,
      )

      const tx = await DAISigner.transfer(
        account2,
        ethers.utils.parseEther('1555'),
      )
      await tx.wait()

      console.log({
        txInfo: tx,
      })
    } catch (err) {
      console.error(err)
    }
  }

  // 4_deploy_contract (Homework)
  const deployTestContract = async () => {
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      await web3Provider.send('eth_requestAccounts', [])

      const signer = web3Provider.getSigner()
      const factory = new ethers.ContractFactory(
        json.rinkeby.TestContract.abi,
        json.rinkeby.TestContract.bytecode.object,
        signer,
      )

      const tx = await factory.deploy()
      const txRes = await tx.deployTransaction.wait()

      console.log({ deployTxRes: txRes })
    } catch (err) {
      console.error(err)
    }
  }

  // 8_sign_message
  const signMessage = async () => {
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      await web3Provider.send('eth_requestAccounts', [])

      const signer = web3Provider.getSigner()
      const address = await signer.getAddress()
      const message = ethers.utils.toUtf8Bytes(
        `Log in with MetaMask: ${address}`,
      )

      const signature = await signer.signMessage(message)
      console.log({ signature })

      const signerAddress = await ethers.utils.verifyMessage(message, signature)
      console.log({ signerAddress, verified: signerAddress === address })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="App">
      <h1>Master Ethers.js</h1>
      <button type="button" onClick={sendEther}>
        Send Ether
      </button>
      <br /> <br />
      <button type="button" onClick={sendDai}>
        Send Dai
      </button>
      <br />
      <br />
      <button type="button" onClick={deployTestContract}>
        Deploy Contract
      </button>
      <br />
      <br />
      <button type="button" onClick={signMessage}>
        Sign Message
      </button>
      <br />
      <h1>Links</h1>
      <button type="button">
        <Link to="/web3-react">Web3React</Link>
      </button>
      <br /> <br />
      <button type="button">
        <Link to="/web3-modal">Web3Modal</Link>
      </button>
      <br /> <br />
      <button type="button">
        <Link to="/solana">Solana</Link>
      </button>
      <br /> <br />
      <button type="button">
        <Link to="/web3js">Web3js</Link>
      </button>
    </div>
  )
}

export const App: React.FC = (): JSX.Element => {
  useEffect(() => {
    window.addEventListener('load', () => {
      localStorage.setItem('walletconnect', '')
    })
  }, [])

  const getLibrary = (provider: any): ethers.providers.Web3Provider => {
    const library = new ethers.providers.Web3Provider(provider)
    library.pollingInterval = 15000
    return library
  }

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Routes>
        <Route path="/" element={<Solana />} />
        <Route path="/web3-react" element={<Web3React />} />
        <Route path="/web3-modal" element={<Web3Modal />} />
        <Route path="/web3js" element={<Web3js />} />
        <Route path="/ipfs" element={<IPFS />} />
      </Routes>
    </Web3ReactProvider>
  )
}

export default App
