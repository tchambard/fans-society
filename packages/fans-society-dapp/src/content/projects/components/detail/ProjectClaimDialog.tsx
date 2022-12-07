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

import { CLAIM_ON_PROJECT } from '../../../../store/amm/actions';

interface IProjectClaimDialogProps {
	projectId: string;
	dialogVisible: boolean;
	setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default ({
	projectId,
	dialogVisible,
	setDialogVisible,
}: IProjectClaimDialogProps) => {
	const dispatch = useDispatch();

	return (
		<Dialog
			disableEscapeKeyDown
			maxWidth={'sm'}
			aria-labelledby={'claim-project-title'}
			open={dialogVisible}
			fullWidth={true}
		>
			<DialogTitle id={'claim-project-title'}>
				{'Are you sure to claim on this project ?'}
			</DialogTitle>
			<DialogContent dividers>
				<DialogContentText id={'alert-dialog-description'}>
					This operation will return tokens for your commitment.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button autoFocus onClick={() => setDialogVisible(false)} color={'primary'}>
					Cancel
				</Button>
				<Button
					color={'primary'}
					onClick={() => {
						dispatch(CLAIM_ON_PROJECT.request({ projectId }));
						setDialogVisible(false);
					}}
				>
					Ok
				</Button>
			</DialogActions>
		</Dialog>
	);
};
