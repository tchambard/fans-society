import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';

import ethNetwork from '../eth-network/reducer';

const createRootReducer = (history: History) =>
	combineReducers({
		router: connectRouter(history),
		ethNetwork,
	});

export default createRootReducer;
