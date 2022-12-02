import { routerActions } from 'connected-react-router';

import * as ethNetwork from '../../eth-network/actions';
import * as amm from '../amm/actions';

export default {
	router: routerActions,
	eth: ethNetwork,
	amm,
};
