import { BigNumber } from '@ethersproject/bignumber';
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
import { ethers } from 'hardhat';

chai.use(chaiAsPromised);

describe('token contract', function() {
    it('owner is deployer', async function() {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("CoinTop360", owner);
        const token = await Token.deploy();

        const ownerAddress = await token.owner();

        chai.expect(ownerAddress).equals(owner.address);
    });

    it('total cap to be 360000000*10^18', async function() {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("CoinTop360", owner);
        const token = await Token.deploy();
        
        const totalSupply = await token.cap();
        
        chai.expect(BigNumber.from(10).pow(18).mul(360000000).eq(totalSupply)).true;
    });
    
    it('total pre-mint to be 1000000*10^18', async function() {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("CoinTop360", owner);
        const token = await Token.deploy();

        const pre_mint = await token.balanceOf(owner.address);
        chai.expect(BigNumber.from(10).pow(18).mul(1000000).eq(pre_mint)).true;
    });

    it('index must be 1 with 1626777020', async function() {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("CoinTop360", owner);
        const token = await Token.deploy();
        const index = await token.findIndex(1626777020);
        console.log(index);
        chai.expect(index==1).true;
    });

    it('index must be 2 with 1626777222', async function() {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("CoinTop360", owner);
        const token = await Token.deploy();
        const index = await token.findIndex(1626777222);
        console.log(index);
        chai.expect(index==2).true;
    });
    
 
});
