//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.5<=0.8.9;

import "openzeppelin-solidity/contracts/utils/Context.sol";
import "openzeppelin-solidity/contracts/utils/Counters.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";



contract Mercenary is ERC721Enumerable,Ownable 
{
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    IERC20 public _token;
    mapping (address => uint256) public eggs;
    uint256 public _eggPrice;
    bool public _flag = false;
    event OpenEgg(
        address indexed _from,
        uint256 indexed _id
        
    );


    Counters.Counter private _tokenIdTracker;
    constructor() ERC721("CryptoPiece Mercenary", "Mercenary") {
    }

    function setFlag(bool flag) public onlyOwner{
        _flag = flag;
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
        emit OpenEgg(msg.sender,token_id);
        return token_id;
    }

    function setToken(IERC20 token) public onlyOwner{
        _token = token;
    }

    function buyEgg(uint256 quantityEggs) public returns (bool){
        
        require(quantityEggs == 1 || _flag == true, "You can not buy any Mercenary.");
        require(_token.transferFrom(msg.sender, address(this), (_eggPrice.mul(quantityEggs))), "Unable to transfer token.");
        eggs[msg.sender] += quantityEggs;
        return true;
    }

    function openEgg() internal returns(bool){
        require(eggs[msg.sender] > 0, "The eggs is not enough to open.");
        eggs[msg.sender] -= 1;    
        return true;
    }

    function openEggs(uint256 quantityEggs) public returns(bool)
    {
        require(eggs[msg.sender] > 0, "The eggs is not enough to open.");
        eggs[msg.sender] -= quantityEggs;
        return true;
    }


    function openEggAndAward() public returns (uint256 newItemId)  {
        require(openEgg());
        return awardItem(msg.sender);
    }

    function openEggsAndAwards(uint quantityEggs) public returns (uint[] memory _ids)  {
        
        require(quantityEggs<=eggs[msg.sender]);
        uint[] memory ids = new uint[](quantityEggs);
        uint i = 0;
        while(i<quantityEggs)
        {
            ids[i++]=openEggAndAward();
        }
        return (ids);
    }

    function list(address _address) public view returns (uint256[] memory _ids)  {
        
        uint balance = balanceOf(_address);
        uint256[] memory ids = new uint256[](balance);
       
        for( uint i = 0;i<balance;i++)
        {
            ids[i]=tokenOfOwnerByIndex(_address,i);
        }
        return (ids);
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawErc20(IERC20 token) public onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}
