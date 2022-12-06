import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { RootState } from 'state-types';

import ContentContainerWrapper from 'src/content/ContentContainerWrapper';
import { GET_TOKEN, LIST_POOLS } from 'src/store/amm/actions';
import ProjectDetail from './TokenDetail';

export default () => {
	const { projectId } = useParams();

	const dispatch = useDispatch();

	const { account } = useSelector((state: RootState) => state.ethNetwork);

	const { currentToken, contracts } = useSelector(
		(state: RootState) => state.amm,
	);

	useEffect(() => {
		if (contracts.amm?.contract && contracts.tokensFactory?.contract) {
			if (
				currentToken.loading == false &&
				currentToken.item?.projectId !== projectId
			) {
				dispatch(GET_TOKEN.request(projectId));
			}
		}
	}, [contracts.amm, contracts.tokensFactory, currentToken.item?.projectId]);

	useEffect(() => {
		if (
			currentToken.item?.projectId === projectId &&
			currentToken.item?.address
		) {
			dispatch(LIST_POOLS.request({ token: currentToken.item.address }));
		}
	}, [currentToken.item?.address]);

	return (
		<ContentContainerWrapper>
			<ProjectDetail />
		</ContentContainerWrapper>
	);
};
