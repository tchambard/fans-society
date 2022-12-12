import { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ContainerWrapper from 'src/components/ContainerWrapper/index';
import SuspenseLoader from 'src/components/SuspenseLoader/index';

import { RootState } from 'state-types';

import {
	CLEAR_TX_ERROR,
	LOAD_CONTRACTS_INFO,
	PROJECT_ADDED,
	TOKEN_ADDED,
} from '../store/amm/actions';
import {
	listenProjectCreated,
	listenTokenCreated,
} from '../store/amm/listeners';

interface IProjectContainerWrapperProps {
	children?: ReactNode;
}

export default ({ children }: IProjectContainerWrapperProps) => {
	const dispatch = useDispatch();

	const { account, contracts, txPending, error } = useSelector(
		(state: RootState) => state.amm,
	);

	useEffect(() => {
		if (!contracts.amm) {
			dispatch(LOAD_CONTRACTS_INFO.request());
		}
	}, [contracts.amm]);

	useEffect(() => {
		let destroyListener;
		if (contracts.amm?.contract) {
			destroyListener = listenProjectCreated(
				account.address,
				contracts.amm,
				(data) => dispatch(PROJECT_ADDED(data)),
			);
		}
		return () => destroyListener?.();
	}, [contracts.amm]);

	useEffect(() => {
		let destroyListener;
		if (contracts.tokensFactory?.contract) {
			destroyListener = listenTokenCreated(
				contracts.amm,
				contracts.tokensFactory,
				(data) => dispatch(TOKEN_ADDED(data)),
			);
		}
		return () => destroyListener?.();
	}, [contracts.tokensFactory]);

	if (!contracts.amm || contracts.loading) {
		return <SuspenseLoader />;
	}

	const handleCloseErrorSnack = (
		event?: React.SyntheticEvent | Event,
		reason?: string,
	) => {
		dispatch(CLEAR_TX_ERROR());
	};

	return (
		<ContainerWrapper
			children={children}
			handleCloseErrorSnack={handleCloseErrorSnack}
			error={error}
			txPending={txPending}
		/>
	);
};
