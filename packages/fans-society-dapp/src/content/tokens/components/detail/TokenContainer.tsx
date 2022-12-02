import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'state-types';

import { useParams } from 'react-router';
import {
	ADD_PROJECT_COMMITMENT,
	CLAIMED,
	COMMITED,
	GET_PROJECT,
	LIST_MY_PROJECT_COMMITMENTS,
	PROJECT_STATUS_CHANGED,
	REMOVE_PROJECT_COMMITMENT,
	WITHDRAWED,
} from '../../../../store/amm/actions';
import {
	listenClaimed,
	listenCommitted,
	listenProjectStatusChanged,
	listenWithdrawed,
} from '../../../../store/amm/listeners';
import ProjectContainerWrapper from '../../../ContentContainerWrapper';
import ProjectDetail from './TokenDetail';

export default () => {
	const { projectId } = useParams();

	const dispatch = useDispatch();

	const { account } = useSelector((state: RootState) => state.ethNetwork);

	const { currentProject, contracts } = useSelector(
		(state: RootState) => state.amm,
	);

	useEffect(() => {
		let destroyListeners: (() => void)[];
		if (contracts.amm?.contract) {
			if (
				currentProject.loading == false &&
				currentProject.item?.id !== projectId
			) {
				dispatch(GET_PROJECT.request(projectId));
				dispatch(LIST_MY_PROJECT_COMMITMENTS.request({ projectId }));
			} else {
				if (currentProject.item != null) {
					destroyListeners = [
						listenProjectStatusChanged(
							contracts.amm,
							(data) => dispatch(PROJECT_STATUS_CHANGED(data)),
							projectId,
						),
						listenCommitted(contracts.amm, (data) => {
							dispatch(COMMITED(data));
							dispatch(GET_PROJECT.request(projectId));
							if (data.address === account) {
								dispatch(ADD_PROJECT_COMMITMENT(data));
							}
						}),
						listenWithdrawed(contracts.amm, (data) => {
							dispatch(WITHDRAWED(data));
							dispatch(GET_PROJECT.request(projectId));
							if (data.address === account) {
								dispatch(REMOVE_PROJECT_COMMITMENT(data));
							}
						}),
						listenClaimed(contracts.amm, (data) => {
							dispatch(CLAIMED(data));
							dispatch(GET_PROJECT.request(projectId));
						}),
					];
				}
			}
		}
		return () => destroyListeners?.forEach((listener) => listener());
	}, [contracts.amm, currentProject.item?.id]);

	return (
		<ProjectContainerWrapper>
			<ProjectDetail />
		</ProjectContainerWrapper>
	);
};
