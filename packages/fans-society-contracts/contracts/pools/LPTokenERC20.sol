// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import { ERC20BurnableUpgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol';

contract LPTokenERC20 is ERC20BurnableUpgradeable {
	constructor() ERC20BurnableUpgradeable() {}
}
