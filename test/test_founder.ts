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

    it('multiTransferAndLock function with _amountArr[1,2,3] and _releaseDaysArr[1,2,3]', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,founder] = await deployFounder(owner);
        
        founder.setRewardToken(token.address);
        token.transfer(founder.address,BigNumber.from(20).pow(19));
        var amount1 = BigNumber.from(1).mul(BigNumber.from(10).pow(18));
        var amount2 = BigNumber.from(2).mul(BigNumber.from(10).pow(18));
        var amount3 = BigNumber.from(3).mul(BigNumber.from(10).pow(18));
        var _amountArr:BigNumber[] = [amount1,amount2,amount3];
        var _releaseDaysArr:number[] = [1,2,3];
        founder.multiTransferAndLock(teamer.address,_amountArr,_releaseDaysArr);
        
        const founderTeamer = founder.connect(teamer);
        
        const lockedFullAmount = await founder.getLockedFullAmount(teamer.address);
        chai.expect(lockedFullAmount.eq(BigNumber.from(6).mul(BigNumber.from(10).pow(18)))).true;
    });


    it('multiTransferAndLock function with _amountArr[1,2,3] and _releaseDaysArr[1,2,3] and release _releaseDays with index 0,1', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,founder] = await deployFounder(owner);
        
        await founder.setRewardToken(token.address);
        await token.transfer(founder.address,BigNumber.from(20).pow(19));
        var amount1 = BigNumber.from(1).mul(BigNumber.from(10).pow(18));
        var amount2 = BigNumber.from(2).mul(BigNumber.from(10).pow(18));
        var amount3 = BigNumber.from(3).mul(BigNumber.from(10).pow(18));
        var _amountArr:BigNumber[] = [amount1,amount2,amount3];
        var _releaseDaysArr:number[] = [1,2,3];
        await founder.multiTransferAndLock(teamer.address,_amountArr,_releaseDaysArr);
       
        ethers.provider.send("evm_increaseTime", [2*24*60*60]);   // add 60 seconds
        ethers.provider.send("evm_mine",[]);  
          
        const founderTeamer = founder.connect(teamer);
        await founderTeamer.releaseAllMyToken(); 
         

        const bellyOfTeamer = await token.balanceOf(teamer.address);
        
        chai.expect(bellyOfTeamer.eq(BigNumber.from(3).mul(BigNumber.from(10).pow(18)))).true;
    });

    it('withdrew amount function with _amountArr[1,2,3] and _releaseDaysArr[1,2,3] and release _releaseDays with index 0,1', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,founder] = await deployFounder(owner);
        
        await founder.setRewardToken(token.address);
        await token.transfer(founder.address,BigNumber.from(20).pow(19));
        var amount1 = BigNumber.from(4).mul(BigNumber.from(10).pow(18));
        var amount2 = BigNumber.from(2).mul(BigNumber.from(10).pow(18));
        var amount3 = BigNumber.from(3).mul(BigNumber.from(10).pow(18));
        var _amountArr:BigNumber[] = [amount1,amount2,amount3];
        var _releaseDaysArr:number[] = [1,2,3];
        await founder.multiTransferAndLock(teamer.address,_amountArr,_releaseDaysArr);
        
        ethers.provider.send("evm_increaseTime", [2*24*60*60]);   // add 60 seconds
        ethers.provider.send("evm_mine",[]);  
          
        const founderTeamer = founder.connect(teamer);
        await founderTeamer.releaseAllMyToken(); 
        

        const withdrewAmount = await founder.getWithdrewAmount(teamer.address);
        
        chai.expect(withdrewAmount.eq(BigNumber.from(6).mul(BigNumber.from(10).pow(18)))).true;
    });


    
 });
