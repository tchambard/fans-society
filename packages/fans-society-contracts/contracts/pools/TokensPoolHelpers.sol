// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Address } from '@openzeppelin/contracts/utils/Address.sol';

library TokensPoolHelpers {

    function computePoolSalt(address _token1, address _token2) internal pure returns (address token1, address token2, bytes32 salt) {
        (token1, token2) = sortTokens(_token1, _token2);
        salt = keccak256(abi.encodePacked(token1, token2));
    }

    function sortTokens(address _token1, address _token2) internal pure returns (address token1, address token2) {
        require(_token1 != _token2, 'same token');
        (token1, token2) = _token1 < _token2 ? (_token1, _token2) : (_token2, _token1);
        require(token1 != address(0), 'invalid token');

    }

}