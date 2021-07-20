//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.5;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract CoinTop360 is ERC20("CoinTop360", "CT360"), ERC20Burnable ,
        ERC20Capped( 360000000 * (10**uint256(18))), Ownable {
    using SafeMath for uint256;
    uint[] timeLock  = [1626777020, 1626777220, 1626785020, 1726775020]; 
    constructor() {
	    _mint(msg.sender, 1000000 * (10**uint256(18)));
        transferOwnership(msg.sender);
    }

    function mint(address to, uint256 amount) public onlyOwner {
      
       _mint(to,amount);
    }
    function findIndex(uint time)  public view returns (uint index){
         for (uint i = 0 ; i < timeLock.length; i++) {
         if(timeLock[i]>time) return i; 
      }
      
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Capped) {
        super._beforeTokenTransfer(from, to, amount);
    }
}
