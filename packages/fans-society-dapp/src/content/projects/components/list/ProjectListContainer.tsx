import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ProjectContainerWrapper from '../../../ContentContainerWrapper';
import ProjectList from './ProjectList';
import { LIST_PROJECTS } from 'src/store/amm/actions';

import { RootState } from 'state-types';

export default () => {
	const dispatch = useDispatch();

	const { contracts } = useSelector((state: RootState) => state.amm);

	useEffect(() => {
		if (contracts.amm?.contract) {
			dispatch(LIST_PROJECTS.request());
		}
	}, [contracts.amm]);

	return (
		<ProjectContainerWrapper>
			<ProjectList />
		</ProjectContainerWrapper>
	);
};
