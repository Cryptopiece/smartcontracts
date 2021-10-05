//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.5<=0.8.9;
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


contract Mercenary is ERC721 ,Ownable {

    IERC20 public _token;
    mapping (address => uint256) public eggs;
    uint256 _eggPrice;


    constructor() ERC721("CryptoPiece Mercenary", "Mercenary") {
    }

    function setEggPrice(uint256 eggPrice) public onlyOwner returns(bool)
    {
        _eggPrice = eggPrice;
        return true;
    }

    function awardItem(address player, uint256 itemId ,  string memory tokenURI) onlyOwner public returns (uint256 newItemId)  {
        _mint(player, itemId);
        _setTokenURI(itemId, tokenURI);
        return itemId;
    }

    function setToken(IERC20 token) public onlyOwner{
        _token = token;
    }

    function buyEgg() public returns (bool){
        
        require(_token.transferFrom(msg.sender, address(this), _eggPrice), "Unable to transfer token.");
        eggs[msg.sender] += 1;
        return true;
    }

    function openEgg(address buyer) public onlyOwner returns(bool){
        require(eggs[buyer] > 0, "The eggs is not enough to open.");
        eggs[buyer] -= 1;
        return true;
    }

    function openEggAndAward(address player, uint256 itemId ,  string memory tokenURI) onlyOwner public returns (uint256 newItemId)  {
        openEgg(player);
        return awardItem(player, itemId, tokenURI);
    }

    function withdraw() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function withdrawErc20(IERC20 token) public onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}