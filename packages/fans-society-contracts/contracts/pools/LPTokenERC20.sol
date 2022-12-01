// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { ERC20BurnableUpgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol';

contract LPTokenERC20 is Initializable, ERC20BurnableUpgradeable {

	address private amm;

	modifier onlyAmm() {
		require(msg.sender == amm, 'Caller is not AMM');
		_;
	}

	/**
     * @dev Sets the AMM address.
     */
    function __LPTokenERC20_init(address _amm) internal onlyInitializing {
        __ERC20_init_unchained('Fans Society Token', 'FST');
		amm = _amm;
    }

	function safeTransferFrom(
		address from,
		address to,
		uint256 value
	) external onlyAmm {
		_approve(from, amm, value);
		_transfer(from, to, value);
	}

}
