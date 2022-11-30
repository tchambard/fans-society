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
		uint40 _totalSupply,
		uint40 _ammGlobalShare,
		uint40 _ammPoolShare,
		uint40 _authorGlobalShare,
		address _amm,
		address _author
	) public returns (address) {
		require(msg.sender == _amm, 'Caller is not AMM');
		address token = Clones.clone(implementation);
		ProjectTokenERC20(token).initialize(
			_name,
			_symbol,
			_totalSupply,
			_ammGlobalShare,
			_ammPoolShare,
			_authorGlobalShare,
			_amm,
			_author
		);
		emit TokenCreated(token, _name, _symbol);
		return token;
	}
}
