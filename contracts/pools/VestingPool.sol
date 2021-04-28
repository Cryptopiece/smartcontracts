//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.5;

import "../library/IERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";


contract VestingPool is Ownable {
    using SafeERC20 for IERC20Mintable;
    using SafeMath for uint256;

    IERC20Mintable _token;

    uint256 totalShare;

    constructor(address token) {
        _token = IERC20Mintable(token);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _token.mint(to, amount);
    }
}