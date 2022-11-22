// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { IERC20MetadataUpgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';

interface IProjectTokenFactory {
    
    function tokens(address tokenAddress) external returns (IERC20MetadataUpgradeable);

    function createToken(
        string memory _name, 
        string memory _symbol, 
        address _fsocietyAddress,
        uint256 _fsocietySupply,
        address _author,
        uint256 _authorSupply, 
        uint256 _otherSupply
    ) external returns (address);
    
}
