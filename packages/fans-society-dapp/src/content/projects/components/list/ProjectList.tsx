import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	Container,
	Grid,
	styled,
	Tooltip,
	Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import * as _ from 'lodash';

import { RootState } from 'state-types';

import PageTitleWrapper from 'src/components/PageTitleWrapper';
import ProjectListHeader from './ProjectListHeader';
import SuspenseLoader from 'src/components/SuspenseLoader';

function web3Url(cid: string) {
	return `https://${cid}.ipfs.w3s.link`;
}

const CardCover = styled(Card)(
	({ theme }) => `
		position: relative;
		maxWidth: 350
		.MuiCardMedia-root {
			height: ${theme.spacing(26)};
		}
	`,
);

export default () => {
	const { projects } = useSelector((state: RootState) => state.amm);

	if (projects.loading) {
		return <SuspenseLoader />;
	}

	return (
		<>
			<Helmet>
				<title>Projects</title>
			</Helmet>
			<PageTitleWrapper>
				<ProjectListHeader />
			</PageTitleWrapper>
			<Container sx={{ mt: 5, minHeight: '1024px' }} maxWidth="xl">
				<Grid
					container
					rowSpacing={{ xs: 4, sm: 4, md: 8 }}
					columnSpacing={{ xs: 2, sm: 2, md: 3 }}
					columns={{ xs: 1, sm: 4, md: 12 }}
				>
					{_.map(projects.items, (project) => {
						return (
							<Grid key={project.id} item xs={12} sm={4} md={3}>
								<Card sx={{ maxWidth: 350 }}>
									<CardActionArea>
										<CardCover>
											<Link to={`/projects/${project.id}`}>
												<CardMedia
													component="img"
													height="300"
													image={web3Url(project.avatarCid)}
													sx={{ backgroundColor: 'white' }}
													alt="ico"
												/>
											</Link>
										</CardCover>
										<Link to={`/projects/${project.id}`}>
											<CardContent>
												<Typography gutterBottom variant="h5" component="div">
													{project.name}
												</Typography>
												<Tooltip
													key={`tooltip-${project.id}`}
													placement={'bottom'}
													title={project.description}
												>
													<div
														style={{
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															width: '15rem',
														}}
													>
														<Typography noWrap variant="body2" color="text.secondary">
															{project.description}
														</Typography>
													</div>
												</Tooltip>
											</CardContent>
										</Link>
									</CardActionArea>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			</Container>
		</>
	);
};
