import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units"
import * as chai from "chai";
const chaiAsPromised = require('chai-as-promised');
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';

chai.use(chaiAsPromised);

async function deployMarket(deployer: SignerWithAddress) {

    const Belly = await ethers.getContractFactory("Belly", deployer);
    const belly = await Belly.deploy();

    const Mercenary = await ethers.getContractFactory("Mercenary", deployer);
    const mercenary = await Mercenary.deploy();

    await mercenary.setToken(belly.address);
    await mercenary.setEggPrice(parseEther('400'));

    const Market = await ethers.getContractFactory("Market", deployer);
    const market = await Market.deploy(mercenary.address, belly.address);

    return [belly, mercenary, market];
}

describe("Market Contract", () => {

    it("should deploy", async () => {
        const [ owner ] = await ethers.getSigners();
        await deployMarket(owner);
    });

    it("should receive NFT after open egg", async () => {
        const [ owner, player ] = await ethers.getSigners();
        const [ belly, mercenary, market ] = await deployMarket(owner);

        // Init player balance
        await belly.transfer(player.address, parseEther('10000'));

        // Set allowance
        await belly.connect(player).approve(mercenary.address, belly.balanceOf(player.address));

        // Set allowance to open multiple eggs
        await mercenary.connect(owner).setFlag(true);

        // // Player buy 2 eggs and open 1 egg to get NFT
        await mercenary.connect(player).buyEgg(BigNumber.from(2));
        await mercenary.connect(player).openEggAndAward();

        chai.expect((await mercenary.balanceOf(player.address)).eq(BigNumber.from(1))).true
    })

    it('should stake NFT', async () => {
        const [ owner, player ] = await ethers.getSigners();
        const [ belly, mercenary, market ] = await deployMarket(owner);

        // Init player balance
        await belly.transfer(player.address, parseEther('10000'));

        // Grant permissions to buy NFT
        await belly.connect(player).approve(mercenary.address, belly.balanceOf(player.address));

        // Player buy and open eggs to get NFT
        await mercenary.connect(player).buyEgg(BigNumber.from(1));
        await mercenary.connect(player).buyEgg(BigNumber.from(1));
        await mercenary.connect(player).openEggAndAward();
        await mercenary.connect(player).openEggAndAward();

        await mercenary.connect(player).approve(market.address, mercenary.tokenOfOwnerByIndex(player.address, 0));
        await mercenary.connect(player).approve(market.address, mercenary.tokenOfOwnerByIndex(player.address, 1));

        const marketBalanceBefore = await mercenary.balanceOf(market.address)

        // Stake 2 NFTs to market
        await market.connect(player).stakeNft(mercenary.tokenOfOwnerByIndex(player.address, 0), BigNumber.from(1))
        await market.connect(player).stakeNft(mercenary.tokenOfOwnerByIndex(player.address, 0), BigNumber.from(1))

        const marketBalanceAfter = await mercenary.balanceOf(market.address)
        const expected = BigNumber.from(2)

        chai.expect((await marketBalanceAfter.sub(marketBalanceBefore)).eq(expected)).true
    })

    it('should unstake NFT', async () => {
        const [ owner, alice, bob ] = await ethers.getSigners();
        const [ belly, mercenary, market ] = await deployMarket(owner);

        // Init balance
        await belly.transfer(alice.address, parseEther('10000'));
        await belly.transfer(bob.address, parseEther('10000'));

        // Grant permissions to buy NFT
        await belly.connect(alice).approve(mercenary.address, belly.balanceOf(alice.address));
        await belly.connect(bob).approve(mercenary.address, belly.balanceOf(bob.address));

        // Alice buy and open eggs to get 2 NFTs
        await mercenary.connect(alice).buyEgg(BigNumber.from(1));
        await mercenary.connect(alice).buyEgg(BigNumber.from(1));
        await mercenary.connect(alice).openEggAndAward();
        await mercenary.connect(alice).openEggAndAward();

        await mercenary.connect(alice).approve(market.address, mercenary.tokenOfOwnerByIndex(alice.address, 0));
        await mercenary.connect(alice).approve(market.address, mercenary.tokenOfOwnerByIndex(alice.address, 1));

        // Bob buy and open egg to get 1 NFT
        await mercenary.connect(bob).buyEgg(BigNumber.from(1));
        await mercenary.connect(bob).openEggAndAward();

        await mercenary.connect(bob).approve(market.address, mercenary.tokenOfOwnerByIndex(bob.address, 0));

        // Alice stake 2 NFTs to market
        const aliceFirstNFT = await mercenary.tokenOfOwnerByIndex(alice.address, 0)
        await market.connect(alice).stakeNft(mercenary.tokenOfOwnerByIndex(alice.address, 0), BigNumber.from(1))
        await market.connect(alice).stakeNft(mercenary.tokenOfOwnerByIndex(alice.address, 0), BigNumber.from(1))

        // Bob stake 1 NFT to market
        const bobFirstNFT = await mercenary.tokenOfOwnerByIndex(bob.address, 0)
        await market.connect(bob).stakeNft(mercenary.tokenOfOwnerByIndex(bob.address, 0), BigNumber.from(1))

        // Bob unstake Alice's NFT
        await chai.expect(market.connect(bob).unstakeNft(aliceFirstNFT)).revertedWith("Only owner can unstake this NFT")

        // Alice unstake 1 NFT 2 times
        await market.connect(alice).unstakeNft(aliceFirstNFT)
        await chai.expect(market.connect(alice).unstakeNft(aliceFirstNFT)).revertedWith("This NFT doesn't exist on market")

        chai.expect((await mercenary.balanceOf(alice.address)).eq(BigNumber.from(1))).true
        chai.expect((await mercenary.balanceOf(bob.address)).eq(BigNumber.from(0))).true
        chai.expect((await mercenary.balanceOf(market.address)).eq(BigNumber.from(2))).true

    })

    it('should buy NFT', async () => {
        const [ owner, alice, bob ] = await ethers.getSigners();
        const [ belly, mercenary, market ] = await deployMarket(owner);

        // Init balance
        const initBalance = parseEther('10000')

        await belly.transfer(alice.address, initBalance);
        await belly.transfer(bob.address, initBalance);

        // Grant permissions to buy NFT
        await belly.connect(alice).approve(mercenary.address, belly.balanceOf(alice.address));
        await belly.connect(bob).approve(mercenary.address, belly.balanceOf(bob.address));

        // Alice buy and open eggs to get 2 NFTs
        await mercenary.connect(alice).buyEgg(BigNumber.from(1));
        await mercenary.connect(alice).buyEgg(BigNumber.from(1));
        await mercenary.connect(alice).openEggAndAward();
        await mercenary.connect(alice).openEggAndAward();

        await mercenary.connect(alice).approve(market.address, mercenary.tokenOfOwnerByIndex(alice.address, 0));
        await mercenary.connect(alice).approve(market.address, mercenary.tokenOfOwnerByIndex(alice.address, 1));
        
        // Bob buy and open egg to get 1 NFT
        await mercenary.connect(bob).buyEgg(BigNumber.from(1));
        await mercenary.connect(bob).openEggAndAward();

        const bobFirstNFT = await mercenary.tokenOfOwnerByIndex(bob.address, 0)
        await mercenary.connect(bob).approve(market.address, bobFirstNFT);

        // Alice stake 2 NFTs to market with price 5000
        const aliceFirstNFT = await mercenary.tokenOfOwnerByIndex(alice.address, 0)
        await market.connect(alice).stakeNft(aliceFirstNFT, parseEther('5000'))
        await market.connect(alice).stakeNft(mercenary.tokenOfOwnerByIndex(alice.address, 0), parseEther('5000'))

        await belly.connect(bob).approve(alice.address, belly.balanceOf(bob.address));
        await belly.connect(bob).approve(market.address, belly.balanceOf(bob.address));

        // Bob buy Alice's NFT on market
        await chai.expect(market.connect(bob).buyNft(aliceFirstNFT, parseEther('20000'))).revertedWith('Insufficient account balance')
        await chai.expect(market.connect(bob).buyNft(bobFirstNFT, parseEther('2000'))).revertedWith("This NFT doesn't exist on market")
        await chai.expect(market.connect(bob).buyNft(aliceFirstNFT, parseEther('2000'))).revertedWith("Minimum price has not been reached")
        
        await market.connect(bob).buyNft(aliceFirstNFT, parseEther('6000'))

        chai.expect((await mercenary.balanceOf(market.address)).eq(BigNumber.from(1))).true
        chai.expect((await mercenary.balanceOf(bob.address)).eq(BigNumber.from(2))).true
        chai.expect((await mercenary.balanceOf(alice.address)).eq(BigNumber.from(0))).true

        const aliceBalance = await belly.balanceOf(alice.address)
        const bobBalance = await belly.balanceOf(bob.address)

        chai.expect(aliceBalance.sub(initBalance).eq(parseEther('5200'))).true  // - 400 * 2 + 6000
        chai.expect(initBalance.sub(bobBalance).eq(parseEther('6400'))).true    // - 400 - 6000

    })

});
