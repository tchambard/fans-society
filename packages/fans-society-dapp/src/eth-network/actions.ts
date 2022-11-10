import { createAction, createAsyncAction } from 'typesafe-actions';

export interface INetworkConnectionInfo {
	networkId: number;
	networkAlias: string;
	account: string;
}

export const LOAD_NETWORK_INFO = createAsyncAction(
	'LOAD_NETWORK_INFO_REQUEST',
	'LOAD_NETWORK_INFO_SUCCESS',
	'LOAD_NETWORK_INFO_FAILURE',
)<void, INetworkConnectionInfo, string>();

export const SET_CURRENT_ACCOUNT = createAction(
	'SET_CURRENT_ACCOUNT',
	(action) => {
		return (account: string | undefined) => action(account);
	},
);
