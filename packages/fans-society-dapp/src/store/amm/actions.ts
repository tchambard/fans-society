import { createAction, createAsyncAction } from 'typesafe-actions';

import { contracts } from 'fans-society-contracts';

export interface IAMMContractInfo {
	contract: contracts.AMM;
	isOwner: boolean;
}

export interface ITokensFactoryContractInfo {
	contract: contracts.tokens.ProjectTokenFactory;
}

export interface IPoolsFactoryContractInfo {
	contract: contracts.pools.PoolFactory;
}

export interface IContractsInfo {
	account: string;
	contracts: {
		amm: IAMMContractInfo;
		tokensFactory: ITokensFactoryContractInfo;
		poolsFactory: IPoolsFactoryContractInfo;
	};
}

export interface ICreateProjectParams {
	partnerAddress: string;
	name: string;
	symbol: string;
	description: string;
	target: string;
	minInvest: string;
	maxInvest: string;
	totalSupply: string;
}

export interface ICommitOnProjectParams {
	projectId: string;
	amount: string;
}

export interface IWithdrawOnProjectParams {
	projectId: string;
}

export interface IClaimOnProjectParams {
	projectId: string;
	amount: number;
}

export interface IProjectListCapabilities {
	$canCreate?: boolean;
}

export interface IProjectDetailCapabilities {
	$canAbort?: boolean;
	$canValidate?: boolean;
	$canCommit?: boolean;
	$canWithdraw?: boolean;
}

export enum ProjectStatus {
	Opened,
	Cancelled,
	Completed,
	Launched,
}

export interface IProjectListItem {
	id: string;
	name: string;
	description: string;
	target: number;
	minInvest: number;
	maxInvest: number;
	partnerAddress: string;
	status: ProjectStatus;
	$capabilities: IProjectDetailCapabilities;
}

export interface IProjectDetail {
	id: string;
	name: string;
	description: string;
	symbol: string;
	target: number;
	minInvest: number;
	maxInvest: number;
	fund: number;
	partnerAddress: string;
	status: ProjectStatus;
	$capabilities: IProjectDetailCapabilities;
}

export interface IProjectStatusChangedEvent {
	id: string;
	status: ProjectStatus;
}

export interface IProjectCommitment {
	id: string;
	amount: number;
	address?: string;
}

export interface IProjectWithdraw {
	id: string;
	address: string;
	amount: number;
}

export interface IProjectClaim {
	id: string;
	address: string;
	amount: number;
}

export interface IListMyProjectCommitmentsParams {
	projectId?: string;
}

export const LOAD_CONTRACTS_INFO = createAsyncAction(
	'LOAD_CONTRACTS_INFO_REQUEST',
	'LOAD_CONTRACTS_INFO_SUCCESS',
	'LOAD_CONTRACTS_INFO_FAILURE',
)<void, IContractsInfo, string>();

export const LIST_PROJECTS = createAsyncAction(
	'LIST_PROJECTS_REQUEST',
	'LIST_PROJECTS_SUCCESS',
	'LIST_PROJECTS_FAILURE',
)<void, IProjectListItem[], string>();

export const PROJECT_ADDED = createAction('PROJECT_ADDED', (action) => {
	return (project: IProjectListItem) => action(project);
});

export const CREATE_PROJECT = createAsyncAction(
	'CREATE_PROJECT_REQUEST',
	'CREATE_PROJECT_SUCCESS',
	'CREATE_PROJECT_FAILURE',
)<ICreateProjectParams, void, string>();

export const ABORT_PROJECT = createAsyncAction(
	'ABORT_PROJECT_REQUEST',
	'ABORT_PROJECT_SUCCESS',
	'ABORT_PROJECT_FAILURE',
)<string, void, string>();

export const GET_PROJECT = createAsyncAction(
	'GET_PROJECT_REQUEST',
	'GET_PROJECT_SUCCESS',
	'GET_PROJECT_FAILURE',
)<string, IProjectDetail, string>();

export const LIST_MY_PROJECT_COMMITMENTS = createAsyncAction(
	'LIST_MY_PROJECT_COMMITMENTS_REQUEST',
	'LIST_MY_PROJECT_COMMITMENTS_SUCCESS',
	'LIST_MY_PROJECT_COMMITMENTS_FAILURE',
)<IListMyProjectCommitmentsParams, { [id: string]: number }, string>();

export const COMMIT_ON_PROJECT = createAsyncAction(
	'COMMIT_ON_PROJECT_REQUEST',
	'COMMIT_ON_PROJECT_SUCCESS',
	'COMMIT_ON_PROJECT_FAILURE',
)<ICommitOnProjectParams, void, string>();

export const COMMITED = createAction('COMMITED', (action) => {
	return (commitment: IProjectCommitment) => action(commitment);
});

export const WITHDRAW_ON_PROJECT = createAsyncAction(
	'WITHDRAW_ON_PROJECT_REQUEST',
	'WITHDRAW_ON_PROJECT_SUCCESS',
	'WITHDRAW_ON_PROJECT_FAILURE',
)<IWithdrawOnProjectParams, void, string>();

export const WITHDRAWED = createAction('WITHDRAWED', (action) => {
	return (withdraw: IProjectWithdraw) => action(withdraw);
});

export const CLAIM_ON_PROJECT = createAsyncAction(
	'CLAIM_ON_PROJECT_REQUEST',
	'CLAIM_ON_PROJECT_SUCCESS',
	'CLAIM_ON_PROJECT_FAILURE',
)<ICommitOnProjectParams, void, string>();

export const CLAIMED = createAction('CLAIMED', (action) => {
	return (claim: IProjectClaim) => action(claim);
});

export const ADD_PROJECT_COMMITMENT = createAction(
	'ADD_PROJECT_COMMITMENT',
	(action) => {
		return (commitment: IProjectCommitment) => action(commitment);
	},
);

export const REMOVE_PROJECT_COMMITMENT = createAction(
	'REMOVE_PROJECT_COMMITMENT',
	(action) => {
		return (withdraw: IProjectWithdraw) => action(withdraw);
	},
);

export const LAUNCH_PROJECT = createAsyncAction(
	'LAUNCH_PROJECT_REQUEST',
	'LAUNCH_PROJECT_SUCCESS',
	'LAUNCH_PROJECT_FAILURE',
)<string, void, string>();

export const PROJECT_STATUS_CHANGED = createAction(
	'PROJECTS_STATUS_CHANGED',
	(action) => {
		return (data: IProjectStatusChangedEvent) => action(data);
	},
);

export const CLEAR_PROJECTS_TX_ERROR = createAction(
	'CLEAR_PROJECTS_TX_ERROR',
	(action) => {
		return () => action();
	},
);
