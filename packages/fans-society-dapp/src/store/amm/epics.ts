import * as _ from 'lodash';
import { Epic } from 'redux-observable';
import { filter, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import {
	Committed,
	ProjectCreated,
	Withdrawed,
} from 'fans-society-contracts/types/web3/contracts/AMM';
import { RootAction, RootState, Services } from 'state-types';

import { findRpcMessage } from 'src/eth-network/helpers';
import loggerService from 'src/services/logger-service';
import {
	ABORT_PROJECT,
	COMMIT_ON_PROJECT,
	CREATE_PROJECT,
	GET_PROJECT,
	IProjectDetail,
	IProjectListItem,
	LAUNCH_PROJECT,
	LIST_MY_PROJECT_COMMITMENTS,
	LIST_PROJECTS,
	LOAD_CONTRACTS_INFO,
	ProjectStatus,
	WITHDRAW_ON_PROJECT,
} from './actions';
import {
	getAMMContract,
	getPoolFactoryContract,
	getTokensFactoryContract,
} from './contract';

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

				const commits = await contract.getPastEvents('Committed', {
					fromBlock: 0,
					filter: {
						projectId: action.payload.projectId,
						caller: account,
					},
				});
				const withdrawals = await contract.getPastEvents('Withdrawed', {
					fromBlock: 0,
					filter: {
						projectId: action.payload.projectId,
						caller: account,
					},
				});

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
