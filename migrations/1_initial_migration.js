const UnlockableNFT = artifacts.require("UnlockableNFT");

module.exports = async function(deployer) {
    await deployer.deploy(UnlockableNFT);
};
