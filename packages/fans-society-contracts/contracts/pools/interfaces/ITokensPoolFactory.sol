// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { ITokensPool } from './ITokensPool.sol';

interface ITokensPoolFactory {
    
    function createPool(
        address _token1,
        address _token2
    ) external returns (address poolAddress, bytes32 poolHash);

    function getPoolByTokensPair(address _token1, address _token2) external view returns (ITokensPool);

    function getPoolByHash(bytes32 _hash) external view returns (ITokensPool);

    function getTokenPools(address _token) external view returns (address[] memory);

}
