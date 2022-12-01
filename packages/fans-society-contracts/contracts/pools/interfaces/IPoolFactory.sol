// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { IPool } from './IPool.sol';

interface IPoolFactory {
	function createPool(
		address _amm,
		address _token1,
		address _token2
	) external returns (address poolAddress);

	function getTokenPools(
		address _token
	) external view returns (address[] memory);

	function getPool(
		address _token1,
		address _token2
	) external view returns (address pool);
}
