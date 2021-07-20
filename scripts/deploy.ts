import { ethers, hardhatArguments } from 'hardhat';
import * as Config from './config';

async function main() {
    await Config.initConfig();
    const network = hardhatArguments.network ? hardhatArguments.network : 'dev';
    const [ deployer ] = await ethers.getSigners();
    console.log('deploy from address: ', deployer.address);

    const Token = await ethers.getContractFactory("CoinTop360");
    const token = await Token.deploy();
    console.log('CoinTop360 address: ', token.address);
    Config.setConfig(network +'.CoinTop360', token.address);

    await Config.updateConfig();
}

main().then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });