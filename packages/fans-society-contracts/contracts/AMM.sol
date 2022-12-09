// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Projects } from './Projects.sol';

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import { IWETH } from './interfaces/IWETH.sol';
import { IProjectTokenFactory } from './tokens/interfaces/IProjectTokenFactory.sol';
import { IPoolFactory } from './pools/interfaces/IPoolFactory.sol';
import { IPool } from './pools/interfaces/IPool.sol';
import { PoolHelpers } from './pools/PoolHelpers.sol';
import { IProjectTokenERC20 } from './tokens/interfaces/IProjectTokenERC20.sol';

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
	event Swapped(
		address indexed caller,
		address tokenIn,
		uint256 amountIn,
		address tokenOut,
		uint256 amountOut
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

	function launchProject(uint256 _id)
		external
		statusIs(_id, ProjectStatus.Completed)
		onlyPartner(_id)
	{
		Project memory project = projects[_id];

		(
			uint112 partnerTokenShares,
			,
			uint112 poolTokenShares,
			uint112 fansSocietyTokenShares
		) = computeTokenShares(project.totalSupply);

		(uint256 poolFundsShares, uint256 partnerFundsShares) = computeFundsShares(
			project.fund
		);

		projects[_id].tokenAddress = IProjectTokenFactory(tokenFactory).createToken(
			_id,
			project.info.name,
			project.info.symbol,
			address(this),
			project.totalSupply,
			partnerTokenShares + poolTokenShares + fansSocietyTokenShares
		);

		address pool = IPoolFactory(poolFactory).createPool(
			address(this),
			projects[_id].tokenAddress,
			weth
		);

		// ===== transfer tokens to partner =====
		IProjectTokenERC20(projects[_id].tokenAddress).safeTransferFrom(
			address(this),
			projects[_id].partnerAddress,
			partnerTokenShares
		);

		// ===== AMM transfer tokens to fans society =====
		IProjectTokenERC20(projects[_id].tokenAddress).safeTransferFrom(
			address(this),
			fansSociety,
			fansSocietyTokenShares
		);

		// ===== AMM transfer tokens to pool =====
		IProjectTokenERC20(projects[_id].tokenAddress).safeTransferFrom(
			address(this),
			pool,
			poolTokenShares
		);

		// swap with weth
		IWETH(weth).deposit{ value: poolFundsShares }();
		// transfer weth
		require(IWETH(weth).transfer(pool, poolFundsShares), 'weth transfer failed');

		// TODO: transfer funds to partner
		(bool sent, ) = payable(project.partnerAddress).call{
			value: partnerFundsShares
		}('');
		require(sent, 'partner distribution failed');

		IPool(pool).mintLP(address(this));

		projects[_id].status = ProjectStatus.Launched;
		emit ProjectStatusChanged(_id, ProjectStatus.Launched);
	}

	function claimProjectTokens(uint256 _projectId)
		external
		statusIs(_projectId, ProjectStatus.Launched)
		isCommited(_projectId)
	{
		Project memory project = projects[_projectId];

		uint256 commitment = commitments[_projectId][msg.sender];

		(, uint112 investorsTokenShares, , ) = computeTokenShares(
			project.totalSupply
		);
		uint256 tokenAmount = (investorsTokenShares * commitment) / project.fund;

		IProjectTokenERC20(project.tokenAddress).claim(msg.sender, tokenAmount);

		emit TokensClaimed(_projectId, project.tokenAddress, msg.sender, tokenAmount);
	}

	function addPoolLiquidity(
		address _pool,
		address _tokenX,
		address _tokenY,
		uint256 _amountX,
		uint256 _amountY
	) external payable {
		if (_tokenX == weth) {
			require(
				_amountX == 0 && _amountY > 0 && msg.value > 0,
				'invalid amount state'
			);

			(uint256 amountX, uint256 amountY) = computeOptimalLiquidityAmount(
				_pool,
				_tokenX,
				_tokenY,
				msg.value,
				_amountY
			);
			IWETH(weth).deposit{ value: amountX }();
			require(IWETH(weth).transfer(_pool, amountX), 'weth transfer failed');

			IProjectTokenERC20(_tokenY).safeTransferFrom(msg.sender, _pool, amountY);

			if (msg.value > amountX) {
				(bool success, ) = msg.sender.call{ value: msg.value - amountX }('');
				require(success, 'refund exceeded ETH failed');
			}
		} else if (_tokenY == weth) {
			require(
				_amountY == 0 && _amountX > 0 && msg.value > 0,
				'invalid amount state'
			);

			(uint256 amountX, uint256 amountY) = computeOptimalLiquidityAmount(
				_pool,
				_tokenX,
				_tokenY,
				_amountX,
				msg.value
			);
			IWETH(weth).deposit{ value: amountY }();
			require(IWETH(weth).transfer(_pool, amountY), 'weth transfer failed');

			IProjectTokenERC20(_tokenX).safeTransferFrom(msg.sender, _pool, amountX);

			if (msg.value > amountY) {
				(bool success, ) = msg.sender.call{ value: msg.value - amountY }('');
				require(success, 'refund exceeded ETH failed');
			}
		} else {
			require(
				msg.value == 0 && _amountX > 0 && _amountY > 0,
				'invalid amount state'
			);

			(uint256 amountX, uint256 amountY) = computeOptimalLiquidityAmount(
				_pool,
				_tokenX,
				_tokenY,
				_amountX,
				_amountY
			);
			IProjectTokenERC20(_tokenX).safeTransferFrom(msg.sender, _pool, amountX);

			IProjectTokenERC20(_tokenY).safeTransferFrom(msg.sender, _pool, amountY);
		}

		IPool(_pool).mintLP(msg.sender);
	}

	function computeOptimalLiquidityAmount(
		address _pool,
		address _tokenX,
		address _tokenY,
		uint256 _amountX,
		uint256 _amountY
	) private view returns (uint256 amountX, uint256 amountY) {
		(, , uint256 reserveX, uint256 reserveY) = IPool(_pool).getReserves(_tokenX);

		if (reserveX == 0 && reserveY == 0) {
			(amountX, amountY) = (_amountX, _amountY);
		} else {
			uint256 amountYOptimal = IPool(_pool).computePriceOut(_tokenX, _amountX);
			if (amountYOptimal <= _amountY) {
				(amountX, amountY) = (_amountX, amountYOptimal);
			} else {
				uint256 amountXOptimal = IPool(_pool).computePriceOut(_tokenY, _amountY);
				require(amountXOptimal <= _amountX, 'too big input amount');
				(amountX, amountY) = (amountXOptimal, _amountY);
			}
		}
	}

	function removePoolLiquidity(address _pool, uint256 _amountLP) external {
		IPool(_pool).safeTransferFrom(msg.sender, _pool, _amountLP);

		(address tokenX, uint256 amountX, address tokenY, uint256 amountY) = IPool(
			_pool
		).burnLP(msg.sender);

		if (tokenX == weth) {
			IWETH(weth).withdraw(amountX);
			(bool success, ) = msg.sender.call{ value: amountX }('');
			require(success, 'withdraw ETH failed');
		} else {
			IERC20(tokenX).transfer(msg.sender, amountX);
		}

		if (tokenY == weth) {
			IWETH(weth).withdraw(amountY);
			(bool success, ) = msg.sender.call{ value: amountY }('');
			require(success, 'withdraw ETH failed');
		} else {
			IERC20(tokenY).transfer(msg.sender, amountY);
		}
	}

	function swap(
		address _pool,
		address _tokenIn,
		uint256 _amountOut
	) external payable {
		(
			address tokenX,
			address tokenY,
			uint256 reserveIn,
			uint256 reserveOut
		) = IPool(_pool).getReserves(_tokenIn);

		bool isEthInput = tokenX == weth;

		uint256 amountIn = IPool(_pool).computeRequiredInputAmount(
			_amountOut,
			reserveIn,
			reserveOut
		);

		if (isEthInput) {
			require(msg.value >= amountIn, 'not enough eth');

			IWETH(weth).deposit{ value: amountIn }();
			require(IWETH(weth).transfer(_pool, amountIn), 'weth transfer failed');
		} else {
			require(msg.value == 0, 'not expected eth');

			IProjectTokenERC20(tokenX).safeTransferFrom(msg.sender, _pool, amountIn);
		}

		uint256 amountOut;
		if (isEthInput) {
			amountOut = IPool(_pool).swap(tokenX, amountIn, msg.sender);
			if (msg.value > amountIn) {
				(bool success, ) = msg.sender.call{ value: msg.value - amountIn }('');
				require(success, 'refund exceeded ETH failed');
			}
		} else {
			amountOut = IPool(_pool).swap(tokenX, amountIn, address(this));
			IWETH(weth).withdraw(amountOut);
			(bool success, ) = msg.sender.call{ value: amountOut }('');
			require(success, 'withdraw ETH failed');
		}
		emit Swapped(msg.sender, tokenX, amountIn, tokenY, amountOut);
	}

	function computeTokenShares(uint112 _totalSupply)
		private
		pure
		returns (
			uint112 partnerTokenShares,
			uint112 investorsTokenShares,
			uint112 poolTokenShares,
			uint112 fansSocietyTokenShares
		)
	{
		partnerTokenShares = (_totalSupply * 200) / 1000;
		// 20%
		investorsTokenShares = (_totalSupply * 490) / 1000;
		// 49%
		poolTokenShares = (_totalSupply * 180) / 1000;
		// 18%
		fansSocietyTokenShares = (_totalSupply * 130) / 1000;
		// 13%
	}

	function computeFundsShares(uint256 _funds)
		private
		pure
		returns (uint256 poolFundsShares, uint256 partnerFundsShares)
	{
		poolFundsShares = (_funds * 100) / 1000;
		// 10%
		partnerFundsShares = (_funds * 900) / 1000;
		// 90%
	}

	receive() external payable {
		require(msg.sender == weth, 'only receive from weth contract');
	}
}
