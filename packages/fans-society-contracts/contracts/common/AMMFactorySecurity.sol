// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

abstract contract AMMFactorySecurity {
	address public immutable amm;

	constructor(address _amm) {
		amm = _amm;
	}

	modifier onlyAmm() {
		require(msg.sender == amm, 'Caller is not AMM');
		_;
	}
}
