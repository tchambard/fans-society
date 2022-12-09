// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Address } from '@openzeppelin/contracts/utils/Address.sol';
import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { IPoolFactory } from './interfaces/IPoolFactory.sol';
import { Pool } from './Pool.sol';
import { IPool } from './interfaces/IPool.sol';
import { AMMFactorySecurity } from '../common/AMMFactorySecurity.sol';

/**
 * PoolFactory Fans Society Interface
 * @dev This contract uses Clones mechanism optimized for minimal gas fees when deploying new pool contracts
 * @author Teddy Chambard, Nicolas Thierry
 */
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

	/**
	 * @dev See {IPoolFactory-createPool}.
	 */
	function createPool(address _tokenX, address _tokenY)
		public
		onlyAmm
		returns (address poolAddress)
	{
		(address tokenX, address tokenY, bytes32 salt) = computePoolSalt(
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

	/**
	 * @dev See {IPoolFactory-getPool}.
	 */
	function getPool(address _tokenX, address _tokenY)
		external
		view
		returns (address pool)
	{
		(, , bytes32 salt) = computePoolSalt(_tokenX, _tokenY);
		return Clones.predictDeterministicAddress(poolImplementationAddress, salt);
	}

	function computePoolSalt(address _tokenX, address _tokenY)
		private
		pure
		returns (
			address tokenX,
			address tokenY,
			bytes32 salt
		)
	{
		(tokenX, tokenY) = sortTokens(_tokenX, _tokenY);
		salt = keccak256(abi.encodePacked(tokenX, tokenY));
	}

	function sortTokens(address _tokenX, address _tokenY)
		private
		pure
		returns (address tokenX, address tokenY)
	{
		require(_tokenX != _tokenY, 'same token');
		(tokenX, tokenY) = _tokenX < _tokenY
			? (_tokenX, _tokenY)
			: (_tokenY, _tokenX);
		require(tokenX != address(0), 'invalid token');
	}
}
