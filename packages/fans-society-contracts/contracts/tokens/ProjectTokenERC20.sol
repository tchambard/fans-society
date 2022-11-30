// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { ERC20Upgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

import { IProjectTokenERC20 } from './interfaces/IProjectTokenERC20.sol';
import 'hardhat/console.sol';

contract ProjectTokenERC20 is
	Initializable,
	ERC20Upgradeable,
	IProjectTokenERC20
{
	uint256 public maxTotalSupply;

	address private owner;

	mapping(address => bool) private claimed;

	function initialize(
		string memory _name,
		string memory _symbol,
		uint40 _totalSupply,
		uint40 _ammGlobalShare,
		uint40 _ammPoolShare,
		uint40 _authorGlobalShare,
		address _amm,
		address _author
	) public virtual initializer {
		require(
			_totalSupply >= _ammGlobalShare + _authorGlobalShare,
			'total supply too small'
		);
		owner = _amm;
		maxTotalSupply = _totalSupply;

		__ProjectTokenERC20_init(
			_name,
			_symbol,
			_ammGlobalShare,
			_ammPoolShare,
			_authorGlobalShare,
			_amm,
			_author
		);
	}

	/**
	 * @dev Mint supplies
	 * - `ammShare` amount of token and transfers them to `amm` contract.
	 * - `authorShare` amount of token and transfers them to `author`.
	 * - `projectShare` amount of token and transfers them to `projectContract`.
	 *
	 * See {ERC20-constructor}.
	 */
	function __ProjectTokenERC20_init(
		string memory _name,
		string memory _symbol,
		uint40 _ammGlobalShare,
		uint40 _ammPoolShare,
		uint40 _authorGlobalShare,
		address _amm,
		address _author
	) internal onlyInitializing {
		__ERC20_init_unchained(_name, _symbol);
		__ProjectTokenERC20_init_unchained(
			_ammGlobalShare,
			_ammPoolShare,
			_authorGlobalShare,
			_amm,
			_author
		);
	}

	function __ProjectTokenERC20_init_unchained(
		uint40 _ammGlobalShare,
		uint40 _ammPoolShare,
		uint40 _authorGlobalShare,
		address _amm,
		address _author
	) internal onlyInitializing {
		require(_ammGlobalShare >= _ammPoolShare, 'AMM pool share too large');
		_mint(_amm, _ammGlobalShare);
		_mint(_author, _authorGlobalShare);
		_approve(_amm, owner, _ammPoolShare);
	}

	function claim(address account, uint256 amount) external {
		require(msg.sender == owner, 'Caller is not AMM');
		require(!claimed[account], 'already claimed');
		uint256 totalSupply = totalSupply();
		require((totalSupply + amount) <= maxTotalSupply, 'maxTotalSupply limit');
		_mint(account, amount);
		claimed[account] = true;
	}
}
