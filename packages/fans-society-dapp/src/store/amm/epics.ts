import * as _ from 'lodash';
import { Epic } from 'redux-observable';
import { filter, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { ProjectCreated } from 'fans-society-contracts/types/web3/contracts/AMM';
import { RootAction, RootState, Services } from 'state-types';

import { findRpcMessage } from 'src/eth-network/helpers';
import loggerService from 'src/services/logger-service';
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
	LIST_MY_PROJECT_COMMITMENTS,
	LIST_PROJECTS,
	LIST_POOLS,
	LOAD_CONTRACTS_INFO,
	ProjectStatus,
	WITHDRAW_ON_PROJECT,
	IPoolInfo,
	SWAP,
	GET_TOKEN_BALANCE,
	COMPUTE_SWAP_OUT,
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
				loggerService.log(e.message);
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
						name: v.name,
						description: v.description,
						symbol: v.symbol,
						target: +web3.utils.fromWei(v.target, 'ether'),
						minInvest: +web3.utils.fromWei(v.minInvest, 'ether'),
						maxInvest: +web3.utils.fromWei(v.maxInvest, 'ether'),
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
				loggerService.log(e.message);
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
> = (action$, state$, { web3 }) => {
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
					target,
					minInvest,
					maxInvest,
					totalSupply,
				} = action.payload;

				await contract.methods
					.createProject(
						partnerAddress,
						name,
						symbol,
						description,
						web3.utils.toWei(target, 'ether'),
						web3.utils.toWei(minInvest, 'ether'),
						web3.utils.toWei(maxInvest, 'ether'),
						totalSupply,
					)
					.send({ from: account });

				return CREATE_PROJECT.success();
			} catch (e) {
				loggerService.log(e.message);
				return CREATE_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};

export const abortProject: Epic<RootAction, RootAction, RootState, Services> = (
	action$,
	state$,
	{ web3 },
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
				loggerService.log(e.message);
				return ABORT_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};

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

				const data = await contract.methods.projects(projectId).call();

				const status = +data.status;
				const maxInvest = +web3.utils.fromWei(data.maxInvest, 'ether');
				const target = +web3.utils.fromWei(data.target, 'ether');
				const fund = +web3.utils.fromWei(data.fund, 'ether');

				const project: IProjectDetail = {
					id: projectId,
					name: data.name,
					description: data.description,
					symbol: data.symbol,
					avatarImageUrl:
						'https://cdn.dribbble.com/users/588874/screenshots/2249528/media/dfc765104b15b69fab7a6363fd523d33.png?compress=1&resize=768x576&vertical=top',
					coverImageUrl:
						'http://www.thegrandtest.com/wp-content/uploads/2018/05/Star-Wars-Les-Derniers-Jedi.jpg',
					target,
					minInvest: +web3.utils.fromWei(data.minInvest, 'ether'),
					maxInvest,
					partnerAddress: data.partnerAddress,
					fund,
					status,
					$capabilities: {
						$canAbort: isOwner,
						$canValidate:
							status === ProjectStatus.Completed && account === data.partnerAddress,
						$canCommit:
							status < ProjectStatus.Completed &&
							fund < target &&
							(state$.value.amm.commitments.items[projectId] || 0) < maxInvest,
						$canWithdraw:
							status < ProjectStatus.Completed &&
							(state$.value.amm.commitments.items[projectId] || 0) > 0,
					},
				};
				logger.log('=== Project found ===\n', JSON.stringify(project, null, 2));
				return GET_PROJECT.success(project);
			} catch (e) {
				loggerService.log(e.message);
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
> = (action$, state$, { web3 }) => {
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
				loggerService.log(e.message);
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
> = (action$, state$, { web3 }) => {
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
				loggerService.log(e.message);
				return WITHDRAW_ON_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};

export const listMyProjectCommitments: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(LIST_MY_PROJECT_COMMITMENTS.request)),
		mergeMap(async (action) => {
			try {
				const account = state$.value.ethNetwork.account;
				if (!account) {
					return LIST_MY_PROJECT_COMMITMENTS.success({});
				}
				const contract = state$.value.amm.contracts.amm.contract;

				const [commits, withdrawals] = await Promise.all([
					contract.getPastEvents('Committed', {
						fromBlock: 0,
						filter: {
							projectId: action.payload.projectId,
							caller: account,
						},
					}),
					contract.getPastEvents('Withdrawed', {
						fromBlock: 0,
						filter: {
							projectId: action.payload.projectId,
							caller: account,
						},
					}),
				]);
				const orderedEvents = _.sortBy([...commits, ...withdrawals], 'blockNumber');
				const commitments: { [id: string]: number } = orderedEvents.reduce(
					(acc, _event) => {
						const { event, returnValues: v } = _event;
						acc[v.id] =
							event === 'Committed'
								? (acc[v.id] || 0) + +web3.utils.fromWei(v.amount, 'ether')
								: (acc[v.id] = 0);
						return acc;
					},
					{} as { [id: string]: number },
				);
				logger.log('=== commitments ===');
				logger.table(commitments);
				return LIST_MY_PROJECT_COMMITMENTS.success(commitments);
			} catch (e) {
				loggerService.log(e.message);
				return LIST_MY_PROJECT_COMMITMENTS.failure(findRpcMessage(e));
			}
		}),
	);
};

export const launchProject: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3 }) => {
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
				loggerService.log(e.message);
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
					name: project.name,
					description: project.description,
					symbol: project.symbol,
					avatarImageUrl:
						'https://cdn.dribbble.com/users/588874/screenshots/2249528/media/dfc765104b15b69fab7a6363fd523d33.png?compress=1&resize=768x576&vertical=top',
					coverImageUrl:
						'http://www.thegrandtest.com/wp-content/uploads/2018/05/Star-Wars-Les-Derniers-Jedi.jpg',
				};
				logger.log('=== Token found ===\n', JSON.stringify(token, null, 2));
				return GET_TOKEN.success(token);
			} catch (e) {
				loggerService.log(e.message);
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
				loggerService.log(e.message);
				return LIST_POOLS.failure(findRpcMessage(e));
			}
		}),
	);
};

export const computeAmountOut: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3 }) => {
	return action$.pipe(
		filter(isActionOf(COMPUTE_SWAP_OUT.request)),
		mergeMap(async (action) => {
			try {
				const wethAddress = await getWethAddress(web3);

				const { poolAddress, tokenIn, tokenOut, amountIn } = action.payload;

				const _amountIn =
					tokenIn === wethAddress ? web3.utils.toWei(amountIn, 'ether') : amountIn;

				const contract = await getPoolContract(web3, poolAddress);

				const { _reserveX, _reserveY } = await contract.methods
					.getReserves(tokenIn)
					.call();

				const [_amountOut, _priceOut] = await Promise.all([
					contract.methods
						.computeMaxOutputAmount(_amountIn, _reserveX, _reserveY)
						.call(),
					contract.methods.computePriceOut(tokenIn, _amountIn).call(),
				]);

				const amountOut =
					tokenOut === wethAddress
						? web3.utils.fromWei(_amountOut, 'ether')
						: _amountOut;
				const priceOut =
					tokenOut === wethAddress
						? web3.utils.fromWei(_priceOut, 'ether')
						: _priceOut;

				return COMPUTE_SWAP_OUT.success({
					tokenOut,
					amountOut,
					priceOut,
				});
			} catch (e) {
				loggerService.log(e.message);
				return COMPUTE_SWAP_OUT.failure(findRpcMessage(e));
			}
		}),
	);
};

export const swap: Epic<RootAction, RootAction, RootState, Services> = (
	action$,
	state$,
	{ web3 },
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
				let _amountOut = amountOut;
				if (tokenIn === wethAddress) {
					value = web3.utils.toWei(amountIn, 'ether');
				} else if (tokenOut === wethAddress) {
					_amountOut = web3.utils.toWei(amountOut, 'ether');
				}

				await contract.methods
					.swap(poolAddress, tokenIn, _amountOut)
					.send({ from: account, value });

				return SWAP.success();
			} catch (e) {
				loggerService.log(e.message);
				return SWAP.failure(findRpcMessage(e));
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
					balance = await contract.methods.balanceOf(account).call();
				}

				logger.log('=== Token balance ===', tokenAddress, balance);
				// here there is a trick: balance of weth address is not correct as we got eth balance
				return GET_TOKEN_BALANCE.success({
					address: tokenAddress,
					balance: +balance,
				});
			} catch (e) {
				loggerService.log(e.message);
				return GET_TOKEN_BALANCE.failure(findRpcMessage(e));
			}
		}),
	);
};
