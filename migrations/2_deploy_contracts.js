var UnlockableNFT = artifacts.require("UnlockableNFT");

module.exports = function(deployer) {
    deployer.deploy(UnlockableNFT);
}
