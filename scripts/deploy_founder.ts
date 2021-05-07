import { ethers, hardhatArguments } from 'hardhat';
import { BigNumber } from '@ethersproject/bignumber';
import * as Config from './config';

//-----------------------------------------------------------------------------
// PARAMETER
// all pools except staking pools
const poolsInfo: { [index: string]: {address:string, share: number} } = 
    {
        'dev': {
            address: '0x14fb9F4280D1189721A61cBC346bfB8df3B5060E', // change these address to real wallet
            share: 10
        },
        'marketing': {
            address: '0x14fb9F4280D1189721A61cBC346bfB8df3B5060E',
            share: 5
        },
        'investor': {
            address: '0x14fb9F4280D1189721A61cBC346bfB8df3B5060E',
            share: 10
        }
    } 

// this will be total number of token mined from staking that cannot be exceeded
const stakeRewardCap = BigNumber.from(10).pow(18).mul(50000000); // change this to expected amount
// number of token per block, stakeRewardPerBlock = stakeRewardCap / time to mine (seconds) * 3
const stakeRewardPerBlock = stakeRewardCap.mul(3).div(86400 * 365).mul(3);
// number of token for above pools, poolRewardPerBlock = totalRewardForPools / time to mine (seconds) * 3
const poolRewardPerBlock = BigNumber.from(10).pow(18); // change this later
// sale price of token will be salePrice / salePriveDiv per token in wei
const salePrice = 100;
const salePriceDiv = 10000;

//-----------------------------------------------------------------------------
    
function mapPoolToParam() {
    var addresses = [];
    var shares = [];
    for (var key in poolsInfo) {
        addresses.push(poolsInfo[key].address);
        shares.push(poolsInfo[key].share);
    }

    return [addresses, shares]
}

async function main() {
    await Config.initConfig();
    const network = hardhatArguments.network ? hardhatArguments.network : 'dev';
    const [deployer] = await ethers.getSigners();
    console.log('deploy from address: ', deployer.address);

    const tokenAddress = Config.getConfig()[network].FTXFToken;
    const [pools, poolsShare] = mapPoolToParam();
    console.log([tokenAddress, pools, poolsShare, stakeRewardCap,
        stakeRewardPerBlock, poolRewardPerBlock, salePrice, salePriceDiv]);

    const Founder = await ethers.getContractFactory("Founder");
    const founder = await Founder.deploy(tokenAddress, pools, poolsShare, stakeRewardCap, 
            stakeRewardPerBlock, poolRewardPerBlock, salePrice, salePriceDiv);
    const Token = await ethers.getContractFactory("FTXFToken");
    const token = Token.attach(tokenAddress);
    await token.transferOwnership(founder.address);

    console.log('Founder address: ', founder.address);
    Config.setConfig(network + '.Founder', founder.address);

    await Config.updateConfig();
}

main().then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });