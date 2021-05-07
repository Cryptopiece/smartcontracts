import { BigNumber } from '@ethersproject/bignumber';
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
import { ethers } from 'hardhat';
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(chaiAsPromised);

async function deployFounder(
        deployer: SignerWithAddress, 
        stakeRewardPerBlock: BigNumber | number=BigNumber.from(10).pow(18),
        poolRewardPerBlock: BigNumber | number = BigNumber.from(10).pow(18),
        salePrice: BigNumber | number = 0, 
        salePriceDiv: BigNumber | number=0) {
    const Token = await ethers.getContractFactory("FTXFToken", deployer);
    const token = await Token.deploy(deployer.address);

    const Founder = await ethers.getContractFactory("Founder", deployer);
    const founder = await Founder.deploy(token.address, [], [], stakeRewardPerBlock, 
        poolRewardPerBlock, salePrice, salePriceDiv);

    await token.transferOwnership(founder.address);

    return [token, founder];
}

describe('founder contract', function () {
    it('should increase block number', async function() {

        const num = await ethers.provider.getBlockNumber();
        await ethers.provider.send("evm_mine", []);

        const newBlockNum = await ethers.provider.getBlockNumber();
        chai.expect(newBlockNum).equal(num + 1);
    });

    it('should be able to deploy', async function () {
        const [deployer] = await ethers.getSigners();

        const [token, founder] = await deployFounder(deployer);
    })

    it('should be able to return staking reward', async function() {
        const [deployer, staker] = await ethers.getSigners();

        const rewardPerBlock = BigNumber.from(10).pow(18);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardPerBlock);

        token.transfer(staker.address, stakeAmount);

        const tokenAsStaker = token.connect(staker);
        await token.approve(founder.address, stakeAmount);
        await tokenAsStaker.approve(founder.address, stakeAmount);
        
        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock+1);

        await founder.stake(stakeAmount);

        await ethers.provider.send("evm_mine", []);
        const reward = await founder.getStakeReward(deployer.address);

        chai.expect(reward.eq(rewardPerBlock)).true;
    });

    it('should be able to stake before start', async function () {
        const [deployer, staker] = await ethers.getSigners();

        const rewardPerBlock = BigNumber.from(10).pow(18);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardPerBlock);

        token.transfer(staker.address, stakeAmount);

        const tokenAsStaker = token.connect(staker);
        await token.approve(founder.address, stakeAmount);
        await tokenAsStaker.approve(founder.address, stakeAmount);


        await founder.stake(stakeAmount);
        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock+1);

        const reward = await founder.getStakeReward(deployer.address);

        chai.expect(reward.eq(rewardPerBlock)).true;
    });

    it('should be able to distribute stake reward', async function () {
        const [deployer, staker] = await ethers.getSigners();

        const rewardPerBlock = BigNumber.from(10).pow(18);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardPerBlock);

        token.transfer(staker.address, stakeAmount);

        const founderAsStaker = founder.connect(staker);
        const tokenAsStaker = token.connect(staker);
        await token.approve(founder.address, stakeAmount);
        await tokenAsStaker.approve(founder.address, stakeAmount);

        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock+1);
        await founder.stake(stakeAmount);
        await founderAsStaker.stake(stakeAmount);

        ethers.provider.send("evm_mine", []); // skip 1 block
        const deployerReward = await founder.getStakeReward(deployer.address);
        const stakerReward = await founder.getStakeReward(staker.address);

        chai.expect(deployerReward.eq(rewardPerBlock.mul(3).div(2))
                && stakerReward.eq(rewardPerBlock.div(2))).true;
    });

});