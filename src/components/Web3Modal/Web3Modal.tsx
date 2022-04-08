import React, { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

interface Props {}

const Web3ModalComponent: React.FC<Props> = (): JSX.Element => {
  const [account, setAccount] = useState<string>('')
  const [connected, setConnected] = useState<boolean>(false)
  const web3ModalRef = useRef(null)

  const getSignerOrProvider = async (needsSigner: boolean = false) => {
    try {
      // @ts-ignore
      const provider = await web3ModalRef.current.connect()
      const web3Provider = new ethers.providers.Web3Provider(provider)
      const { chainId } = await web3Provider.getNetwork()

      if (chainId !== 4) {
        alert('Change network to Rinkeby')
        throw new Error('Change network to Rinkeby')
      }

      if (needsSigner) {
        const signer = await web3Provider.getSigner()
        return signer
      }

      return web3Provider
    } catch (err) {
      console.error(err)
    }
  }

  const connectWallet = async () => {
    try {
      const signer = await getSignerOrProvider(true)
      setConnected(true)

      // @ts-ignore
      const address = await signer.getAddress()
      setAccount(address)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    // @ts-ignore
    web3ModalRef.current = new Web3Modal({
      network: 'rinkeby',
      providerOptions: {},
    })
  }, [])

  return (
    <div className="App">
      <h1>Web3Modal</h1>
      <p>{connected ? account : 'Not Connected'}</p>
      <button type="button" onClick={connectWallet}>
        Connect Using Web3Modal
      </button>
    </div>
  )
}

export default Web3ModalComponent
