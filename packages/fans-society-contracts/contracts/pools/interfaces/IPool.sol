// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IPool {
	function getReserves()
		external
		view
		returns (address _tokenX, address _tokenY, uint256 _reserveX, uint256 _reserveY);

	function mintLP(address provider) external returns (uint liquidity);

	function burnLP(
		address provider
	) external returns (uint amountX, uint amountY);

	function swap(address _tokenIn) external returns (uint amountOut);

	function safeTransferFrom(address from, address to, uint256 value) external;
}
