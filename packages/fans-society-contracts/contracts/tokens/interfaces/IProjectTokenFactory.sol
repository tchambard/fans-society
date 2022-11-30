// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { IProjectTokenERC20 } from './IProjectTokenERC20.sol';

interface IProjectTokenFactory {
	function createToken(
		string memory _name,
		string memory _symbol,
		address _amm,
		uint40 _totalSupply,
		uint40 _initialSupply
	) external returns (address);
}
