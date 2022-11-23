import { Epic } from 'redux-observable';
import { filter, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { ProjectCreated } from 'fans-society-contracts/types/web3/contracts/FansSociety';
import { RootAction, RootState, Services } from 'state-types';

import { findRpcMessage } from 'src/eth-network/helpers';
import loggerService from 'src/services/logger-service';
import {
	ABORT_PROJECT,
	CREATE_PROJECT,
	GET_PROJECT,
	IProjectDetail,
	IProjectListItem,
	LIST_PROJECTS,
	LOAD_PROJECTS_CONTRACT_INFO,
	ProjectStatus,
} from './actions';
import { getProjectsContract } from './contract';

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
				const contract = await getProjectsContract(web3);
				const owner = await contract.methods.owner().call();

				return LOAD_PROJECTS_CONTRACT_INFO.success({
					contract,
					isOwner: account === owner,
					account,
				});
			} catch (e) {
				loggerService.log(e.stack);
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
						symbol: v.symbol,
						target: +v.target,
						minInvest: +v.minInvest,
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
				loggerService.log(e.stack);
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

				const { authorAddress, name, symbol, description, target, minInvest } =
					action.payload;

				await contract.methods
					.createProject(authorAddress, name, symbol, description, target, minInvest)
					.send({ from: account });

				return CREATE_PROJECT.success();
			} catch (e) {
				loggerService.log(e.stack);
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
				loggerService.log(e.stack);
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
					target: +data.target,
					minInvest: +data.minInvest,
					authorAddress: data.authorAddress,
					status: +data.status,
					$capabilities: {
						$canAbort: state$.value.projects.contract.info.isOwner,
					},
				};
				logger.log('=== Project found ===\n', JSON.stringify(project, null, 2));
				return GET_PROJECT.success(project);
			} catch (e) {
				loggerService.log(e.stack);
				return GET_PROJECT.failure(findRpcMessage(e));
			}
		}),
	);
};
