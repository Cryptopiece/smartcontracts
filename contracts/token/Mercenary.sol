//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.5<=0.8.9;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/Context.sol";
import "openzeppelin-solidity/contracts/utils/Counters.sol";


contract Mercenary is ERC721,Ownable 
{
    using Counters for Counters.Counter;
    IERC20 public _token;
    mapping (address => uint256) public eggs;
    uint256 _eggPrice;

    Counters.Counter private _tokenIdTracker;
    constructor() ERC721("CryptoPiece Mercenary", "Mercenary") {
    }

    function setEggPrice(uint256 eggPrice) public onlyOwner returns(bool)
    {
        _eggPrice = eggPrice;
        return true;
    }

    function awardItem(address to) internal returns (uint256 newItemId)  {
         uint256 token_id = _tokenIdTracker.current();
         _mint(to, token_id);
        _tokenIdTracker.increment();
        return token_id;
    }

    function setToken(IERC20 token) public onlyOwner{
        _token = token;
    }

    function buyEgg() public returns (bool){
        
        require(_token.transferFrom(msg.sender, address(this), _eggPrice), "Unable to transfer token.");
        eggs[msg.sender] += 1;
        return true;
    }

    function openEgg() internal returns(bool){
        require(eggs[msg.sender] > 0, "The eggs is not enough to open.");
        eggs[msg.sender] -= 1;
        return true;
    }

    function openEggAndAward() public returns (uint256 newItemId)  {
        require(openEgg());
        return awardItem(msg.sender);
    }

    function withdraw() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function withdrawErc20(IERC20 token) public onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}