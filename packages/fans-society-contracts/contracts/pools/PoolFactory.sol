// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Address } from '@openzeppelin/contracts/utils/Address.sol';
import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { IPoolFactory } from './interfaces/IPoolFactory.sol';
import { Pool } from './Pool.sol';
import { PoolHelpers } from './PoolHelpers.sol';
import { IPool } from './interfaces/IPool.sol';

contract PoolFactory is IPoolFactory, Ownable {
	address private immutable implementation;

	/**
	 * @dev tokenPools mapping allow to retrieve all pools addresses corresponding to a specific token
	 */
	mapping(address => address[]) private tokenPools;

	event PoolCreated(address pool, address token1, address token2);

	constructor() {
		implementation = address(new Pool());
	}

	function createPool(
		address _token1,
		address _token2
	) public returns (address poolAddress) {
		(address token1, address token2, bytes32 salt) = PoolHelpers.computePoolSalt(
			_token1,
			_token2
		);
		require(
			Address.isContract(_token1) && Address.isContract(_token2),
			'not contract'
		);

		poolAddress = Clones.cloneDeterministic(implementation, salt);
		Pool(poolAddress).initialize(token1, token2);

		tokenPools[token1].push(poolAddress);
		tokenPools[token2].push(poolAddress);

		emit PoolCreated(poolAddress, token1, token2);
		return (poolAddress);
	}

	function getTokenPools(
		address _token
	) external view returns (address[] memory) {
		require(tokenPools[_token].length != 0, 'no pool found');
		return tokenPools[_token];
	}

	function getPool(
		address _token1,
		address _token2
	) external view returns (address pool) {
		(, , bytes32 salt) = PoolHelpers.computePoolSalt(_token1, _token2);
		return Clones.predictDeterministicAddress(implementation, salt);
	}
}
