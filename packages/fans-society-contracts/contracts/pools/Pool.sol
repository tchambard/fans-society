// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { Math } from '@openzeppelin/contracts/utils/math/Math.sol';

import { IPool } from './interfaces/IPool.sol';
import { LPTokenERC20 } from './LPTokenERC20.sol';

import 'hardhat/console.sol';

contract Pool is Initializable, LPTokenERC20 {
	address private fansSocietyAddress;
	address private tokenX;
	address private tokenY;

	uint256 private reserveX;
	uint256 private reserveY;

	uint256 private k; // k = x * y

	event LPMinted(
		address indexed provider,
		address tokenX,
		uint256 amountX,
		address tokenY,
		uint256 amountY,
		uint256 liquidity
	);
	event LPBurnt(
		address indexed provider,
		address tokenX,
		uint256 amountX,
		address tokenY,
		uint256 amountY,
		uint256 liquidity
	);
	event PoolSwapped(
		address tokenIn,
		uint256 amountIn,
		address tokenOut,
		uint256 amountOut
	);
	event ReservesUpdated(uint256 reserveX, uint256 reserveY);

	function initialize(
		address _amm,
		address _fansSocietyAddress,
		address _tokenX,
		address _tokenY
	) public virtual initializer {
		__LPTokenERC20_init(_amm);
		fansSocietyAddress = _fansSocietyAddress;
		tokenX = _tokenX;
		tokenY = _tokenY;
	}

	function getReserves(address _tokenIn)
		public
		view
		returns (
			address _tokenX,
			address _tokenY,
			uint256 _reserveX,
			uint256 _reserveY
		)
	{
		require(_tokenIn == tokenX || _tokenIn == tokenY, 'invalid token address');
		(_tokenX, _tokenY, _reserveX, _reserveY) = _tokenIn == tokenX
			? (tokenX, tokenY, reserveX, reserveY)
			: (tokenY, tokenX, reserveY, reserveX);
	}

	function mintLP(address provider)
		external
		onlyAmm
		returns (uint256 liquidity)
	{
		(uint256 _reserveX, uint256 _reserveY) = (reserveX, reserveY);

		uint256 balanceX = IERC20(tokenX).balanceOf(address(this));
		uint256 balanceY = IERC20(tokenY).balanceOf(address(this));
		uint256 amountX = balanceX - _reserveX;
		uint256 amountY = balanceY - _reserveY;

		if (_reserveX > 0 || _reserveY > 0) {
			require(_reserveX * amountY == _reserveY * amountX, 'x / y != dx / dy');
		}

		_mintFansSocietyFees(_reserveX, _reserveY);

		uint256 _totalSupply = totalSupply();
		if (_totalSupply == 0) {
			liquidity = Math.sqrt(amountX * amountY);
		} else {
			liquidity = Math.min(
				(amountX * _totalSupply) / _reserveX,
				(amountY * _totalSupply) / _reserveY
			);
		}
		require(liquidity > 0, 'not enough liquidity to add');

		_mint(provider, liquidity);

		_updateReserves(balanceX, balanceY);

		k = reserveX * reserveY;

		emit LPMinted(provider, tokenX, amountX, tokenY, amountY, liquidity);
	}

	function burnLP(address provider)
		external
		onlyAmm
		returns (uint256 amountX, uint256 amountY)
	{
		(uint256 _reserveX, uint256 _reserveY) = (reserveX, reserveY);
		(address _tokenX, address _tokenY) = (tokenX, tokenY);

		uint256 balanceX = IERC20(_tokenX).balanceOf(address(this));
		uint256 balanceY = IERC20(_tokenY).balanceOf(address(this));
		uint256 liquidity = balanceOf(address(this));

		_mintFansSocietyFees(_reserveX, _reserveY);

		uint256 _totalSupply = totalSupply();

		amountX = (liquidity * balanceX) / _totalSupply;
		amountY = (liquidity * balanceY) / _totalSupply;

		require(amountX > 0 && amountY > 0, 'Not enough liquidity to remove');

		_burn(address(this), liquidity);

		SafeERC20.safeTransfer(IERC20(_tokenX), provider, amountX);
		SafeERC20.safeTransfer(IERC20(_tokenY), provider, amountY);

		_updateReserves(
			IERC20(tokenX).balanceOf(address(this)),
			IERC20(tokenY).balanceOf(address(this))
		);

		k = reserveX * reserveY;

		emit LPBurnt(provider, tokenX, amountX, tokenY, amountY, liquidity);
	}

	function swap(
		address _tokenIn,
		uint256 _amountIn,
		address _recipient
	) external onlyAmm returns (uint256 amountOut) {
		require(_tokenIn == tokenX || _tokenIn == tokenY, 'bad token');

		(
			address __tokenIn,
			address __tokenOut,
			uint256 reserveIn,
			uint256 reserveOut
		) = _tokenIn == tokenX
				? (tokenX, tokenY, reserveX, reserveY)
				: (tokenY, tokenX, reserveY, reserveX);

		uint256 balanceIn = IERC20(__tokenIn).balanceOf(address(this));

		require(balanceIn - reserveIn == _amountIn, 'invalid input amount');

		amountOut = computeMaxOutputAmount(_amountIn, reserveIn, reserveOut);
		SafeERC20.safeTransfer(IERC20(__tokenOut), _recipient, amountOut);

		_updateReserves(
			IERC20(tokenX).balanceOf(address(this)),
			IERC20(tokenY).balanceOf(address(this))
		);
	}

	function computePriceOut(address _tokenIn, uint256 _amountIn)
		external
		view
		returns (uint256)
	{
		(uint256 reserveIn, uint256 reserveOut) = _tokenIn == tokenX
			? (reserveX, reserveY)
			: (reserveY, reserveX);
		require(_amountIn > 0, 'Not enough input');
		require(reserveIn > 0 && reserveOut > 0, 'Not enough liquidity');
		return (_amountIn * reserveOut) / reserveIn;
	}

	function computeMaxOutputAmount(
		uint256 _amountIn,
		uint256 _reserveIn,
		uint256 _reserveOut
	) public pure returns (uint256 amountOut) {
		require(_amountIn > 0, 'Not enough input');
		require(_reserveIn > 0 && _reserveIn > 0, 'Not enough liquidity');
		// 1% fees
		uint256 amountInWithFee = _amountIn * 990;
		amountOut =
			(amountInWithFee * _reserveOut) /
			((_reserveIn * 1000) + amountInWithFee);
	}

	function computeRequiredInputAmount(
		uint256 _amountOut,
		uint256 _reserveIn,
		uint256 _reserveOut
	) external pure returns (uint256 amountIn) {
		require(_amountOut > 0, 'Not enough output');
		require(_reserveIn > 0 && _reserveIn > 0, 'Not enough liquidity');
		// 1% fees
		amountIn =
			1 +
			(_reserveIn * _amountOut * 1000) /
			((_reserveOut - _amountOut) * 990);
	}

	function _updateReserves(uint256 _balanceX, uint256 _balanceY) private {
		reserveX = _balanceX;
		reserveY = _balanceY;
		emit ReservesUpdated(reserveX, reserveY);
	}

	function _mintFansSocietyFees(uint256 _reserveX, uint256 _reserveY) private {
		uint256 _k = k;
		if (_k != 0) {
			uint256 rootK = Math.sqrt(_reserveX * _reserveY);
			uint256 rootKLast = Math.sqrt(_k);
			if (rootK > rootKLast) {
				uint256 numerator = totalSupply() * (rootK - rootKLast) * 50;
				uint256 denominator = rootK * 100 + rootKLast * 50;
				uint256 liquidity = numerator / denominator;
				if (liquidity > 0) _mint(fansSocietyAddress, liquidity);
			}
		}
	}
}
