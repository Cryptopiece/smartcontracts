import { ethers, hardhatArguments } from 'hardhat';
import * as Config from './config';

async function main() {
    await Config.initConfig();
    const network = hardhatArguments.network ? hardhatArguments.network : 'dev';
    const [ deployer ] = await ethers.getSigners();
    console.log('deploy from address: ', deployer.address);

    const Belly = await ethers.getContractFactory("Belly");
   const belly = await Belly.deploy('0xbb06F5C7689eA93d9DeACCf4aF8546C4Fe0Bf1E5');
   console.log('Belly address: ', belly.address);

    const Founder = await ethers.getContractFactory("Founder");
   const founder = await Founder.deploy();
   console.log('Founder address: ', founder.address);

    const Mercenary = await ethers.getContractFactory("Mercenary");
    const mercenary = await Mercenary.deploy();
    console.log('Mercenary address: ', mercenary.address);

    Config.setConfig(network +'.Mercenary', mercenary.address);

    await Config.updateConfig();
}

main().then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
