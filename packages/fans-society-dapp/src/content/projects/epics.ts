import { Epic } from 'redux-observable';
import { filter, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import {
	Committed,
	ProjectCreated,
} from 'fans-society-contracts/types/web3/contracts/FansSociety';
import { RootAction, RootState, Services } from 'state-types';

import { findRpcMessage } from 'src/eth-network/helpers';
import loggerService from 'src/services/logger-service';
import {
	ABORT_PROJECT,
	COMMIT_ON_PROJECT,
	CREATE_PROJECT,
	GET_PROJECT,
	IProjectCommitment,
	IProjectDetail,
	IProjectListItem,
	LIST_MY_PROJECT_COMMITMENTS,
	LIST_PROJECTS,
	LOAD_PROJECTS_CONTRACT_INFO,
	ProjectStatus,
	WITHDRAW_ON_PROJECT,
} from './actions';
import { getAMMContract } from './contract';

export const loadProjectsContractInfo: Epic<
	RootAction,
	RootAction,
	RootState,
	Services
> = (action$, state$, { web3, logger }) => {
	return action$.pipe(
		filter(isActionOf(LOAD_PROJECTS_CONTRACT_INFO.request)),
		mergeMap(async () => {
			try {
				const accounts = await web3.eth.requestAccounts();
				const account = accounts[0];
				const contract = await getAMMContract(web3);
				const owner = await contract.methods.owner().call();

				return LOAD_PROJECTS_CONTRACT_INFO.success({
					contract,
					isOwner: account === owner,
					account,
				});
			} catch (e) {
				loggerService.log(e.message);
				return LOAD_PROJECTS_CONTRACT_INFO.failure(findRpcMessage(e));
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
				const contract = state$.value.projects.contract.info.contract;

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
						authorAddress: v.authorAddress,
						status: projectStatuses[v.id] || ProjectStatus.Opened,
						$capabilities: {
							$canAbort: state$.value.projects.contract.info.isOwner,
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
				const contract = state$.value.projects.contract.info.contract;

				const {
					authorAddress,
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
						authorAddress,
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
				const contract = state$.value.projects.contract.info.contract;

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

				const { contract, isOwner } = state$.value.projects.contract.info;

				const data = await contract.methods.projects(projectId).call();

				const project: IProjectDetail = {
					id: projectId,
					name: data.name,
					description: data.description,
					symbol: data.symbol,
					target: +web3.utils.fromWei(data.target, 'ether'),
					minInvest: +web3.utils.fromWei(data.minInvest, 'ether'),
					maxInvest: +web3.utils.fromWei(data.maxInvest, 'ether'),
					authorAddress: data.authorAddress,
					fund: +web3.utils.fromWei(data.fund, 'ether'),
					status: +data.status,
					$capabilities: {
						$canAbort: state$.value.projects.contract.info.isOwner,
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
				const contract = state$.value.projects.contract.info.contract;

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
				const contract = state$.value.projects.contract.info.contract;

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
				const contract = state$.value.projects.contract.info.contract;

				const commitments: { [id: string]: number } = (
					await contract.getPastEvents('Committed', {
						fromBlock: 0,
						filter: {
							projectId: action.payload.projectId,
							caller: account,
						},
					})
				).reduce((acc, event) => {
					const { returnValues: v } = event as unknown as Committed;
					acc[v.id] = (acc[v.id] || 0) + +web3.utils.fromWei(v.amount, 'ether');
					return acc;
				}, {} as { [id: string]: number });
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
