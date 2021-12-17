//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0<=0.8.9;


import "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";


contract Founder is Ownable {
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

 


    function multiTransferAndLock(address _lockedAddress, uint256[] memory _amountArr, uint256[] memory _releaseDaysArr) public onlyOwner
    {
        require(_amountArr.length !=0);
        require(_releaseDaysArr.length !=0); 
        require(_amountArr.length == _releaseDaysArr.length); 
        for(uint i=0; i<_amountArr.length; i++){
                transferAndLock(_lockedAddress, _amountArr[i], _releaseDaysArr[i]);
        }
        
    }

    function transferAndLock(address _lockedAddress,uint256 _amount,uint _releaseDays) public onlyOwner
    {
        uint releasedDate = block.timestamp + _releaseDays * (1 days);
        LockItemByTime memory  lockItemByTime = LockItemByTime({amount:_amount, releaseDate:releasedDate,isRelease:0});
        totalLockedAmount = totalLockedAmount + _amount;
        lockListByTime[_lockedAddress].push(lockItemByTime);

    }
    function releaseMyToken(uint256 _index) public
    {
        if(getLockedTimeAt(msg.sender,_index)<=block.timestamp && getLockedIsReleaseAt(msg.sender,_index)==0)
        {
            lockListByTime[msg.sender][_index].isRelease=1;
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

    function getWithdrewAmount(address _lockedAddress) public view returns(uint256 _amount)
	{
	    uint256 withdrewAmount =0;
	    for(uint256 j = 0;j<getLockedListSize(_lockedAddress);j++)
	    {
            uint isRelease = getLockedIsReleaseAt(_lockedAddress, j);
	        if(isRelease==1)
	        {
	            uint256 temp = getLockedAmountAt(_lockedAddress,j);
	            withdrewAmount += temp;
	        }
	    }
	    return withdrewAmount;
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
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawErc20(IERC20 token) public onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}
