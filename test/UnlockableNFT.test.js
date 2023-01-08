const UnlockableNFT = artifacts.require("UnlockableNFT");

contract("UnlockableNFT", function(accounts) {
    const [owner, buyer, user] = accounts;

    it("should create NFTs correctly", async function() {
        const unlockableNFT = await UnlockableNFT.new();

        await unlockableNFT.createNFT("publicUrl1", "privateUrl1", 100);
        await unlockableNFT.createNFT("publicUrl2", "privateUrl2", 200);
        await unlockableNFT.createNFT("publicUrl3", "privateUrl3", 300);

        await unlockableNFT.metadata(0).then(res => assert.equal(res.publicUrl, "publicUrl1", "Incorrect public URL"));
        await unlockableNFT.metadata(0).then(res => assert.equal(res.price, 100, "Incorrect price"));
        await unlockableNFT.metadata(1).then(res => assert.equal(res.publicUrl, "publicUrl2", "Incorrect public URL"));
        await unlockableNFT.metadata(1).then(res => assert.equal(res.price, 200, "Incorrect price"));
        await unlockableNFT.metadata(2).then(res => assert.equal(res.publicUrl, "publicUrl3", "Incorrect public URL"));
        await unlockableNFT.metadata(2).then(res => assert.equal(res.price, 300, "Incorrect price"));
    });

    it("should be able to create and unlock an NFT", async () => {
        const unlockableNFT = await UnlockableNFT.new();
        await unlockableNFT.createNFT("publicUrl1", "privateUrl1", 1000, { from: owner });

        const initialBalance = await web3.eth.getBalance(owner);
        await unlockableNFT.unlock(0, { from: buyer, value: 1000 });

        const unlocked = await unlockableNFT.unlocks(0, buyer);
        assert.isTrue(unlocked, "NFT not marked as unlocked for user");

        const newBalance = await web3.eth.getBalance(owner);
        assert.equal(newBalance, Number(initialBalance) + 1000, "Contract owner did not receive the paid amount");
    });

    it("should not be able to unlock an NFT with insufficient funds", async () => {
        const unlockableNFT = await UnlockableNFT.new();
        await unlockableNFT.createNFT("publicUrl1", "privateUrl1", 1000, { from: owner });
        try {
            await unlockableNFT.unlock(0, { from: buyer, value: 100 });
            assert.fail("unlock should have thrown an error");
        } catch (error) {
            assert.include(error.message, "Incorrect price", "Incorrect error message");
        }
    });

    it("should not be able to unlock an NFT multiple times", async () => {
        const unlockableNFT = await UnlockableNFT.new();
        await unlockableNFT.createNFT("publicUrl1", "privateUrl1", 1000, { from: owner });
        await unlockableNFT.unlock(0, { from: buyer, value: 1000 });
        try {
            await unlockableNFT.unlock(0, { from: buyer, value: 1000 });
            assert.fail("unlock should have thrown an error");
        } catch (error) {
            assert.include(error.message, "NFT already unlocked for user", "Incorrect error message");
        }
    });

    it("should not be able to access private URL without unlocking", async () => {
        const unlockableNFT = await UnlockableNFT.new();
        await unlockableNFT.createNFT("publicUrl1", "privateUrl1", 1000, { from: owner });
        try {
            await unlockableNFT.getPrivateUrl(0, { from: buyer });
            assert.fail("getPrivateUrl should have thrown an error");
        } catch (error) {
            assert.include(error.message, "NFT not unlocked for user", "Incorrect error message");
        }
    });

    it("should be able to access private URL after unlocking", async () => {
        const unlockableNFT = await UnlockableNFT.new();
        await unlockableNFT.createNFT("publicUrl1", "privateUrl1", 1000, { from: owner });
        await unlockableNFT.unlock(0, { from: buyer, value: 1000 });
        const privateUrl = await unlockableNFT.getPrivateUrl(0, { from: buyer });
        assert.equal(privateUrl, "privateUrl1", "Incorrect private URL");
    });

    it("should not be able to access private URL with incorrect user", async () => {
        const unlockableNFT = await UnlockableNFT.new();
        await unlockableNFT.createNFT("publicUrl1", "privateUrl1", 1000, { from: owner });
        await unlockableNFT.unlock(0, { from: buyer, value: 1000 });
        try {
            await unlockableNFT.getPrivateUrl(0, { from: user });
            assert.fail("getPrivateUrl should have thrown an error");
        } catch (error) {
            assert.include(error.message, "NFT not unlocked for user", "Incorrect error message");
        }
    });
});
