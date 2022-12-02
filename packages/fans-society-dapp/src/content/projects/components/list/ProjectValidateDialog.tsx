import * as React from 'react';
import { useDispatch } from 'react-redux';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { Routes } from 'src/router';
import { LAUNCH_PROJECT } from '../../../../store/amm/actions';

interface IProjectValidateDialogProps {
	projectId: string;
	dialogVisible: boolean;
	setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default ({
	projectId,
	dialogVisible,
	setDialogVisible,
}: IProjectValidateDialogProps) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	return (
		<Dialog
			disableEscapeKeyDown
			maxWidth={'sm'}
			aria-labelledby={'delete-project-title'}
			open={dialogVisible}
			fullWidth={true}
		>
			<DialogTitle id={'delete-project-title'}>
				{'Are you sure to validate this project ?'}
			</DialogTitle>
			<DialogContent dividers>
				<DialogContentText id={'alert-dialog-description'}>
					This operation will validate the project and create ERC20 token.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button autoFocus onClick={() => setDialogVisible(false)} color={'primary'}>
					Cancel
				</Button>
				<Button
					color={'primary'}
					onClick={() => {
						dispatch(LAUNCH_PROJECT.request(projectId));

						setDialogVisible(false);
						navigate(Routes.PROJECT_LIST);
					}}
				>
					Ok
				</Button>
			</DialogActions>
		</Dialog>
	);
};
