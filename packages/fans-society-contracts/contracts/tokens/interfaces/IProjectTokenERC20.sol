// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { IERC20MetadataUpgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';

interface IProjectTokenERC20 is IERC20MetadataUpgradeable {
	event TokenClaimed(address account, uint256 amount);

	/**
	 * Allows to approve and transfer in the same time
	 * @dev Reserved to AMM contract
	 * @param from The name of ERC20 token
	 * @param to The symbol of ERC20 token
	 * @param value The AMM contract address
	 */
	function safeTransferFrom(
		address from,
		address to,
		uint256 value
	) external;

	/**
	 * Allows to claim projects token after participating to project ICO
	 * @dev Reserved to AMM contract
	 * @param _account The account address for ICO token reward to be claimed
	 * @param _amount The amount of tokens to mint for recipient
	 */
	function claim(address _account, uint256 _amount) external;
}
