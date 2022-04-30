const bitcoin = require('bitcoinjs-lib')

const testnet = bitcoin.networks.testnet
const keypair = bitcoin.ECPair.makeRandom({ network: testnet })
const address = keypair.getAddress()
const privateKey = keypair.toWIF()
console.log(address, privateKey) // Save the private key in the .env file
const recipientAddress = 'mzi1NJxD6jC5uVFFazfACgaYqLnVv2SXgx'

const txb = new bitcoin.TransactionBuilder(testnet)
const txid = '8898fbd143bca82443bca824b79bca843bca824bbca824bef7852809024'
const outn = 0

txb.addInput(txid, outn)

txb.addOutput('mweirowbaIGRWgWRKSN429TEBFJ942rsa', 100000) // 0.001 BTC
txb.addOutput(recipientAddress, 10000) // 0.0001 BTC

const WIF = process.env.PRIVATE_KEY_BITCOINJS
const keypairSpend = bitcoin.ECPair.fromWIF(WIF, testnet)
txb.sign(0, keypairSpend)

const tx = txb.build()
const txHex = tx.toHex()
console.log(txHex)
