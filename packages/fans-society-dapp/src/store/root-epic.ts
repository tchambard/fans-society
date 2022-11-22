import { combineEpics } from 'redux-observable';

import * as ethNetwork from '../eth-network/epics';
import * as projects from '../content/projects/epics';

export default combineEpics(
	...Object.values(ethNetwork),
	...Object.values(projects),
);
