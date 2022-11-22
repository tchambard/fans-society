import { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ContainerWrapper from 'src/components/ContainerWrapper';
import SuspenseLoader from 'src/components/SuspenseLoader';

import { RootState } from 'state-types';

import {
	CLEAR_PROJECTS_TX_ERROR,
	LOAD_PROJECTS_CONTRACT_INFO,
} from '../actions';

interface IProjectContainerWrapperProps {
	children?: ReactNode;
}

export default ({ children }: IProjectContainerWrapperProps) => {
	const dispatch = useDispatch();

	const { contract, txPending, error } = useSelector(
		(state: RootState) => state.projects,
	);

	useEffect(() => {
		if (!contract.info) {
			dispatch(LOAD_PROJECTS_CONTRACT_INFO.request());
		}
	}, [contract.info]);

	if (!contract.info || contract.loading) {
		return <SuspenseLoader />;
	}

	const handleCloseErrorSnack = (
		event?: React.SyntheticEvent | Event,
		reason?: string,
	) => {
		dispatch(CLEAR_PROJECTS_TX_ERROR());
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
