pragma solidity ^0.8.0;

contract UnlockableNFT {
    uint public numNFTs;

    mapping (uint => UnlockableNFTMetadata) public metadata;
    mapping (uint => mapping (address => bool)) public unlocks;
    mapping (uint => string) private privateUrls;

    event Unlock(uint indexed nftId, address indexed user);

    struct UnlockableNFTMetadata {
        address owner;
        string publicUrl;
        uint price;
    }

    function createNFT(string memory publicUrl, string memory privateUrl, uint price) public {
        numNFTs++;
        metadata[numNFTs - 1] = UnlockableNFTMetadata(msg.sender, publicUrl, price);
        privateUrls[numNFTs - 1] = privateUrl;
        unlocks[numNFTs - 1][msg.sender] = true;
    }

    function unlock(uint256 nftId) public payable {
        require(!unlocks[nftId][msg.sender], "NFT already unlocked for user");
        require(metadata[nftId].price <= msg.value, "Incorrect price");

        address payable owner = payable(address(metadata[nftId].owner));
        owner.transfer(msg.value);

        unlocks[nftId][msg.sender] = true;
    }

    function getPrivateUrl(uint nftId, address user) public view returns (string memory) {
        require(nftId < numNFTs, "NFT does not exist");
        require(unlocks[nftId][user], "NFT not unlocked for user");

        return privateUrls[nftId];
    }
}
