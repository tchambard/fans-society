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
} from '../../actions';
import {
	listenClaimed,
	listenCommitted,
	listenProjectStatusChanged,
	listenWithdrawed,
} from '../../listeners';
import ProjectContainerWrapper from '../ProjectContainerWrapper';
import ProjectDetail from './ProjectDetail';

export default () => {
	const { projectId } = useParams();

	const dispatch = useDispatch();

	const { account } = useSelector((state: RootState) => state.ethNetwork);

	const { currentProject, contract } = useSelector(
		(state: RootState) => state.projects,
	);

	useEffect(() => {
		let destroyListeners: (() => void)[];
		if (contract.info?.contract) {
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
							contract.info,
							(data) => dispatch(PROJECT_STATUS_CHANGED(data)),
							projectId,
						),
						listenCommitted(contract.info, (data) => {
							console.log('COMMITED', data);
							dispatch(COMMITED(data));
							dispatch(GET_PROJECT.request(projectId));
							if (data.address === account) {
								dispatch(ADD_PROJECT_COMMITMENT(data));
							}
						}),
						listenWithdrawed(contract.info, (data) => {
							console.log('WITHDRAWED', data);
							dispatch(WITHDRAWED(data));
							dispatch(GET_PROJECT.request(projectId));
							if (data.address === account) {
								dispatch(REMOVE_PROJECT_COMMITMENT(data));
							}
						}),
						listenClaimed(contract.info, (data) => {
							dispatch(CLAIMED(data));
							dispatch(GET_PROJECT.request(projectId));
						}),
					];
				}
			}
		}
		return () => destroyListeners?.forEach((listener) => listener());
	}, [contract.info, currentProject.item?.id]);

	return (
		<ProjectContainerWrapper>
			<ProjectDetail />
		</ProjectContainerWrapper>
	);
};
