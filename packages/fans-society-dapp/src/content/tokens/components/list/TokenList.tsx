import {
	Card,
	Container,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import * as _ from 'lodash';

import { RootState } from 'state-types';

import SuspenseLoader from 'src/components/SuspenseLoader';

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
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Name</TableCell>
											<TableCell>Description</TableCell>
											<TableCell align={'right'}>Actions</TableCell>
										</TableRow>
									</TableHead>

									<TableBody>
										{_.map(tokens.items, (token) => {
											return (
												<TableRow hover key={token.projectId}>
													<TableCell>
														<Link to={`/tokens/${token.projectId}`}>
															<Typography
																variant={'body1'}
																fontWeight={'bold'}
																color={'text.primary'}
																gutterBottom
																noWrap
															>
																{token.name}
															</Typography>
														</Link>
													</TableCell>
													<TableCell>
														<Typography
															variant={'body1'}
															fontWeight={'bold'}
															color={'text.primary'}
															gutterBottom
															noWrap
														>
															{token.description}
														</Typography>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</TableContainer>
						</Card>
					</Grid>
				</Grid>
			</Container>
		</>
	);
};
