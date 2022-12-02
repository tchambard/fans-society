// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { IERC20MetadataUpgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';

interface IProjectTokenERC20 is IERC20MetadataUpgradeable {
	
	event TokenClaimed(address account, uint amount);

	function safeTransferFrom(address from, address to, uint256 value) external;

	function claim(address account, uint256 amount) external;

}
