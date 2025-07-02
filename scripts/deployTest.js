const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying AnonymousPoll contract...");

    const AnonymousPoll = await ethers.getContractFactory("AnonymousPoll");

    const question = "what programming language is the best";
    const options = ["Java", "C", "Python"];

    const poll = await AnonymousPoll.deploy(question, options);
    await poll.waitForDeployment();

    console.log(`AnonymousPoll deployed to: ${poll.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
