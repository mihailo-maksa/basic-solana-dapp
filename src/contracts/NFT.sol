// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";

contract NFT is ERC721 {
  using Counters for Counters.Counter;

  Counters.Counter public _tokenId;

  constructor() ERC721("Test NFT", "TEST") {}

  function mint(address owner) public {
    _tokenId.increment();

    uint256 newTokenId = _tokenId.current();
    _mint(owner, newTokenId);
  }
}
