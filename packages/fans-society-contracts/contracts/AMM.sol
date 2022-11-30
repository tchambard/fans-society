// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Projects } from './Projects.sol';

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import { IWETH } from './interfaces/IWETH.sol';
import { IProjectTokenFactory } from './tokens/interfaces/IProjectTokenFactory.sol';
import { IPoolFactory } from './pools/interfaces/IPoolFactory.sol';
import { IProjectTokenERC20 } from './tokens/interfaces/IProjectTokenERC20.sol';
import './common/Constants.sol';

import 'hardhat/console.sol';

contract AMM is Projects {
	address internal fansSociety;
	address internal weth;

	address internal tokenFactory;
	address internal poolFactory;

	event TokensClaimed(
		uint256 indexed projectId,
		address indexed token,
		address indexed caller,
		uint256 amount
	);

	constructor(
		address _fansSocietyAddress,
		address _wethTokenAddress,
		address _tokenFactoryAddress,
		address _poolFactoryAddress
	) Projects() {
		fansSociety = _fansSocietyAddress;
		weth = _wethTokenAddress;
		tokenFactory = _tokenFactoryAddress;
		poolFactory = _poolFactoryAddress;
	}

	function launchProject(
		uint256 _id
	) external statusIs(_id, ProjectStatus.Completed) {
		Project memory project = projects[_id];

		uint40 totalSupply = uint40(MULTIPLIER) * project.totalSupply;

		uint40 ammSupplyShares = uint40(AMM_SUPPLY) * totalSupply;

		uint40 authorSupplyShares = uint40(AUTHOR_SUPPLY) * totalSupply;

		uint40 ammTokensPoolShares = (uint40(AMM_TOKENS_POOL_SHARES) *
			ammSupplyShares) / 100;

		projects[_id].tokenAddress = IProjectTokenFactory(tokenFactory).createToken(
			project.name,
			project.symbol,
			uint40(MULTIPLIER) * totalSupply,
			ammSupplyShares,
			ammTokensPoolShares,
			authorSupplyShares,
			address(this),
			project.authorAddress
		);

		address pool = IPoolFactory(poolFactory).createPool(
			projects[_id].tokenAddress,
			weth
		);

		// ===== AMM transfer tokens to pool =====
		SafeERC20.safeTransferFrom(
			IERC20(projects[_id].tokenAddress),
			address(this),
			pool,
			ammTokensPoolShares
		);

		//	// swap with weth
		//	IWETH(weth).deposit{ value: project.fund }();
		//	// transfer weth
		//	assert(IWETH(weth).transfer(pool, project.fund));

		projects[_id].status = ProjectStatus.Launched;
		emit ProjectStatusChanged(_id, ProjectStatus.Launched);
	}

	function claimProjectTokens(
		uint256 _projectId
	)
		external
		statusIs(_projectId, ProjectStatus.Launched)
		isCommited(_projectId)
	{
		Project memory project = projects[_projectId];

		uint256 commitment = commitments[_projectId][msg.sender];

		uint256 tokenAmount = (INVESTORS_SUPPLY * project.totalSupply * commitment) /
			project.fund;

		IProjectTokenERC20(project.tokenAddress).claim(msg.sender, tokenAmount);

		emit TokensClaimed(_projectId, project.tokenAddress, msg.sender, tokenAmount);
	}
}
