// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/**
 * Pool Fans Society Interface
 * @author Teddy Chambard, Nicolas Thierry
 */
interface IPool {
	/**
	 * Allow anyone to exchange ERC20 tokens (ETH is supported)
	 * @param _tokenIn One of the two tokens address. This should be used by caller to control order of tokens returned and associated reserves
	 * @return tokenX The address of first token
	 * @return tokenY The address of second token
	 * @return reserveX The reserve of first token
	 * @return reserveY The reserve of second token
	 */
	function getReserves(address _tokenIn)
		external
		view
		returns (
			address tokenX,
			address tokenY,
			uint256 reserveX,
			uint256 reserveY
		);

	/**
	 * Allows to add liquidity on the pool.
	 *
	 * @dev Can only be called by AMM contract
	 * This function need that tranfers of both tokens has been done before with correct amounts respeting the product constant (k = x * y)
	 * where x and y are pool reserves and k the product constant stored on the contract.
	 *
	 * As proof of its deposit, initial AMM caller will be rewarded with LP tokens minted here
	 *
	 * @param _provider The address of liquidity provider
	 * @return liquidity The LP token amount minted
	 */
	function mintLP(address _provider) external returns (uint256 liquidity);

	/**
	 * Allows liquidity provider to give back LP tokens and get back projects ERC20 tokens.
	 *
	 * @dev Can only be called by AMM contract
	 * This function need that tranfer of LP token has been done before
	 *
	 * LP tokens are burnt here, and fees are minted for Fans Society
	 *
	 * @param _provider The address of liquidity provider
	 * @return tokenX The address of first token
	 * @return amountX The amount of first token
	 * @return tokenY The address of second token
	 * @return amountY The amount of second token
	 */
	function burnLP(address _provider)
		external
		returns (
			address tokenX,
			uint256 amountX,
			address tokenY,
			uint256 amountY
		);

	/**
	 * Allows to exchange tokens.
	 *
	 * @dev Can only be called by AMM contract
	 * This function need that tranfer of input token has been done before
	 *
	 * LP tokens are burnt here, and fees are minted for Fans Society
	 *
	 * @param _tokenIn The address of input token
	 * @param _amountIn The amount of input token
	 * @param _recipient The address of recipient
	 * @return amountOut The amount of output token
	 */
	function swap(
		address _tokenIn,
		uint256 _amountIn,
		address _recipient
	) external returns (uint256 amountOut);

	/**
	 * Allows to estimate the price of token given an amount of the other one.
	 *
	 * @param _tokenIn The address of input token
	 * @param _amountIn The amount of input token
	 */
	function computePriceOut(address _tokenIn, uint256 _amountIn)
		external
		view
		returns (uint256 priceOut);

	/**
	 * Allows to compute the maximum output amount given an input amount. This will consider 1% fees !
	 * It will be used offchain to propose to final user the amount to ask when calling AMM swap method
	 * Caller needs to call getReserves function before to get a correct result.
	 *
	 * @param _amountIn The amount of input token
	 * @param _reserveIn The reserve of input token
	 * @param _reserveOut The reserve of output token
	 * @return amountOut The max output amount computed
	 */
	function computeMaxOutputAmount(
		uint256 _amountIn,
		uint256 _reserveIn,
		uint256 _reserveOut
	) external view returns (uint256 amountOut);

	/**
	 * Allows to compute required input amount for givent output amount. This will consider 1% fees !
	 * It will be used offchain to propose to final user the amount to ask when calling AMM swap method
	 * Caller needs to call getReserves function before to get a correct result.
	 *
	 * @param _amountOut The amount of output token
	 * @param _reserveIn The reserve of input token
	 * @param _reserveOut The reserve of output token
	 * @return amountIn The required input amount computed
	 */
	function computeRequiredInputAmount(
		uint256 _amountOut,
		uint256 _reserveIn,
		uint256 _reserveOut
	) external view returns (uint256 amountIn);

	function safeTransferFrom(
		address from,
		address to,
		uint256 value
	) external;
}
