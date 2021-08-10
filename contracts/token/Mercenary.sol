//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Mercenary is ERC721 ,Ownable {
      

    constructor() ERC721("CryptoPiece Mercenary", "Mercenary") {
    }

    function awardItem(address player, uint256 itemId ,  string memory tokenURI) onlyOwner public returns (uint256 newItemId)  {
        _mint(player, itemId);
        _setTokenURI(itemId, tokenURI);
        return itemId;
    }
}