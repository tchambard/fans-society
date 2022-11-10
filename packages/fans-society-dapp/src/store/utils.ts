import { compose } from 'redux';

export const composeEnhancers =
	typeof window === 'object' &&
	(window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
		: compose;
