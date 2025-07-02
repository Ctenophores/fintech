// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TimeLock {
    struct Deposit {
        uint256 amount;
        uint256 releaseTime;
        address recipient;
    }

    mapping(address => Deposit) public deposits;

    event Deposited(address indexed user, uint256 amount, uint256 releaseTime);
    event Withdrawn(address indexed user, uint256 amount);

    function deposit(uint256 lockSeconds, address recipient) external payable {
        require(msg.value > 0, "Must send ETH");
        require(deposits[msg.sender].amount == 0, "Already deposited");

        deposits[msg.sender] = Deposit({
            amount: msg.value,
            releaseTime: block.timestamp + lockSeconds,
            recipient: recipient
        });

        emit Deposited(msg.sender, msg.value, block.timestamp + lockSeconds);
    }

    function withdraw() external {
        Deposit storage userDeposit = deposits[msg.sender];
        require(userDeposit.amount > 0, "Nothing to withdraw");
        require(block.timestamp >= userDeposit.releaseTime, "Too early to withdraw");
        require(msg.sender == userDeposit.recipient, "Not authorized");

        uint256 amount = userDeposit.amount;
        userDeposit.amount = 0; 
        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }

    function getTimeLeft() external view returns (uint256) {
        if (block.timestamp >= deposits[msg.sender].releaseTime) {
            return 0;
        }
        return deposits[msg.sender].releaseTime - block.timestamp;
    }
}