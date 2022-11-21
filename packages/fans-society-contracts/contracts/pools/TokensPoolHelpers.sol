// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Address } from '@openzeppelin/contracts/utils/Address.sol';
import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';
import { IERC20Upgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';

import { TokensPool } from './TokensPool.sol';
import { ITokensPool } from './interfaces/ITokensPool.sol';

function computeTokensPairHash(address _token1, address _token2) pure returns (address token1, address token2, bytes32 _hash) {
    (token1, token2) = sortTokens(_token1, _token2);
    _hash = keccak256(abi.encodePacked(token1, token2));
}

function sortTokens(address _token1, address _token2) pure returns (address token1, address token2) {
    (token1, token2) = _token1 < _token2 ? (_token1, _token2) : (_token2, _token1);
}