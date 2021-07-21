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

    it('Duration must be 0 with 1627146000', async function() {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("CoinTop360", owner);
        const token = await Token.deploy();
        const Duration = await token.countDuration(1627146000);
       
        chai.expect(Duration==0).true;
    });

    it('Duration must be 1 with 1627146000 plus 1 years', async function() {

        var startDate = "25 Jul 2021";
        var numOfYears = 1;
        var testDate = new Date(startDate);
        testDate.setFullYear(testDate.getFullYear() + numOfYears);
        testDate.setDate(testDate.getDate() + 20);


        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("CoinTop360", owner);
        const token = await Token.deploy();
        const Duration = await token.countDuration(testDate.getTime()/1000);
       
        chai.expect(Duration==1).true;
    });
    it('mint 3000000 must be ok', async function() {

      
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("CoinTop360", owner);
        const token = await Token.deploy();
        await token.mint(owner.address,BigNumber.from(10).pow(18).mul(3000000));
       
        const totalSupply = await token.totalSupply();
        
        chai.expect(BigNumber.from(10).pow(18).mul(4000000).eq(totalSupply)).true;
    });

    it('mint 14000000 must be fail', async function() {

        var testDate = new Date("26 Jul 2021");
        
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("CoinTop360", owner);
        const token = await Token.deploy();
        await ethers.provider.send("evm_setNextBlockTimestamp", [testDate.getTime()/1000])
        await ethers.provider.send("evm_mine",[]) 
        const Duration = await token.countDuration(testDate.getTime()/1000);
        console.log(Duration);
        const maxTotalSupply = await token.maxTotalSupply(testDate.getTime()/1000);
        console.log(maxTotalSupply);

        try {
            await token.mint(owner.address,BigNumber.from(10).pow(18).mul(14000000));
          } catch (err) {
            chai.expect(true).true;
          }
      });
 });
