import React, { useEffect, useState } from 'react'
import json from '../../contracts/tutorial.json'
import { ACCOUNT2 } from '../../constants'
import Web3 from 'web3'

interface Props {}

const Web3js: React.FC<Props> = (): JSX.Element => {
  const [address, setAddress] = useState<string>('')
  const [web3, setWeb3] = useState<Web3>()
  const [counter, setCounter] = useState<number>(0)
  const [daiBalance, setDaiBalance] = useState<number>(0)
  const [message, setMessage] = useState<string>('')
  const [messageDisplay, setMessageDisplay] = useState<string>('')
  const [signature, setSignature] = useState<string>('')
  const [signerAddress, setSignerAdress] = useState<string>('')

  useEffect(() => {
    const main = async () => {
      let provider = window.ethereum

      if (typeof provider !== 'undefined') {
        const accounts = await provider.request({
          method: 'eth_requestAccounts',
        })
        setAddress(accounts[0])

        provider.on('accountsChanged', (accounts: string[]) => {
          setAddress(accounts[0])
        })
      }

      const newWeb3 = new Web3(provider)
      setWeb3(newWeb3)

      const networkId = await newWeb3.eth.net.getId()
      console.log({ networkId })
    }

    main()
  }, [])

  const getCurrenCounter = async () => {
    try {
      if (address !== '') {
        // @ts-ignore
        const nftContract = new web3.eth.Contract(
          // @ts-ignore
          json.rinkeby.TestNFT.abi,
          json.rinkeby.TestNFT.address,
        )
        const currentCounter = await nftContract?.methods.tokenId().call({
          from: address,
        })
        setCounter(parseInt(currentCounter))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const mintNFT = async () => {
    try {
      if (address !== '') {
        // @ts-ignore
        const nftContract = new web3.eth.Contract(
          // @ts-ignore
          json.rinkeby.TestNFT.abi,
          json.rinkeby.TestNFT.address,
        )

        const tx = await nftContract.methods.mint(address).send({
          from: address,
        })

        console.log({ tx })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getDaiBalance = async () => {
    try {
      // @ts-ignore
      const daiContract = new web3.eth.Contract(
        // @ts-ignore
        json.rinkeby.DAI.abi,
        json.rinkeby.DAI.address,
      )

      const currentBalance = await daiContract.methods.balanceOf(address).call({
        from: address,
      })

      setDaiBalance(parseFloat(Web3.utils.fromWei(currentBalance)))
    } catch (err) {
      console.error(err)
    }
  }

  const sendDai = async () => {
    try {
      // @ts-ignore
      const daiContract = new web3.eth.Contract(
        // @ts-ignore
        json.rinkeby.DAI.abi,
        json.rinkeby.DAI.address,
      )

      const tx = await daiContract.methods
        .transfer(ACCOUNT2, Web3.utils.toWei('250'))
        .send({ from: address })
      console.log({ tx })
    } catch (err) {
      console.error(err)
    }
  }

  const signMessage = async () => {
    try {
      const currentMessage = web3!.utils.soliditySha3(message)!.toString()
      const currentSignature = await web3!.eth.sign(currentMessage, address)

      setMessage('')

      setMessageDisplay(currentMessage)
      setSignature(currentSignature)
      setSignerAdress(address)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="App">
      <h1>Web3.js Crash Course</h1>
      <p>
        <strong>Your Address: </strong>
        {address !== '' ? address : 'Not Connected'}
      </p>
      <p>
        <strong>Current Counter: </strong>
        {counter}
      </p>
      <p>
        <strong>Your DAI Balance: </strong>
        {daiBalance}
      </p>
      <button type="button" onClick={mintNFT}>
        Mint NFT
      </button>
      <br />
      <br />
      <button type="button" onClick={getCurrenCounter}>
        Get Counter
      </button>
      <br />
      <br />
      <button type="button" onClick={sendDai}>
        Send DAI
      </button>
      <br />
      <br />
      <button type="button" onClick={getDaiBalance}>
        Get DAI Balance
      </button>
      <br /> <br />
      <h2>Sign a Message</h2>
      <input
        type="text"
        name="message"
        placeholder="Enter a Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        autoComplete={'off'}
      />
      <br /> <br />
      <button type="button" onClick={signMessage}>
        Sign & Send
      </button>
      <br />
      <br />
      <p>
        <strong>Signed Message: </strong>
        {messageDisplay}
      </p>
      <p>
        <strong>Signature: </strong>
        {signature}
      </p>
      <p>
        <strong>Account That Signed the Message: </strong>
        {signerAddress}
      </p>
    </div>
  )
}

export default Web3js
