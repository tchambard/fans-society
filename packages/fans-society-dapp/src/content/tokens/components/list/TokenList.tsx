import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	Container,
	Grid,
	styled,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import * as _ from 'lodash';

import { RootState } from 'state-types';

import SuspenseLoader from 'src/components/SuspenseLoader';
import TokensActions from './TokensActions';

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

const ActionsWrapper = styled(Box)(
	({ theme }) => `
		position: absolute;
		right: ${theme.spacing(2)};
		bottom: ${theme.spacing(2)};
	`,
);

export default () => {
	const { tokens } = useSelector((state: RootState) => state.amm);

	if (tokens.loading) {
		return <SuspenseLoader />;
	}

	return (
		<>
			<Helmet>
				<title>Tokens</title>
			</Helmet>

			<Container sx={{ mt: 5, minHeight: '1024px' }} maxWidth="xl">
				<Grid
					container
					rowSpacing={{ xs: 4, sm: 4, md: 8 }}
					columnSpacing={{ xs: 2, sm: 2, md: 3 }}
					columns={{ xs: 1, sm: 4, md: 12 }}
				>
					{_.map(tokens.items, (token) => {
						return (
							<Grid key={token.projectId} item xs={12} sm={4} md={3}>
								<Card sx={{ maxWidth: 350 }}>
									<CardActionArea>
										<CardCover>
											<Link to={`/projects/${token.projectId}`}>
												<CardMedia
													component="img"
													height="300"
													image={web3Url(token.avatarCid)}
													sx={{ backgroundColor: 'white' }}
													alt="ico"
												/>
											</Link>
											<ActionsWrapper>
												<TokensActions projectId={token.projectId} />
											</ActionsWrapper>
										</CardCover>
										<Link to={`/projects/${token.projectId}`}>
											<CardContent>
												<Typography gutterBottom variant="h5" component="div">
													{token.name}
												</Typography>
												<Tooltip
													key={`tooltip-${token.projectId}`}
													placement={'bottom'}
													title={token.description}
												>
													<div
														style={{
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															width: '15rem',
														}}
													>
														<Typography noWrap variant="body2" color="text.secondary">
															{token.description}
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
