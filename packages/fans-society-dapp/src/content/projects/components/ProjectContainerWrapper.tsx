import { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ContainerWrapper from 'src/components/ContainerWrapper';
import SuspenseLoader from 'src/components/SuspenseLoader';

import { RootState } from 'state-types';

import {
	CLEAR_PROJECTS_TX_ERROR,
	LOAD_CONTRACTS_INFO,
} from '../../../store/amm/actions';

interface IProjectContainerWrapperProps {
	children?: ReactNode;
}

export default ({ children }: IProjectContainerWrapperProps) => {
	const dispatch = useDispatch();

	const { contracts, txPending, error } = useSelector(
		(state: RootState) => state.amm,
	);

	useEffect(() => {
		if (!contracts.amm) {
			dispatch(LOAD_CONTRACTS_INFO.request());
		}
	}, [contracts.amm]);

	if (!contracts.amm || contracts.loading) {
		return <SuspenseLoader/>;
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
