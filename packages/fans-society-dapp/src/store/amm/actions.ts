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
	avatarCid: string;
	coverCid: string;
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
	$canClaim?: boolean;
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
	symbol: string;
	description: string;
	avatarCid: string;
	coverCid: string;
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
	symbol: string;
	description: string;
	avatarCid: string;
	coverCid: string;
	target: number;
	minInvest: number;
	maxInvest: number;
	fund: number;
	partnerAddress: string;
	status: ProjectStatus;
	$capabilities: IProjectDetailCapabilities;
}

export interface ITokenListItem {
	projectId: string;
	name: string;
	description: string;
	symbol: string;
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

export interface ITokenCreated {
	projectId: string;
	address: string;
	name: string;
	symbol: string;
}

export interface ITokenDetail {
	projectId: string;
	address: string;
	symbol: string;
	name: string;
	description: string;
	avatarCid: string;
	coverCid: string;
}

export interface IListPoolsParams {
	token?: string;
}

export interface IToken {
	address: string;
	name: string;
	symbol: string;
}

export interface IPoolInfo {
	poolAddress: string;
	tokenX: IToken;
	tokenY: IToken;
}

export interface IListPoolsResult {
	token?: string;
	pools: IPoolInfo[];
}

export interface IListMyProjectCommitmentsParams {
	projectId?: string;
}

export interface ISwapParams {
	poolAddress: string;
	tokenIn: string;
	amountIn: string;
	tokenOut: string;
	amountOut: string;
}

export interface IComputeSwapOutParams {
	poolAddress: string;
	tokenIn: string;
	tokenOut: string;
	amountIn: string;
}

export interface IComputeSwapOutResult {
	tokenOut: string;
	amountOut: string;
	priceOut: string;
}

export interface ISwapEvent {
	tokenIn: string;
	amountIn: number;
	tokenOut: string;
	amountOut: number;
}

export interface ITokenBalanceResult {
	address: string;
	balance: number;
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

export const TOKEN_ADDED = createAction('TOKEN_ADDED', (action) => {
	return (project: ITokenCreated) => action(project);
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

export const PROJECT_STATUS_CHANGED = createAction(
	'PROJECTS_STATUS_CHANGED',
	(action) => {
		return (data: IProjectStatusChangedEvent) => action(data);
	},
);

export const LAUNCH_PROJECT = createAsyncAction(
	'LAUNCH_PROJECT_REQUEST',
	'LAUNCH_PROJECT_SUCCESS',
	'LAUNCH_PROJECT_FAILURE',
)<string, void, string>();

export const GET_TOKEN = createAsyncAction(
	'GET_TOKEN_REQUEST',
	'GET_TOKEN_SUCCESS',
	'GET_TOKEN_FAILURE',
)<string, ITokenDetail, string>();

export const LIST_POOLS = createAsyncAction(
	'LIST_POOLS_REQUEST',
	'LIST_POOLS_SUCCESS',
	'LIST_POOLS_FAILURE',
)<IListPoolsParams, IListPoolsResult, string>();

export const COMPUTE_SWAP_OUT = createAsyncAction(
	'COMPUTE_SWAP_OUT_REQUEST',
	'COMPUTE_SWAP_OUT_SUCCESS',
	'COMPUTE_SWAP_OUT_FAILURE',
)<IComputeSwapOutParams, IComputeSwapOutResult, string>();

export const SWAP = createAsyncAction(
	'SWAP_REQUEST',
	'SWAP_SUCCESS',
	'SWAP_FAILURE',
)<ISwapParams, void, string>();

export const GET_TOKEN_BALANCE = createAsyncAction(
	'GET_TOKEN_BALANCE_REQUEST',
	'GET_TOKEN_BALANCE_SUCCESS',
	'GET_TOKEN_BALANCE_FAILURE',
)<string, ITokenBalanceResult, string>();

export const CLEAR_TX_ERROR = createAction('CLEAR_TX_ERROR', (action) => {
	return () => action();
});
