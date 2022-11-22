// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Address } from '@openzeppelin/contracts/utils/Address.sol';
import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { IERC20MetadataUpgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';

import { IProjectTokenFactory } from './interfaces/IProjectTokenFactory.sol';
import { ProjectTokenERC20 } from './ProjectTokenERC20.sol';

contract ProjectTokenFactory is IProjectTokenFactory, Ownable {
    
    address immutable private proxy;

    mapping(address => IERC20MetadataUpgradeable) public tokens;

    event TokenCreated(address token, string name, string symbol);

    constructor() {
        proxy = address(new ProjectTokenERC20());
    }

    function createToken(
        string memory _name, 
        string memory _symbol, 
        address _fsociety,
        uint256 _fsocietySupply, 
        address _author,
        uint256 _authorSupply, 
        uint256 _otherSupply
    ) public onlyOwner returns (address) {
        address token = Clones.clone(proxy);
        ProjectTokenERC20(token).initialize(_name, _symbol, _fsociety, _fsocietySupply, _author, _authorSupply, msg.sender, _otherSupply);
        emit TokenCreated(token, _name, _symbol);
        return token;
    }

}

