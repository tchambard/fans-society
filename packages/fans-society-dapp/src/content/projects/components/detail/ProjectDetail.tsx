import {
	Avatar,
	Box,
	Card,
	CardMedia,
	Container,
	Grid,
	IconButton,
	LinearProgress,
	Tooltip,
	Typography,
	useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';

import { useSelector } from 'react-redux';

import { RootState } from 'state-types';

import SuspenseLoader from 'src/components/SuspenseLoader';
import Text from 'src/components/Text';
import ProjectActions from './ProjectActions';
import { Routes } from 'src/router';

const AvatarWrapper = styled(Card)(
	({ theme }) => `
		position: relative;
		overflow: visible;
		display: inline-block;
		margin-top: -${theme.spacing(9)};
		margin-left: ${theme.spacing(2)};

		.MuiAvatar-root {
			width: ${theme.spacing(16)};
			height: ${theme.spacing(16)};
		}
	`,
);

const CardCover = styled(Card)(
	({ theme }) => `
		position: relative;
		.MuiCardMedia-root {
			height: ${theme.spacing(26)};
		}
	`,
);

const ActionsWrapper = styled(Box)(
	({ theme }) => `
		position: absolute;
		right: ${theme.spacing(2)};
		bottom: ${theme.spacing(2)};
	`,
);

const LinearProgressWrapper = styled(LinearProgress)(
	({ theme }) => `
		flex-grow: 1;
		height: 10px;

		&.MuiLinearProgress-root {
			background-color: ${theme.colors.alpha.black[10]};
		}

		.MuiLinearProgress-bar {
			border-radius: ${theme.general.borderRadiusXl};
		}
  	`,
);

export default ({}) => {
	const theme = useTheme();

	const { currentProject } = useSelector((state: RootState) => state.projects);

	if (!currentProject.item || currentProject.loading) {
		return <SuspenseLoader />;
	}

	return (
		<>
			<Container sx={{ mt: 3 }} maxWidth="xl">
				<Grid
					container
					direction="row"
					justifyContent="center"
					alignItems="stretch"
					spacing={3}
				>
					<Grid item xs={12} md={8}>
						<Box display={'flex'} mb={3}>
							<Tooltip arrow placement={'top'} title={'Go back'}>
								<Link to={Routes.PROJECT_LIST}>
									<IconButton color={'primary'} sx={{ p: 2, mr: 2 }}>
										<ArrowBackTwoToneIcon />
									</IconButton>
								</Link>
							</Tooltip>
							<Box>
								<Typography variant={'h3'} component={'h3'} gutterBottom>
									{currentProject.item.name}
								</Typography>
								<Typography variant={'subtitle2'}>
									{currentProject.item.description}
								</Typography>
							</Box>
						</Box>
						<CardCover>
							<CardMedia
								image={
									'http://www.thegrandtest.com/wp-content/uploads/2018/05/Star-Wars-Les-Derniers-Jedi.jpg'
								}
								component="img"
							/>
							<ActionsWrapper>
								<ProjectActions
									projectId={currentProject.item.id}
									capabilities={currentProject.item.$capabilities}
								/>
							</ActionsWrapper>
						</CardCover>
						<AvatarWrapper>
							<Avatar
								variant="rounded"
								alt={currentProject.item.name}
								src={
									'https://cdn.dribbble.com/users/588874/screenshots/2249528/media/dfc765104b15b69fab7a6363fd523d33.png?compress=1&resize=768x576&vertical=top'
								}
							/>
						</AvatarWrapper>

						<Box py={2} pl={2} mb={3}>
							<div
								style={{
									padding: '20px',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'left',
								}}
							>
								<div style={{ color: theme.palette.text.secondary }}>
									Minimum invest amount
								</div>
								<div style={{ fontSize: '1.5em' }}>{currentProject.item.minInvest}</div>

								<div style={{ color: theme.palette.text.secondary }}>
									Maximum invest amount
								</div>
								<div style={{ fontSize: '1.5em' }}>{currentProject.item.maxInvest}</div>

								<Box>
									<Typography variant={'subtitle2'} gutterBottom>
										Funds received:{'  '}
										<span style={{ color: '#bc3aab' }}>
											<b>{currentProject.item.fund}</b>
										</span>{' '}
										ETH
										<b> / {currentProject.item.target} ETH</b>
									</Typography>
									<LinearProgressWrapper
										value={(currentProject.item.fund / currentProject.item.target) * 100}
										color={'primary'}
										variant={'determinate'}
									/>
								</Box>
							</div>
						</Box>
					</Grid>
				</Grid>
			</Container>
		</>
	);
};
