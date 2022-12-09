// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { ERC20Upgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import { SafeERC20Upgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';

import { IProjectTokenERC20 } from './interfaces/IProjectTokenERC20.sol';
import 'hardhat/console.sol';

/**
 * ProjectTokenERC20 Fans Society Interface
 * @author Teddy Chambard, Nicolas Thierry
 */
contract ProjectTokenERC20 is
	Initializable,
	ERC20Upgradeable,
	IProjectTokenERC20
{
	uint256 public maxTotalSupply;

	address private amm;

	mapping(address => bool) private claimed;

	modifier onlyAmm() {
		require(msg.sender == amm, 'Caller is not AMM');
		_;
	}

	/**
	 * Allow anyone to exchange ERC20 tokens (ETH is supported)
	 * @param _name The name of ERC20 token
	 * @param _symbol The symbol of ERC20 token
	 * @param _amm The AMM contract address
	 * @param _totalSupply The max total supply of tokens
	 * @param _initialSupply The initial supply of tokens
	 */
	function initialize(
		string memory _name,
		string memory _symbol,
		address _amm,
		uint112 _totalSupply,
		uint112 _initialSupply
	) public virtual initializer {
		require(_totalSupply >= _initialSupply, 'total supply too small');
		amm = _amm;
		maxTotalSupply = _totalSupply;

		__ProjectTokenERC20_init(_name, _symbol, _initialSupply);
	}

	/**
	 * @dev Mint supplies
	 * - `initialSupply` amount of tokens to mint and assign to `amm` contract.
	 *
	 * See {ERC20-constructor}.
	 */
	function __ProjectTokenERC20_init(
		string memory _name,
		string memory _symbol,
		uint112 _initialSupply
	) internal onlyInitializing {
		__ERC20_init_unchained(_name, _symbol);
		__ProjectTokenERC20_init_unchained(_initialSupply);
	}

	function __ProjectTokenERC20_init_unchained(uint112 _initialSupply)
		internal
		onlyInitializing
	{
		_mint(amm, _initialSupply);
	}

	/**
	 * @dev See {IProjectTokenERC20-safeTransferFrom}.
	 */
	function safeTransferFrom(
		address from,
		address to,
		uint256 value
	) external onlyAmm {
		_approve(from, amm, value);
		_transfer(from, to, value);
	}

	/**
	 * @dev See {IProjectTokenERC20-claim}.
	 */
	function claim(address _account, uint256 _amount) external onlyAmm {
		require(!claimed[_account], 'already claimed');
		uint256 totalSupply = totalSupply();
		require((totalSupply + _amount) <= maxTotalSupply, 'maxTotalSupply limit');
		_mint(_account, _amount);
		claimed[_account] = true;
		emit TokenClaimed(_account, _amount);
	}
}
