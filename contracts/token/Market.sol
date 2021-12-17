//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.5<=0.8.9;

import "openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./Mercenary.sol";
import "./Belly.sol";

contract Market is IERC721Receiver {

    Mercenary public mercenary;
    Belly public token;

    struct StakeDetail {
        address payable author;
        uint256 price;
        uint256 tokenId;
    }

    event StakeNft(uint256 _tokenId, uint256 _price);
    event UnstakeNft(uint256 _tokenId);
    event BuyNft(uint256 _tokenId, uint256 _price);

    uint256 public commissionRate = 7; // percentage
    uint256[] public stakedNft;
    mapping ( uint256 => StakeDetail ) stakeDetail;

    constructor(address _mercenary, address _token) {
        mercenary = Mercenary(_mercenary);
        token = Belly(_token);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external override pure returns (bytes4) {
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }

    function getStakingAmount(address _address) view public returns (uint256) {
        uint256 total = 0;
        for (uint256 index = 0; index < stakedNft.length; index++) {
            if (stakeDetail[stakedNft[index]].author == _address) {
                total += 1;
            }
        }

        return total;
    }

    function getStakingAmount() view public returns (uint256) {
        return stakedNft.length;
    }

    function getStakedNft() view public returns (StakeDetail [] memory) {
        uint256 length = getStakingAmount();
        StakeDetail[] memory myNft = new StakeDetail[](length);
        uint count = 0;

        for (uint256 index = 0; index < stakedNft.length; index++) {
            myNft[count++] = stakeDetail[stakedNft[index]];
        }
        
        return myNft;
    }

    function getStakedNft(address _address) view public returns (StakeDetail [] memory) {
        uint256 length = getStakingAmount(_address);
        StakeDetail[] memory myNft = new StakeDetail[](length);
        uint count = 0;

        for (uint256 index = 0; index < stakedNft.length; index++) {
            if (stakeDetail[stakedNft[index]].author == _address) {
                myNft[count++] = stakeDetail[stakedNft[index]];
            }
        }
        
        return myNft;
    }

    function getAddress(uint256 _index) view public returns (address) {
        return stakeDetail[stakedNft[_index]].author;
    }

    function push(uint256[] storage array, uint256 element) private {
        for (uint256 index = 0; index < array.length; index++) {
            if (array[index] == element) {
                return;
            }
        }
        array.push(element);
    }

    function push(address[] storage array, address element) private {
        for (uint256 index = 0; index < array.length; index++) {
            if (array[index] == element) {
                return;
            }
        }
        array.push(element);
    }

    function pop(uint256[] storage array, uint256 element) private {
        for (uint256 index = 0; index < array.length; index++) {
            if (array[index] == element) {
                array[index] = array[array.length - 1];
                array.pop();
                // delete array[index];
                return;
            }
        }
    }

    function stakeNft(uint256 _tokenId, uint256 _price) public {
        require(mercenary.ownerOf(_tokenId) == msg.sender);
        require(mercenary.getApproved(_tokenId) == address(this));

        push(stakedNft, _tokenId);
        stakeDetail[_tokenId] = StakeDetail(payable(msg.sender), _price, _tokenId);

        mercenary.safeTransferFrom(msg.sender, address(this), _tokenId);

        emit StakeNft(_tokenId, _price);
    }

    function unstakeNft(uint256 _tokenId) public {
        require(mercenary.ownerOf(_tokenId) == address(this), "This NFT doesn't exist on market");
        require(stakeDetail[_tokenId].author == msg.sender, "Only owner can unstake this NFT");

        pop(stakedNft, _tokenId);

        mercenary.safeTransferFrom(address(this), msg.sender, _tokenId);

        emit UnstakeNft(_tokenId);
    }

    function buyNft(uint256 _tokenId, uint256 _price) public {
        require(token.balanceOf(msg.sender) >= _price, "Insufficient account balance");
        require(mercenary.ownerOf(_tokenId) == address(this), "This NFT doesn't exist on market");
        require(stakeDetail[_tokenId].price <= _price, "Minimum price has not been reached");

        require(token.allowance(msg.sender, stakeDetail[_tokenId].author) >= _price * (100 - commissionRate) / 100, "Insufficient allowance for author");
        require(token.allowance(msg.sender, address(this)) >= _price * commissionRate / 100, "Insufficient allowance for market owner");

        pop(stakedNft, _tokenId);
        
        token.transferFrom(msg.sender, stakeDetail[_tokenId].author, _price * (100 - commissionRate) / 100);
        token.transferFrom(msg.sender, address(this), _price * commissionRate / 100);
        mercenary.safeTransferFrom(address(this), msg.sender, _tokenId);

        emit BuyNft(_tokenId, _price);
    }

}
