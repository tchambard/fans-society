// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { IPool } from './IPool.sol';

/**
 * IPoolFactory Fans Society Interface
 * @author Teddy Chambard, Nicolas Thierry
 */
interface IPoolFactory {
	/**
	 * Allows to create a new pool for a pair of ERC20 tokens
	 * @param _token1 The first token address
	 * @param _token2 The second token address
	 * @return poolAddress The pool address
	 */
	function createPool(address _token1, address _token2)
		external
		returns (address poolAddress);

	/**
	 * Allows to retrieve a pool address giving two ERC20 tokens addresses
	 * This will use Clones capabilities with the `predictDeterministicAddress` function
	 * @param _token1 The first token address
	 * @param _token2 The second token address
	 */
	function getPool(address _token1, address _token2)
		external
		view
		returns (address pool);
}
