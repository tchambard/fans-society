import { useEffect } from 'react';
import * as _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableHead from '@mui/material/TableHead';

import { RootState } from 'state-types';

import { LIST_TOKENS_WITH_BALANCE } from 'src/store/amm/actions';
import DashboardTokensActions from '../../../tokens/components/list/TokensActions';

export default ({}) => {
	const dispatch = useDispatch();

	const { dashboard } = useSelector((state: RootState) => state.amm);

	useEffect(() => {
		dispatch(LIST_TOKENS_WITH_BALANCE.request());
	}, []);

	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell>Balance</TableCell>
						<TableCell align={'right'}>Actions</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{_.map(dashboard.tokens.items, (token) => {
						return (
							<TableRow key={token.projectId} hover>
								<TableCell>
									<Typography
										variant={'body1'}
										fontWeight={'bold'}
										color={'text.primary'}
										gutterBottom
										noWrap
									>
										{token.name}
									</Typography>
								</TableCell>
								<TableCell>
									<Typography
										variant={'body1'}
										fontWeight={'bold'}
										color={'text.primary'}
										gutterBottom
										noWrap
									>
										{token.balance} {token.symbol}
									</Typography>
								</TableCell>
								<TableCell align={'right'}>
									<DashboardTokensActions projectId={token.projectId} />
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
