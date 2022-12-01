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
	address private immutable fansSocietyAddress;

	address private immutable implementation;

	/**
	 * @dev tokenPools mapping allow to retrieve all pools addresses corresponding to a specific token
	 */
	mapping(address => address[]) private tokenPools;

	event PoolCreated(address pool, address tokenX, address token2);

	constructor(address _fansSocietyAddress) {
		fansSocietyAddress = _fansSocietyAddress;
		implementation = address(new Pool());
	}

	function createPool(
		address _amm,
		address _tokenX,
		address _tokenY
	) public returns (address poolAddress) {
		(address tokenX, address token2, bytes32 salt) = PoolHelpers.computePoolSalt(
			_tokenX,
			_tokenY
		);
		require(
			Address.isContract(_tokenX) && Address.isContract(_tokenY),
			'not contract'
		);

		poolAddress = Clones.cloneDeterministic(implementation, salt);
		Pool(poolAddress).initialize(_amm, fansSocietyAddress, tokenX, token2);

		tokenPools[tokenX].push(poolAddress);
		tokenPools[token2].push(poolAddress);

		emit PoolCreated(poolAddress, tokenX, token2);
		return (poolAddress);
	}

	function getTokenPools(
		address _token
	) external view returns (address[] memory) {
		require(tokenPools[_token].length != 0, 'no pool found');
		return tokenPools[_token];
	}

	function getPool(
		address _tokenX,
		address _tokenY
	) external view returns (address pool) {
		(, , bytes32 salt) = PoolHelpers.computePoolSalt(_tokenX, _tokenY);
		return Clones.predictDeterministicAddress(implementation, salt);
	}
}
