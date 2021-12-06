import { ethers, hardhatArguments } from 'hardhat';
import * as Config from './config';

async function main() {
    await Config.initConfig();
    const network = hardhatArguments.network ? hardhatArguments.network : 'dev';
    const [ deployer ] = await ethers.getSigners();
    console.log('deploy from address: ', deployer.address);

<<<<<<< HEAD
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
=======
    const Belly = await ethers.getContractFactory("Belly");
   const belly = await Belly.deploy();
   console.log('Belly address: ', belly.address);

    const Founder = await ethers.getContractFactory("Founder");
   const founder = await Founder.deploy();
   console.log('Founder address: ', founder.address);

   const Mercenary = await ethers.getContractFactory("Mercenary");
   const mercenary = await Mercenary.deploy();
   console.log('Mercenary address: ', mercenary.address);

   const Market = await ethers.getContractFactory("Market");
   const market = await Market.deploy();
   console.log('Market address: ', market.address);

>>>>>>> a9b61692f9e942cd8fdfd33a8c7b6aff7eba8c66
    Config.setConfig(network +'.Mercenary', mercenary.address);

    await Config.updateConfig();
}

main().then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
