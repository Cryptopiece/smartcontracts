//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.5;

import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

interface IERC20Mintable is IERC20 {

    function mint(address to, uint256 amount) external;
}