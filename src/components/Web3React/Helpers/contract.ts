// npm i web3-react --force
// npm i @web3-react/core @web3-react/fortmatic-connector @web3-react/injected-connector @web3-react/walletconnect-connector @web3-react/walletlink-connector
// npm i walletlink @walletconnect/ethereum-provider @walletconnect/web3-provider

import { ethers, Contract } from 'ethers'
import json from '../../../contracts/tutorial.json'

export const getContract = (library: any, account: any): Contract => {
  const signer = library.getSigner(account).connectUnchecked()
  return new ethers.Contract(
    json.rinkeby.TestContract.address,
    json.rinkeby.TestContract.abi,
    signer,
  )
}
