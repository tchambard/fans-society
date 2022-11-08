import * as _ from 'lodash';
import { ActionType, createReducer } from 'typesafe-actions';
import { LOAD_NETWORK_INFO, SET_CURRENT_ACCOUNT } from './actions';

export interface IAppState {
	networkId?: number;
	networkAlias?: string;
	account?: string;
	loading: boolean;
}

const initialState: IAppState = {
	loading: false,
};

export default createReducer(initialState)
	.handleAction([LOAD_NETWORK_INFO.request], (state: IAppState): IAppState => {
		return {
			...state,
			account: undefined,
			loading: true,
		};
	})

	.handleAction(
		[LOAD_NETWORK_INFO.failure],
		(
			state: IAppState,
			action: ActionType<typeof LOAD_NETWORK_INFO.failure>,
		): IAppState => {
			return {
				...state,
				loading: false,
			};
		},
	)

	.handleAction(
		[LOAD_NETWORK_INFO.success],
		(
			state: IAppState,
			action: ActionType<typeof LOAD_NETWORK_INFO.success>,
		): IAppState => {
			return {
				...state,
				networkId: action.payload.networkId,
				networkAlias: action.payload.networkAlias,
				account: action.payload.account,
				loading: false,
			};
		},
	)

	.handleAction(
		[SET_CURRENT_ACCOUNT],
		(
			state: IAppState,
			action: ActionType<typeof SET_CURRENT_ACCOUNT>,
		): IAppState => {
			return {
				...state,
				account: action.payload,
			};
		},
	);
