//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract Mercenary is ERC721 ,Ownable {
      

    constructor() ERC721("CryptoPiece Mercenary", "Mercenary") {
    }

    function awardItem(address player, uint256 itemId ,  string memory tokenURI) onlyOwner public returns (uint256 newItemId)  {
        _mint(player, itemId);
        _setTokenURI(itemId, tokenURI);
        return itemId;
    }
    function withdraw() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function withdrawErc20(IERC20 token) public onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}