//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/utils/Counters.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Mercenary is ERC721 ,Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("CryptoPiece Mercenary", "Mercenary") {
    }

    function awardItem(address player, string memory tokenURI) onlyOwner public returns (uint256)  {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}