import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Box, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from 'state-types';

import ProjectDeleteDialog from '../list/ProjectAbortDialog';

import SuspenseLoader from 'src/components/SuspenseLoader';

export default () => {
	const [abortDialogVisible, setAbortDialogVisible] = useState(false);

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
					{currentProject.item.$capabilities.$canAbort && (
						<Tooltip placement={'bottom'} title={'Abort project'}>
							<IconButton
								color={'primary'}
								onClick={() => setAbortDialogVisible(!abortDialogVisible)}
							>
								<AddCircleIcon />
							</IconButton>
						</Tooltip>
					)}
					<Grid item>
						<Box sx={{ width: '100%' }}></Box>
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
		</>
	);
};
