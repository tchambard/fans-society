// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { IProjectTokenERC20 } from './IProjectTokenERC20.sol';

/**
 * IProjectTokenFactory Fans Society Interface
 * @author Teddy Chambard, Nicolas Thierry
 */
interface IProjectTokenFactory {
	/**
	 * Allow anyone to exchange ERC20 tokens (ETH is supported)
	 * @param _projectId The project ID to create a token for
	 * @param _name The name of the token
	 * @param _symbol The symbol of the token
	 * @param _totalSupply The max total supply to allow
	 * @param _initialSupply The initial supply to mint
	 * @return tokenAddress The created ERC20 token address
	 */
	function createToken(
		uint256 _projectId,
		string memory _name,
		string memory _symbol,
		uint112 _totalSupply,
		uint112 _initialSupply
	) external returns (address tokenAddress);
}
