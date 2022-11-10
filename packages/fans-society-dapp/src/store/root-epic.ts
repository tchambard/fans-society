import { combineEpics } from 'redux-observable';

import * as ethNetworkEpics from '../eth-network/epics';

export default combineEpics(...Object.values(ethNetworkEpics));
