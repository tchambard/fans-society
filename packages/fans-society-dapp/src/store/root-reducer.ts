import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';

import ethNetwork from '../eth-network/reducer';
import projects from '../content/projects/reducer';

const createRootReducer = (history: History) =>
	combineReducers({
		router: connectRouter(history),
		ethNetwork,
		projects,
	});

export default createRootReducer;
