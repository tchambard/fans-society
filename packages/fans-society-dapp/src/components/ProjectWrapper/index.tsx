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
	coverCid: string;
	avatarCid: string;
	content: ReactNode;
	actions?: ReactNode;
}

function web3Url(cid: string) {
	return `https://${cid}.ipfs.w3s.link`;
}

export default ({
	name,
	description,
	linkBackRoute,
	coverCid,
	avatarCid,
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
						<CardMedia image={web3Url(coverCid)} component="img" />
						{actions ? <ActionsWrapper>{actions}</ActionsWrapper> : undefined}
					</CardCover>
					<AvatarWrapper>
						<Avatar variant="rounded" alt={name} src={web3Url(avatarCid)} />
					</AvatarWrapper>
					<Box py={2} pl={2} mb={3}>
						{content}
					</Box>
				</Grid>
			</Grid>
		</Container>
	);
};
