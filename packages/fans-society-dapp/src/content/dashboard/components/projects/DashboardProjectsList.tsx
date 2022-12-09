import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as _ from 'lodash';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableHead from '@mui/material/TableHead';

import { RootState } from 'state-types';

import {
	ADD_PROJECT_COMMITMENT,
	CLAIMED,
	COMMITED,
	GET_PROJECT,
	LIST_PROJECTS_DETAILS_WITH_COMMITMENTS,
	PROJECT_STATUS_CHANGED,
	REMOVE_PROJECT_COMMITMENT,
	WITHDRAWED,
} from 'src/store/amm/actions';
import ProjectActions from 'src/content/projects/components/detail/ProjectActions';
import {
	listenClaimed,
	listenCommitted,
	listenProjectStatusChanged,
	listenWithdrawed,
} from 'src/store/amm/listeners';

export default ({}) => {
	const dispatch = useDispatch();

	const { account, contracts, dashboard } = useSelector(
		(state: RootState) => state.amm,
	);

	useEffect(() => {
		dispatch(LIST_PROJECTS_DETAILS_WITH_COMMITMENTS.request());

		const destroyListeners: (() => void)[] = [
			listenProjectStatusChanged(contracts.amm, (data) =>
				dispatch(PROJECT_STATUS_CHANGED(data)),
			),
			listenCommitted(contracts.amm, (data) => {
				dispatch(COMMITED(data));
			}),
			listenWithdrawed(contracts.amm, (data) => {
				dispatch(WITHDRAWED(data));
			}),
			listenClaimed(contracts.amm, (data) => {
				dispatch(CLAIMED(data));
			}),
		];
		return () => destroyListeners?.forEach((listener) => listener());
	}, []);

	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Project</TableCell>
						<TableCell>Funds/Target</TableCell>
						<TableCell>My share</TableCell>
						<TableCell align={'right'}>Actions</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{_.map(dashboard.projects.items, (project) => {
						return (
							<TableRow key={project.id} hover>
								<TableCell>
									<Typography
										variant={'body1'}
										fontWeight={'bold'}
										color={'text.primary'}
										gutterBottom
										noWrap
									>
										{project.name}
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
										{project.fund} / {project.target}
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
										{project.commitment ? (project.commitment * 100) / project.target : 0}{' '}
										%
									</Typography>
								</TableCell>
								<TableCell align={'right'}>
									<ProjectActions
										projectId={project.id}
										capabilities={project.$capabilities}
									/>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
