import * as _ from 'lodash';
import { assert } from 'chai';
import { BN, expectEvent, expectRevert } from '@openzeppelin/test-helpers';

import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import { PoolFactoryInstance } from '../types/truffle/contracts/pools/PoolFactory';
import {
	deployProjectTokenFactoryInstance,
	deployPoolFactoryInstance,
	getPoolsCreatedFromPastEvents,
	getTokensCreatedFromPastEvents,
	IToken,
	address0,
	getTokenTransfersFromPastEvents,
	deployWethInstance,
} from './TestHelpers';
import { ProjectTokenERC20Instance } from '../types/truffle/contracts/tokens/ProjectTokenERC20';
import { PoolInstance } from '../types/truffle/contracts/pools/Pool';
import { WETHTokenInstance } from '../types/truffle/contracts/common/WETHToken';

const ProjectTokenERC20 = artifacts.require('ProjectTokenERC20');
const Pool = artifacts.require('Pool');

contract('Pools', (accounts) => {
	const administrator = accounts[0];
	const fsociety = accounts[1];

	const author1 = accounts[2];
	const author2 = accounts[3];
	const user1 = accounts[4];
	const user2 = accounts[5];

	let wethToken: WETHTokenInstance;
	let projectTokenFactory: ProjectTokenFactoryInstance;
	let PoolFactory: PoolFactoryInstance;

	let tokens: IToken[];

	const tX_totalSupply = 1_000_000;
	const tX_ammGlobalShare = 10_000;
	const tX_ammPoolShare = 9_000;
	const tX_authorGlobalShare = 800_000;

	const tY_totalSupply = 1_000_000;
	const tY_ammGlobalShare = 10_000;
	const tY_ammPoolShare = 9_000;
	const tY_authorGlobalShare = 800_000;

	let tokenX: ProjectTokenERC20Instance;
	let tokenY: ProjectTokenERC20Instance;

	beforeEach(async () => {
		wethToken = await deployWethInstance(administrator);
		projectTokenFactory = await deployProjectTokenFactoryInstance(administrator);
		PoolFactory = await deployPoolFactoryInstance(administrator, fsociety);

		await projectTokenFactory.createToken(
			'tokenY',
			'TKN1',
			tX_totalSupply,
			tX_ammGlobalShare,
			tX_ammPoolShare,
			tX_authorGlobalShare,
			administrator,
			author1,
			{
				from: administrator,
			},
		);

		await projectTokenFactory.createToken(
			'token2',
			'TKN2',
			tY_totalSupply,
			tY_ammGlobalShare,
			tY_ammPoolShare,
			tY_authorGlobalShare,
			administrator,
			author2,
			{
				from: administrator,
			},
		);

		tokens = await getTokensCreatedFromPastEvents(projectTokenFactory);
		tokenX = await ProjectTokenERC20.at(tokens[0]?.token);
		tokenY = await ProjectTokenERC20.at(tokens[1]?.token);

		await tokenX.transfer(user1, BN(5000));
		await tokenY.transfer(user1, BN(5000));

		await tokenX.transfer(user2, BN(1000));
		await tokenY.transfer(user2, BN(1000));
	});

	describe('> pool is created', () => {
		let poolInstance: PoolInstance;

		beforeEach(async () => {
			await PoolFactory.createPool(tokens[0].token, tokens[1].token, {
				from: administrator,
			});
			const events = await getPoolsCreatedFromPastEvents(PoolFactory);

			assert.lengthOf(events, 1);
			assert.isDefined(events[0].pool);
			poolInstance = await Pool.at(events[0].pool);
		});

		describe('> liquidity is empty', () => {
			it('> mintLP', async () => {
				const amountX = BN(1000);
				const amountY = BN(4000);

				// user1 transfers tokens to pool
				await tokenX.transfer(poolInstance.address, amountX, { from: user1 });
				await tokenY.transfer(poolInstance.address, amountY, { from: user1 });

				// then ask for LP tokens
				const receipt = await poolInstance.mintLP(user1, { from: user1 });

				const expectedLiquidity = BN(2000);

				await expectEvent(receipt, 'Transfer', {
					from: address0,
					to: user1,
					value: expectedLiquidity,
				});

				await expectEvent(receipt, 'ReservesUpdated', {
					reserveX: amountX,
					reserveY: amountY,
				});

				await expectEvent(receipt, 'LPMinted', {
					provider: user1,
					amountX,
					amountY,
				});

				assert.equal(
					(await poolInstance.totalSupply()).toNumber(),
					expectedLiquidity,
				);
				assert.equal(
					(await poolInstance.balanceOf(user1)).toNumber(),
					expectedLiquidity,
				);
				assert.equal(
					(await tokenX.balanceOf(poolInstance.address)).toNumber(),
					amountX,
				);
				assert.equal(
					(await tokenY.balanceOf(poolInstance.address)).toNumber(),
					amountY,
				);
				const reserves = await poolInstance.getReserves();
				assert.equal(reserves[0].toNumber(), amountX);
				assert.equal(reserves[1].toNumber(), amountY);
			});
		});

		describe('> liquidity already provided', () => {
			const amountX = BN(3000);
			const amountY = BN(3000);
			const initialLiquidity = BN(3000); // sqrt(3000 * 3000)

			beforeEach(async () => {
				await tokenX.transfer(poolInstance.address, amountX, { from: user1 });
				await tokenY.transfer(poolInstance.address, amountY, { from: user1 });
				await poolInstance.mintLP(user1, { from: user1 });
			});

			it('> burnLP', async () => {
				const lpToRemove = BN(1000);

				const lpUser1 = await poolInstance.balanceOf(user1);
				assert.equal(lpUser1.toNumber(), initialLiquidity.toNumber());

				// user1 gives back LP token to the pool
				await poolInstance.transfer(poolInstance.address, lpUser1.sub(lpToRemove), {
					from: user1,
				});

				// then ask to get back its tokens
				const receipt = await poolInstance.burnLP(user1, { from: user1 });

				await expectEvent(receipt, 'Transfer', {
					from: poolInstance.address,
					to: address0,
					value: initialLiquidity.sub(lpToRemove),
				});

				await expectEvent(receipt, 'Transfer', {
					from: poolInstance.address,
					to: user1,
					value: initialLiquidity.sub(lpToRemove),
				});

				await expectEvent(receipt, 'ReservesUpdated', {
					reserveX: BN(1000),
					reserveY: BN(1000),
				});

				await expectEvent(receipt, 'LPBurnt', {
					provider: user1,
					amountX: BN(amountX - 1000),
					amountY: BN(amountY - 1000),
				});

				const tokenXTransferEvent = _.last(
					await getTokenTransfersFromPastEvents(tokenX),
				);
				const tokenYTransferEvent = _.last(
					await getTokenTransfersFromPastEvents(tokenY),
				);

				assert.deepEqual(tokenXTransferEvent, {
					from: poolInstance.address,
					to: user1,
					value: amountX - 1000,
				});
				assert.deepEqual(tokenYTransferEvent, {
					from: poolInstance.address,
					to: user1,
					value: amountY - 1000,
				});

				assert.equal((await poolInstance.totalSupply()).toNumber(), 1000);
				assert.equal((await poolInstance.balanceOf(user1)).toNumber(), 1000);
				assert.equal(
					(await tokenX.balanceOf(poolInstance.address)).toNumber(),
					1000,
				);
				assert.equal(
					(await tokenY.balanceOf(poolInstance.address)).toNumber(),
					1000,
				);

				assert.equal((await tokenX.balanceOf(user1)).toNumber(), 4000);
				assert.equal((await tokenY.balanceOf(user1)).toNumber(), 4000);

				const reserves = await poolInstance.getReserves();
				assert.equal(reserves[0].toNumber(), 1000);
				assert.equal(reserves[1].toNumber(), 1000);
			});

			it('> swap with input on tokenX', async () => {
				const amountIn = BN(100);
				const expectedAmountOut = 95;

				await tokenX.transfer(poolInstance.address, amountIn, { from: user2 });

				const receipt = await poolInstance.swap(tokenX.address, { from: user2 });

				const tokenYTransferEvent = _.last(
					await getTokenTransfersFromPastEvents(tokenY),
				);

				assert.deepEqual(tokenYTransferEvent, {
					from: poolInstance.address,
					to: user2,
					value: expectedAmountOut,
				});

				await expectEvent(receipt, 'ReservesUpdated', {
					reserveX: amountX.add(amountIn),
					reserveY: amountY.sub(BN(expectedAmountOut)),
				});

				await expectEvent(receipt, 'Swap', {
					caller: user2,
					tokenIn: tokenX.address,
					amountIn: amountIn,
					tokenOut: tokenY.address,
					amountOut: BN(expectedAmountOut),
				});

				const reserves = await poolInstance.getReserves();
				assert.equal(reserves[0].toNumber(), amountX.add(amountIn).toNumber());
				assert.equal(
					reserves[1].toNumber(),
					amountY.sub(BN(expectedAmountOut)).toNumber(),
				);
				assert.equal(
					(await tokenX.balanceOf(poolInstance.address)).toNumber(),
					amountX.add(amountIn).toNumber(),
				);
				assert.equal(
					(await tokenY.balanceOf(poolInstance.address)).toNumber(),
					amountY.sub(BN(expectedAmountOut)),
				);

				assert.equal((await tokenX.balanceOf(user2)).toNumber(), 900);
				assert.equal((await tokenY.balanceOf(user2)).toNumber(), 1095);
			});
		});
	});
});
