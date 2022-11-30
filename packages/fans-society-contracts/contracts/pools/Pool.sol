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

	uint private reserveX;
	uint private reserveY;

	uint public k; // k = x * y

	event LPMinted(address indexed provider, uint amountX, uint amountY);
	event LPBurnt(address indexed provider, uint amountX, uint amountY);
	event Swap(
		address indexed caller,
		address tokenIn,
		uint amountIn,
		address tokenOut,
		uint amountOut
	);
	event ReservesUpdated(uint reserveX, uint reserveY);

	constructor() LPTokenERC20() {}

	function initialize(
		address _fansSocietyAddress,
		address _tokenX,
		address _tokenY
	) public virtual initializer {
		fansSocietyAddress = _fansSocietyAddress;
		tokenX = _tokenX;
		tokenY = _tokenY;
	}

	function getReserves()
		public
		view
		returns (uint256 _reserveX, uint256 _reserveY)
	{
		_reserveX = reserveX;
		_reserveY = reserveY;
	}

	function mintLP(address provider) external returns (uint liquidity) {
		(uint _reserveX, uint _reserveY) = (reserveX, reserveY);

		uint balanceX = IERC20(tokenX).balanceOf(address(this));
		uint balanceY = IERC20(tokenY).balanceOf(address(this));
		uint amountX = balanceX - _reserveX;
		uint amountY = balanceY - _reserveY;

		if (_reserveX > 0 || _reserveY > 0) {
			require(_reserveX * amountX == _reserveY * amountY, 'x / y != dx / dy');
		}

		_mintFansSocietyFees(_reserveX, _reserveY);

		uint _totalSupply = totalSupply();
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

		emit LPMinted(provider, amountX, amountY);
	}

	function burnLP(
		address provider
	) external returns (uint amountX, uint amountY) {
		(uint _reserveX, uint _reserveY) = (reserveX, reserveY);
		address _tokenX = tokenX;
		address _tokenY = tokenY;

		uint balanceX = IERC20(_tokenX).balanceOf(address(this));
		uint balanceY = IERC20(_tokenY).balanceOf(address(this));
		uint liquidity = balanceOf(address(this));

		_mintFansSocietyFees(_reserveX, _reserveY);

		uint _totalSupply = totalSupply();

		amountX = (liquidity * balanceX) / _totalSupply;
		amountY = (liquidity * balanceY) / _totalSupply;

		require(amountX > 0 && amountY > 0, 'not enough liquidity to remove');

		_burn(address(this), liquidity);

		SafeERC20.safeTransfer(IERC20(_tokenX), provider, amountX);
		SafeERC20.safeTransfer(IERC20(_tokenY), provider, amountY);

		_updateReserves(
			IERC20(tokenX).balanceOf(address(this)),
			IERC20(tokenY).balanceOf(address(this))
		);

		k = reserveX * reserveY;

		emit LPBurnt(provider, amountX, amountY);
	}

	function swap(address _tokenIn) external returns (uint amountOut) {
		require(
			_tokenIn == address(tokenX) || _tokenIn == address(tokenY),
			'bad token'
		);

		(
			address tokenIn,
			address tokenOut,
			uint reserveIn,
			uint reserveOut
		) = _tokenIn == address(tokenX)
				? (tokenX, tokenY, reserveX, reserveY)
				: (tokenY, tokenX, reserveY, reserveX);

		uint balanceIn = IERC20(tokenIn).balanceOf(address(this));

		uint amountIn = balanceIn - reserveIn;
		require(amountIn > 0, 'not enough input');

		uint amountInWithFees = (amountIn * 990) / 1000; // 1% fees
		amountOut = (reserveOut * amountInWithFees) / (reserveIn + amountInWithFees);
		require(amountOut < reserveOut, 'not enough liquidity for swap');

		SafeERC20.safeTransfer(IERC20(tokenOut), msg.sender, amountOut);

		_updateReserves(
			IERC20(tokenX).balanceOf(address(this)),
			IERC20(tokenY).balanceOf(address(this))
		);

		emit Swap(msg.sender, tokenIn, amountIn, tokenOut, amountOut);
	}

	function _updateReserves(uint _balanceX, uint _balanceY) private {
		reserveX = _balanceX;
		reserveY = _balanceY;
		emit ReservesUpdated(reserveX, reserveY);
	}

	function _mintFansSocietyFees(uint _reserveX, uint _reserveY) private {
		uint _k = k;
		if (_k != 0) {
			uint rootK = Math.sqrt(_reserveX * _reserveY);
			uint rootKLast = Math.sqrt(_k);
			if (rootK > rootKLast) {
				uint numerator = totalSupply() * (rootK - rootKLast) * 8;
				uint denominator = rootK * 17 + rootKLast * 8;
				uint liquidity = numerator / denominator;
				if (liquidity > 0) _mint(fansSocietyAddress, liquidity);
			}
		}
	}
}
