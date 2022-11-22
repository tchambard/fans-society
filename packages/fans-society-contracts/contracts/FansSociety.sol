// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Projects } from './Projects.sol';

contract FansSociety is Projects  {
    
    constructor(
        address _wethTokenAddress,
		address _tokenFactoryAddress, 
		address _poolFactoryAddress
    ) Projects(_wethTokenAddress, _tokenFactoryAddress, _poolFactoryAddress) {
        
    }

}
