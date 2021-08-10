import { BigNumber } from '@ethersproject/bignumber';
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
import { ethers } from 'hardhat';

chai.use(chaiAsPromised);

describe('token contract', function() {
    it('owner is deployer for Belly', async function() {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Belly");
        const token = await Token.deploy();

        const ownerAddress = await token.owner();

        chai.expect(ownerAddress).equals(owner.address);
    });

    it('owner is deployer for Mercenary', async function() {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Mercenary");
        const token = await Token.deploy();

        const ownerAddress = await token.owner();

        chai.expect(ownerAddress).equals(owner.address);
    });

    it('mint Mercenary for deployer and check ownerOf', async function() {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Mercenary");
        const token = await Token.deploy();
        const itemId = await token.awardItem(owner.address,1235,"https://cryptopiece.online/mercenary/1235");
        chai.expect(owner.address).equals(await token.ownerOf(1235));
        
    });
 });
