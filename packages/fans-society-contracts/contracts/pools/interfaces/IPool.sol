// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IPool {
	function getReserves(address _tokenX)
		external
		view
		returns (
			address tokenX,
			address tokenY,
			uint256 reserveX,
			uint256 reserveY
		);

	function mintLP(address provider) external returns (uint256 liquidity);

	function burnLP(address provider)
		external
		returns (
			address tokenX,
			uint256 amountX,
			address tokenY,
			uint256 amountY
		);

	function swap(
		address _tokenIn,
		uint256 _amountIn,
		address _recipient
	) external returns (uint256 amountOut);

	function computeMaxOutputAmount(
		uint256 _amountIn,
		uint256 _reserveIn,
		uint256 _reserveOut
	) external view returns (uint256);

	function computeRequiredInputAmount(
		uint256 _amountOut,
		uint256 _reserveIn,
		uint256 _reserveOut
	) external view returns (uint256);

	function computePriceOut(address _tokenIn, uint256 _amountIn)
		external
		view
		returns (uint256);

	function safeTransferFrom(
		address from,
		address to,
		uint256 value
	) external;
}
