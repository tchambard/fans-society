import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
	Box,
	Button,
	Grid,
	IconButton,
	Tooltip,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import CancelIcon from '@mui/icons-material/Cancel';

import { RootState } from 'state-types';

import ProjectDeleteDialog from '../list/ProjectAbortDialog';

import SuspenseLoader from 'src/components/SuspenseLoader';
import ProjectCommitDialog from './ProjectCommitDialog';
import ProjectWithdrawDialog from './ProjectWithdrawDialog';

export default () => {
	const [abortDialogVisible, setAbortDialogVisible] = useState(false);
	const [commitDialogVisible, setCommitDialogVisible] = useState(false);
	const [withdrawDialogVisible, setWithdrawDialogVisible] = useState(false);

	const { currentProject } = useSelector((state: RootState) => state.projects);

	if (!currentProject.item) {
		return <SuspenseLoader />;
	}

	return (
		<>
			<Grid container justifyContent={'space-between'} alignItems={'center'}>
				<Grid item>
					<Typography variant={'h3'} component={'h3'} gutterBottom>
						{currentProject.item.name} - {currentProject.item.description}
					</Typography>
				</Grid>
				<Grid item>
					<Grid container spacing={2}>
						<Grid item>
							<Tooltip placement={'bottom'} title={'Commit on project'}>
								<Button
									variant="outlined"
									color={'info'}
									onClick={() => setCommitDialogVisible(!commitDialogVisible)}
								>
									Commit
								</Button>
							</Tooltip>
						</Grid>
						<Grid item>
							<Tooltip placement={'bottom'} title={'Withdraw on project'}>
								<Button
									variant="outlined"
									color={'warning'}
									onClick={() => setWithdrawDialogVisible(!withdrawDialogVisible)}
								>
									Withdraw
								</Button>
							</Tooltip>
						</Grid>
						<Grid item>
							{currentProject.item.$capabilities.$canAbort && (
								<Tooltip placement={'bottom'} title={'Abort project'}>
									<Button
										variant="outlined"
										startIcon={<CancelIcon />}
										color={'error'}
										onClick={() => setAbortDialogVisible(!abortDialogVisible)}
									>
										Abort
									</Button>
								</Tooltip>
							)}
						</Grid>
					</Grid>
				</Grid>
			</Grid>

			{abortDialogVisible && (
				<ProjectDeleteDialog
					projectId={currentProject.item.id}
					dialogVisible={abortDialogVisible}
					setDialogVisible={setAbortDialogVisible}
				/>
			)}

			{commitDialogVisible && (
				<ProjectCommitDialog
					projectId={currentProject.item.id}
					dialogVisible={commitDialogVisible}
					setDialogVisible={setCommitDialogVisible}
				/>
			)}

			{withdrawDialogVisible && (
				<ProjectWithdrawDialog
					projectId={currentProject.item.id}
					dialogVisible={withdrawDialogVisible}
					setDialogVisible={setWithdrawDialogVisible}
				/>
			)}
		</>
	);
};
