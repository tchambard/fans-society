import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
} from '@mui/material';
import { useState } from 'react';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'state-types';

import { COMMIT_ON_PROJECT, ICommitOnProjectParams } from '../../actions';

interface IProjectCommitDialogProps {
	dialogVisible: boolean;
	setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
	projectId: string;
}

export default ({
	dialogVisible,
	setDialogVisible,
	projectId,
}: IProjectCommitDialogProps) => {
	const dispatch = useDispatch();

	const { txPending } = useSelector((state: RootState) => state.projects);
	const [formData, setFormData] = useState<Partial<ICommitOnProjectParams>>({});

	return (
		<Dialog
			disableEscapeKeyDown
			maxWidth={'sm'}
			aria-labelledby={'commit-project-title'}
			open={dialogVisible}
			fullWidth={true}
		>
			<DialogTitle id={'commit-project-title'}>{'Commit on project'}</DialogTitle>
			<DialogContent dividers>
				<FormContainer
					defaultValues={formData}
					onSuccess={(data: ICommitOnProjectParams) => {
						setFormData(data);
						dispatch(COMMIT_ON_PROJECT.request({ ...data, projectId }));
						setDialogVisible(false);
					}}
				>
					<Stack direction={'column'}>
						<TextFieldElement
							type={'number'}
							name={'amount'}
							label={'Amount'}
							required={true}
						/>
						<br />
						<LoadingButton
							loading={txPending}
							loadingPosition={'end'}
							variant={'contained'}
							color={'primary'}
							endIcon={<SendIcon />}
							type={'submit'}
						>
							Submit
						</LoadingButton>
					</Stack>
				</FormContainer>
			</DialogContent>
			<DialogActions>
				<Button autoFocus onClick={() => setDialogVisible(false)} color={'primary'}>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
};
