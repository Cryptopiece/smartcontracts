//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import "../library/IERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract Founder is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20Mintable;

    struct PoolInfo {
        uint256 shares;
        uint256 withdraw;
    }

    struct StakerInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    mapping (address => StakerInfo) _stakers;
    uint256 public _stakeRewardMinted;
    uint256 public _stakeRewardPerBlock;
    uint256 public _totalStake;
    uint256 public _accAmountPerShare;
    uint256 public _lastRewardBlock;

    mapping (address => PoolInfo) _pools;

    IERC20Mintable public _rewardToken;

    uint256 public _salePoolSupply = 3500000 * (10 ** uint256(18));
    uint256 public _salePoolLeft = 3500000 * (10 ** uint256(18));
    bool public _onPublicSale = true;
    uint256 public _salePrice;
    uint256 public _salePriceDiv;

    uint256 public _totalShare;
    uint256 _startBlock;
    uint256 _poolRewardPerBlock;

    modifier onSale {
        require(_onPublicSale && _salePoolLeft > 0, "Public sale stopped");
        _;
    }

    constructor(address rewardToken, address[] memory pools, uint256[] memory poolShares, 
            uint256 stakeRewardPerBlock, uint256 poolRewardPerBlock, uint256 salePrice, 
            uint256 salePriceDiv) {
        require(pools.length == poolShares.length, "pools and shares data lenght different");
        
        uint256 totalShare = 0;
        for (uint i = 0; i < pools.length; i++) {
            _pools[pools[i]] = PoolInfo(poolShares[i], 0);
            totalShare = totalShare.add(poolShares[i]);
        }

        _totalShare = totalShare;
        _rewardToken = IERC20Mintable(rewardToken);
        _poolRewardPerBlock = poolRewardPerBlock;
        _stakeRewardPerBlock = stakeRewardPerBlock;
        _salePrice = salePrice;
        _salePriceDiv = salePriceDiv;
    }

    function startStaking(uint256 startBlock) external onlyOwner {
        require(block.number <= startBlock, "invalid start block");

        _startBlock = startBlock;
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

        _rewardToken.mint(msg.sender, amount);
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

    // in effect from last reward block
    function changeStakeReward(uint256 reward) external onlyOwner {
        require(reward != _stakeRewardPerBlock, "no change");
        _stakeRewardPerBlock = reward;
    }

    function update() internal {
        uint256 lastRewardBlock = _lastRewardBlock;
        if (_totalStake == 0) {
            _lastRewardBlock = block.number;
            return;
        }

        if (block.number <= _startBlock) {
            return;
        }

        uint256 multiplier = block.number.sub(lastRewardBlock);
        uint256 reward = multiplier.mul(_stakeRewardPerBlock);

        _accAmountPerShare = _accAmountPerShare.add(reward.mul(1e12).div(_totalStake));
        _lastRewardBlock = block.number;
        _rewardToken.mint(address(this), reward);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "amount must be greater than zero");

        StakerInfo storage staker = _stakers[msg.sender];
        update();

        if (staker.amount > 0) {
            uint256 pending = staker.amount.mul(_accAmountPerShare).div(1e12).sub(staker.rewardDebt);

            _stakeRewardMinted = _stakeRewardMinted.add(pending);
            _rewardToken.safeTransfer(msg.sender, pending); // return pending reward
        }

        _totalStake = _totalStake.add(amount);
        staker.amount = staker.amount.add(amount);
        staker.rewardDebt = staker.amount.mul(_accAmountPerShare).div(1e12);

        _rewardToken.safeTransferFrom(msg.sender, address(this), amount); // move staking amount in
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "amount must be greater than zero");

        StakerInfo storage staker = _stakers[msg.sender];
        require(staker.amount >= amount, "staked amount not enough");
        update();

        uint256 pending = staker.amount.mul(_accAmountPerShare).div(1e12).sub(staker.rewardDebt);
        _rewardToken.safeTransfer(msg.sender, pending); // return pending reward
        _stakeRewardMinted = _stakeRewardMinted.add(pending);

        staker.amount = staker.amount.sub(amount);
        staker.rewardDebt = staker.amount.mul(_accAmountPerShare).div(1e12);
        _totalStake = _totalStake.sub(amount);
        _rewardToken.safeTransfer(msg.sender, amount);
    }

    function getStakeReward(address stakerAddr) external view returns (uint256) {
        StakerInfo storage staker = _stakers[stakerAddr];

        uint256 accAmountPerShare = _accAmountPerShare;

        if (block.number > _lastRewardBlock && _totalStake != 0) {
            uint256 multiplier = block.number.sub(_lastRewardBlock);
            uint256 reward = multiplier.mul(_stakeRewardPerBlock);
            accAmountPerShare = accAmountPerShare.add(reward.mul(1e12).div(_totalStake));
        }

        return staker.amount.mul(accAmountPerShare).div(1e12).sub(staker.rewardDebt);
    }

    function redeemStakeReward() external {
        StakerInfo storage staker = _stakers[msg.sender];
        update();

        uint256 pending = staker.amount.mul(_accAmountPerShare).div(1e12).sub(staker.rewardDebt);
        staker.rewardDebt = 0;

        _stakeRewardMinted = _stakeRewardMinted.add(pending);
        _rewardToken.safeTransfer(msg.sender, pending); // return pending reward
    }
}