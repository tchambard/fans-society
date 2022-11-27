// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

uint8 constant MULTIPLIER = 100;

/**
 * @dev Total tokens supply is dispatched between project author, investors and the protocol (AMM)
 * TOKENS REPATITION
 */

uint8 constant AMM_SUPPLY = 15;

uint8 constant INVESTORS_SUPPLY = 15;

uint8 constant AUTHOR_SUPPLY = 70;

/**
 * @dev AMM supply is shared between fans society team and liquidity pools
 */

uint8 constant AMM_TOKENS_TEAM_SHARES = 20;

uint8 constant AMM_TOKENS_POOL_SHARES = 80;

/**
 * @dev Author supply is partially added to liquidity pools
 */

uint8 constant AUTHOR_TOKENS_POOL_SHARES = 80;

/**
 * @dev Total ETH funds are dispatched between project author and the protocol (AMM)
 * FUNDS REPARTITION
 */

uint8 constant AMM_FUNDS = 15;

uint8 constant AUTHOR_FUNDS = 85;

/**
 * @dev AMM funds is shared between fans society team and liquidity pools
 */

uint8 constant AMM_FUNDS_FSOCIETY_SHARES = 20;

uint8 constant AMM_FUNDS_POOL_SHARES = 80;

/**
 * @dev AMM funds is shared between fans society team and liquidity pools
 */

uint8 constant AUTHOR_FUNDS_POOL_SHARES = 30;
