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

import { WITHDRAW_ON_PROJECT } from '../../../../store/amm/actions';

interface IProjectWithdrawDialogProps {
	projectId: string;
	dialogVisible: boolean;
	setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default ({
	projectId,
	dialogVisible,
	setDialogVisible,
}: IProjectWithdrawDialogProps) => {
	const dispatch = useDispatch();

	return (
		<Dialog
			disableEscapeKeyDown
			maxWidth={'sm'}
			aria-labelledby={'withdraw-project-title'}
			open={dialogVisible}
			fullWidth={true}
		>
			<DialogTitle id={'withdraw-project-title'}>
				{'Are you sure to withdraw on this project ?'}
			</DialogTitle>
			<DialogContent dividers>
				<DialogContentText id={'alert-dialog-description'}>
					This operation will return your commitment.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button autoFocus onClick={() => setDialogVisible(false)} color={'primary'}>
					Cancel
				</Button>
				<Button
					color={'primary'}
					onClick={() => {
						dispatch(WITHDRAW_ON_PROJECT.request({ projectId }));
						setDialogVisible(false);
					}}
				>
					Ok
				</Button>
			</DialogActions>
		</Dialog>
	);
};
