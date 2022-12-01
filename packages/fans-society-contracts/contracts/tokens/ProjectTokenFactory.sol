// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';

import { IProjectTokenFactory } from './interfaces/IProjectTokenFactory.sol';
import { ProjectTokenERC20 } from './ProjectTokenERC20.sol';

contract ProjectTokenFactory is IProjectTokenFactory {
	address private immutable implementation;

	event TokenCreated(address token, string name, string symbol);

	constructor() {
		implementation = address(new ProjectTokenERC20());
	}

	function createToken(
		string memory _name,
		string memory _symbol,
		address _amm,
		uint40 _totalSupply,
		uint40 _initialSupply
	) public returns (address) {
		address token = Clones.clone(implementation);
		ProjectTokenERC20(token).initialize(
			_name,
			_symbol,
			_amm,
			_totalSupply,
			_initialSupply
		);
		emit TokenCreated(token, _name, _symbol);
		return token;
	}
}
