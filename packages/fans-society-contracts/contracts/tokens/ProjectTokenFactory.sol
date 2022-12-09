// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';

import { IProjectTokenFactory } from './interfaces/IProjectTokenFactory.sol';
import { ProjectTokenERC20 } from './ProjectTokenERC20.sol';
import { AMMFactorySecurity } from '../common/AMMFactorySecurity.sol';

/**
 * ProjectTokenFactory Fans Society Interface
 * @dev This contract uses Clones mechanism optimized for minimal gas fees when deploying new ERC20 contracts
 * @author Teddy Chambard, Nicolas Thierry
 */
contract ProjectTokenFactory is IProjectTokenFactory, AMMFactorySecurity {
	address private immutable tokenImplementationAddress;

	event TokenCreated(
		uint256 indexed projectId,
		address token,
		string name,
		string symbol
	);

	constructor(address _amm, address _tokenImplementationAddress)
		AMMFactorySecurity(_amm)
	{
		tokenImplementationAddress = _tokenImplementationAddress;
	}

	/**
	 * @dev See {IProjectTokenFactory-createToken}.
	 */
	function createToken(
		uint256 _projectId,
		string memory _name,
		string memory _symbol,
		uint112 _totalSupply,
		uint112 _initialSupply
	) public onlyAmm returns (address) {
		address token = Clones.clone(tokenImplementationAddress);
		ProjectTokenERC20(token).initialize(
			_name,
			_symbol,
			amm,
			_totalSupply,
			_initialSupply
		);
		emit TokenCreated(_projectId, token, _name, _symbol);
		return token;
	}
}
