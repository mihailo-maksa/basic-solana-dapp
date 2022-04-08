import React, { useState, useEffect, useRef } from 'react'
import {
  Connection,
  Transaction,
  clusterApiUrl,
  SystemProgram,
  PublicKey,
  ConfirmedTransaction,
  TransactionInstruction,
} from '@solana/web3.js'
import Wallet from '@project-serum/sol-wallet-adapter'
import EventEmitter from 'eventemitter3'

interface WalletAdapter extends EventEmitter {
  publicKey: PublicKey | null
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  connect: () => any
}

const network = clusterApiUrl('testnet')
const connection = new Connection(network, 'confirmed')
const wallet: WalletAdapter = new Wallet('https://phantom.app', network)

const initWallet = async (): Promise<[Connection, WalletAdapter]> => {
  await wallet.connect()
  return [connection, wallet]
}

class TransactionWithSignature {
  constructor(
    public signature: string,
    public confirmedTransaction: ConfirmedTransaction,
  ) {}
}

const getTransactions = async (
  connection: Connection,
  address: PublicKey,
): Promise<TransactionWithSignature[]> => {
  const txSignatures = await connection.getConfirmedSignaturesForAddress2(
    address,
  )
  const txs = new Array<TransactionWithSignature>()

  for (let i = 0; i < txSignatures.length; i++) {
    const signature = txSignatures[i].signature
    const confirmedTransaction = await connection.getConfirmedTransaction(
      signature,
    )

    if (confirmedTransaction) {
      txs.push(new TransactionWithSignature(signature, confirmedTransaction))
    }
  }

  return txs
}

interface Props {}

const ACCOUNT2 = 'F6dxmXKz5kRC1MdsqcFNbnEFEP9wRcMJmD3fqgszfhux'

const Solana: React.FC<Props> = (): JSX.Element => {
  const [address, setAddress] = useState<string>('')
  const [recipientAddress, setRecipientAddress] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [provider, setProvider] = useState<any>()
  const [message, setMessage] = useState<string>('')
  const [messageDisplay, setMessageDisplay] = useState<string>('')
  const [signature, setSignature] = useState<string>('')

  const connectionRef = useRef<Connection>()
  const walletRef = useRef<WalletAdapter>()

  useEffect(() => {
    const main = async () => {
      try {
        if (window.solana.isPhantom) {
          const currentProvider = await window.solana
          setProvider(currentProvider)

          const res = await window.solana.connect()
          const currentAddress = res.publicKey.toString()
          setAddress(currentAddress)
        }

        // initWallet().then(([connection, wallet]) => {
        //   connectionRef.current = connection
        //   walletRef.current = wallet

        //   if (wallet.publicKey) {
        //     getTransactions(connection, wallet.publicKey).then((tx) => {
        //       setTransactions(tx)
        //     })
        //   }
        // })
      } catch (error) {
        console.error(error)
      }
    }

    main()
  }, [])

  const setWalletTransaction = async (
    instruction: TransactionInstruction,
  ): Promise<Transaction> => {
    const transaction = new Transaction()
    transaction.add(instruction)
    transaction.feePayer = new PublicKey(address)

    let hash = await connection.getRecentBlockhash()
    transaction.recentBlockhash = hash.blockhash

    console.log({
      hash: hash.blockhash,
      transaction,
    })
    return transaction
  }

  const signAndSendTransaction = async (
    wallet: WalletAdapter,
    tx: Transaction,
  ): Promise<string> => {
    const signedTx = await wallet.signTransaction(tx)
    let signature = await connection.sendRawTransaction(signedTx.serialize())
    return signature
  }

  const sendMoney = async (destPubKeyString: string, amount: number = 10e7) => {
    try {
      const destPubKey = new PublicKey(destPubKeyString)
      const instruction = SystemProgram.transfer({
        fromPubkey: wallet!.publicKey!,
        toPubkey: destPubKey,
        lamports: amount,
      })
      let tx = await setWalletTransaction(instruction)
      let signature = await signAndSendTransaction(wallet, tx)
      let res = await connection.confirmTransaction(signature, 'singleGossip')
      console.log({ res })
    } catch (error) {
      console.error(error)
    }
  }

  const sendSOL = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()
      sendMoney(recipientAddress, amount)
    } catch (error) {
      console.error(error)
    }
  }

  const signMessage = async () => {
    try {
      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await window.solana.signMessage(
        encodedMessage,
        'utf8',
      )
      const signature = signedMessage.signature.toString()

      setMessageDisplay(message)
      setSignature(signature)

      setMessage('')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="App">
      <h1>Send Money on Solana</h1>
      <p>
        <strong>Your Address: </strong>
        {address}
      </p>
      <br />
      <div className="send-money">
        <form onSubmit={(e) => sendSOL(e)}>
          <div>
            <label
              style={{
                marginRight: '20px',
              }}
            >
              <strong>Amount (in SOL)</strong>
            </label>
            <input
              type="number"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              autoComplete="off"
              placeholder="Enter Amount"
            />
          </div>

          <br />

          <div>
            <label
              style={{
                marginRight: '20px',
              }}
            >
              <strong>Recipient Address:</strong>
            </label>
            <input
              type="text"
              name="address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Enter Address"
              autoComplete="off"
            />
          </div>

          <br />

          <button type="submit">Send</button>
        </form>
      </div>
      <br />
      <h1>Sign Message</h1>
      <input
        type="text"
        placeholder="Enter Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        autoComplete="off"
        name="message"
      />
      <br /> <br />
      <button type="button" onClick={signMessage}>
        Sign Message
      </button>
      <p>
        <strong>Signer: </strong>
        {address}
      </p>
      <p>
        <strong>Message: </strong>
        {messageDisplay}
      </p>
      <p>
        <strong>Signature: </strong>
        {signature}
      </p>
    </div>
  )
}

export default Solana
