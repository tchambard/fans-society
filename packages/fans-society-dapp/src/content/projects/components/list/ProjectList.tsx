import {
	Card,
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
import * as _ from 'lodash';

import { RootState } from 'state-types';

import ProjectListItemActions from './ProjectListItemActions';

export default () => {
	const { projects } = useSelector((state: RootState) => state.projects);
	console.log('projects', projects);
	return (
		<>
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
							{_.map(projects.items, (project) => {
								return (
									<TableRow hover key={project.id}>
										<TableCell>
											<Link to={`/projects/${project.id}`}>
												<Typography
													variant={'body1'}
													fontWeight={'bold'}
													color={'text.primary'}
													gutterBottom
													noWrap
												>
													{project.name}
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
												{project.description}
											</Typography>
										</TableCell>
										<TableCell align={'right'}>
											<ProjectListItemActions
												currentView={'list'}
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
			</Card>
		</>
	);
};
