// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Projects } from './Projects.sol';

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import { AggregatorV3Interface } from '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

import { IWETH } from './interfaces/IWETH.sol';
import { IProjectTokenFactory } from './tokens/interfaces/IProjectTokenFactory.sol';
import { IPoolFactory } from './pools/interfaces/IPoolFactory.sol';
import { IPool } from './pools/interfaces/IPool.sol';
import { IProjectTokenERC20 } from './tokens/interfaces/IProjectTokenERC20.sol';

import 'hardhat/console.sol';

/**
 * Main Fans Society Automated Market Maker Contract
 * @author Teddy Chambard, Nicolas Thierry
 * @notice This contract is responsible for all projects management and it alaso offers DEX capabilities addressing liquidity pools
 */
contract AMM is Projects {
	/**
	 * The address to use to reward fans society team
	 */
	address internal fansSociety;

	/**
	 * The address of Wrapped ETH contract
	 */
	address internal weth;

	/**
	 * The address of ETH / USD Chainlink data feed aggregator
	 */
	address internal ethUsdtAggregator;

	/**
	 * The token factory contract address that is responsible for ERC20 tokens creation
	 */
	address internal tokenFactory;

	/**
	 * The pool factory contract address that is responsible for liquidity pools creation
	 */
	address internal poolFactory;

	event TokensClaimed(
		uint256 indexed projectId,
		address indexed token,
		address indexed caller,
		uint256 amount
	);
	event Swapped(
		address indexed caller,
		address indexed poolAddress,
		address tokenIn,
		uint256 amountIn,
		address tokenOut,
		uint256 amountOut
	);
	event LiquidityAdded(
		address indexed caller,
		address indexed poolAddress,
		address tokenX,
		uint256 amountX,
		address tokenY,
		uint256 amountY,
		uint256 liquidity
	);
	event LiquidityRemoved(
		address indexed caller,
		address indexed poolAddress,
		address tokenX,
		uint256 amountX,
		address tokenY,
		uint256 amountY,
		uint256 liquidity
	);

	constructor(
		address _fansSocietyAddress,
		address _wethTokenAddress,
		address _ethUsdtAggregatorAddress
	) Projects() {
		fansSociety = _fansSocietyAddress;
		weth = _wethTokenAddress;
		ethUsdtAggregator = _ethUsdtAggregatorAddress;
	}

	/**
	 * @dev This function is reserved for deployer, and needs to be called to initialize factories addresses
	 */
	function setFactories(
		address _tokenFactoryAddress,
		address _poolFactoryAddress
	) external onlyOwner {
		require(
			tokenFactory == address(0) && poolFactory == address(0),
			'AMM factories already set'
		);
		tokenFactory = _tokenFactoryAddress;
		poolFactory = _poolFactoryAddress;
	}

	/**
	 * This function can be called only by project owner (partner) when a project reached is target (status compeleted)
	 */
	function launchProject(uint256 _id)
		external
		statusIs(_id, ProjectStatus.Completed)
		onlyPartner(_id)
		nonReentrant
	{
		require(
			tokenFactory != address(0) && poolFactory != address(0),
			'no factories'
		);

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
			project.totalSupply,
			partnerTokenShares + poolTokenShares + fansSocietyTokenShares
		);

		address pool = IPoolFactory(poolFactory).createPool(
			projects[_id].tokenAddress,
			weth
		);

		// ===== transfer tokens to partner =====
		IProjectTokenERC20(projects[_id].tokenAddress).safeTransferFrom(
			address(this),
			projects[_id].partnerAddress,
			partnerTokenShares
		);

		// ===== transfer tokens to fans society =====
		IProjectTokenERC20(projects[_id].tokenAddress).safeTransferFrom(
			address(this),
			fansSociety,
			fansSocietyTokenShares
		);

		// ===== transfer tokens to pool =====
		IProjectTokenERC20(projects[_id].tokenAddress).safeTransferFrom(
			address(this),
			pool,
			poolTokenShares
		);

		// swap with weth
		IWETH(weth).deposit{ value: poolFundsShares }();
		// ===== transfer WETH to pool =====
		require(IWETH(weth).transfer(pool, poolFundsShares), 'weth transfer failed');

		// ===== transfer partner funds =====
		(bool sent, ) = payable(project.partnerAddress).call{
			value: partnerFundsShares
		}('');
		require(sent, 'partner distribution failed');

		// trigger first pool liquidity deposit
		IPool(pool).mintLP(address(this));

		projects[_id].status = ProjectStatus.Launched;
		emit ProjectStatusChanged(_id, ProjectStatus.Launched);
	}

	/**
	 * Can be called by ICO participant when project has been validated by partner (status launched)
	 * This will reward the participant with the created ERC20 token
	 * @param _projectId The project ID
	 */
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

	/**
	 * Allow anyone to add liquidity on specified pool
	 * @dev This function is compliant with any created project ERC20 token and also with ETH values
	 * Caller can either provide simple amounts as parameter or give some Ethers as value.
	 * Tokens addresses could have been enought to determine pool address thanks to Clones factory, but giving pool address here is gas saving.
	 * @param _pool The pool address
	 * @param _tokenX The first token address
	 * @param _tokenY The second token address
	 * @param _amountX The amount of first token. MUST be 0 _tokenX is WETH address
	 * @param _amountY The amount of the second token. MUST be 0 _tokenY is WETH address
	 */
	function addPoolLiquidity(
		address _pool,
		address _tokenX,
		address _tokenY,
		uint256 _amountX,
		uint256 _amountY
	) external payable nonReentrant {
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

		(
			address __tokenX,
			uint256 __amountX,
			address __tokenY,
			uint256 __amountY,
			uint256 __liquidity
		) = IPool(_pool).mintLP(msg.sender);

		emit LiquidityAdded(
			msg.sender,
			_pool,
			__tokenX,
			__amountX,
			__tokenY,
			__amountY,
			__liquidity
		);
	}

	/**
	 * Allow liquidity providers to remove liquidity on specified pool
	 * Caller MUST own LP tokens to be able to use this function.
	 * LP tokens will be burnt, and ERC20 and/or ETH will be returned to the caller
	 * @param _pool The pool address
	 * @param _amountLP The amount of LP token to give back to the pool.
	 */
	function removePoolLiquidity(address _pool, uint256 _amountLP)
		external
		nonReentrant
	{
		IPool(_pool).safeTransferFrom(msg.sender, _pool, _amountLP);

		(
			address tokenX,
			uint256 amountX,
			address tokenY,
			uint256 amountY,
			uint256 liquidity
		) = IPool(_pool).burnLP(msg.sender);

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

		emit LiquidityRemoved(
			msg.sender,
			_pool,
			tokenX,
			amountX,
			tokenY,
			amountY,
			liquidity
		);
	}

	/**
	 * Allow anyone to exchange ERC20 tokens (ETH is supported)
	 * @param _pool The pool address
	 * @param _tokenIn The address of token caller owns and want to exchange.
	 * @param _amountOut The amount of other token provided by the pool that caller want to get.
	 * Providing the output amount allows the protocol to determine required input amount in the limit of available liquidities
	 *
	 * Caller needs to compute output amount before calling this function. For this purpose, Pool contract provides `computeMaxOutputAmount` function
	 */
	function swap(
		address _pool,
		address _tokenIn,
		uint256 _amountOut
	) external payable nonReentrant {
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
		emit Swapped(msg.sender, _pool, tokenX, amountIn, tokenY, amountOut);
	}

	/**
	 * Allow to retrieve ETH / USD price with Chainlink aggregator
	 */
	function getEthUsdPrice() public view returns (uint256) {
		require(ethUsdtAggregator != address(0), 'no aggregator');
		AggregatorV3Interface priceFeed = AggregatorV3Interface(ethUsdtAggregator);
		(, int256 answer, , , ) = priceFeed.latestRoundData();
		return uint256(answer);
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
		partnerTokenShares = (_totalSupply * 2000) / 10000;
		// 20%
		investorsTokenShares = (_totalSupply * 4900) / 10000;
		// 49%
		poolTokenShares = (_totalSupply * 1800) / 10000;
		// 18%
		fansSocietyTokenShares = (_totalSupply * 1300) / 10000;
		// 13%
	}

	function computeFundsShares(uint256 _funds)
		private
		pure
		returns (uint256 poolFundsShares, uint256 partnerFundsShares)
	{
		poolFundsShares = (_funds * 1000) / 10000;
		// 10%
		partnerFundsShares = (_funds * 9000) / 10000;
		// 90%
	}

	receive() external payable {
		require(msg.sender == weth, 'only receive from weth contract');
	}
}
