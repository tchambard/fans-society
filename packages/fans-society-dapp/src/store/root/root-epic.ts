import { combineEpics } from 'redux-observable';

import * as ethNetwork from '../../eth-network/epics';
import * as amm from '../amm/epics';

export default combineEpics(
	...Object.values(ethNetwork),
	...Object.values(amm),
);
