import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { RootState } from 'state-types';

import ContentContainerWrapper from 'src/content/ContentContainerWrapper';
import DashboardDetail from './DashboardDetail';

export default () => {
	const { projectId } = useParams();

	const dispatch = useDispatch();

	const { account } = useSelector((state: RootState) => state.ethNetwork);

	const { contracts } = useSelector((state: RootState) => state.amm);

	useEffect(() => {}, []);

	return (
		<ContentContainerWrapper>
			<DashboardDetail />
		</ContentContainerWrapper>
	);
};
