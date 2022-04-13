import React, { useState } from 'react'
import {
  Connection,
  Transaction,
  clusterApiUrl,
  SystemProgram,
} from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '../../constants'

interface Props {}

const Solana: React.FC<Props> = (): JSX.Element => {
  const [address, setAddress] = useState<string>('')
  const [pubkey, setPubkey] = useState<any>()
  const [recipientAddress, setRecipientAddress] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [connected, setConnected] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>('')

  const network = clusterApiUrl('testnet')
  const connection = new Connection(network, 'confirmed')

  const sendSOL = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const lamportAmount = parseFloat(amount) * LAMPORTS_PER_SOL

      let tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: pubkey,
          toPubkey: pubkey,
          lamports: lamportAmount,
        }),
      )

      tx.feePayer = pubkey
      const { blockhash } = await connection.getRecentBlockhash()
      tx.recentBlockhash = blockhash

      const { signature } = await window.solana.signAndSendTransaction(tx)
      setTxHash(signature)
      setAmount('')
      setRecipientAddress('')
    } catch (error) {
      console.error(error)
    }
  }

  const connectWallet = async () => {
    try {
      if (window.solana.isPhantom) {
        const res = await window.solana.connect()
        const currentAddress = res.publicKey.toString()
        setAddress(currentAddress)
        const currentPubkey = res.publicKey
        setPubkey(currentPubkey)
        setConnected(true)
      } else {
        alert('Please install Phantom wallet first!')
        window.open('https://phantom.app', '_blank')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const disconnectWallet = async () => {
    try {
      await window.solana.disconnect()
      setConnected(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="App">
      <h1 className="bold">Send Money on Solana Testnet</h1>

      {connected ? (
        <button
          type="button"
          className="btn btn-danger bold connect-btn"
          onClick={disconnectWallet}
        >
          Disconnect Wallet
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-success bold connect-btn"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}

      <div className="stats">
        <p className="stat">
          <strong>Status: </strong>
          {connected ? 'Connected' : 'Not Connected'}
        </p>
        {connected && (
          <p className="stat">
            <strong>Your Address: </strong>
            {address}
          </p>
        )}
      </div>

      {connected && (
        <div className="send-money">
          <form onSubmit={(e) => sendSOL(e)}>
            <div className="form-group">
              <label>
                <strong>Amount (in SOL)</strong>
              </label>
              <input
                type="text"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoComplete="off"
                placeholder="Enter Amount"
                className="form-control"
              />
            </div>

            <br />

            <div className="form-group">
              <label>
                <strong>Recipient Address</strong>
              </label>
              <input
                type="text"
                name="address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter Address"
                autoComplete="off"
                className="form-control"
              />
            </div>

            <br />

            <button type="submit" className="btn btn-primary bold">
              Send
            </button>
          </form>

          {txHash && (
            <a
              href={`https://explorer.solana.com/tx/${txHash}?cluster=testnet`}
              className="link-primary bold tx-link mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Transaction on the Explorer
            </a>
          )}
          <a
            href="https://solfaucet.com/"
            className="link-primary bold mt-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            SOL Testnet Faucet
          </a>
        </div>
      )}
    </div>
  )
}

export default Solana
