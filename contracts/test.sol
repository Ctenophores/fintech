// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AnonymousPoll {
    address public owner;
    string public question;
    string[] public options;
    uint[] public votes;

    constructor(string memory _question, string[] memory _options) {
        require(_options.length >= 2, "Need at least 2 options");
        question = _question;
        options = _options;
        votes = new uint[](_options.length);
        owner = msg.sender;
    }

    function vote(uint option) public payable  {
        require(option < options.length, "Invalid option");
        require(msg.value >= 0.001 ether, "Need at least 0.001 ETH to vote");
        votes[option] += 1;
        payable(owner).transfer(msg.value);
    }

    function getOptionsCount() public view returns (uint) {
        return options.length;
    }

    function getOptionText(uint index) public view returns (string memory) {
        require(index < options.length, "Invalid index");
        return options[index];
    }


    function getVoteCount(uint index) public view returns (uint) {
        require(index < votes.length, "Invalid index");
        return votes[index];
    }
}