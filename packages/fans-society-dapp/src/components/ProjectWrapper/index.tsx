import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';

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

interface IProjectWrapperProps {
	name: string;
	description: string;
	linkBackRoute: string;
	coverImageUrl: string;
	avatarImageUrl: string;
	content: ReactNode;
	actions: ReactNode;
}

export default ({
	name,
	description,
	linkBackRoute,
	coverImageUrl,
	avatarImageUrl,
	actions,
	content,
}: IProjectWrapperProps) => {
	return (
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
							<Link to={linkBackRoute}>
								<IconButton color={'primary'} sx={{ p: 2, mr: 2 }}>
									<ArrowBackTwoToneIcon />
								</IconButton>
							</Link>
						</Tooltip>
						<Box>
							<Typography variant={'h3'} component={'h3'} gutterBottom>
								{name}
							</Typography>
							<Typography variant={'subtitle2'}>{description}</Typography>
						</Box>
					</Box>
					<CardCover>
						<CardMedia image={coverImageUrl} component="img" />
						<ActionsWrapper>{actions}</ActionsWrapper>
					</CardCover>
					<AvatarWrapper>
						<Avatar variant="rounded" alt={name} src={avatarImageUrl} />
					</AvatarWrapper>

					{content}
				</Grid>
			</Grid>
		</Container>
	);
};
