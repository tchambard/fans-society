// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Address } from '@openzeppelin/contracts/utils/Address.sol';
import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { ITokensPoolFactory } from './interfaces/ITokensPoolFactory.sol';
import { TokensPool } from './TokensPool.sol';
import { ITokensPool } from './interfaces/ITokensPool.sol';
import { computeTokensPairHash } from './TokensPoolHelpers.sol';

contract TokensPoolFactory is ITokensPoolFactory, Ownable {
    
    address immutable private proxy;

    /**
     * @dev pools mapping allow to retrieve a pool address with its hash
     */
    mapping(bytes32 => address) private pools;

    /**
     * @dev tokenPools mapping allow to retrivee all pools addresses corresponding to a specific token
     */
    mapping(address => address[]) private tokenPools;

    event PoolCreated(address poolAddress, bytes32 _hash);

    constructor() {
        proxy = address(new TokensPool());
    }

    function createPool(
        address _token1,
        address _token2
    ) public onlyOwner returns (address poolAddress, bytes32 poolHash) {
        require(_token1 != _token2, 'same token');
        (address token1, address token2, bytes32 _hash) = computeTokensPairHash(_token1, _token2);
        require(token1 != address(0) && Address.isContract(_token1) && Address.isContract(_token2), 'invalid address');

        poolAddress = Clones.clone(proxy);
        TokensPool(poolAddress).initialize(token1, token2);

        pools[_hash] = poolAddress;
        tokenPools[token1].push(poolAddress);
        tokenPools[token2].push(poolAddress);

        emit PoolCreated(poolAddress, _hash);
        return (poolAddress, _hash);
    }

    function getPoolByTokensPair(address _token1, address _token2) external view returns (ITokensPool) {
        (,, bytes32 hash) = computeTokensPairHash(_token1, _token2);
        require(address(pools[hash]) != address(0), 'pool not found');
        return ITokensPool(pools[hash]);
    }

    function getPoolByHash(bytes32 _hash) external view returns (ITokensPool) {
        require(address(pools[_hash]) != address(0), 'pool not found');
        return ITokensPool(pools[_hash]);
    }

    function getTokenPools(address _token) external view returns (address[] memory) {
        require(tokenPools[_token].length != 0, 'no pool found');
        return tokenPools[_token];
    }
}
