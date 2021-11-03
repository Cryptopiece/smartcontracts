//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.5<=0.8.9;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

import './IPinkAntiBot.sol';

contract Belly is ERC20("Belly", "Belly"), ERC20Burnable ,
        ERC20Capped( 1000000000*10**uint256(18)), Ownable {
    using SafeMath for uint256;
    uint256 startTime = 0; 
    uint256 period = 1 days; 

    IPinkAntiBot public pinkAntiBot;
    bool public antiBotEnabled;

    constructor(
        address pinkAntiBot_
    ) {
	    _mint(msg.sender,570000000*10**uint256(18));
        startTime = block.timestamp;
        transferOwnership(msg.sender);

        // Register the contract with PinkAntiBot
        pinkAntiBot = IPinkAntiBot(pinkAntiBot_);
        pinkAntiBot.setTokenOwner(msg.sender);

        antiBotEnabled = true;
    }

    function setEnableAntiBot(bool _enable) external onlyOwner {
        antiBotEnabled = _enable;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Capped) {
        if(antiBotEnabled){
            pinkAntiBot.onPreTransferCheck(from, to, amount);
        }

        super._beforeTokenTransfer(from, to, amount);
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
        maxSupply = 570000000*(10**uint256(18)) + countDuration(time)*1000000*(10**uint256(18));
        return maxSupply;      
    }
    
}
