import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'state-types';

import { LIST_PROJECTS, PROJECT_ADDED } from '../../actions';
import { listenProjectCreated } from '../../listeners';
import ProjectContainerWrapper from '../ProjectContainerWrapper';
import ProjectList from './ProjectList';

export default () => {
	const dispatch = useDispatch();

	const { contract } = useSelector((state: RootState) => state.projects);

	useEffect(() => {
		let destroyListener;
		if (contract.info?.contract) {
			dispatch(LIST_PROJECTS.request());
			listenProjectCreated(contract.info, (data) => dispatch(PROJECT_ADDED(data)));
		}
		return () => destroyListener?.();
	}, [contract.info]);

	return (
		<ProjectContainerWrapper>
			<ProjectList />
		</ProjectContainerWrapper>
	);
};
