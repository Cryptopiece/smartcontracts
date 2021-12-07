import { BigNumber } from '@ethersproject/bignumber';
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { Mercenary } from '../typechain';

chai.use(chaiAsPromised);

async function deployMercenary(deployer: SignerWithAddress) {
    const Token = await ethers.getContractFactory("Belly", deployer);
    const token = await Token.deploy();

    const Mercenary = await ethers.getContractFactory("Mercenary", deployer);
    const mercenary = await Mercenary.deploy();

    await token.transferOwnership(mercenary.address);
    return [token, mercenary];
}

describe('Mercenary contract', function() {
    
    it('owner is deployer for Mercenary', async function() {
        const [owner] = await ethers.getSigners();
        await deployMercenary(owner);
    });

   
    it('buy egg', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,mercenary] = await deployMercenary(owner);
        
        await mercenary.setToken(token.address);
        await mercenary.setEggPrice(BigNumber.from(1).mul(BigNumber.from(10).pow(18)));
        await mercenary.setFlag(true);
        await token.transfer(teamer.address,BigNumber.from(10000).mul(BigNumber.from(10).pow(18)));
        
        const tokenTeamer = token.connect(teamer);

        await tokenTeamer.approve(mercenary.address, await token.balanceOf(teamer.address));
        
        const mercenaryTeamer = mercenary.connect(teamer);
        await mercenaryTeamer.buyEgg(4);
        
        const eggAmount = await mercenary.eggs(teamer.address);
        chai.expect(eggAmount.eq(4)).true;
    });

    it('buy egg and return the belly balance is 9996', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,mercenary] = await deployMercenary(owner);
        
        await mercenary.setToken(token.address);
        await mercenary.setEggPrice(BigNumber.from(1).mul(BigNumber.from(10).pow(18)));
        await mercenary.setFlag(true);
        await token.transfer(teamer.address,BigNumber.from(10000).mul(BigNumber.from(10).pow(18)));
        
        const tokenTeamer = token.connect(teamer);

        await tokenTeamer.approve(mercenary.address, await token.balanceOf(teamer.address));
        
        const mercenaryTeamer = mercenary.connect(teamer);
        await mercenaryTeamer.buyEgg(4);
        
        const bellyBalance = await token.balanceOf(teamer.address);
        
        chai.expect(bellyBalance.eq(BigNumber.from(9996).mul(BigNumber.from(10).pow(18)))).true;
    });

    it('open egg', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,mercenary] = await deployMercenary(owner);
        
        await  mercenary.setToken(token.address);
        await mercenary.setEggPrice(BigNumber.from(1).mul(BigNumber.from(10).pow(18)));
        await mercenary.setFlag(true);
        await  token.transfer(teamer.address,BigNumber.from(4000).mul(BigNumber.from(10).pow(18)));
        
        const tokenTeamer = token.connect(teamer);

        await  tokenTeamer.approve(mercenary.address, token.balanceOf(teamer.address));

        const mercenaryTeamer = mercenary.connect(teamer);
        await mercenaryTeamer.buyEgg(4);

        await mercenaryTeamer.openEggsAndAwards(4);
            
        
        const eggAmount = await mercenary.eggs(teamer.address);

        chai.expect(eggAmount.eq(0)).true;
    });


    it('open eggs and see all token ID ', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,mercenary] = await deployMercenary(owner);
        
        await  mercenary.setToken(token.address);
        await mercenary.setEggPrice(BigNumber.from(1).mul(BigNumber.from(10).pow(18)));
        await mercenary.setFlag(true);
        await  token.transfer(teamer.address,BigNumber.from(4000).mul(BigNumber.from(10).pow(18)));
        
        const tokenTeamer = token.connect(teamer);

        await  tokenTeamer.approve(mercenary.address, token.balanceOf(teamer.address));

        const mercenaryTeamer = mercenary.connect(teamer);
        await mercenaryTeamer.buyEgg(4);

        const tx =  await mercenaryTeamer.openEggsAndAwards(4);

        const ids= await mercenaryTeamer.list(teamer.address);
        chai.assert(ids == '0,1,2,3');

    });

    it('open eggs and return awardIds ', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,mercenary] = await deployMercenary(owner);
        
        await  mercenary.setToken(token.address);
        await mercenary.setEggPrice(BigNumber.from(1).mul(BigNumber.from(10).pow(18)));
        await mercenary.setFlag(true);
        await  token.transfer(teamer.address,BigNumber.from(4000).mul(BigNumber.from(10).pow(18)));
        
        const tokenTeamer = token.connect(teamer);

        await  tokenTeamer.approve(mercenary.address, token.balanceOf(teamer.address));

        const mercenaryTeamer = mercenary.connect(teamer);
        await mercenaryTeamer.buyEgg(4);

        const tx =  await mercenaryTeamer.openEggsAndAwards(4);

        const EggsAndAwardsIds = await tx.wait(); // 0ms, as tx is already confirmed
        const event = EggsAndAwardsIds.events?.filter((event: { event: string; }) => event.event === 'OpenEgg')
        //console.log(JSON.stringify(event));

        
        // for (const event of EggsAndAwardsIds.events!) {
        //     if( event.event === 'OpenEgg')
        //     {
        //         const [from, id] = event.args;
        //         console.log("got openEgg from "+from+" with id "+id);
        //     }
        // }
        


        
        
        const eggAmount = await mercenary.eggs(teamer.address);

        chai.expect(eggAmount.eq(0)).true;
    });

    it('buy egg and award', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,mercenary] = await deployMercenary(owner);
        
        await  mercenary.setToken(token.address);
        await mercenary.setEggPrice(BigNumber.from(1).mul(BigNumber.from(10).pow(18)));
        await mercenary.setFlag(true);
        await  token.transfer(teamer.address,BigNumber.from(10000).mul(BigNumber.from(10).pow(18)));
        
        const tokenTeamer = token.connect(teamer);

        await  tokenTeamer.approve(mercenary.address, token.balanceOf(teamer.address));

        const mercenaryTeamer = mercenary.connect(teamer);
        await mercenaryTeamer.buyEgg(2);

        const mercenaryOwner = mercenary.connect(owner);
        const awartItem = await mercenaryTeamer.openEggAndAward();

        const eggAmount = await mercenary.eggs(teamer.address);
        const tmp =  await mercenary.ownerOf(0);
        
        chai.expect(tmp==teamer.address);
        
    });


    
 });
