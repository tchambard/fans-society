// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { IProjectTokenERC20 } from './IProjectTokenERC20.sol';

interface IProjectTokenFactory {
	function createToken(
		uint256 _projectId,
		string memory _name,
		string memory _symbol,
		address _amm,
		uint112 _totalSupply,
		uint112 _initialSupply
	) external returns (address);
}
