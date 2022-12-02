import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';

import ethNetwork from '../../eth-network/reducer';
import amm from '../amm/reducer';

const createRootReducer = (history: History) =>
	combineReducers({
		router: connectRouter(history),
		ethNetwork,
		amm,
	});

export default createRootReducer;
