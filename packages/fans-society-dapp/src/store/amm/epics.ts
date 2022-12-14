import * as _ from 'lodash';
import { Epic } from 'redux-observable';
import { filter, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import {
	LiquidityAdded,
	LiquidityRemoved,
	ProjectCreated,
	TokensClaimed,
} from 'fans-society-contracts/types/web3/contracts/AMM';
import { RootAction, RootState, Services } from 'state-types';

import { findRpcMessage } from 'src/eth-network/helpers';
import {
	ABORT_PROJECT,
	COMMIT_ON_PROJECT,
	CREATE_PROJECT,
	GET_PROJECT,
	GET_TOKEN,
	IProjectDetail,
	IProjectListItem,
	ITokenDetail,
	LAUNCH_PROJECT,
	LIST_PROJECTS,
	LIST_POOLS,
	LOAD_CONTRACTS_INFO,
	ProjectStatus,
	WITHDRAW_ON_PROJECT,
	IPoolInfo,
	SWAP,
	GET_TOKEN_BALANCE,
	COMPUTE_SWAP_MAX_OUT,
	LIST_TOKENS_WITH_BALANCE,
	ITokenWithBalance,
	LIST_PROJECTS_DETAILS_WITH_COMMITMENTS,
	CLAIM_ON_PROJECT,
	COMPUTE_POOL_PRICE,
	ADD_POOL_LIQUIDITY,
	REMOVE_POOL_LIQUIDITY,
	GET_ETH_USD_PRICE,
	GET_POOL_RESERVE,
	COMPUTE_SWAP_REQUIRED_IN,
	GET_CURRENT_PROJECT_COMMITMENT,
	LIST_POOL_LIQUIDITY_SUMMARIES,
	IPoolLiquiditySummary,
} from './actions';
import {
	getAMMContract,
	getPoolContract,
	getPoolFactoryContract,
	getTokenContract,
	getTokensFactoryContract,
	getWethAddress,
} from './contract';
import { PoolCreated } from 'fans-society-contracts/types/web3/contracts/pools/PoolFactory';
import { TokenCreated } from 'fans-society-contracts/types/web3/contracts/tokens/ProjectTokenFactory';
import { contracts } from 'fans-society-contracts';
import Web3 from 'web3';

export const loadContractsInfo: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(LOAD_CONTRACTS_INFO.request)),
		mergeMap(async () => {
			try {
				const accounts = await web3.eth.requestAccounts();
				const account = accounts[0];
				const amm = await getAMMContract(web3);
				const owner = await amm.methods.owner().call();
				const poolsFactory = await getPoolFactoryContract(web3);
				const tokensFactory = await getTokensFactoryContract(web3);

				return LOAD_CONTRACTS_INFO.success({
					account,
					contracts: {
						amm: {
							contract: amm,
							isOwner: account === owner,
						},
						tokensFactory: {
							contract: tokensFactory,
						},
						poolsFactory: {
							contract: poolsFactory,
						},
					},
				});
			} catch (e) {
				logger.log(e.message);
				return LOAD_CONTRACTS_INFO.failure(findRpcMessage(e));
			}
		}),
	);
};

export const listProjects: Epic<RootAction, RootAction, RootState, Services> = (
	action$,
	state$,
	{ web3, logger },
) => {
	return action$.pipe(
		filter(isActionOf(LIST_PROJECTS.request)),
		mergeMap(async () => {
			try {
				const contract = state$.value.amm.contracts.amm.contract;

				const projectStatuses = (
					await contract.getPastEvents('ProjectStatusChanged', { fromBlock: 0 })
				).reduce((acc, evt) => {
					acc[evt.returnValues.id] = +evt.returnValues.status;
					return acc;
				}, {} as { [id: string]: ProjectStatus });

				const projects = (
					await contract.getPastEvents('ProjectCreated', { fromBlock: 0 })
				).map((event): IProjectListItem => {
					const { returnValues: v } = event as unknown as ProjectCreated;
					return {
						id: v.id,
						name: v.info[0],
						symbol: v.info[1],
						description: v.info[2],
						avatarCid: v.info[3],
						coverCid: v.info[4],
						target: +web3.utils.fromWei(v.ico[0], 'ether'),
						minInvest: +web3.utils.fromWei(v.ico[1], 'ether'),
						maxInvest: +web3.utils.fromWei(v.ico[2], 'ether'),
						partnerAddress: v.partnerAddress,
						status: projectStatuses[v.id] || ProjectStatus.Opened,
						$capabilities: {
							$canAbort: state$.value.amm.contracts.amm.isOwner,
							$canValidate: false,
						},
					};
				});
				logger.log('=== projects ===');
				logger.table(projects);
				return LIST_PROJECTS.success(projects);
			} catch (e) {
				logger.log(e.message);
				return LIST_PROJECTS.failure(findRpcMessage(e));
			}
		}),
	);
};

export const createProject: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(CREATE_PROJECT.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const contract = state$.value.amm.contracts.amm.contract;

				const {
					partnerAddress,
					name,
					symbol,
					description,
					avatarCid,
					coverCid,
					target,
					minInvest,
					maxInvest,
					totalSupply,
				} = action.payload;

				await contract.methods
					.createProject(
						[name, symbol, description, avatarCid, coverCid],
						[
							web3.utils.toWei(target, 'ether'),
							web3.utils.toWei(minInvest, 'ether'),
							web3.utils.toWei(maxInvest, 'ether'),
						],
						partnerAddress,
						web3.utils.toWei(totalSupply, 'ether'),
					)
					.send({ from: account });

				return CREATE_PROJECT.success();
			} catch (e) {
				logger.log(e.message);
				return CREATE_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};

export const abortProject: Epic<RootAction, RootAction, RootState, Services> = (
	action$,
	state$,
	{ web3, logger },
) => {
	return action$.pipe(
		filter(isActionOf(ABORT_PROJECT.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const contract = state$.value.amm.contracts.amm.contract;

				const projectId = action.payload;

				await contract.methods.abortProject(projectId).send({ from: account });

				return ABORT_PROJECT.success();
			} catch (e) {
				logger.log(e.message);
				return ABORT_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};

async function _getProject(
	web3: Web3,
	ammContract: contracts.AMM,
	account: string,
	isOwner: boolean,
	projectId: string,
	commitment?: number,
	claimed?: boolean,
): Promise<IProjectDetail> {
	const data = await ammContract.methods.projects(projectId).call();

	const status = +data.status;
	const target = +web3.utils.fromWei(data.ico[0], 'ether');
	const minInvest = +web3.utils.fromWei(data.ico[1], 'ether');
	const maxInvest = +web3.utils.fromWei(data.ico[2], 'ether');
	const fund = +web3.utils.fromWei(data.fund, 'ether');

	return {
		id: projectId,
		name: data.info[0],
		symbol: data.info[1],
		description: data.info[2],
		avatarCid: data.info[3],
		coverCid: data.info[4],
		target,
		minInvest,
		maxInvest,
		partnerAddress: data.partnerAddress,
		fund,
		status,
		commitment,
		$capabilities: {
			$canAbort: isOwner && status < ProjectStatus.Launched,
			$canValidate:
				status === ProjectStatus.Completed && account === data.partnerAddress,
			$canCommit:
				status < ProjectStatus.Completed &&
				fund < target &&
				(commitment ?? 0) < maxInvest,
			$canWithdraw: status < ProjectStatus.Completed && (commitment ?? 0) > 0,
			$canClaim:
				!claimed && status >= ProjectStatus.Launched && (commitment ?? 0) > 0,
		},
	};
}

export const getProject: Epic<RootAction, RootAction, RootState, Services> = (
	action$,
	state$,
	{ web3, logger },
) => {
	return action$.pipe(
		filter(isActionOf(GET_PROJECT.request)),
		mergeMap(async (action) => {
			try {
				const projectId = action.payload;

				const { contract, isOwner } = state$.value.amm.contracts.amm;
				const account = state$.value.amm.account.address;

				const commitments = await getProjectsCommitments(
					web3,
					contract,
					account,
					projectId,
				);
				const project = await _getProject(
					web3,
					contract,
					account,
					isOwner,
					projectId,
					state$.value.amm.commitments.items[projectId],
				);
				logger.log('=== Project found ===\n', JSON.stringify(project, null, 2));
				return GET_PROJECT.success(project);
			} catch (e) {
				logger.log(e.message);
				return GET_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};

export const commitOnProject: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(COMMIT_ON_PROJECT.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const contract = state$.value.amm.contracts.amm.contract;

				const { projectId, amount } = action.payload;

				await contract.methods
					.commitOnProject(projectId)
					.send({ from: account, value: web3.utils.toWei(amount, 'ether') });

				return COMMIT_ON_PROJECT.success();
			} catch (e) {
				logger.log(e.message);
				return COMMIT_ON_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};

export const withdrawOnProject: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(WITHDRAW_ON_PROJECT.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const contract = state$.value.amm.contracts.amm.contract;

				const { projectId } = action.payload;

				await contract.methods.withdrawOnProject(projectId).send({ from: account });

				return WITHDRAW_ON_PROJECT.success();
			} catch (e) {
				logger.log(e.message);
				return WITHDRAW_ON_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};

export const claimOnProject: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(CLAIM_ON_PROJECT.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const contract = state$.value.amm.contracts.amm.contract;

				const { projectId } = action.payload;

				await contract.methods
					.claimProjectTokens(projectId)
					.send({ from: account });

				return CLAIM_ON_PROJECT.success();
			} catch (e) {
				logger.log(e.message);
				return CLAIM_ON_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};

async function getProjectsCommitments(
	web3: Web3,
	ammContract: contracts.AMM,
	account: string,
	projectId?: string,
): Promise<{ [id: string]: number }> {
	const [commits, withdrawals] = await Promise.all([
		ammContract.getPastEvents('Committed', {
			fromBlock: 0,
			filter: {
				projectId,
				caller: account,
			},
		}),
		ammContract.getPastEvents('Withdrawed', {
			fromBlock: 0,
			filter: {
				projectId,
				caller: account,
			},
		}),
	]);
	const orderedEvents = _.sortBy([...commits, ...withdrawals], 'blockNumber');
	return orderedEvents.reduce((acc, _event) => {
		const { event, returnValues: v } = _event;
		acc[v.id] =
			event === 'Committed'
				? (acc[v.id] || 0) + +web3.utils.fromWei(v.amount, 'ether')
				: (acc[v.id] = 0);
		return acc;
	}, {} as { [id: string]: number });
}

export const getCurrentProjectCommitments: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(GET_CURRENT_PROJECT_COMMITMENT.request)),
		mergeMap(async (action) => {
			try {
				const projectId = action.payload.projectId;
				const account = state$.value.ethNetwork.account;
				if (!account) {
					return GET_CURRENT_PROJECT_COMMITMENT.success({
						projectId,
						commitment: 0,
					});
				}
				const contract = state$.value.amm.contracts.amm.contract;
				const commitment = (
					await getProjectsCommitments(web3, contract, account, projectId)
				)[projectId];

				logger.log('=== Commitment ===', projectId, commitment);

				return GET_CURRENT_PROJECT_COMMITMENT.success({
					projectId,
					commitment,
				});
			} catch (e) {
				logger.log(e.message);
				return GET_CURRENT_PROJECT_COMMITMENT.failure(findRpcMessage(e));
			}
		}),
	);
};

export const launchProject: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(LAUNCH_PROJECT.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const contract = state$.value.amm.contracts.amm.contract;

				const projectId = action.payload;

				await contract.methods.launchProject(projectId).send({ from: account });

				return LAUNCH_PROJECT.success();
			} catch (e) {
				logger.log(e.message);
				return LAUNCH_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};

export const getToken: Epic<RootAction, RootAction, RootState, Services> = (
	action$,
	state$,
	{ web3, logger },
) => {
	return action$.pipe(
		filter(isActionOf(GET_TOKEN.request)),
		mergeMap(async (action) => {
			try {
				const projectId = action.payload;

				const ammContract = state$.value.amm.contracts.amm.contract;
				const tokenFactoryContract =
					state$.value.amm.contracts.tokensFactory.contract;

				const [project, [tokenEvent]] = await Promise.all([
					ammContract.methods.projects(projectId).call(),
					tokenFactoryContract.getPastEvents('TokenCreated', {
						fromBlock: 0,
						filter: {
							projectId,
						},
					}),
				]);

				const token: ITokenDetail = {
					projectId,
					address: (tokenEvent as unknown as TokenCreated).returnValues.token,
					name: project.info[0],
					symbol: project.info[1],
					description: project.info[2],
					avatarCid: project.info[3],
					coverCid: project.info[4],
				};
				logger.log('=== Token found ===\n', JSON.stringify(token, null, 2));
				return GET_TOKEN.success(token);
			} catch (e) {
				logger.log(e.message);
				return GET_TOKEN.failure(findRpcMessage(e));
			}
		}),
	);
};

export const listTokenPools: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(LIST_POOLS.request)),
		mergeMap(async (action) => {
			try {
				const { token } = action.payload;
				const contract = state$.value.amm.contracts.poolsFactory.contract;
				const wethAddress = await getWethAddress(web3);

				const [poolsEvents, poolsEventsReverse] = await Promise.all([
					contract.getPastEvents('PoolCreated', {
						fromBlock: 0,
						filter: { tokenX: token },
					}),
					contract.getPastEvents('PoolCreated', {
						fromBlock: 0,
						filter: { tokenY: token },
					}),
				]);
				const pools: IPoolInfo[] = await Promise.all(
					[...poolsEvents, ...poolsEventsReverse].flatMap(async (event) => {
						const { returnValues: v } = event as unknown as PoolCreated;
						const tokenYAddress = v.tokenX === token ? v.tokenY : v.tokenX;

						const contractX = await getTokenContract(web3, token);
						const contractY = await getTokenContract(web3, tokenYAddress);
						const [nameX, symbolX, nameY, symbolY] = await Promise.all([
							contractX.methods.name().call(),
							contractX.methods.symbol().call(),
							contractY.methods.name().call(),
							contractY.methods.symbol().call(),
						]);
						return {
							poolAddress: v.pool,
							tokenX: {
								address: token,
								name: wethAddress === token ? 'Ethereum' : nameX,
								symbol: wethAddress === token ? 'ETH' : symbolX,
							},
							tokenY: {
								address: tokenYAddress,
								name: wethAddress === tokenYAddress ? 'Ethereum' : nameY,
								symbol: wethAddress === tokenYAddress ? 'ETH' : symbolY,
							},
						} as IPoolInfo;
					}),
				);

				logger.log('=== pools ===');
				logger.table(pools);
				return LIST_POOLS.success({ token, pools });
			} catch (e) {
				logger.log(e.message);
				return LIST_POOLS.failure(findRpcMessage(e));
			}
		}),
	);
};

export const computeSwapMaxAmountOut: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(COMPUTE_SWAP_MAX_OUT.request)),
		mergeMap(async (action) => {
			try {
				const { poolAddress, tokenIn, tokenOut, amountIn } = action.payload;

				const _amountIn = web3.utils.toWei(amountIn, 'ether');

				const contract = await getPoolContract(web3, poolAddress);

				const { _reserveX, _reserveY } = await contract.methods
					.getReserves(tokenIn.address)
					.call();

				const [amountOut, priceOut] = await Promise.all([
					contract.methods
						.computeMaxOutputAmount(_amountIn, _reserveX, _reserveY)
						.call(),
					contract.methods.computePriceOut(tokenIn.address, _amountIn).call(),
				]);

				return COMPUTE_SWAP_MAX_OUT.success({
					tokenIn,
					amountIn,
					tokenOut,
					amountOut: web3.utils.fromWei(amountOut, 'ether'),
					priceOut: web3.utils.fromWei(priceOut, 'ether'),
				});
			} catch (e) {
				logger.log(e.message);
				return COMPUTE_SWAP_MAX_OUT.failure(findRpcMessage(e));
			}
		}),
	);
};

export const computeSwapRequiredAmountIn: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(COMPUTE_SWAP_REQUIRED_IN.request)),
		mergeMap(async (action) => {
			try {
				const { poolAddress, tokenIn, tokenOut, amountOut } = action.payload;

				const _amountOut = web3.utils.toWei(amountOut, 'ether');

				const contract = await getPoolContract(web3, poolAddress);

				const { _reserveX, _reserveY } = await contract.methods
					.getReserves(tokenIn.address)
					.call();

				const amountIn = await contract.methods
					.computeRequiredInputAmount(_amountOut, _reserveX, _reserveY)
					.call();
				const _priceIn = await contract.methods
					.computePriceOut(tokenIn.address, amountIn)
					.call();

				return COMPUTE_SWAP_REQUIRED_IN.success({
					tokenIn,
					amountIn: web3.utils.fromWei(amountIn, 'ether'),
					tokenOut,
					amountOut,
					priceIn: web3.utils.fromWei(_priceIn, 'ether'),
				});
			} catch (e) {
				logger.log(e.message);
				return COMPUTE_SWAP_REQUIRED_IN.failure(findRpcMessage(e));
			}
		}),
	);
};

export const swap: Epic<RootAction, RootAction, RootState, Services> = (
	action$,
	state$,
	{ web3, logger },
) => {
	return action$.pipe(
		filter(isActionOf(SWAP.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const contract = state$.value.amm.contracts.amm.contract;
				const wethAddress = await getWethAddress(web3);

				const { poolAddress, tokenIn, amountIn, tokenOut, amountOut } =
					action.payload;

				let value: string;
				if (tokenIn === wethAddress) {
					value = web3.utils.toWei(amountIn, 'ether');
				}

				const _amountOut = web3.utils.toWei(amountOut, 'ether');

				await contract.methods
					.swap(poolAddress, tokenIn, _amountOut)
					.send({ from: account, value });

				return SWAP.success();
			} catch (e) {
				logger.log(e.message);
				return SWAP.failure(findRpcMessage(e));
			}
		}),
	);
};

export const computePoolPrice: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(COMPUTE_POOL_PRICE.request)),
		mergeMap(async (action) => {
			try {
				const { poolAddress, tokenX, tokenY, amountX } = action.payload;

				const _amountX = web3.utils.toWei(amountX, 'ether');
				const contract = await getPoolContract(web3, poolAddress);

				const _amountY = await contract.methods
					.computePriceOut(tokenX.address, _amountX)
					.call();

				return COMPUTE_POOL_PRICE.success({
					tokenX,
					amountX,
					tokenY,
					amountY: web3.utils.fromWei(_amountY, 'ether'),
				});
			} catch (e) {
				logger.log(e.message);
				return COMPUTE_POOL_PRICE.failure(findRpcMessage(e));
			}
		}),
	);
};

export const getPoolReserve: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(GET_POOL_RESERVE.request)),
		mergeMap(async (action) => {
			try {
				const { poolAddress, tokenX } = action.payload;
				const contract = await getPoolContract(web3, poolAddress);

				const { _tokenX, _reserveX, _tokenY, _reserveY } = await contract.methods
					.getReserves(tokenX)
					.call();

				return GET_POOL_RESERVE.success({
					tokenX: _tokenX,
					reserveX: web3.utils.fromWei(_reserveX, 'ether'),
					tokenY: _tokenY,
					reserveY: web3.utils.fromWei(_reserveY, 'ether'),
				});
			} catch (e) {
				logger.log(e.message);
				return GET_POOL_RESERVE.failure(findRpcMessage(e));
			}
		}),
	);
};

export const addPoolLiquidity: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(ADD_POOL_LIQUIDITY.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const contract = state$.value.amm.contracts.amm.contract;
				const wethAddress = await getWethAddress(web3);

				const { poolAddress, tokenX, amountX, tokenY, amountY } = action.payload;

				let value: string;
				if (tokenX === wethAddress) {
					value = web3.utils.toWei(amountX, 'ether');
				} else if (tokenY === wethAddress) {
					value = web3.utils.toWei(amountY, 'ether');
				}
				const _amountX =
					tokenX === wethAddress ? '0' : web3.utils.toWei(amountX, 'ether');
				const _amountY =
					tokenX === wethAddress ? web3.utils.toWei(amountY, 'ether') : '0';

				await contract.methods
					.addPoolLiquidity(poolAddress, tokenX, tokenY, _amountX, _amountY)
					.send({ from: account, value });

				return ADD_POOL_LIQUIDITY.success();
			} catch (e) {
				logger.log(e.message);
				return ADD_POOL_LIQUIDITY.failure(findRpcMessage(e));
			}
		}),
	);
};

export const removePoolLiquidity: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(REMOVE_POOL_LIQUIDITY.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const contract = state$.value.amm.contracts.amm.contract;

				const { poolAddress, amountLP } = action.payload;

				const _amountLP = web3.utils.toWei(amountLP, 'ether');

				await contract.methods
					.removePoolLiquidity(poolAddress, _amountLP)
					.send({ from: account });

				return REMOVE_POOL_LIQUIDITY.success();
			} catch (e) {
				logger.log(e.message);
				return REMOVE_POOL_LIQUIDITY.failure(findRpcMessage(e));
			}
		}),
	);
};

export const getTokenBalance: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(GET_TOKEN_BALANCE.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const tokenAddress = action.payload;
				const contract = await getTokenContract(web3, tokenAddress);
				const wethAddress = await getWethAddress(web3);
				let balance;
				if (tokenAddress === wethAddress) {
					balance = web3.utils.fromWei(
						(await web3.eth.getBalance(account)).toString(),
						'ether',
					);
				} else {
					balance = web3.utils.fromWei(
						(await contract.methods.balanceOf(account).call()).toString(),
						'ether',
					);
				}

				logger.log('=== Token balance ===', tokenAddress, balance);
				// here there is a trick: balance of weth address is not correct as we got eth balance
				return GET_TOKEN_BALANCE.success({
					address: tokenAddress,
					balance,
				});
			} catch (e) {
				logger.log(e.message);
				return GET_TOKEN_BALANCE.failure(findRpcMessage(e));
			}
		}),
	);
};

export const listAllTokensBalances: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(LIST_TOKENS_WITH_BALANCE.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				const tokenFactory = state$.value.amm.contracts.tokensFactory.contract;

				const tokenCreatedEvents = (await tokenFactory.getPastEvents(
					'TokenCreated',
					{
						fromBlock: 0,
					},
				)) as unknown as TokenCreated[];

				const tokens: ITokenWithBalance[] = await Promise.all(
					tokenCreatedEvents.flatMap(async ({ returnValues }) => {
						const tokenContract = await getTokenContract(web3, returnValues.token);
						const balance = web3.utils.fromWei(
							(await tokenContract.methods.balanceOf(account).call()).toString(),
							'ether',
						);
						return {
							projectId: returnValues.projectId,
							address: returnValues.token,
							name: returnValues.name,
							symbol: returnValues.symbol,
							balance,
						} as ITokenWithBalance;
					}),
				);
				logger.log('=== tokens with balances ===');
				logger.table(tokens);
				return LIST_TOKENS_WITH_BALANCE.success(tokens);
			} catch (e) {
				logger.log(e.message);
				return LIST_TOKENS_WITH_BALANCE.failure(findRpcMessage(e));
			}
		}),
	);
};

export const listProjectsClaims: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(LIST_PROJECTS_DETAILS_WITH_COMMITMENTS.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				if (!account) {
					return LIST_PROJECTS_DETAILS_WITH_COMMITMENTS.success([]);
				}
				const { contract, isOwner } = state$.value.amm.contracts.amm;
				const commitments = await getProjectsCommitments(web3, contract, account);

				const tokensClaimed = (await contract.getPastEvents('TokensClaimed', {
					fromBlock: 0,
					filter: {
						caller: account,
					},
				})) as unknown as TokensClaimed[];

				const unclaimedProjects = _.reduce(
					commitments,
					(acc, commitment, projectId) => {
						if (
							!_.find(tokensClaimed, (tc) => tc.returnValues.projectId === projectId)
						) {
							acc[projectId] = commitment;
						}
						return acc;
					},
					{} as { [projectId: string]: number },
				);

				const projects = await Promise.all(
					_.keys(unclaimedProjects).flatMap(async (projectId) => {
						return _getProject(
							web3,
							contract,
							account,
							isOwner,
							projectId,
							commitments[projectId],
						);
					}),
				);

				logger.log('=== projects with commitments ===');
				logger.table(projects);
				return LIST_PROJECTS_DETAILS_WITH_COMMITMENTS.success(projects);
			} catch (e) {
				logger.log(e.message);
				return LIST_PROJECTS_DETAILS_WITH_COMMITMENTS.failure(findRpcMessage(e));
			}
		}),
	);
};

async function getPoolWithLiquidities(
	web3: Web3,
	ammContract: contracts.AMM,
	account: string,
): Promise<string[]> {
	const [addEvents, removeEvents] = await Promise.all([
		ammContract.getPastEvents('LiquidityAdded', {
			fromBlock: 0,
			filter: {
				caller: account,
			},
		}) as unknown as Promise<LiquidityAdded[]>,
		ammContract.getPastEvents('LiquidityRemoved', {
			fromBlock: 0,
			filter: {
				caller: account,
			},
		}) as unknown as Promise<LiquidityRemoved[]>,
	]);
	const orderedEvents = _.sortBy([...addEvents, ...removeEvents], 'blockNumber');
	const poolWithLiquidity = orderedEvents.reduce((acc, _event) => {
		const { event, returnValues: v } = _event;
		acc[v.poolAddress] = event === 'LiquidityAdded';
		return acc;
	}, {} as { [id: string]: boolean });

	return _.reduce(
		poolWithLiquidity,
		(acc, hasLiquidity, address) => {
			if (hasLiquidity) acc.push(address);
			return acc;
		},
		[] as string[],
	);
}

export const listPoolLiquiditySummaries: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(LIST_POOL_LIQUIDITY_SUMMARIES.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				if (!account) {
					return LIST_POOL_LIQUIDITY_SUMMARIES.success([]);
				}
				const wethAddress = await getWethAddress(web3);
				const ammContract = state$.value.amm.contracts.amm.contract;
				const tokenFactoryContract =
					state$.value.amm.contracts.tokensFactory.contract;

				const poolAddresses = await getPoolWithLiquidities(
					web3,
					ammContract,
					account,
				);

				const pools: IPoolLiquiditySummary[] = await Promise.all(
					poolAddresses.flatMap(async (poolAddress) => {
						const poolContract = await getPoolContract(web3, poolAddress);
						const poolInfo = await poolContract.methods
							.getPoolInfo()
							.call({ from: account });

						let tokenX;
						let tokenY;
						if (poolInfo._tokenX === wethAddress) {
							tokenX = {
								address: poolInfo._tokenY,
								symbol: poolInfo._symbolY,
								reserve: poolInfo._reserveY,
							};
							tokenY = {
								address: poolInfo._tokenX,
								symbol: poolInfo._symbolX,
								reserve: poolInfo._reserveX,
							};
						} else {
							tokenX = {
								address: poolInfo._tokenX,
								symbol: poolInfo._symbolX,
								reserve: poolInfo._reserveX,
							};
							tokenY = {
								address: poolInfo._tokenY,
								symbol: poolInfo._symbolY,
								reserve: poolInfo._reserveY,
							};
						}

						const [token] = await tokenFactoryContract.getPastEvents('TokenCreated', {
							fromBlock: 0,
							filter: {
								token: tokenX.address,
							},
						});
						const projectId = token?.returnValues.projectId;
						if (!projectId) {
							throw new Error(`project ID not found for pool ${projectId}`);
						}
						return {
							projectId,
							poolAddress,
							tokenX: {
								symbol: tokenX.symbol,
								reserve: web3.utils.fromWei(tokenX.reserve, 'ether'),
							},
							tokenY: {
								symbol: tokenY.symbol,
								reserve: web3.utils.fromWei(tokenY.reserve, 'ether'),
							},
							supply: web3.utils.fromWei(poolInfo._supply, 'ether'),
							balance: web3.utils.fromWei(poolInfo._balance, 'ether'),
						};
					}),
				);
				logger.log('=== pools liquidities ===');
				logger.table(pools);
				return LIST_POOL_LIQUIDITY_SUMMARIES.success(pools);
			} catch (e) {
				logger.log(e.message);
				return LIST_POOL_LIQUIDITY_SUMMARIES.failure(findRpcMessage(e));
			}
		}),
	);
};

export const getEthUsdtPrice: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(GET_ETH_USD_PRICE.request)),
		mergeMap(async (action) => {
			try {
				const networkAlias = state$.value.ethNetwork.networkAlias;
				if (networkAlias === 'localhost') {
					return GET_ETH_USD_PRICE.failure('price unavailable on localhost');
				}
				const contract = await getAMMContract(web3);

				const price = await contract.methods.getEthUsdPrice().call();

				logger.log('=== ETH / USDT price ===', price);
				// here there is a trick: balance of weth address is not correct as we got eth balance
				return GET_ETH_USD_PRICE.success(+price / 10 ** 8);
			} catch (e) {
				logger.log(e.message);
				return GET_ETH_USD_PRICE.failure(findRpcMessage(e));
			}
		}),
	);
};
