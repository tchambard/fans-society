import { Container, Grid, Paper, styled } from '@mui/material';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'state-types';

import { useParams } from 'react-router';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { GET_PROJECT, PROJECT_STATUS_CHANGED } from '../../actions';
import { listenProjectStatusChanged } from '../../listeners';
import ProjectContainerWrapper from '../ProjectContainerWrapper';
import ProjectHeader from './ProjectHeader';

const Item = styled(Paper)(({ theme }) => ({
	color: theme.palette.text.secondary,
}));

export default () => {
	const { projectId } = useParams();

	const dispatch = useDispatch();

	const { currentProject, contract } = useSelector(
		(state: RootState) => state.projects,
	);

	useEffect(() => {
		let destroyListener;
		if (contract.info?.contract) {
			if (currentProject.item == null || currentProject.item.id !== projectId) {
				dispatch(GET_PROJECT.request(projectId));
			} else {
				if (currentProject.item != null) {
					destroyListener = listenProjectStatusChanged(
						contract.info,
						(data) => dispatch(PROJECT_STATUS_CHANGED(data)),
						projectId,
					);
				}
			}
		}
		return () => destroyListener?.();
	}, [contract.info, currentProject.item?.id]);

	if (!currentProject.item || currentProject.loading) {
		return <SuspenseLoader />;
	}

	return (
		<ProjectContainerWrapper>
			<Helmet>
				<title>
					{currentProject.item.name} - {currentProject.item.description}
				</title>
			</Helmet>
			<PageTitleWrapper>
				<ProjectHeader />
			</PageTitleWrapper>
			<Container maxWidth={'xl'}>
				<Grid
					container
					direction={'row'}
					justifyContent={'center'}
					alignItems={'stretch'}
					spacing={3}
				>
					<Grid item xs={12}>
						<Item>test</Item>
					</Grid>
				</Grid>
			</Container>
		</ProjectContainerWrapper>
	);
};
