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
        
        mercenary.setToken(token.address);
        token.transfer(teamer.address,BigNumber.from(4000).mul(BigNumber.from(10).pow(18)));
        
        const tokenTeamer = token.connect(teamer);

        tokenTeamer.approve(mercenary.address, token.balanceOf(teamer.address));

        const mercenaryTeamer = mercenary.connect(teamer);
        mercenaryTeamer.buyEgg();
        
        const eggAmount = await mercenary.eggs(teamer.address);
        chai.expect(eggAmount.eq(1)).true;
    });

    it('open egg', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,mercenary] = await deployMercenary(owner);
        
        await  mercenary.setToken(token.address);
        await  token.transfer(teamer.address,BigNumber.from(4000).mul(BigNumber.from(10).pow(18)));
        
        const tokenTeamer = token.connect(teamer);

        await  tokenTeamer.approve(mercenary.address, token.balanceOf(teamer.address));

        const mercenaryTeamer = mercenary.connect(teamer);
        await mercenaryTeamer.buyEgg();

        const mercenaryOwner = mercenary.connect(owner);
        await mercenaryOwner.openEgg(teamer.address);

        
        const eggAmount = await mercenary.eggs(teamer.address);
        console.log("eggsAmount1: "+eggAmount);
        chai.expect(eggAmount.eq(0)).true;
    });

    it('buy egg and award', async function(){
        const [owner,teamer] = await ethers.getSigners();
        const [token,mercenary] = await deployMercenary(owner);
        
        await  mercenary.setToken(token.address);
        await  token.transfer(teamer.address,BigNumber.from(4000).mul(BigNumber.from(10).pow(18)));
        
        const tokenTeamer = token.connect(teamer);

        await  tokenTeamer.approve(mercenary.address, token.balanceOf(teamer.address));

        const mercenaryTeamer = mercenary.connect(teamer);
        await mercenaryTeamer.buyEgg();

        const mercenaryOwner = mercenary.connect(owner);
        const awartItem = await mercenaryOwner.openEggAndAward(teamer.address, 1225,  "https://google.com");

        const eggAmount = await mercenary.eggs(teamer.address);
        const tmp =  await mercenary.ownerOf(1225) ;
        console.log("tmp: "+tmp);
        console.log("teamer.address: "+teamer.address);
        
        chai.expect(tmp==teamer.address);
        
    });


    
 });
