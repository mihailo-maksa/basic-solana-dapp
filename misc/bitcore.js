const bitcore = require('bitcore-lib')
require('dotenv').config()

// Generate private key & save it in the .env file
// const privateKey = new bitcore.PrivateKey('testnet').toWIF()
// console.log(privateKey)

const privateKeyWIF = process.env.PRIVATE_KEY_WIF
const privateKey = new bitcore.PrivateKey.fromWIF(privateKeyWIF)
const address = privateKey.toAddress()
// console.log(address.toString())
// mqCRs7kKA7ysdCth6zrC5FahomSx6qPvgL

const value = new Buffer.from(
  'this is a way to generate an address from a random string',
)
const hash = bitcore.crypto.Hash.sha256(value)
const bn = bitcore.crypto.BN.fromBuffer(hash)
const address2 = new bitcore.PrivateKey(bn, 'testnet').toAddress()
// console.log(address2.toString())
// mzi1NJxD6jC5uVFFazfACgaYqLnVv2SXgx

const Insight = require('bitcore-explorers').Insight
const insight = new Insight('testnet')

console.log(insight)

insight.getUnspentUtxos(address.toString(), (err, utxos) => {
  if (err) console.error(err)
  console.log(utxos)
  const tx = new bitcore.Transaction()
  tx.from(utxos)
  tx.to(address2.toString(), 100000) // 0.001 BTC
  tx.change(address.toString())
  tx.fee(10000) // 0.0001 BTC
  tx.sign(privateKey)
  console.log('tx: ', tx.toObject())
  tx.serialize()

  const sciptIn = bitcore.Script(tx.toObject().inputs[0].script)
  console.log('Input script string: ', sciptIn.toString())
  const sciptOut = bitcore.Script(tx.toObject().outputs[0].script)
  console.log('Output script string: ', sciptOut.toString())

  insight.broadcast(tx.toString(), (err, txid) => {
    if (err) console.error(err)
    console.log(`Successful broadcast: ${txid}`)
  })
})
