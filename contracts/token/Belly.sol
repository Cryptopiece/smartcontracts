//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.5<=0.8.8;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract Belly is ERC20("Belly", "Belly"), ERC20Burnable ,
        ERC20Capped( 1000000000000*10**uint256(18)), Ownable {
    using SafeMath for uint256;
    address pairAddress;
    address wbnbAddress;
    
    IUniswapV2Router02 router;
    bool takeFee;
    address marketingAddress;
    uint256 marketingTaxFee;
    
    address bossRaidAddress;
    uint256 bossRaidTaxFee;
    
    address treasureAddress;
    uint256 treasureTaxFee;

    constructor() {
	    _mint(msg.sender,100000000*10**uint256(18));
        transferOwnership(msg.sender);
    }
     
    function setMarketingAddress(address _marketingAddress,uint256 _marketingTaxFee) public onlyOwner {
        marketingAddress = _marketingAddress;
        marketingTaxFee = _marketingTaxFee;
    }
    function setBossRaidAddress(address _bossRaidAddress,uint256 _bossRaidTaxFee) public onlyOwner {
        bossRaidAddress = _bossRaidAddress;
        bossRaidTaxFee =  _bossRaidTaxFee;
    }
    function setTreasureAddress(address _treasureAddress,uint256 _treasureTaxFee) public onlyOwner {
        treasureAddress = _treasureAddress;
        treasureTaxFee = _treasureTaxFee;
    }
    function setWbnbAddress(address _wbnbAddress) public onlyOwner {
        wbnbAddress = _wbnbAddress;
    }
    function setRouterAddress(IUniswapV2Router02 _router) public onlyOwner {
        router = _router;
    }
    function setPairAddress(address _pairAddress) public onlyOwner {
        pairAddress = _pairAddress;
    }
   
    function setTakeFee(bool _takeFee) public onlyOwner {
        takeFee = _takeFee;
    }


    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to,amount);
    }
    /*
    address marketingAddress;
    uint256 marketingTaxFee;
    
    address bossRaidAddress;
    uint256 bossRaidTaxFee;
    
    address treasureAddress;
    uint256 treasureTaxFee;
    
    */
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        if(recipient==pairAddress&&takeFee){
            uint256 taxFee = amount.mul(marketingTaxFee+bossRaidTaxFee+treasureTaxFee).div(100);
            amount = amount - taxFee;
            address[] memory path = new address[](2);
            path[0] = address(this);
            path[1] = wbnbAddress;
            router.swapExactTokensForETH(amount.mul(marketingTaxFee).div(100),0,path,marketingAddress,block.timestamp);
            router.swapExactTokensForETH(amount.mul(bossRaidTaxFee).div(100),0,path,bossRaidAddress,block.timestamp);
            router.swapExactTokensForETH(amount.mul(treasureTaxFee).div(100),0,path,treasureAddress,block.timestamp);
            
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
