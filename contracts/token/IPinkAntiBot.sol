// SPDX-License-Identifier: MIT
pragma solidity >=0.7.5<=0.8.9;

interface IPinkAntiBot {
  function setTokenOwner(address owner) external;

  function onPreTransferCheck(
    address from,
    address to,
    uint256 amount
  ) external;
}
