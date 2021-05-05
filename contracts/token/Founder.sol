pragma solidity ^0.7.5;

import "../library/IERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

/**
 * @title Staking Token (STK)
 * @author Alberto Cuesta Canada
 * @notice Implements a basic ERC20 staking token with incentive distribution.
 */
contract Founder is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20Mintable;

    struct PoolInfo {
        uint256 shares;
        uint256 withdraw;
    }

    struct Staker {
        uint256 amount;
        uint256 withdraw;
    }

    mapping (address => PoolInfo) _pools;

    IERC20Mintable _rewardToken;

    uint256 _salePoolSupply = 3500000 * (10 ** uint256(18));
    uint256 public _salePoolLeft = 3500000 * (10 ** uint256(18));
    bool public _onPublicSale = true;
    uint256 public _salePrice;
    uint256 public _salePriceDiv;


    uint256 _totalShare;
    uint256 _startBlock;
    uint256 _lastBlock;
    uint256 _poolRewardPerBlock;

    modifier onSale {
        require(_onPublicSale && _salePoolLeft > 0, "Public sale stopped");
        _;
    }

    constructor(uint256 startBlock, address rewardToken, address[] memory pools, uint256[] memory poolShares,
            uint256 poolRewardPerBlock, uint256 salePrice, uint256 salePriceDiv) {
        require(pools.length == poolShares.length, "pools and shares data lenght different");
        
        uint256 totalShare = 0;
        for (uint i = 0; i < pools.length; i++) {
            _pools[pools[i]] = PoolInfo(poolShares[i], 0);
            totalShare = totalShare.add(poolShares[i]);
        }

        _totalShare = totalShare;
        _rewardToken = IERC20Mintable(rewardToken);
        _poolRewardPerBlock = poolRewardPerBlock;
        _startBlock = startBlock;
        _salePrice = salePrice;
        _salePriceDiv = salePriceDiv;
    }

    function stopPublicSale() external onlyOwner onSale {
        _onPublicSale = false;
    }

    function setSalePrice(uint256 salePrice, uint256 salePriceDiv) external onlyOwner {
        _salePrice = salePrice;
        _salePriceDiv = salePriceDiv;
    }

    function buy() external payable onSale returns (uint256 amount) {
        uint256 left = _salePoolLeft;
        amount = uint256(msg.value).mul(_salePrice).div(_salePriceDiv);

        uint256 change = 0;
        if (amount > left) {
            change = (amount.sub(left)).mul(_salePriceDiv).div(_salePrice);
            amount = left;
            _onPublicSale = false;
        }

        _salePoolLeft = left.sub(amount);

        if (change > 0) {
            msg.sender.transfer(change);
        }

        _rewardToken.transfer(msg.sender, amount);
    }

    function setRewardPerBlock(uint256 reward) external onlyOwner {
        _poolRewardPerBlock = reward;
    }

    function getTotalPoolReward(PoolInfo memory pool) internal view returns (uint256 poolReward) {
         uint256 totalReward = (block.number - _startBlock).mul(_poolRewardPerBlock);

        poolReward = totalReward.div(_totalShare).mul(pool.shares);
    }

    function redeemPoolReward() external {
        PoolInfo memory pool = _pools[msg.sender];
        require(pool.shares > 0, "Only pool can redeem");

        uint256 totalReward = getTotalPoolReward(pool);
        uint256 reward = totalReward.sub(pool.withdraw);

        _rewardToken.mint(msg.sender, reward);
        _pools[msg.sender].withdraw = totalReward;
    }
}