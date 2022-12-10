import * as _ from 'lodash';
import { ActionType, createReducer } from 'typesafe-actions';

import { SET_CURRENT_ACCOUNT } from 'src/eth-network/actions';

import {
	ABORT_PROJECT,
	ADD_PROJECT_COMMITMENT,
	CLEAR_TX_ERROR,
	COMMIT_ON_PROJECT,
	COMPUTE_SWAP_MAX_OUT,
	CREATE_PROJECT,
	GET_PROJECT,
	GET_TOKEN,
	GET_TOKEN_BALANCE,
	IAMMContractInfo,
	IPoolInfo,
	IPoolsFactoryContractInfo,
	IProjectDetail,
	IProjectListCapabilities,
	IProjectListItem,
	ITokenDetail,
	ITokenListItem,
	ITokensFactoryContractInfo,
	LAUNCH_PROJECT,
	GET_CURRENT_PROJECT_COMMITMENT,
	LIST_POOLS,
	LIST_PROJECTS,
	LOAD_CONTRACTS_INFO,
	PROJECT_ADDED,
	PROJECT_STATUS_CHANGED,
	ProjectStatus,
	REMOVE_PROJECT_COMMITMENT,
	SWAP,
	TOKEN_ADDED,
	WITHDRAW_ON_PROJECT,
	ITokenWithBalance,
	LIST_TOKENS_WITH_BALANCE,
	LIST_PROJECTS_DETAILS_WITH_COMMITMENTS,
	CLAIM_ON_PROJECT,
	COMMITED,
	WITHDRAWED,
	COMPUTE_POOL_PRICE,
	ADD_POOL_LIQUIDITY,
	REMOVE_POOL_LIQUIDITY,
	GET_ETH_USD_PRICE,
	IToken,
	IComputePoolPriceResult,
	IComputeSwapMaxOutResult,
	IGetPoolReserveResult,
	GET_POOL_RESERVE,
	COMPUTE_SWAP_REQUIRED_IN,
	CLAIMED,
} from './actions';
import BN from 'bn.js';

export interface IProjectsState {
	account?: {
		address: string;
	};
	contracts: {
		loading: boolean;
		amm?: IAMMContractInfo;
		tokensFactory?: ITokensFactoryContractInfo;
		poolsFactory?: IPoolsFactoryContractInfo;
	};
	projects: {
		items: { [id: string]: IProjectListItem };
		$capabilities: IProjectListCapabilities;
		loading: boolean;
	};
	currentProject: { item?: IProjectDetail; loading: boolean };
	commitments: {
		items: { [id: string]: number };
		loading: boolean;
	};
	tokens: {
		items: { [address: string]: ITokenListItem };
		loading: boolean;
	};
	currentToken: { item?: ITokenDetail; poolIds: string[]; loading: boolean };
	pools: {
		items: { [address: string]: IPoolInfo };
		loading: boolean;
	};
	balances: {
		[address: string]: { balance: string; loading: boolean };
	};
	swapInfo?: {
		result?: {
			tokenIn: IToken;
			amountIn: string;
			tokenOut: IToken;
			amountOut: string;
			price: string;
		};
		error?: string;
	};
	poolInfo?: {
		price?: IComputePoolPriceResult;
		reserve?: IGetPoolReserveResult;
		error?: string;
	};
	dashboard: {
		tokens: {
			items: { [address: string]: ITokenWithBalance };
			loading: boolean;
		};
		projects: {
			items: { [projectId: string]: IProjectDetail };
			loading: boolean;
		};
	};
	ethUsdPrice?: number;
	txPending: boolean;
	error?: string;
}

const initialState: IProjectsState = {
	contracts: {
		loading: false,
	},
	projects: { items: {}, $capabilities: {}, loading: false },
	currentProject: { loading: false },
	commitments: { items: {}, loading: false },
	tokens: { items: {}, loading: false },
	currentToken: { loading: false, poolIds: [] },
	pools: { items: {}, loading: false },
	balances: {},
	dashboard: {
		tokens: { items: {}, loading: false },
		projects: { items: {}, loading: false },
	},
	txPending: false,
};

export default createReducer(initialState)
	.handleAction(
		[LOAD_CONTRACTS_INFO.request],
		(state: IProjectsState): IProjectsState => {
			return {
				...state,
				contracts: {
					...state.contracts,
					loading: true,
					amm: undefined,
				},
			};
		},
	)

	.handleAction(
		[LOAD_CONTRACTS_INFO.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof LOAD_CONTRACTS_INFO.failure>,
		): IProjectsState => {
			return {
				...state,
				contracts: {
					...state.contracts,
					loading: false,
					amm: state.contracts.amm,
				},
				error: action.payload,
			};
		},
	)

	.handleAction(
		[LOAD_CONTRACTS_INFO.success],
		(
			state: IProjectsState,
			action: ActionType<typeof LOAD_CONTRACTS_INFO.success>,
		): IProjectsState => {
			return {
				...state,
				account: {
					address: action.payload.account,
				},
				contracts: {
					...state.contracts,
					loading: false,
					amm: action.payload.contracts.amm,
					tokensFactory: action.payload.contracts.tokensFactory,
					poolsFactory: action.payload.contracts.poolsFactory,
				},
			};
		},
	)

	.handleAction(
		[LIST_PROJECTS.request],
		(state: IProjectsState): IProjectsState => {
			return {
				...state,
				projects: {
					items: {},
					loading: true,
					$capabilities: {},
				},
			};
		},
	)

	.handleAction(
		[LIST_PROJECTS.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof LIST_PROJECTS.failure>,
		): IProjectsState => {
			return {
				...state,
				projects: {
					...state.projects,
					loading: false,
				},
				error: action.payload,
			};
		},
	)

	.handleAction(
		[LIST_PROJECTS.success],
		(
			state: IProjectsState,
			action: ActionType<typeof LIST_PROJECTS.success>,
		): IProjectsState => {
			const projects: { [id: string]: IProjectListItem } = {};
			const tokens: { [id: string]: ITokenListItem } = {};
			action.payload.forEach((p) => {
				if (p.status === ProjectStatus.Launched) {
					tokens[p.id] = {
						projectId: p.id,
						name: p.name,
						description: p.description,
						symbol: p.symbol,
					};
				} else {
					projects[p.id] = p;
				}
			});

			return {
				...state,
				projects: {
					...state.projects,
					items: projects,
					loading: false,
					$capabilities: {
						$canCreate: state.contracts.amm?.isOwner,
					},
				},
				tokens: {
					...state.tokens,
					items: tokens,
					loading: false,
				},
			};
		},
	)

	.handleAction(
		[PROJECT_ADDED],
		(
			state: IProjectsState,
			action: ActionType<typeof PROJECT_ADDED>,
		): IProjectsState => {
			return {
				...state,
				projects: {
					...state.projects,
					items: {
						...state.projects.items,
						[action.payload.id]: action.payload,
					},
				},
			};
		},
	)

	.handleAction(
		[TOKEN_ADDED],
		(
			state: IProjectsState,
			action: ActionType<typeof TOKEN_ADDED>,
		): IProjectsState => {
			const projectId = action.payload.projectId;
			const tokenProject = state.projects.items[projectId];

			return {
				...state,
				projects: {
					...state.projects,
					items: {
						...state.projects.items,
						[projectId]: undefined,
					},
				},
				tokens: {
					...state.projects,
					items: {
						...state.tokens.items,
						[projectId]: {
							projectId,
							name: action.payload.name,
							description: tokenProject.description,
							symbol: action.payload.symbol,
						},
					},
				},
			};
		},
	)

	.handleAction(
		[
			CREATE_PROJECT.request,
			ABORT_PROJECT.request,
			LAUNCH_PROJECT.request,
			COMMIT_ON_PROJECT.request,
			WITHDRAW_ON_PROJECT.request,
			CLAIM_ON_PROJECT.request,
			SWAP.request,
			ADD_POOL_LIQUIDITY.request,
			REMOVE_POOL_LIQUIDITY.request,
		],
		(state: IProjectsState): IProjectsState => {
			return {
				...state,
				txPending: true,
			};
		},
	)

	.handleAction(
		[
			CREATE_PROJECT.failure,
			ABORT_PROJECT.failure,
			LAUNCH_PROJECT.failure,
			COMMIT_ON_PROJECT.failure,
			WITHDRAW_ON_PROJECT.failure,
			CLAIM_ON_PROJECT.failure,
			SWAP.failure,
			ADD_POOL_LIQUIDITY.failure,
			REMOVE_POOL_LIQUIDITY.failure,
		],
		(
			state: IProjectsState,
			action: ActionType<typeof CREATE_PROJECT.failure>,
		): IProjectsState => {
			return {
				...state,
				txPending: false,
				error: action.payload,
			};
		},
	)

	.handleAction(
		[
			CREATE_PROJECT.success,
			ABORT_PROJECT.success,
			LAUNCH_PROJECT.success,
			COMMIT_ON_PROJECT.success,
			WITHDRAW_ON_PROJECT.success,
			CLAIM_ON_PROJECT.success,
			SWAP.success,
			ADD_POOL_LIQUIDITY.success,
			REMOVE_POOL_LIQUIDITY.success,
		],
		(state: IProjectsState): IProjectsState => {
			return {
				...state,
				txPending: false,
			};
		},
	)

	.handleAction(
		[GET_PROJECT.request],
		(state: IProjectsState): IProjectsState => {
			return {
				...state,
				currentProject: {
					item: undefined,
					loading: true,
				},
			};
		},
	)

	.handleAction(
		[GET_PROJECT.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_PROJECT.failure>,
		): IProjectsState => {
			return {
				...state,
				currentProject: {
					...state.currentProject,
					loading: false,
				},
				error: action.payload,
			};
		},
	)

	.handleAction(
		[GET_PROJECT.success],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_PROJECT.success>,
		): IProjectsState => {
			return {
				...state,
				currentProject: {
					item: action.payload,
					loading: false,
				},
			};
		},
	)

	.handleAction(
		[GET_CURRENT_PROJECT_COMMITMENT.request],
		(state: IProjectsState): IProjectsState => {
			return {
				...state,
				commitments: {
					items: {},
					loading: true,
				},
			};
		},
	)

	.handleAction(
		[GET_CURRENT_PROJECT_COMMITMENT.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_CURRENT_PROJECT_COMMITMENT.failure>,
		): IProjectsState => {
			return {
				...state,
				commitments: {
					...state.commitments,
					loading: false,
				},
				error: action.payload,
			};
		},
	)

	.handleAction(
		[GET_CURRENT_PROJECT_COMMITMENT.success],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_CURRENT_PROJECT_COMMITMENT.success>,
		): IProjectsState => {
			const commitmentsItems = {
				...state.commitments.items,
				[action.payload.projectId]: action.payload.commitment,
			};
			const currentProjectCommitment =
				commitmentsItems[state.currentProject.item?.id] ?? 0;

			return {
				...state,
				currentProject: {
					...state.currentProject,
					item: {
						...state.currentProject.item,
						$capabilities: {
							...state.currentProject.item.$capabilities,
							$canCommit:
								state.currentProject.item.status < ProjectStatus.Completed &&
								state.currentProject.item.fund < state.currentProject.item.target &&
								currentProjectCommitment < state.currentProject.item.maxInvest,
							$canWithdraw:
								state.currentProject.item.status < ProjectStatus.Completed &&
								currentProjectCommitment > 0,
							$canClaim:
								state.currentProject.item.status >= ProjectStatus.Launched &&
								currentProjectCommitment > 0,
						},
					},
				},
				commitments: {
					...state.commitments,
					items: commitmentsItems,
					loading: false,
				},
			};
		},
	)

	.handleAction(
		[COMMITED],
		(
			state: IProjectsState,
			action: ActionType<typeof COMMITED>,
		): IProjectsState => {
			const { id, amount } = action.payload;

			return {
				...state,
				dashboard: {
					...state.dashboard,
					projects: {
						...state.dashboard.projects,
						items: {
							...state.dashboard.projects.items,
							[id]: {
								...state.dashboard.projects.items[id],
								fund: (state.dashboard.projects.items[id]?.fund ?? 0) + amount,
								commitment:
									(state.dashboard.projects.items[id]?.commitment ?? 0) + amount,
							},
						},
					},
				},
			};
		},
	)
	.handleAction(
		[WITHDRAWED],
		(
			state: IProjectsState,
			action: ActionType<typeof WITHDRAWED>,
		): IProjectsState => {
			const { id, amount } = action.payload;

			return {
				...state,
				dashboard: {
					...state.dashboard,
					projects: {
						...state.dashboard.projects,
						items: {
							...state.dashboard.projects.items,
							[id]: {
								...state.dashboard.projects.items[id],
								fund: state.dashboard.projects.items[id].fund - amount,
								commitment:
									(state.dashboard.projects.items[id].commitment ?? 0) - amount,
							},
						},
					},
				},
			};
		},
	)

	.handleAction(
		[ADD_PROJECT_COMMITMENT],
		(
			state: IProjectsState,
			action: ActionType<typeof ADD_PROJECT_COMMITMENT>,
		): IProjectsState => {
			return {
				...state,
				commitments: {
					...state.commitments,
					items: {
						...state.commitments.items,
						[action.payload.id]:
							(state.commitments.items[action.payload.id] || 0) +
							action.payload.amount,
					},
				},
			};
		},
	)

	.handleAction(
		[REMOVE_PROJECT_COMMITMENT],
		(
			state: IProjectsState,
			action: ActionType<typeof REMOVE_PROJECT_COMMITMENT>,
		): IProjectsState => {
			return {
				...state,
				commitments: {
					...state.commitments,
					items: {
						...state.commitments.items,
						[action.payload.id]:
							(state.commitments.items[action.payload.id] || 0) -
							action.payload.amount,
					},
				},
			};
		},
	)

	.handleAction(
		[CLAIMED],
		(
			state: IProjectsState,
			action: ActionType<typeof CLAIMED>,
		): IProjectsState => {
			const projectItems = { ...state.dashboard.projects.items };
			delete projectItems[action.payload.id];

			return {
				...state,
				dashboard: {
					...state.dashboard,
					tokens: {
						...state.dashboard.tokens,
						items: {
							...state.dashboard.tokens.items,
							[action.payload.id]: {
								...state.dashboard.tokens.items[action.payload.id],
								balance: new BN(state.dashboard.tokens.items[action.payload.id].balance)
									.add(new BN(action.payload.amount))
									.toString(),
							},
						},
					},
					projects: {
						...state.dashboard.projects,
						items: projectItems,
					},
				},
			};
		},
	)

	.handleAction([GET_TOKEN.request], (state: IProjectsState): IProjectsState => {
		return {
			...state,
			currentToken: {
				item: undefined,
				loading: true,
				poolIds: [],
			},
		};
	})

	.handleAction(
		[GET_TOKEN.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_TOKEN.failure>,
		): IProjectsState => {
			return {
				...state,
				currentToken: {
					...state.currentToken,
					loading: false,
				},
				error: action.payload,
			};
		},
	)

	.handleAction(
		[GET_TOKEN.success],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_TOKEN.success>,
		): IProjectsState => {
			return {
				...state,
				currentToken: {
					...state.currentToken,
					item: action.payload,
					loading: false,
				},
			};
		},
	)

	.handleAction(
		[GET_TOKEN_BALANCE.request],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_TOKEN_BALANCE.request>,
		): IProjectsState => {
			return {
				...state,
				balances: {
					...state.balances,
					[action.payload]: {
						...state.balances[action.payload],
						loading: true,
					},
				},
			};
		},
	)

	.handleAction(
		[GET_TOKEN_BALANCE.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_TOKEN_BALANCE.failure>,
		): IProjectsState => {
			return {
				...state,
				balances: {
					...state.balances,
					[action.payload]: {
						balance: undefined,
						loading: false,
					},
				},
				error: action.payload,
			};
		},
	)

	.handleAction(
		[GET_TOKEN_BALANCE.success],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_TOKEN_BALANCE.success>,
		): IProjectsState => {
			return {
				...state,
				balances: {
					...state.balances,
					[action.payload.address]: {
						balance: action.payload.balance,
						loading: false,
					},
				},
			};
		},
	)

	.handleAction(
		[LIST_POOLS.request],
		(state: IProjectsState): IProjectsState => {
			return {
				...state,
				pools: {
					items: {},
					loading: true,
				},
			};
		},
	)

	.handleAction(
		[LIST_POOLS.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof LIST_POOLS.failure>,
		): IProjectsState => {
			return {
				...state,
				pools: {
					...state.pools,
					loading: false,
				},
				error: action.payload,
			};
		},
	)

	.handleAction(
		[LIST_POOLS.success],
		(
			state: IProjectsState,
			action: ActionType<typeof LIST_POOLS.success>,
		): IProjectsState => {
			return {
				...state,
				pools: {
					...state.pools,
					items: action.payload.pools.reduce((acc, pool) => {
						if (
							action.payload.token != null &&
							action.payload.token === state.currentToken.item?.address
						) {
							state.currentToken.poolIds.push(pool.poolAddress);
						}
						acc[pool.poolAddress] = pool;
						return acc;
					}, {} as { [address: string]: IPoolInfo }),
					loading: false,
				},
			};
		},
	)

	.handleAction(
		[COMPUTE_SWAP_MAX_OUT.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof COMPUTE_SWAP_MAX_OUT.failure>,
		): IProjectsState => {
			return {
				...state,
				swapInfo: {
					error: action.payload,
				},
			};
		},
	)

	.handleAction(
		[COMPUTE_SWAP_MAX_OUT.success],
		(
			state: IProjectsState,
			action: ActionType<typeof COMPUTE_SWAP_MAX_OUT.success>,
		): IProjectsState => {
			return {
				...state,
				swapInfo: {
					result: {
						tokenIn: action.payload.tokenIn,
						amountIn: action.payload.amountIn,
						tokenOut: action.payload.tokenOut,
						amountOut: action.payload.amountOut,
						price: action.payload.priceOut,
					},
				},
			};
		},
	)

	.handleAction(
		[COMPUTE_SWAP_REQUIRED_IN.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof COMPUTE_SWAP_REQUIRED_IN.failure>,
		): IProjectsState => {
			return {
				...state,
				swapInfo: {
					error: action.payload,
				},
			};
		},
	)

	.handleAction(
		[COMPUTE_SWAP_REQUIRED_IN.success],
		(
			state: IProjectsState,
			action: ActionType<typeof COMPUTE_SWAP_REQUIRED_IN.success>,
		): IProjectsState => {
			return {
				...state,
				swapInfo: {
					result: {
						...state.swapInfo.result,
						tokenIn: action.payload.tokenIn,
						amountIn: action.payload.amountIn,
						tokenOut: action.payload.tokenOut,
						amountOut: action.payload.amountOut,
						price: action.payload.priceIn,
					},
				},
			};
		},
	)

	.handleAction(
		[COMPUTE_POOL_PRICE.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof COMPUTE_POOL_PRICE.failure>,
		): IProjectsState => {
			return {
				...state,
				poolInfo: {
					error: action.payload,
				},
			};
		},
	)

	.handleAction(
		[COMPUTE_POOL_PRICE.success],
		(
			state: IProjectsState,
			action: ActionType<typeof COMPUTE_POOL_PRICE.success>,
		): IProjectsState => {
			return {
				...state,
				poolInfo: {
					...state.poolInfo,
					price: {
						tokenX: action.payload.tokenX,
						amountX: action.payload.amountX,
						tokenY: action.payload.tokenY,
						amountY: action.payload.amountY,
					},
				},
			};
		},
	)
	.handleAction(
		[GET_POOL_RESERVE.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_POOL_RESERVE.failure>,
		): IProjectsState => {
			return {
				...state,
				poolInfo: {
					error: action.payload,
				},
			};
		},
	)

	.handleAction(
		[GET_POOL_RESERVE.success],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_POOL_RESERVE.success>,
		): IProjectsState => {
			return {
				...state,
				poolInfo: {
					...state.poolInfo,
					reserve: {
						tokenX: action.payload.tokenX,
						reserveX: action.payload.reserveX,
						tokenY: action.payload.tokenY,
						reserveY: action.payload.reserveY,
					},
				},
			};
		},
	)
	.handleAction(
		[PROJECT_STATUS_CHANGED],
		(
			state: IProjectsState,
			action: ActionType<typeof PROJECT_STATUS_CHANGED>,
		): IProjectsState => {
			const account = state.account.address;

			let currentProject = state.currentProject;
			const currentProjectCommitment =
				state.commitments.items[currentProject.item.id] || 0;

			if (action.payload.id === state.currentProject.item?.id) {
				currentProject = {
					...state.currentProject,
					item: {
						...state.currentProject.item,
						status: action.payload.status,
						$capabilities: {
							$canAbort:
								state.contracts.amm.isOwner &&
								action.payload.status < ProjectStatus.Launched,
							$canValidate:
								account === state.currentProject.item.partnerAddress &&
								action.payload.status === ProjectStatus.Completed,
							$canCommit:
								action.payload.status < ProjectStatus.Completed &&
								state.currentProject.item.fund < state.currentProject.item.target &&
								currentProjectCommitment < currentProject.item.maxInvest,
							$canWithdraw:
								action.payload.status < ProjectStatus.Completed &&
								currentProjectCommitment > 0,
							$canClaim: action.payload.status === ProjectStatus.Launched && false, // TODO
						},
					},
				};
			}

			return {
				...state,
				currentProject,
				projects: {
					...state.projects,
					items: {
						...state.projects.items,
						[action.payload.id]: {
							...state.projects.items[action.payload.id],
							status: action.payload.status,
						},
					},
				},
			};
		},
	)

	.handleAction(
		[LIST_TOKENS_WITH_BALANCE.request],
		(state: IProjectsState): IProjectsState => {
			return {
				...state,
				dashboard: {
					...state.dashboard,
					tokens: {
						items: {},
						loading: true,
					},
				},
			};
		},
	)

	.handleAction(
		[LIST_TOKENS_WITH_BALANCE.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof LIST_TOKENS_WITH_BALANCE.failure>,
		): IProjectsState => {
			return {
				...state,
				dashboard: {
					...state.dashboard,
					tokens: {
						...state.dashboard.tokens,
						loading: false,
					},
				},
				error: action.payload,
			};
		},
	)

	.handleAction(
		[LIST_TOKENS_WITH_BALANCE.success],
		(
			state: IProjectsState,
			action: ActionType<typeof LIST_TOKENS_WITH_BALANCE.success>,
		): IProjectsState => {
			return {
				...state,
				dashboard: {
					...state.dashboard,
					tokens: {
						items: action.payload.reduce((acc, token) => {
							acc[token.projectId] = token;
							return acc;
						}, {}),
						loading: false,
					},
				},
			};
		},
	)

	.handleAction(
		[LIST_PROJECTS_DETAILS_WITH_COMMITMENTS.request],
		(state: IProjectsState): IProjectsState => {
			return {
				...state,
				dashboard: {
					...state.dashboard,
					projects: {
						items: {},
						loading: true,
					},
				},
			};
		},
	)

	.handleAction(
		[LIST_PROJECTS_DETAILS_WITH_COMMITMENTS.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof LIST_PROJECTS_DETAILS_WITH_COMMITMENTS.failure>,
		): IProjectsState => {
			return {
				...state,
				dashboard: {
					...state.dashboard,
					projects: {
						...state.dashboard.projects,
						loading: false,
					},
				},
				error: action.payload,
			};
		},
	)

	.handleAction(
		[LIST_PROJECTS_DETAILS_WITH_COMMITMENTS.success],
		(
			state: IProjectsState,
			action: ActionType<typeof LIST_PROJECTS_DETAILS_WITH_COMMITMENTS.success>,
		): IProjectsState => {
			return {
				...state,
				dashboard: {
					...state.dashboard,
					projects: {
						items: action.payload.reduce((acc, project) => {
							acc[project.id] = project;
							return acc;
						}, {}),
						loading: false,
					},
				},
			};
		},
	)

	.handleAction(
		[GET_ETH_USD_PRICE.request],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_ETH_USD_PRICE.request>,
		): IProjectsState => {
			return {
				...state,
				ethUsdPrice: undefined,
			};
		},
	)

	.handleAction(
		[GET_ETH_USD_PRICE.failure],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_ETH_USD_PRICE.failure>,
		): IProjectsState => {
			return {
				...state,
				ethUsdPrice: undefined,
			};
		},
	)

	.handleAction(
		[GET_ETH_USD_PRICE.success],
		(
			state: IProjectsState,
			action: ActionType<typeof GET_ETH_USD_PRICE.success>,
		): IProjectsState => {
			return {
				...state,
				ethUsdPrice: action.payload,
			};
		},
	)

	.handleAction([CLEAR_TX_ERROR], (state: IProjectsState): IProjectsState => {
		return {
			...state,
			error: undefined,
		};
	})

	.handleAction([SET_CURRENT_ACCOUNT], (): IProjectsState => {
		// reset state will force reload of data
		return initialState;
	});
