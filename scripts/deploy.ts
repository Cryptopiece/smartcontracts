import { ethers, hardhatArguments } from 'hardhat';
import * as Config from './config';

async function main() {
    await Config.initConfig();
    const network = hardhatArguments.network ? hardhatArguments.network : 'dev';
    const [ deployer ] = await ethers.getSigners();
    console.log('deploy from address: ', deployer.address);

//     const Belly = await ethers.getContractFactory("Belly");
//    const belly = await Belly.deploy();
//    console.log('Belly address: ', belly.address);
//    await belly.deployed();
//     const Founder = await ethers.getContractFactory("Founder");
//    const founder = await Founder.deploy();
//    console.log('Founder address: ', founder.address);
//    await founder.deployed();
    const Mercenary = await ethers.getContractFactory("Mercenary");
    const mercenary = await Mercenary.deploy();
    console.log('Mercenary address: ', mercenary.address);
    await mercenary.deployed();
    Config.setConfig(network +'.Mercenary', mercenary.address);

    await Config.updateConfig();
}

main().then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });