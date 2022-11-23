import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'state-types';

import { useParams } from 'react-router';
import {
	CLAIMED,
	COMMITED,
	GET_PROJECT,
	PROJECT_STATUS_CHANGED,
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
			} else {
				if (currentProject.item != null) {
					destroyListeners = [
						listenProjectStatusChanged(
							contract.info,
							(data) => dispatch(PROJECT_STATUS_CHANGED(data)),
							projectId,
						),
						listenCommitted(contract.info, (data) => {
							console.log('commited');
							dispatch(COMMITED(data));
							dispatch(GET_PROJECT.request(projectId));
						}),
						listenWithdrawed(contract.info, (data) => {
							dispatch(WITHDRAWED(data));
							dispatch(GET_PROJECT.request(projectId));
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
