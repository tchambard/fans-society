import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from 'state-types';

import ProjectCreateDialog from './ProjectCreateDialog';

export default () => {
	const [createDialogVisible, setCreateDialogVisible] = useState(false);
	const { projects } = useSelector((state: RootState) => state.amm);

	return (
		<>
			<Grid container justifyContent={'space-between'} alignItems={'center'}>
				<Grid item>
					<Typography variant={'h3'} component={'h3'} gutterBottom>
						Projects
					</Typography>
				</Grid>
				<Grid item>
					{projects.$capabilities.$canCreate && (
						<Tooltip placement={'bottom'} title={'Create new project'}>
							<IconButton
								color={'primary'}
								onClick={() => setCreateDialogVisible(!createDialogVisible)}
							>
								<AddCircleIcon/>
							</IconButton>
						</Tooltip>
					)}
				</Grid>
			</Grid>
			{createDialogVisible && (
				<ProjectCreateDialog
					dialogVisible={createDialogVisible}
					setDialogVisible={setCreateDialogVisible}
				/>
			)}
		</>
	);
};
