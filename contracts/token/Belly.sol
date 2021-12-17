//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0<=0.8.9;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Belly is ERC20("Belly", "Belly"), ERC20Burnable , Ownable {
    
    constructor() {
	    _mint(msg.sender,1000000000*10**uint256(18));        
    }

}
