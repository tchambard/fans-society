// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Address } from '@openzeppelin/contracts/utils/Address.sol';
import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { IPoolFactory } from './interfaces/IPoolFactory.sol';
import { Pool } from './Pool.sol';
import { PoolHelpers } from './PoolHelpers.sol';
import { IPool } from './interfaces/IPool.sol';
import { AMMFactorySecurity } from '../common/AMMFactorySecurity.sol';

contract PoolFactory is IPoolFactory, Ownable, AMMFactorySecurity {
	address private immutable fansSocietyAddress;

	address private immutable poolImplementationAddress;

	event PoolCreated(
		address indexed pool,
		address indexed tokenX,
		address indexed tokenY
	);

	constructor(
		address _amm,
		address _poolImplementationAddress,
		address _fansSocietyAddress
	) AMMFactorySecurity(_amm) {
		fansSocietyAddress = _fansSocietyAddress;
		poolImplementationAddress = _poolImplementationAddress;
	}

	function createPool(address _tokenX, address _tokenY)
		public
		onlyAmm
		returns (address poolAddress)
	{
		(address tokenX, address tokenY, bytes32 salt) = PoolHelpers.computePoolSalt(
			_tokenX,
			_tokenY
		);
		require(
			Address.isContract(_tokenX) && Address.isContract(_tokenY),
			'not contract'
		);

		poolAddress = Clones.cloneDeterministic(poolImplementationAddress, salt);
		Pool(poolAddress).initialize(amm, fansSocietyAddress, tokenX, tokenY);

		emit PoolCreated(poolAddress, tokenX, tokenY);
		return (poolAddress);
	}

	function getPool(address _tokenX, address _tokenY)
		external
		view
		returns (address pool)
	{
		(, , bytes32 salt) = PoolHelpers.computePoolSalt(_tokenX, _tokenY);
		return Clones.predictDeterministicAddress(poolImplementationAddress, salt);
	}
}
