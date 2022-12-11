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

import { LIST_POOL_LIQUIDITY_SUMMARIES } from 'src/store/amm/actions';
import TokensActions from '../../../tokens/components/list/TokensActions';

export default ({}) => {
	const dispatch = useDispatch();

	const { dashboard } = useSelector((state: RootState) => state.amm);

	useEffect(() => {
		dispatch(LIST_POOL_LIQUIDITY_SUMMARIES.request());
	}, []);

	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Pool</TableCell>
						<TableCell>Balance</TableCell>
						<TableCell align={'right'}>Actions</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{_.map(dashboard.pools.items, (pool) => {
						return (
							<TableRow key={pool.projectId} hover>
								<TableCell>
									<Typography
										variant={'body1'}
										fontWeight={'bold'}
										color={'text.primary'}
										gutterBottom
										noWrap
									>
										{pool.tokenX.symbol} / {pool.tokenY.symbol}
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
										{pool.balance} LP
									</Typography>
								</TableCell>

								<TableCell align={'right'}>
									<TokensActions projectId={pool.projectId} />
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
