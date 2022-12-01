// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Address } from '@openzeppelin/contracts/utils/Address.sol';

library PoolHelpers {
	function computePoolSalt(
		address _tokenX,
		address _tokenY
	) internal pure returns (address tokenX, address tokenY, bytes32 salt) {
		(tokenX, tokenY) = sortTokens(_tokenX, _tokenY);
		salt = keccak256(abi.encodePacked(tokenX, tokenY));
	}

	function sortTokens(
		address _tokenX,
		address _tokenY
	) internal pure returns (address tokenX, address tokenY) {
		require(_tokenX != _tokenY, 'same token');
		(tokenX, tokenY) = _tokenX < _tokenY
			? (_tokenX, _tokenY)
			: (_tokenY, _tokenX);
		require(tokenX != address(0), 'invalid token');
	}
}
