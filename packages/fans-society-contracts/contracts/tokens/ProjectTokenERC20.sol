// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { ERC20Upgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract ProjectTokenERC20 is Initializable, ERC20Upgradeable {
    function initialize(
        string memory _name, 
        string memory _symbol, 
        address _fsociety,
        uint256 _fsocietySupply,
        address _author,
        uint256 _authorSupply, 
        address _other,
        uint256 _otherSupply
    ) public virtual initializer {
        __ProjectTokenERC20_init(_name, _symbol, _fsociety, _fsocietySupply, _author, _authorSupply, _other, _otherSupply);
    }
    
    /**
     * @dev Mint supplies
     * - `fsocietySupply` amount of token and transfers them to `fsociety` contract.
     * - `authorSupply` amount of token and transfers them to `author`.
     * - `otherSupply` amount of token and transfers them to `otherContract`.
     *
     * See {ERC20-constructor}.
     */
    function __ProjectTokenERC20_init(
        string memory _name, 
        string memory _symbol, 
        address _fsociety,
        uint256 _fsocietySupply,
        address _author,
        uint256 _authorSupply, 
        address _other,
        uint256 _otherSupply
    ) internal onlyInitializing {
        __ERC20_init_unchained(_name, _symbol);
        __ProjectTokenERC20_init_unchained(_fsociety, _fsocietySupply, _author, _authorSupply, _other, _otherSupply);
    }

    function __ProjectTokenERC20_init_unchained(
        address _fsociety,
        uint256 _fsocietySupply,
        address _author,
        uint256 _authorSupply, 
        address _other,
        uint256 _otherSupply
    ) internal onlyInitializing {
        _mint(_fsociety, _fsocietySupply);
        _mint(_author, _authorSupply);
        _mint(_other, _otherSupply);
    }
}
