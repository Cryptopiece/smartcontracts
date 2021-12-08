import { ethers, hardhatArguments } from 'hardhat';
import * as Config from './config';

async function main() {
    await Config.initConfig();
    const network = hardhatArguments.network ? hardhatArguments.network : 'dev';
    const [ deployer ] = await ethers.getSigners();
    console.log('deploy from address: ', deployer.address);

    // const Belly = await ethers.getContractFactory("Belly");
    // const belly = await Belly.deploy();
    // console.log('Belly address: ', belly.address);
    // await belly.deployed();
    // const Founder = await ethers.getContractFactory("Founder");
    // const founder = await Founder.deploy();
    // console.log('Founder address: ', founder.address);
    // await founder.deployed();
    
    // const Mercenary = await ethers.getContractFactory("Mercenary");
    // const mercenary = await Mercenary.deploy();
    // console.log('Mercenary address: ', mercenary.address);
    // await mercenary.deployed();

    const Market = await ethers.getContractFactory("Market");
    // const market = await Market.deploy(mercenary.address, belly.address);
    const market = await Market.deploy('0xa0d30959BfFd30c7629203970f5E3164Aa712249', '0x7b519Bc2Da663775a6D2188e5E1d14dcabD1c610');
    console.log('Market address: ', market.address);
    await market.deployed();
    // Config.setConfig(network +'.Mercenary', mercenary.address);

    // await Config.updateConfig();
}

main().then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
