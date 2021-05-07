import { BigNumber } from '@ethersproject/bignumber';
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
import { ethers } from 'hardhat';
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { base58 } from 'ethers/lib/utils';

chai.use(chaiAsPromised);

const PREMINT = BigNumber.from(10).pow(24).mul(8);

async function deployFounder(
        deployer: SignerWithAddress,
        stakeRewardCap: BigNumber | number = BigNumber.from(10).pow(19),
        stakeRewardPerBlock: BigNumber | number=BigNumber.from(10).pow(18),
        poolRewardPerBlock: BigNumber | number = BigNumber.from(10).pow(18),
        salePrice: BigNumber | number = 0, 
        salePriceDiv: BigNumber | number = 0) {
    const Token = await ethers.getContractFactory("FTXFToken", deployer);
    const token = await Token.deploy(deployer.address);

    const Founder = await ethers.getContractFactory("Founder", deployer);
    const founder = await Founder.deploy(token.address, [], [], 
        stakeRewardCap, stakeRewardPerBlock, 
        poolRewardPerBlock, salePrice, salePriceDiv);

    await token.transferOwnership(founder.address);

    return [token, founder];
}

describe('founder contract', function () {
    it('should be able to deploy', async function () {
        const [deployer] = await ethers.getSigners();

        await deployFounder(deployer);
    })

    it('should be able to return staking reward', async function() {
        const [deployer, staker] = await ethers.getSigners();

        const rewardCap = BigNumber.from(10).pow(19);
        const rewardPerBlock = BigNumber.from(10).pow(18);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardCap, rewardPerBlock);

        token.transfer(staker.address, stakeAmount);

        const tokenAsStaker = token.connect(staker);
        await token.approve(founder.address, stakeAmount);
        await tokenAsStaker.approve(founder.address, stakeAmount);
        
        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock+1);

        await founder.stake(stakeAmount);

        await ethers.provider.send('evm_mine', []);
        const reward = await founder.getStakeReward(deployer.address);

        chai.expect(reward.eq(rewardPerBlock)).true;
    });

    it('should be able to stake before start', async function () {
        const [deployer, staker] = await ethers.getSigners();

        const rewardCap = BigNumber.from(10).pow(19);
        const rewardPerBlock = BigNumber.from(10).pow(18);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardCap, rewardPerBlock);

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

        const rewardCap = BigNumber.from(10).pow(19);
        const rewardPerBlock = BigNumber.from(10).pow(18);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardCap, rewardPerBlock);

        token.transfer(staker.address, stakeAmount);

        const founderAsStaker = founder.connect(staker);
        const tokenAsStaker = token.connect(staker);
        await token.approve(founder.address, stakeAmount);
        await tokenAsStaker.approve(founder.address, stakeAmount);

        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock+1);
        await founder.stake(stakeAmount);
        await founderAsStaker.stake(stakeAmount);

        ethers.provider.send('evm_mine', []); // skip 1 block
        const deployerReward = await founder.getStakeReward(deployer.address);
        const stakerReward = await founder.getStakeReward(staker.address);

        chai.expect(deployerReward.eq(rewardPerBlock.mul(3).div(2))
                && stakerReward.eq(rewardPerBlock.div(2))).true;
    });

    it('should be able to withdraw staking reward', async function () {
        const [deployer, staker] = await ethers.getSigners();

        const rewardCap = BigNumber.from(10).pow(19);
        const rewardPerBlock = BigNumber.from(10).pow(18);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardCap, rewardPerBlock);

        token.transfer(staker.address, stakeAmount);

        const founderAsStaker = founder.connect(staker);
        const tokenAsStaker = token.connect(staker);
        await token.approve(founder.address, stakeAmount);
        await tokenAsStaker.approve(founder.address, stakeAmount);

        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock + 1);
        await founder.stake(stakeAmount);
        await founderAsStaker.stake(stakeAmount);

        await founderAsStaker.redeemStakeReward();

        const stakerBalance = await token.balanceOf(staker.address);

        chai.expect(stakerBalance.eq(rewardPerBlock.div(2))).true;
    });
    
    it.only('should be able to withdraw staking reward multiple time', async function () {
        const [deployer, staker] = await ethers.getSigners();

        const rewardCap = BigNumber.from(10).pow(19);
        const rewardPerBlock = BigNumber.from(10).pow(18);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardCap, rewardPerBlock);

        token.transfer(staker.address, stakeAmount);

        const founderAsStaker = founder.connect(staker);
        const tokenAsStaker = token.connect(staker);
        await token.approve(founder.address, stakeAmount);
        await tokenAsStaker.approve(founder.address, stakeAmount);

        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock + 1);
        await founder.stake(stakeAmount);
        await founderAsStaker.stake(stakeAmount);

        await founderAsStaker.redeemStakeReward();
        await founderAsStaker.redeemStakeReward();

        const stakerBalance = await token.balanceOf(staker.address);

        chai.expect(stakerBalance.eq(rewardPerBlock)).true;
    });

    it('should be able to unstake', async function () {
        const [deployer, staker] = await ethers.getSigners();

        const rewardCap = BigNumber.from(10).pow(19);
        const rewardPerBlock = BigNumber.from(10).pow(18);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardCap, rewardPerBlock);

        token.transfer(staker.address, stakeAmount);

        const founderAsStaker = founder.connect(staker);
        const tokenAsStaker = token.connect(staker);
        await token.approve(founder.address, stakeAmount);
        await tokenAsStaker.approve(founder.address, stakeAmount);

        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock + 1);
        await founder.stake(stakeAmount);
        await founderAsStaker.stake(stakeAmount);

        await founderAsStaker.unstake(stakeAmount);

        const stakerBalance = await token.balanceOf(staker.address);

        chai.expect(stakerBalance.eq(rewardPerBlock.div(2).add(stakeAmount))).true;
    });

    it('should be able to change stake reward per block', async function() {
        const [deployer, staker] = await ethers.getSigners();

        const rewardCap = BigNumber.from(10).pow(19);
        const rewardPerBlock = BigNumber.from(10).pow(18);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardCap, rewardPerBlock);

        token.transfer(staker.address, stakeAmount);

        const founderAsStaker = founder.connect(staker);
        const tokenAsStaker = token.connect(staker);
        await token.approve(founder.address, stakeAmount);
        await tokenAsStaker.approve(founder.address, stakeAmount);

        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock + 1);
        await founder.stake(stakeAmount);
        await founderAsStaker.stake(stakeAmount);

        await founder.changeStakeReward(rewardPerBlock.div(2));
        const reward = await founder.getStakeReward(staker.address);

        chai.expect(reward.eq(rewardPerBlock.div(4))).true;
    });

    it('should not be able to surpass stake reward cap', async function () {
        const [deployer, staker] = await ethers.getSigners();

        const rewardCap = BigNumber.from(10).pow(2).mul(3);
        const rewardPerBlock = BigNumber.from(10).pow(2);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardCap, rewardPerBlock);


        await token.approve(founder.address, stakeAmount);

        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock + 1);
        
        await founder.stake(stakeAmount);

        for (var i = 0; i < 10; i++) {
            ethers.provider.send('evm_mine', []);
        }

        await founder.redeemStakeReward();
        const balance = await token.balanceOf(deployer.address);

        chai.expect(balance.eq(PREMINT.sub(stakeAmount).add(rewardCap))).true;
    });

    it('staking after reach cap should not be able to redeem', async function () {
        const [deployer, staker] = await ethers.getSigners();

        const rewardCap = BigNumber.from(10).pow(2).mul(3);
        const rewardPerBlock = BigNumber.from(10).pow(2);
        const stakeAmount = rewardPerBlock;
        const [token, founder] = await deployFounder(deployer, rewardCap, rewardPerBlock);

        token.transfer(staker.address, stakeAmount);

        const founderAsStaker = founder.connect(staker);
        const tokenAsStaker = token.connect(staker);
        await token.approve(founder.address, stakeAmount);
        await tokenAsStaker.approve(founder.address, stakeAmount);

        const startBlock = await ethers.provider.getBlockNumber();
        await founder.startStaking(startBlock + 1);

        await founder.stake(stakeAmount);

        for (var i = 0; i < 10; i++) {
            ethers.provider.send('evm_mine', []);
        }

        await founderAsStaker.stake(stakeAmount);
        await founderAsStaker.unstake(stakeAmount);

        const stakerBalance = await token.balanceOf(staker.address);

        chai.expect(stakerBalance.eq(stakeAmount)).true;
    });
});