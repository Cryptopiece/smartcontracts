//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.5<=0.8.9;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Belly is ERC20("Belly", "Belly"), ERC20Burnable ,
         Ownable {
    using SafeMath for uint256;
    

    constructor() {
	    _mint(msg.sender,1000000000*10**uint256(18));        
        transferOwnership(msg.sender);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20) {
        super._beforeTokenTransfer(from, to, amount);
    }

    
   
    
}
