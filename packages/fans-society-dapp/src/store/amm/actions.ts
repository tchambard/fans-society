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
	commitment?: number;
	$capabilities: IProjectDetailCapabilities;
}

export interface ITokenListItem {
	projectId: string;
	name: string;
	description: string;
	symbol: string;
	avatarCid: string;
	coverCid: string;
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

export interface IGetCurrentProjectCommitmentParams {
	projectId: string;
}

export interface IGetCurrentProjectCommitmentResult {
	projectId: string;
	commitment: number;
}

export interface ISwapParams {
	poolAddress: string;
	tokenIn: string;
	amountIn: string;
	tokenOut: string;
	amountOut: string;
}

export interface IComputeSwapMaxOutParams {
	poolAddress: string;
	tokenIn: IToken;
	tokenOut: IToken;
	amountIn: string;
}

export interface IComputeSwapMaxOutResult {
	tokenIn: IToken;
	amountIn: string;
	tokenOut: IToken;
	amountOut: string;
	priceOut: string;
}

export interface IComputeSwapRequiredInParams {
	poolAddress: string;
	tokenIn: IToken;
	tokenOut: IToken;
	amountOut: string;
}

export interface IComputeSwapRequiredInResult {
	tokenIn: IToken;
	amountIn: string;
	tokenOut: IToken;
	amountOut: string;
	priceIn: string;
}

export interface ISwapEvent {
	poolAddress: string;
	tokenIn: string;
	amountIn: string;
	tokenOut: string;
	amountOut: string;
}

export interface IAddPoolLiquidityParams {
	poolAddress: string;
	tokenX: string;
	tokenY: string;
	amountX: string;
	amountY: string;
}

export interface IRemovePoolLiquidityParams {
	poolAddress: string;
	amountLP: string;
}

export interface IGetPoolReserveParams {
	poolAddress: string;
	tokenX: string;
}

export interface IGetPoolReserveResult {
	tokenX: string;
	reserveX: string;
	tokenY: string;
	reserveY: string;
}

export interface IComputePoolPriceParams {
	poolAddress: string;
	tokenX: IToken;
	amountX: string;
	tokenY: IToken;
}

export interface IComputePoolPriceResult {
	tokenX: IToken;
	amountX: string;
	tokenY: IToken;
	amountY: string;
}

export interface ILPMintedEvent {
	tokenX: string;
	amountX: string;
	tokenY: string;
	amountY: string;
	liquidity: string;
}

export interface ILPBurntEvent {
	tokenX: string;
	amountX: string;
	tokenY: string;
	amountY: string;
	liquidity: string;
}

export interface ITokenBalanceResult {
	address: string;
	balance: string;
}

export interface ITokenWithBalance {
	projectId: string;
	address: string;
	name: string;
	symbol: string;
	balance: string;
}

export interface IProjectWithShare {
	projectId: string;
}

export interface IPoolLiquiditySummary {
	projectId: string;
	poolAddress: string;
	tokenX: {
		symbol: string;
		reserve: string;
	};
	tokenY: {
		symbol: string;
		reserve: string;
	};
	balance: string;
	supply: string;
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
	return (project: ITokenListItem) => action(project);
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

export const GET_CURRENT_PROJECT_COMMITMENT = createAsyncAction(
	'GET_CURRENT_PROJECT_COMMITMENT_REQUEST',
	'GET_CURRENT_PROJECT_COMMITMENT_SUCCESS',
	'GET_CURRENT_PROJECT_COMMITMENT_FAILURE',
)<
	IGetCurrentProjectCommitmentParams,
	IGetCurrentProjectCommitmentResult,
	string
>();

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
)<IClaimOnProjectParams, void, string>();

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

export const COMPUTE_SWAP_MAX_OUT = createAsyncAction(
	'COMPUTE_SWAP_MAX_OUT_REQUEST',
	'COMPUTE_SWAP_MAX_OUT_SUCCESS',
	'COMPUTE_SWAP_MAX_OUT_FAILURE',
)<IComputeSwapMaxOutParams, IComputeSwapMaxOutResult, string>();

export const COMPUTE_SWAP_REQUIRED_IN = createAsyncAction(
	'COMPUTE_SWAP_REQUIRED_IN_REQUEST',
	'COMPUTE_SWAP_REQUIRED_IN_SUCCESS',
	'COMPUTE_SWAP_REQUIRED_IN_FAILURE',
)<IComputeSwapRequiredInParams, IComputeSwapRequiredInResult, string>();

export const SWAP = createAsyncAction(
	'SWAP_REQUEST',
	'SWAP_SUCCESS',
	'SWAP_FAILURE',
)<ISwapParams, void, string>();

export const ADD_POOL_LIQUIDITY = createAsyncAction(
	'ADD_POOL_LIQUIDITY_REQUEST',
	'ADD_POOL_LIQUIDITY_SUCCESS',
	'ADD_POOL_LIQUIDITY_FAILURE',
)<IAddPoolLiquidityParams, void, string>();

export const REMOVE_POOL_LIQUIDITY = createAsyncAction(
	'REMOVE_POOL_LIQUIDITY_REQUEST',
	'REMOVE_POOL_LIQUIDITY_SUCCESS',
	'REMOVE_POOL_LIQUIDITY_FAILURE',
)<IRemovePoolLiquidityParams, void, string>();

export const COMPUTE_POOL_PRICE = createAsyncAction(
	'COMPUTE_POOL_PRICE_REQUEST',
	'COMPUTE_POOL_PRICE_SUCCESS',
	'COMPUTE_POOL_PRICEFAILURE',
)<IComputePoolPriceParams, IComputePoolPriceResult, string>();

export const GET_POOL_RESERVE = createAsyncAction(
	'GET_POOL_RESERVE_REQUEST',
	'GET_POOL_RESERVE_SUCCESS',
	'GET_POOL_RESERVE_FAILURE',
)<IGetPoolReserveParams, IGetPoolReserveResult, string>();

export const GET_TOKEN_BALANCE = createAsyncAction(
	'GET_TOKEN_BALANCE_REQUEST',
	'GET_TOKEN_BALANCE_SUCCESS',
	'GET_TOKEN_BALANCE_FAILURE',
)<string, ITokenBalanceResult, string>();

export const LIST_TOKENS_WITH_BALANCE = createAsyncAction(
	'LIST_TOKENS_WITH_BALANCE_REQUEST',
	'LIST_TOKENS_WITH_BALANCE_SUCCESS',
	'LIST_TOKENS_WITH_BALANCE_FAILURE',
)<void, ITokenWithBalance[], string>();

export const LIST_PROJECTS_DETAILS_WITH_COMMITMENTS = createAsyncAction(
	'LIST_PROJECTS_DETAILS_WITH_COMMITMENTS_REQUEST',
	'LIST_PROJECTS_DETAILS_WITH_COMMITMENTS_SUCCESS',
	'LIST_PROJECTS_DETAILS_WITH_COMMITMENTS_FAILURE',
)<void, IProjectDetail[], string>();

export const LIST_POOL_LIQUIDITY_SUMMARIES = createAsyncAction(
	'LIST_POOL_LIQUIDITY_SUMMARIES_REQUEST',
	'LIST_POOL_LIQUIDITY_SUMMARIES_SUCCESS',
	'LIST_POOL_LIQUIDITY_SUMMARIES_FAILURE',
)<void, IPoolLiquiditySummary[], string>();

export const GET_ETH_USD_PRICE = createAsyncAction(
	'GET_ETH_USD_PRICE_REQUEST',
	'GET_ETH_USD_PRICE_SUCCESS',
	'GET_ETH_USD_PRICE_FAILURE',
)<void, number, string>();

export const CLEAR_TX_ERROR = createAction('CLEAR_TX_ERROR', (action) => {
	return () => action();
});
