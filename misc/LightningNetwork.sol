// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract LightningNetwork {
    string constant version = "0.1.0";
    mapping(uint256 => LightningChannel) public lightningChannels;
    uint256 public channelCounter;
    address public balanceUpdater; // Can later be modified to be an array of updaters (e.g. authorized node operators or special contracts for automatic updates)

    constructor(address _balanceUpdater) {
        channelCounter = 0;
        balanceUpdater = _balanceUpdater;
    }

    // Can later be modified to support ERC20 tokens as balances (this version only supports ether) and/or to support more than 2 channel participants
    // Advanced ideas: Cross-chain (atomic) swaps, payment streaming, granular (sub-wei) probabilistic payments, cross-channel routing, private transactions utilizing ZK-proofs, multi-signature functionality, etc.
    struct LightningChannel { 
        address addressA;
        uint256 balanceA;
        address addressB;
        uint256 balanceB;
    }

    event ChannelCreated(uint256 channelId, address indexed addressA, uint256 startingBalanceA, address indexed addressB, uint256 startingBalanceB);

    event Deposit(uint256 channelId, address indexed addressA, uint256 newBalanceA, address indexed addressB, uint256 newBalanceB, uint256 depositedAmount);

    event BalancesUpdated(uint256 channelId, address indexed addressA, uint256 newBalanceA, address indexed addressB, uint256 newBalanceB);

    event Withdrawal(uint256 channelId, address indexed addressA, uint256 newBalanceA, address indexed addressB, uint256 newBalanceB, uint256 withdrawalAmount);

    function createChannel(address _addressA, address _addressB) public {
        LightningChannel memory newLightningChannel = LightningChannel(_addressA, 0, _addressB, 0);
        lightningChannels[channelCounter] = newLightningChannel;

        emit ChannelCreated(channelCounter, _addressA, 0, _addressB, 0);

        channelCounter++;
    }

    function deposit(uint256 _channelId) public payable {
        LightningChannel memory currentLightningChannel = lightningChannels[_channelId];
        require(msg.sender == currentLightningChannel.addressA || msg.sender == currentLightningChannel.addressB, "LightningNetwork::deposit: address doesn't belong to the specified lightning channel.");
        uint256 depositedAmount;
        
        if (msg.sender == currentLightningChannel.addressA) {
            depositedAmount = msg.value;
            currentLightningChannel.balanceA += msg.value;
        } else if (msg.sender == currentLightningChannel.addressB) {
            depositedAmount = msg.value;
            currentLightningChannel.balanceB += msg.value;
        }

        emit Deposit(_channelId, currentLightningChannel.addressA, currentLightningChannel.balanceA, currentLightningChannel.addressB, currentLightningChannel.balanceB, depositedAmount);
    }

    // Can later be implemented to automatically update the balances based on the signed messages between the users 
    // Ideally, contract should only take the most recent signature (with a valid format) as the ultimate source of truth and the function to update ballnces should ideally be called inside the withdraw() function by the user who is currently trying to withdraw their funds
    function updateBalances(uint256 _channelId, uint256 _newBalanceA, uint256 _newBalanceB) public {
        require(msg.sender == balanceUpdater, "LightningNetwork::updateBalances: not allowed to update balances of this channel.");
        LightningChannel memory currentLightningChannel = lightningChannels[_channelId];

        currentLightningChannel.balanceA = _newBalanceA;
        currentLightningChannel.balanceB = _newBalanceB;

        emit BalancesUpdated(_channelId, currentLightningChannel.addressA, _newBalanceA, currentLightningChannel.addressB, _newBalanceB);
    }

    function withdraw(uint256 _channelId, uint256 _withdrawalAmount) public {
        LightningChannel memory currentLightningChannel = lightningChannels[_channelId];
        require(msg.sender == currentLightningChannel.addressA || msg.sender == currentLightningChannel.addressB, "LightningNetwork::withdraw: address doesn't belong to the specified lightning channel.");
        require(currentLightningChannel.balanceA > 0 || currentLightningChannel.balanceB > 0, "LightningNetwork::withdraw: total balance of the channel can't be zero.");

        if (msg.sender == currentLightningChannel.addressA) {
            require(currentLightningChannel.balanceA > 0, "LightningNetwork::withdraw: can't withdraw 0 ether.");
            currentLightningChannel.balanceA -= _withdrawalAmount;
        } else if (msg.sender == currentLightningChannel.addressB) {
            require(currentLightningChannel.balanceB > 0, "LightningNetwork::withdraw: can't withdraw 0 ether.");
            currentLightningChannel.balanceB -= _withdrawalAmount;
        }

        (bool sent, ) = msg.sender.call{ value: _withdrawalAmount }("");
        require(sent, "LightningNetwork::withdraw: failed to send ether.");

        emit Withdrawal(_channelId, currentLightningChannel.addressA, currentLightningChannel.balanceA, currentLightningChannel.addressB, currentLightningChannel.balanceB, _withdrawalAmount);
    }

    receive() external payable {
        revert("LightningNetwork::receive: cannot send ether directly to the LightningNetwork contract.");
    }

    fallback() external payable {
        revert("LightningNetwork::fallback: cannot send ether directly to the LightningNetwork contract.");
    }
}
