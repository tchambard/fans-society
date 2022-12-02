import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'state-types';

import { LIST_PROJECTS, PROJECT_ADDED } from '../../../../store/amm/actions';
import { listenProjectCreated } from '../../../../store/amm/listeners';
import ProjectContainerWrapper from '../ProjectContainerWrapper';
import ProjectList from './ProjectList';

export default () => {
	const dispatch = useDispatch();

	const { account, contracts } = useSelector((state: RootState) => state.amm);

	useEffect(() => {
		let destroyListener;
		if (contracts.amm?.contract) {
			dispatch(LIST_PROJECTS.request());
			listenProjectCreated(account.address, contracts.amm, (data) =>
				dispatch(PROJECT_ADDED(data)),
			);
		}
		return () => destroyListener?.();
	}, [contracts.amm]);

	return (
		<ProjectContainerWrapper>
			<ProjectList />
		</ProjectContainerWrapper>
	);
};
