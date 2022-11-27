// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { IProjectTokenERC20 } from './IProjectTokenERC20.sol';

interface IProjectTokenFactory {
	function createToken(
		string memory _name,
		string memory _symbol,
		uint40 _totalSupply,
		uint40 _ammGlobalShare,
		uint40 _ammPoolShare,
		uint40 _authorGlobalShare,
		uint40 _authorPoolShare,
		address _amm,
		address _author
	) external returns (address);
}
