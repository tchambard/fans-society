// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract WETHToken is ERC20 {
    constructor() ERC20('Wrapped ETHER', 'WETH') {
        _mint(msg.sender, 1000 ether);
    }
}