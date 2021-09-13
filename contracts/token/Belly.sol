//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.5;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract Belly is ERC20("Belly", "Belly"), ERC20Burnable ,
        ERC20Capped( 1000000000000*10**uint256(18)), Ownable {
    using SafeMath for uint256;
    address pairAddress;
    bool takeFee;
    uint256 dexTaxFee;
    constructor() {
	    _mint(msg.sender,100000000*10**uint256(18));
        transferOwnership(msg.sender);
    }
     
    function setPairAddress(address _pairAddress) public onlyOwner {
        pairAddress=_pairAddress;
    }
    function setDexTaxFee(uint256 _dexTaxFee) public onlyOwner {
        dexTaxFee=_dexTaxFee;
    }
    function setTakeFee(bool _takeFee) public onlyOwner {
        takeFee=_takeFee;
    }


    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to,amount);
    }
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        if(recipient==pairAddress&&takeFee){
            uint256 taxFee = amount.mul(dexTaxFee).div(100);
            amount=amount - taxFee;
            return super.transfer(recipient,taxFee);    
        }   
        return super.transfer(recipient,amount);    
    }
   
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Capped) {
        super._beforeTokenTransfer(from, to, amount);
    }

    

    function withdraw() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function withdrawErc20(IERC20 token) public onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
    
}
