// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';

import { IProjectTokenFactory } from './interfaces/IProjectTokenFactory.sol';
import { ProjectTokenERC20 } from './ProjectTokenERC20.sol';

contract ProjectTokenFactory is IProjectTokenFactory {
	address private immutable tokenImplementationAddress;

	event TokenCreated(
		uint256 indexed projectId,
		address token,
		string name,
		string symbol
	);

	constructor(address _tokenImplementationAddress) {
		tokenImplementationAddress = _tokenImplementationAddress;
	}

	function createToken(
		uint256 _projectId,
		string memory _name,
		string memory _symbol,
		address _amm,
		uint112 _totalSupply,
		uint112 _initialSupply
	) public returns (address) {
		address token = Clones.clone(tokenImplementationAddress);
		ProjectTokenERC20(token).initialize(
			_name,
			_symbol,
			_amm,
			_totalSupply,
			_initialSupply
		);
		emit TokenCreated(_projectId, token, _name, _symbol);
		return token;
	}
}
