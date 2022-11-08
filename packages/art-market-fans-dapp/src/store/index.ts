import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { createBrowserHistory } from 'history';
import { routerMiddleware as createRouterMiddleware } from 'connected-react-router';

import { RootAction, RootState } from 'state-types';

import services from '../services/index';
import { composeEnhancers } from './utils';
import rootEpic from './root-epic';
import createRootReducer from './root-reducer';

export const history = createBrowserHistory();
const routerMiddleware = createRouterMiddleware(history);

export const epicMiddleware = createEpicMiddleware<
	RootAction,
	RootAction,
	RootState,
	any
>({
	dependencies: services,
});

// configure middlewares
const middlewares = [epicMiddleware, routerMiddleware];
// compose enhancers
const enhancer = composeEnhancers(applyMiddleware(...middlewares));

// rehydrate state on app start
const initialState = {};
// create store
const rootReducer = createRootReducer(history);
const store = createStore(rootReducer, initialState, enhancer);

epicMiddleware.run(rootEpic);

// export store singleton instance
export default store;
