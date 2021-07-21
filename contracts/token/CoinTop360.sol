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
    uint256 startTime = 1627146000; // 25 Jul 2021
    uint256 period = 360 days; 
    constructor() {
	    _mint(msg.sender, 1000000 * (10**uint256(18)));
        transferOwnership(msg.sender);
    }

    function mint(address to, uint256 amount) public onlyOwner {
       require(maxTotalSupply(block.timestamp)>totalSupply()+amount,"Can't mint more than maxTotalSupply");
       _mint(to,amount);
    }
    function countDuration(uint256 time)  public view returns (uint256 count){
        count = (time - startTime)/period;
        return count;      
    }
    function maxTotalSupply(uint256 time)  public view returns (uint256 maxSupply){
        maxSupply = (countDuration(time) + 2)*6000000*(10**uint256(18));
        return maxSupply;      
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Capped) {
        super._beforeTokenTransfer(from, to, amount);
    }
}
