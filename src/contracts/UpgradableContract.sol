// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract LogicContractV1 {
    uint256 public num;

    function setNumber(uint256 _num) external {
        num = _num;
    }
}

contract LogicContractV2 {
    uint256 public num;

    function setNumber(uint256 _num) external {
        num = _num * 2;
    }
}

contract Proxy {
    uint256 public num;
    address public owner;
    address public logicContractAddress;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        msg.sender == owner;
        _;
    }

    function setNumber(uint256 _num) external payable {
        logicContractAddress.delegatecall(
          abi.encodeWithSignature("setNumber(uint256)", _num)
        );
    }

    function upgrade(address _logicContractAddress) external onlyOwner {
        logicContractAddress = _logicContractAddress;
    }

    receive() external payable {}

    fallback() external payable {
        (bool success, ) = logicContractAddress.delegatecall(msg.data);
        require(success, "Delegate call failed!");
    }
}
