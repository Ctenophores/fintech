const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers");

describe("AnonymousPoll", function () {
    let AnonymousPoll, poll, owner, voter1, voter2;

    const question = "What is your favorite color?";
    const options = ["Red", "Blue", "Green"];

    beforeEach(async function () {
        [owner, voter1, voter2] = await ethers.getSigners();
        AnonymousPoll = await ethers.getContractFactory("AnonymousPoll");
        poll = await AnonymousPoll.deploy(question, options);
        await poll.waitForDeployment();
        console.log("Deployed contract address:", poll.target);

        });

    it("should deploy with correct owner, question, and options", async function () {
        expect(await poll.owner()).to.equal(owner.address);
        expect(await poll.question()).to.equal(question);

        const optionCount = await poll.getOptionsCount();
        expect(optionCount).to.equal(options.length);

        for (let i = 0; i < options.length; i++) {
        const optionText = await poll.getOptionText(i);
        expect(optionText).to.equal(options[i]);
        }
        });

    it("should allow voting with sufficient ETH and update vote count", async function () {
        // voter1 votes for option 1 (Blue)
        await expect(
            poll.connect(voter1).vote(1, { value: parseEther("0.001") })
        ).to.changeEtherBalances(
            [voter1, owner],
            [parseEther("-0.001"), parseEther("0.001")]
        );

        const voteCount = await poll.getVoteCount(1);
        expect(voteCount).to.equal(1);
        });

    it("should reject voting with insufficient ETH", async function () {
        await expect(
        poll.connect(voter1).vote(0, { value: parseEther("0.0005") })
        ).to.be.revertedWith("Need at least 0.001 ETH to vote");
        });

    it("should reject voting with invalid option index", async function () {
        await expect(
        poll.connect(voter1).vote(options.length, { value: parseEther("0.001") })
        ).to.be.revertedWith("Invalid option");
        });

    it("should correctly accumulate votes for different options", async function () {
        // voter1 votes for option 0 (Red)
        await poll.connect(voter1).vote(0, { value: parseEther("0.001") });
        // voter2 votes for option 2 (Green)
        await poll.connect(voter2).vote(2, { value: parseEther("0.001") });

        const votesRed = await poll.getVoteCount(0);
        const votesGreen = await poll.getVoteCount(2);

        expect(votesRed).to.equal(1);
        expect(votesGreen).to.equal(1);

        const votesBlue = await poll.getVoteCount(1);
        expect(votesBlue).to.equal(0);
        });

    it("should allow same voter to vote multiple times", async function () {
        await poll.connect(voter1).vote(1, { value: parseEther("0.001") });
        await poll.connect(voter1).vote(1, { value: parseEther("0.001") });

        const voteCount = await poll.getVoteCount(1);
        expect(voteCount).to.equal(2);
        });
});
