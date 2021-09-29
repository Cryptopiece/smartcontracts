import { BigNumber } from '@ethersproject/bignumber';
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';

chai.use(chaiAsPromised);

async function deployFounder(deployer: SignerWithAddress) {
    const Token = await ethers.getContractFactory("Belly", deployer);
    const token = await Token.deploy();

    const Founder = await ethers.getContractFactory("Founder", deployer);
    const founder = await Founder.deploy();

    await token.transferOwnership(founder.address);
    return [token, founder];
}

describe('Founder contract', function() {
    
    it('owner is deployer for Founder', async function() {
        const [owner] = await ethers.getSigners();
        await deployFounder(owner);
    });

    it('transferAndLock function with 1 day', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,founder] = await deployFounder(owner);
        
        founder.setRewardToken(token.address);
                
        token.transfer(founder.address,BigNumber.from(20).pow(19));
        founder.transferAndLock(teamer.address,BigNumber.from(10).pow(19),1);
        
        
        const founderTeamer = founder.connect(teamer);
        founderTeamer.releaseAllMyToken();    

        const availableAmount = await founder.getAvailableAmount(teamer.address);
        
        chai.expect(availableAmount.eq(BigNumber.from(0).pow(18))).true;
    });

    it('transferAndLock function with 0 day', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,founder] = await deployFounder(owner);
        
        founder.setRewardToken(token.address);     
        token.transfer(founder.address,BigNumber.from(10).pow(19));
        founder.transferAndLock(teamer.address,BigNumber.from(10).pow(19),0);
        
        const founderTeamer = founder.connect(teamer);
        founderTeamer.releaseMyToken(0);    

        const availableAmount = await founder.getAvailableAmount(teamer.address);
        chai.expect(availableAmount.eq(BigNumber.from(0).pow(18))).true;
    });

    it('transferAndLock function with 1 day and release', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,founder] = await deployFounder(owner);
        
        founder.setRewardToken(token.address);
        token.transfer(founder.address,BigNumber.from(20).pow(19));
        founder.transferAndLock(teamer.address,BigNumber.from(10).pow(19),1);
        
        ethers.provider.send("evm_increaseTime", [24*60*60]);   // add 60 seconds
        ethers.provider.send("evm_mine",[]);      // mine the next block

        const founderTeamer = founder.connect(teamer);
        founderTeamer.releaseAllMyToken();    

        const availableAmount = await founder.getAvailableAmount(teamer.address);
        chai.expect(availableAmount.eq(BigNumber.from(0).pow(18))).true;
    });

    
    
 });
