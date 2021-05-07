import { BigNumber } from '@ethersproject/bignumber';
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
import { ethers } from 'hardhat';

chai.use(chaiAsPromised);

describe('token contract', function() {
    it ('owner is deployer', async function() {
        const [deployer, owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("FTXFToken", deployer);
        const token = await Token.deploy(owner.address);

        const ownerAddress = await token.owner();

        chai.expect(ownerAddress).equals(owner.address);
    });

    it ('total cap to be 10^26', async function() {
        const [deployer, owner] = await ethers.getSigners();
        
        const Token = await ethers.getContractFactory("FTXFToken", deployer);
        const token = await Token.deploy(owner.address);
        
        const totalSupply = await token.cap();
        
        chai.expect(BigNumber.from(10).pow(26).eq(totalSupply)).true;
    });
    
    it ('total pre-mint to be 8*10**18', async function() {
        const [deployer, owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("FTXFToken", deployer);
        const token = await Token.deploy(owner.address);

        const pre_mint = await token.balanceOf(deployer.address);
        chai.expect(BigNumber.from(10).pow(24).mul(8).eq(pre_mint)).true;
    });
 
});
