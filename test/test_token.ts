import { BigNumber } from '@ethersproject/bignumber';
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
import { ethers } from 'hardhat';

chai.use(chaiAsPromised);

describe('token contract', function() {
    it('owner is deployer', async function() {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Belly");
        const token = await Token.deploy();

        const ownerAddress = await token.owner();

        chai.expect(ownerAddress).equals(owner.address);
    });

 });
