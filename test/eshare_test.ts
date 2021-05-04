import { BigNumber } from '@ethersproject/bignumber';
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
import { ethers } from 'hardhat';

chai.use(chaiAsPromised);

describe('eshare contract', function() {
    it ('owner is deployer', async function() {
        const [deployer, owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("FTXFEshare", deployer);
        const token = await Token.deploy(owner.address);

        const ownerAddress = await token.owner();

        chai.expect(ownerAddress).equals(owner.address);
    });

    it ('total cap to be 0', async function() {
        const [deployer, owner] = await ethers.getSigners();
        
        const Token = await ethers.getContractFactory("FTXFEshare", deployer);
        const token = await Token.deploy(owner.address);
        
        const totalSupply = await token.totalSupply();
        
        chai.expect(BigNumber.from(0).eq(totalSupply)).true;
    });
    
    it ('total cap to be increase to 1000 when mint', async function() {
        const [deployer, owner] = await ethers.getSigners();
        
        const Token = await ethers.getContractFactory("FTXFEshare", deployer);
        const token = await Token.deploy(deployer.address);
        
        await token.mint(owner.address, (BigNumber.from(10).pow(18).mul(1000)));
        const totalSupply = await token.totalSupply();
        
        chai.expect(BigNumber.from(10).pow(18).mul(1000).eq(totalSupply)).true;
    });

    it ('Balance of owner to be increase to 1000 when mint', async function() {
        const [deployer, owner] = await ethers.getSigners();
        
        const Token = await ethers.getContractFactory("FTXFEshare", deployer);
        const token = await Token.deploy(deployer.address);
        
        await token.mint(owner.address, (BigNumber.from(10).pow(18).mul(1000)));
        const balanceOfOwner = await token.balanceOf(owner.address);
        
        chai.expect(BigNumber.from(10).pow(18).mul(1000).eq(balanceOfOwner)).true;
    });
 
});
