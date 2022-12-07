import * as _ from 'lodash';
import { assert } from 'chai';
import { BN, expectEvent, expectRevert } from '@openzeppelin/test-helpers';

import {
	address0,
	deployProjectsInstances,
	getPoolsCreatedFromPastEvents,
	getTokensCreatedFromPastEvents,
	getTokenTransfersFromPastEvents,
	getWethDepositsFromPastEvents,
	getWethTransfersFromPastEvents,
} from './TestHelpers';
import { AllEvents, AMMInstance } from '../types/truffle/contracts/AMM';
import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import { ProjectTokenERC20Instance } from '../types/truffle/contracts/tokens/ProjectTokenERC20';
import { PoolFactoryInstance } from '../types/truffle/contracts/pools/PoolFactory';
import { PoolInstance } from '../types/truffle/contracts/pools/Pool';
import { WETHTokenInstance } from '../types/truffle/contracts/common/WETHToken';

const ProjectTokenERC20 = artifacts.require('ProjectTokenERC20');
const Pool = artifacts.require('Pool');

enum ProjectStatus {
	Opened,
	Aborted,
	Completed,
	Launched,
}

contract('AMM', (accounts) => {
	const administrator = accounts[0];
	const fsociety = accounts[1];
	const partnerAddress = accounts[2];
	const fans = accounts.slice(3);

	let amm: AMMInstance;
	let projectTokenFactory: ProjectTokenFactoryInstance;
	let poolFactory: PoolFactoryInstance;
	let wethToken: WETHTokenInstance;

	beforeEach(async () => {
		const contracts = await deployProjectsInstances(administrator, fsociety);
		amm = contracts.amm;
		projectTokenFactory = contracts.projectTokenFactory;
		poolFactory = contracts.poolFactory;
		wethToken = contracts.wethToken;
	});

	const totalFunds = 1; // 1 ETH
	const name = 'The god father';
	const description = 'A very famous mafia film';
	const symbol = 'TGF';
	const target = web3.utils.toWei(totalFunds.toString()); // 1 ETH
	const minInvest = web3.utils.toWei((totalFunds / 100).toString()); // 0.1 ETH
	const maxInvest = web3.utils.toWei((totalFunds / 10).toString()); // 0.01 ETH
	const totalSupply = 100_000_000;

	// tokens
	const partnerTokenShares = (totalSupply * 20) / 100; // 20%
	const investorsTokenShares = (totalSupply * 49) / 100; // 49%
	const poolTokenShares = (totalSupply * 18) / 100; // 18%
	const fansSocietyTokenShares = (totalSupply * 13) / 100; // 13%

	// funds
	const poolFundsShares = (totalFunds * 10) / 100; // 10%
	const partnerFundsShares = (totalFunds * 90) / 100; // 90%

	context('# no project exist', () => {
		it('> createProject should succeed when called with contract owner address', async () => {
			const receipt = await amm.createProject(
				{
					name,
					symbol,
					description,
					avatarCid: '',
					coverCid: '',
				},
				{
					target,
					minInvest,
					maxInvest,
				},
				partnerAddress,
				BN(totalSupply),
				{ from: administrator },
			);

			await expectEvent(receipt, 'ProjectCreated', {
				id: BN(1),
				info: [name, symbol, description, '', ''],
				ico: [target, minInvest, maxInvest],
				partnerAddress,
				totalSupply: BN(totalSupply),
			});

			const createdProject = await amm.projects(1);
			assert.equal(createdProject['id'].toNumber(), 1);
			assert.equal(createdProject['info']['name'], name);
			assert.equal(createdProject['info']['symbol'], symbol);
			assert.equal(createdProject['info']['description'], description);
			assert.equal(createdProject['info']['avatarCid'], '');
			assert.equal(createdProject['info']['coverCid'], '');
			assert.equal(createdProject['ico']['target'], target);
			assert.equal(createdProject['ico']['minInvest'], minInvest);
			assert.equal(createdProject['ico']['maxInvest'], maxInvest);
			assert.equal(createdProject['fund'], 0);
			assert.equal(createdProject['totalSupply'].toNumber(), totalSupply);
			assert.equal(createdProject['status'].toNumber(), 0);
			assert.equal(createdProject['partnerAddress'], partnerAddress);
			assert.equal(createdProject['tokenAddress'], address0);
		});
	});

	context('# one project is created', () => {
		let projectId: number;

		beforeEach(async () => {
			await amm.createProject(
				{
					name,
					symbol,
					description,
					avatarCid: '',
					coverCid: '',
				},
				{
					target,
					minInvest,
					maxInvest,
				},
				partnerAddress,
				totalSupply,
				{ from: administrator },
			);
			const createdProject = await amm.projects(1);
			projectId = createdProject['id'].toNumber();
		});

		describe('> commitments', () => {
			it('> commit on project with unsufficient amount should fail', async () => {
				// TODO
			});

			it('> commit on project with too large amount should fail', async () => {
				// TODO
			});

			it('> many commits on project should succeed until commitments is larger than maxInvest', async () => {
				// TODO
			});

			it('> commit on project with correct correct amount should succeed', async () => {
				const amount = web3.utils.toWei('0.1', 'ether');
				const receipt = await amm.commitOnProject(projectId, {
					from: fans[0],
					value: amount,
				});
				await expectEvent(receipt, 'Committed', {
					id: BN(1),
					caller: fans[0],
					amount,
				});
			});

			it('> withdraw should succeed if commitments is done before', async () => {
				const amount = web3.utils.toWei('0.1', 'ether');
				await amm.commitOnProject(projectId, {
					from: fans[0],
					value: amount,
				});
				const receipt = await amm.withdrawOnProject(projectId, {
					from: fans[0],
				});
				await expectEvent(receipt, 'Withdrawed', {
					id: BN(1),
					caller: fans[0],
					amount,
				});
			});
		});

		describe('> claimProjectTokens', () => {
			it('> should fail until project is completed', async () => {
				await expectRevert(
					amm.claimProjectTokens(projectId, { from: fans[0] }),
					'Bad project status',
				);
			});
		});

		context('# project funds are completed', () => {
			const nbFans = 10;

			beforeEach(async () => {
				for (let i = 0; i < nbFans; i++) {
					await amm.commitOnProject(projectId, {
						from: fans[i],
						value: web3.utils.toWei('0.1', 'ether'),
					});
				}
				const event = _.last(
					await amm.getPastEvents('ProjectStatusChanged', {
						fromBlock: 0,
					}),
				);
				assert.equal(event?.returnValues.status, ProjectStatus.Completed);
			});

			it('> launchProject should fail if not partner', async () => {
				await expectRevert(
					amm.launchProject(projectId, {
						from: administrator,
					}),
					'Not partner',
				);
			});

			describe('> launchProject as partner', () => {
				let launchProjectReceipt: Truffle.TransactionResponse<AllEvents>;
				let erc20Instance: ProjectTokenERC20Instance;
				let poolInstance: PoolInstance;

				beforeEach(async () => {
					launchProjectReceipt = await amm.launchProject(projectId, {
						from: partnerAddress,
					});
					const tokenCreated = _.last(
						await getTokensCreatedFromPastEvents(projectTokenFactory),
					);
					erc20Instance = await ProjectTokenERC20.at(tokenCreated?.token);
					const poolCreated = _.last(
						await getPoolsCreatedFromPastEvents(poolFactory),
					);
					poolInstance = await Pool.at(poolCreated?.pool);
				});

				it('> should change project status', async () => {
					await expectEvent(launchProjectReceipt, 'ProjectStatusChanged', {
						id: BN(1),
						status: BN(ProjectStatus.Launched),
					});
				});

				it('> should create token with expected supply and max supply', async () => {
					const lastTokenCreated = _.last(
						await getTokensCreatedFromPastEvents(projectTokenFactory),
					);

					assert.equal(lastTokenCreated?.name, name);
					assert.equal(lastTokenCreated?.symbol, symbol);

					assert.equal(
						(await erc20Instance.totalSupply()).toNumber(),
						partnerTokenShares + poolTokenShares + fansSocietyTokenShares,
					);
					assert.equal(
						(await erc20Instance.maxTotalSupply()).toNumber(),
						totalSupply,
					);
				});

				it('> should dispatch tokens', async () => {
					const transfers = await getTokenTransfersFromPastEvents(erc20Instance);

					assert.sameDeepOrderedMembers(transfers, [
						// transfer from erc20 to amm
						{
							from: address0,
							to: amm.address,
							value: partnerTokenShares + poolTokenShares + fansSocietyTokenShares,
						},
						// transfer from erc20 to partner
						{
							from: amm.address,
							to: partnerAddress,
							value: partnerTokenShares,
						},
						// transfer from erc20 to fans society
						{
							from: amm.address,
							to: fsociety,
							value: fansSocietyTokenShares,
						},
						// transfer from amm to pool
						{
							from: amm.address,
							to: poolInstance.address,
							value: poolTokenShares,
						},
					]);

					assert.equal(
						(await erc20Instance.balanceOf(partnerAddress)).toNumber(),
						partnerTokenShares,
						'Partner balance assertion failed',
					);

					assert.equal(
						(await erc20Instance.balanceOf(amm.address)).toNumber(),
						0,
						'AMM balance assertion failed',
					);
				});

				it('> should dispatch funds', async () => {
					const deposits = await getWethDepositsFromPastEvents(wethToken);

					assert.sameDeepOrderedMembers(deposits, [
						// deposit for amm
						{
							dst: amm.address,
							wad: +web3.utils.toWei(poolFundsShares.toString()),
						},
					]);

					const transfers = await getWethTransfersFromPastEvents(wethToken);

					assert.sameDeepOrderedMembers(transfers, [
						// transfer from amm to pool
						{
							src: amm.address,
							dst: poolInstance.address,
							wad: +web3.utils.toWei(poolFundsShares.toString()),
						},
					]);
				});
			});

			context('# project is launched', () => {
				let erc20Instance: ProjectTokenERC20Instance;
				let poolInstance: PoolInstance;

				beforeEach(async () => {
					await amm.launchProject(projectId, {
						from: partnerAddress,
					});
					const tokenCreated = _.last(
						await getTokensCreatedFromPastEvents(projectTokenFactory),
					);
					erc20Instance = await ProjectTokenERC20.at(tokenCreated?.token);
					const poolCreated = _.last(
						await getPoolsCreatedFromPastEvents(poolFactory),
					);
					poolInstance = await Pool.at(poolCreated?.pool);
				});

				describe('> claimProjectTokens', () => {
					it('> should allow a project participant to claim his token share', async () => {
						const receipt = await amm.claimProjectTokens(projectId, {
							from: fans[0],
						});
						const expectedAmount = investorsTokenShares / nbFans;

						await expectEvent(receipt, 'TokensClaimed', {
							projectId: BN(1),
							caller: fans[0],
							token: erc20Instance.address,
							amount: BN(expectedAmount),
						});

						assert.equal(
							(await erc20Instance.balanceOf(fans[0])).toNumber(),
							expectedAmount,
							'Participant balance assertion failed',
						);
					});

					it('> should fail if not a participant', async () => {
						await expectRevert(
							amm.claimProjectTokens(projectId, { from: fans[10] }), // fans[10] did not participate on ICO
							'No commitment',
						);
					});
				});

				context('# first fans investor has reclaimed his shares', () => {
					beforeEach(async () => {
						await amm.claimProjectTokens(projectId, { from: fans[0] });
					});

					describe('> addPoolLiquidity', () => {
						it('> should fail when using weth on tokenX and no msg.value', async () => {
							await expectRevert(
								amm.addPoolLiquidity(wethToken.address, erc20Instance.address, 0, 100, {
									from: fans[0],
								}),
								'invalid amount state',
							);
						});

						it('> should fail when using weth on tokenY and no msg.value', async () => {
							await expectRevert(
								amm.addPoolLiquidity(erc20Instance.address, wethToken.address, 100, 0, {
									from: fans[0],
								}),
								'invalid amount state',
							);
						});

						it('> should fail when using weth on tokenX and no amountY value', async () => {
							await expectRevert(
								amm.addPoolLiquidity(wethToken.address, erc20Instance.address, 0, 0, {
									from: fans[0],
									value: web3.utils.toWei('0.001'),
								}),
								'invalid amount state',
							);
						});

						it('> should fail when using weth on tokenY and no amountX value', async () => {
							await expectRevert(
								amm.addPoolLiquidity(erc20Instance.address, wethToken.address, 0, 0, {
									from: fans[0],
									value: web3.utils.toWei('0.001'),
								}),
								'invalid amount state',
							);
						});

						it('> should fail when using weth on tokenX and amountX value not equal to zero', async () => {
							await expectRevert(
								amm.addPoolLiquidity(
									wethToken.address,
									erc20Instance.address,
									100,
									100,
									{
										from: fans[0],
										value: web3.utils.toWei('0.001'),
									},
								),
								'invalid amount state',
							);
						});

						it('> should fail when using weth on tokenY and amountY value not equal to zero', async () => {
							await expectRevert(
								amm.addPoolLiquidity(
									erc20Instance.address,
									wethToken.address,
									100,
									100,
									{
										from: fans[0],
										value: web3.utils.toWei('0.001'),
									},
								),
								'invalid amount state',
							);
						});

						it('> should succeed when using weth on tokenX with correct amounts', async () => {
							const fanLpBalanceBefore = (
								await poolInstance.balanceOf(fans[0])
							).toNumber();

							assert.equal(fanLpBalanceBefore, 0);

							const receipt = await amm.addPoolLiquidity(
								wethToken.address,
								erc20Instance.address,
								0,
								100,
								{
									from: fans[0],
									value: web3.utils.toWei('0.00001'),
								},
							);

							const ammBalance = (
								await poolInstance.balanceOf(amm.address)
							).toNumber();

							const totalSupply = (await poolInstance.totalSupply()).toNumber();

							const fanLpBalanceAfter = (
								await poolInstance.balanceOf(fans[0])
							).toNumber();

							assert.equal(fanLpBalanceAfter, totalSupply - ammBalance);
						});

						it('> should succeed when using weth on tokenY with correct amounts', async () => {
							const fanLpBalanceBefore = (
								await poolInstance.balanceOf(fans[0])
							).toNumber();

							assert.equal(fanLpBalanceBefore, 0);

							const receipt = await amm.addPoolLiquidity(
								erc20Instance.address,
								wethToken.address,
								100,
								0,
								{
									from: fans[0],
									value: web3.utils.toWei('0.00001'),
								},
							);

							const ammBalance = (
								await poolInstance.balanceOf(amm.address)
							).toNumber();

							const totalSupply = (await poolInstance.totalSupply()).toNumber();

							const fanLpBalanceAfter = (
								await poolInstance.balanceOf(fans[0])
							).toNumber();

							assert.equal(fanLpBalanceAfter, totalSupply - ammBalance);
						});

						it('> should succeed when using two ERC20 tokens with correct amounts', async () => {
							// TODO
						});
					});
					describe('> removePoolLiquidity', () => {
						it('> should fail when caller does not own LP tokens', async () => {
							await expectRevert(
								amm.removePoolLiquidity(erc20Instance.address, wethToken.address, 10, {
									from: fans[0],
								}),
								'ERC20: transfer amount exceeds balance',
							);
						});
					});

					context('# first fan investor has added liquidity', () => {
						beforeEach(async () => {
							await amm.addPoolLiquidity(
								wethToken.address,
								erc20Instance.address,
								0,
								100,
								{
									from: fans[0],
									value: web3.utils.toWei('0.00001'),
								},
							);
						});

						describe('> removePoolLiquidity', () => {
							it('> should succeed when caller ask for owned LP tokens amount', async () => {
								const fanLpTokenBalanceBefore = (
									await poolInstance.balanceOf(fans[0])
								).toNumber();
								assert.ok(fanLpTokenBalanceBefore > 0);

								const params: any = [
									wethToken.address,
									erc20Instance.address,
									fanLpTokenBalanceBefore,
									{
										from: fans[0],
									},
								];
								const res = await amm.removePoolLiquidity.call.apply(null, params);

								assert.equal(
									web3.utils.fromWei(res['amountX']),
									'0.000009999999951564',
								);
								assert.equal(res['amountY'].toNumber(), 1799);

								await amm.removePoolLiquidity.apply(null, params);

								const fanLpTokenBalanceAfter = (
									await poolInstance.balanceOf(fans[0])
								).toNumber();

								assert.equal(fanLpTokenBalanceAfter, 0);
							});

							it('> should succeed when caller ask for owned LP tokens amount (reversed token order)', async () => {
								const fanLpTokenBalanceBefore = (
									await poolInstance.balanceOf(fans[0])
								).toNumber();
								assert.ok(fanLpTokenBalanceBefore > 0);

								const params: any = [
									erc20Instance.address,
									wethToken.address,
									fanLpTokenBalanceBefore,
									{
										from: fans[0],
									},
								];
								const res = await amm.removePoolLiquidity.call.apply(null, params);

								assert.equal(res['amountX'].toNumber(), 1799);
								assert.equal(
									web3.utils.fromWei(res['amountY']),
									'0.000009999999951564',
								);

								await amm.removePoolLiquidity.apply(null, params);

								const fanLpTokenBalanceAfter = (
									await poolInstance.balanceOf(fans[0])
								).toNumber();
								assert.equal(fanLpTokenBalanceAfter, 0);
							});
						});

						describe('> swap', () => {
							it('> should fail if tokenIn is weth and output amount is equal to zero', async () => {
								await expectRevert(
									amm.swap(poolInstance.address, wethToken.address, 0, {
										from: fans[0],
									}),
									'Not enough output',
								);
							});

							it('> should fail if tokenIn is ERC20 and output amount is equal to zero', async () => {
								await expectRevert(
									amm.swap(poolInstance.address, erc20Instance.address, 0, {
										from: fans[0],
										value: web3.utils.toWei('0.00001'),
									}),
									'Not enough output',
								);
							});

							it('> should fail if tokenIn is weth and msg.value is not sufficient', async () => {
								await expectRevert(
									amm.swap(poolInstance.address, wethToken.address, BN('10000000'), {
										from: fans[0],
										value: web3.utils.toWei('0.00001'),
									}),
									'not enough eth',
								);
							});

							it('> should fail if tokenIn is ERC20 and msg value is provided', async () => {
								await expectRevert(
									amm.swap(poolInstance.address, erc20Instance.address, 100, {
										from: fans[0],
										value: web3.utils.toWei('0.00001'),
									}),
									'not expected eth',
								);
							});

							it('> should fail if tokenIn is ERC20 and balance is not sufficient', async () => {
								await expectRevert(
									amm.swap(
										poolInstance.address,
										erc20Instance.address,
										BN('100000000000000000'),
										{
											from: fans[0],
										},
									),
									'ERC20: transfer amount exceeds balance',
								);
							});

							it('> should succeed if tokenIn is weth with msg value provided and address owns sufficient amount', async () => {
								// fans[10] does not own ERC20 token

								// get ERC20 balance
								const fanERC20BalanceBefore = (
									await erc20Instance.balanceOf(fans[10])
								).toNumber();

								// get ETH balance
								const fanETHBalanceBefore = await web3.eth.getBalance(fans[10]);
								const ethValue = web3.utils.toWei('0.00001');
								const { _reserveX, _reserveY } = (await poolInstance.getReserves(
									wethToken.address,
								)) as any;

								const computedOutputAmount = await poolInstance.computeMaxOutputAmount(
									ethValue,
									_reserveX,
									_reserveY,
								);
								const receipt = await amm.swap(
									poolInstance.address,
									wethToken.address,
									computedOutputAmount,
									{
										from: fans[10],
										value: ethValue,
									},
								);

								// assert fan's ERC20 balance
								const fanERC20BalanceAfter = (
									await erc20Instance.balanceOf(fans[10])
								).toNumber();

								const computedAmountIn = await poolInstance.computeRequiredInputAmount(
									computedOutputAmount,
									_reserveX,
									_reserveY,
								);
								assert.equal(fanERC20BalanceAfter, computedOutputAmount.toNumber());

								// assert fan's ETH balance
								const fanETHBalanceAfter = BN(await web3.eth.getBalance(fans[10]));
								const expectedNewETHBalance = BN(fanETHBalanceBefore)
									// value
									.sub(BN(ethValue))
									.add(BN(ethValue).sub(computedAmountIn))
									// gas
									.sub(BN(receipt.receipt.gasUsed * receipt.receipt.effectiveGasPrice));

								assert.equal(
									fanETHBalanceAfter.toString(),
									expectedNewETHBalance.toString(),
								);
							});

							it('> should succeed if tokenIn is ERC20 with amount provided and address owns sufficient amount', async () => {
								// claim to get tokens
								await amm.claimProjectTokens(projectId, { from: fans[1] });

								// now fans[1] does own ERC20 token
								// get ERC20 balance
								const fanERC20BalanceBefore = (
									await erc20Instance.balanceOf(fans[1])
								).toNumber();

								// get ETH balance
								const fanETHBalanceBefore = await web3.eth.getBalance(fans[1]);

								const { _reserveX, _reserveY } = (await poolInstance.getReserves(
									erc20Instance.address,
								)) as any;

								const inputAmount = 2000;
								const computedOutputAmount = await poolInstance.computeMaxOutputAmount(
									inputAmount,
									_reserveX,
									_reserveY,
								);

								const receipt = await amm.swap(
									poolInstance.address,
									erc20Instance.address,
									computedOutputAmount,
									{
										from: fans[1],
									},
								);

								// assert fan's ETH balance
								const fanETHBalanceAfter = BN(await web3.eth.getBalance(fans[1]));

								const expectedNewETHBalance = BN(fanETHBalanceBefore)
									.add(BN(computedOutputAmount.toString()))
									// gas
									.sub(BN(receipt.receipt.gasUsed * receipt.receipt.effectiveGasPrice));

								assert.equal(
									fanETHBalanceAfter.toString(),
									expectedNewETHBalance.toString(),
								);

								// assert fan's ERC20 balance
								const fanERC20BalanceAfter = (
									await erc20Instance.balanceOf(fans[1])
								).toNumber();

								assert.equal(fanERC20BalanceAfter, fanERC20BalanceBefore - inputAmount);
							});
						});
					});
				});
			});
		});
	});
});
