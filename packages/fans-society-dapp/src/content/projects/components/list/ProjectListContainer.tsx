import { Card, Container, Grid } from '@mui/material';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'state-types';

import PageTitleWrapper from 'src/components/PageTitleWrapper';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { LIST_PROJECTS, PROJECT_ADDED } from '../../actions';
import { listenProjectCreated } from '../../listeners';
import ProjectContainerWrapper from '../ProjectContainerWrapper';
import ProjectList from './ProjectList';
import ProjectListHeader from './ProjectListHeader';

export default () => {
	const dispatch = useDispatch();

	const { contract, projects } = useSelector(
		(state: RootState) => state.projects,
	);

	useEffect(() => {
		let destroyListener;
		if (contract.info?.contract) {
			dispatch(LIST_PROJECTS.request());
			listenProjectCreated(contract.info, (data) => dispatch(PROJECT_ADDED(data)));
		}
		return () => destroyListener?.();
	}, [contract.info]);

	if (projects.loading) {
		return <SuspenseLoader />;
	}

	return (
		<ProjectContainerWrapper>
			<Helmet>
				<title>Projects</title>
			</Helmet>
			<PageTitleWrapper>
				<ProjectListHeader />
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
						<Card>
							<ProjectList />
						</Card>
					</Grid>
				</Grid>
			</Container>
		</ProjectContainerWrapper>
	);
};
