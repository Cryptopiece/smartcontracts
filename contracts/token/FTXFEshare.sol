//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.5;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract FTXFEshare is ERC20("FTXFEshare", "ESHARE"), ERC20Burnable , Ownable {
    using SafeMath for uint256;
    address[] holders;

    constructor(address owner) {
        transferOwnership(owner);
    }

    function mint(address to, uint256 amount) public onlyOwner {
       _mint(to,amount);
        uint exists = 0;
        for (uint i=0; i<holders.length; i++) 
        {
            if(holders[i]==to)exists = 1; 
        }
        if(exists == 0){
            holders.push(to);
        }
       
        
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20) {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    function getHoldersSize() public view  returns(uint count){
        return holders.length;    
    }

    function getHolders() public view returns(address[] memory holders)
    {
        return holders;
    }

    

}
