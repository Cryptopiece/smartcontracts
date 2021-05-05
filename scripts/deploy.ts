import { ethers, hardhatArguments } from 'hardhat';
import * as Config from './config';

async function main() {
    await Config.initConfig();
    const network = hardhatArguments.network ? hardhatArguments.network : 'dev';
    const [ deployer ] = await ethers.getSigners();
    console.log('deploy from address: ', deployer.address);

    const SporesToken = await ethers.getContractFactory("FTXFToken");
    const token = await SporesToken.deploy();
    console.log('FTXFToken address: ', token.address);
    Config.setConfig(network +'.FTXFToken', token.address);

    await Config.updateConfig();
}

main().then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });