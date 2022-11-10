import * as _ from 'lodash';
import { Epic } from 'redux-observable';
import { filter, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { RootAction, RootState, Services } from 'state-types';

import { LOAD_NETWORK_INFO } from './actions';
import { findRpcMessage, NETWORKS } from 'src/eth-network/helpers';

export const loadAccount: Epic<RootAction, RootAction, RootState, Services> = (
	action$,
	state$,
	{ web3 },
) => {
	return action$.pipe(
		filter(isActionOf(LOAD_NETWORK_INFO.request)),
		mergeMap(async () => {
			try {
				const networkId = await web3.eth.net.getId();
				const networkAlias = NETWORKS[networkId];

				const accounts = await web3.eth.requestAccounts();
				const account = accounts[0];

				return LOAD_NETWORK_INFO.success({
					networkId,
					networkAlias,
					account,
				});
			} catch (e) {
				return LOAD_NETWORK_INFO.failure(findRpcMessage(e));
			}
		}),
	);
};
