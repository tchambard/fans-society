import { routerActions } from 'connected-react-router';

import * as ethNetwork from '../eth-network/actions';
import * as projects from '../content/projects/actions';

export default {
	router: routerActions,
	eth: ethNetwork,
	projects,
};
