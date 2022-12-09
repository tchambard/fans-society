import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { RootState } from 'state-types';

import ContentContainerWrapper from 'src/content/ContentContainerWrapper';
import DashboardDetail from './DashboardDetail';
import {
	listenClaimed,
	listenCommitted,
	listenProjectStatusChanged,
	listenWithdrawed,
} from 'src/store/amm/listeners';

export default () => {
	return (
		<ContentContainerWrapper>
			<DashboardDetail />
		</ContentContainerWrapper>
	);
};
