//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.5<=0.8.8;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Founder is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    

    IERC20 public _rewardToken;
    uint256 totalLockedAmount;

    
    struct LockItemByTime
    {
        uint256 amount;
        uint releaseDate;
        uint isRelease;
    }
    mapping (address => LockItemByTime[]) public lockListByTime;

    modifier onLockedRemain {
        require(totalLockedAmount < (3000000 * (10**uint256(18))), "Overflow transfer");
        _;
    }


    function multiTransferAndLock(address _lockedAddress, uint256[] memory _amountArr, uint256[] memory _releaseDaysArr) public onlyOwner onLockedRemain
    {
        if(_amountArr.length !=0 && _releaseDaysArr.length !=0 && _amountArr.length == _releaseDaysArr.length)
        {
            for(uint i=0; i<_amountArr.length; i++){
                transferAndLock(_lockedAddress, _amountArr[i], _releaseDaysArr[i]);
            }
        }
    }

    function transferAndLock(address _lockedAddress,uint256 _amount,uint _releaseDays) public onlyOwner onLockedRemain
    {
        uint releasedDate = (_releaseDays.mul(1 days)).add(block.timestamp);
        LockItemByTime memory  lockItemByTime = LockItemByTime({amount:_amount, releaseDate:releasedDate,isRelease:0});
        totalLockedAmount = totalLockedAmount.add(_amount);
        lockListByTime[_lockedAddress].push(lockItemByTime);

    }
    function releaseMyToken(uint256 _index) public
    {
        if(getLockedTimeAt(msg.sender,_index)<=block.timestamp && getLockedIsReleaseAt(msg.sender,_index)==0)
        {
            lockListByTime[msg.sender][_index].isRelease=1;
            // safeTransfer(contract IERC20 token, address to, uint256 value)
           _rewardToken.safeTransfer(msg.sender, lockListByTime[msg.sender][_index].amount);
        }

    }
    function releaseAllMyToken() public
    {
        for(uint256 i=0; i<getLockedListSize(msg.sender); i++)
        {
            releaseMyToken(i);
        } 

    }

    function getLockedAmountAt(address _lockedAddress, uint256 _index) public view returns(uint256 _amount)
	{
	    
	    return lockListByTime[_lockedAddress][_index].amount;
	}

    function getLockedIsReleaseAt(address _lockedAddress, uint256 _index) public view returns(uint256 _isRelease)
	{  
	    return lockListByTime[_lockedAddress][_index].isRelease;
	}
    function getLockedTimeAt(address _lockedAddress, uint256 _index) public view returns(uint256 _time)
	{
        return lockListByTime[_lockedAddress][_index].releaseDate;
	}

    function getLockedListSize(address _lockedAddress) public view returns(uint256 _length)
    {
            return lockListByTime[_lockedAddress].length;
    }

	function getAvailableAmount(address _lockedAddress) public view returns(uint256 _amount)
	{
	    uint256 availabelAmount =0;
	    for(uint256 j = 0;j<getLockedListSize(_lockedAddress);j++)
	    {
            uint isRelease = getLockedIsReleaseAt(_lockedAddress, j);
	        uint256 releaseDate = getLockedTimeAt(_lockedAddress,j);
	        if(releaseDate<=block.timestamp&&isRelease==0)
	        {
	            uint256 temp = getLockedAmountAt(_lockedAddress,j);
	            availabelAmount += temp;
	        }
	    }
	    return availabelAmount;
	}

    function getLockedFullAmount(address _lockedAddress) public view returns(uint256 _amount)
    {
        uint256 lockedAmount =0;
        for(uint256 j = 0;j<getLockedListSize(_lockedAddress);j++)
        {
            
                uint256 temp = getLockedAmountAt(_lockedAddress,j);
                lockedAmount += temp;
            
        }
        return lockedAmount;
    }

   

    constructor() {
        
    }

    function setRewardToken(IERC20 rewardToken) public onlyOwner{
        _rewardToken = rewardToken;
    }

    
    function withdraw() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function withdrawErc20(IERC20 token) public onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}