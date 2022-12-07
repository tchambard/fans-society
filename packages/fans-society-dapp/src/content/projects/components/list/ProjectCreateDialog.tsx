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
import Web3Uploader from 'src/components/Web3Uploader';

import { RootState } from 'state-types';

import {
	CREATE_PROJECT,
	ICreateProjectParams,
} from '../../../../store/amm/actions';

interface IProjectCreateDialogProps {
	dialogVisible: boolean;
	setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default ({
	dialogVisible,
	setDialogVisible,
}: IProjectCreateDialogProps) => {
	const dispatch = useDispatch();

	const { txPending } = useSelector((state: RootState) => state.amm);
	const [formData, setFormData] = useState<Partial<ICreateProjectParams>>({});
	const [coverCid, setCoverCid] = useState<string>();
	const [avatarCid, setAvatarCid] = useState<string>();

	return (
		<Dialog
			disableEscapeKeyDown
			maxWidth={'sm'}
			aria-labelledby={'new-project-title'}
			open={dialogVisible}
			fullWidth={true}
		>
			<DialogTitle id={'new-project-title'}>{'Create new project'}</DialogTitle>
			<DialogContent dividers>
				<FormContainer
					defaultValues={formData}
					onSuccess={(data: ICreateProjectParams) => {
						setFormData(data);
						dispatch(CREATE_PROJECT.request({ ...data, coverCid, avatarCid }));
						setDialogVisible(false);
					}}
				>
					<Stack direction={'column'}>
						<TextFieldElement
							type={'text'}
							name={'partnerAddress'}
							label={'Partner address'}
							required={true}
						/>
						<br />
						<TextFieldElement
							type={'text'}
							name={'name'}
							label={'Name'}
							required={true}
						/>
						<br />
						<TextFieldElement
							type={'text'}
							name={'symbol'}
							label={'Symbol'}
							required={true}
						/>
						<br />
						<TextFieldElement
							type={'text'}
							name={'description'}
							label={'Description'}
							required={true}
						/>
						<br />
						<Web3Uploader
							id={'cover-image-uploader'}
							label={'Cover image'}
							placeholder={'Select a file for project cover'}
							required={true}
							onUploaded={(cid) => setCoverCid(cid)}
						/>
						<br />
						<Web3Uploader
							id={'avatar-image-uploader'}
							label={'Avatar image'}
							placeholder={'Select a file for project avatar'}
							required={true}
							onUploaded={(cid) => setAvatarCid(cid)}
						/>
						<br />
						<TextFieldElement
							type={'number'}
							name={'target'}
							label={'Amount goal'}
							required={true}
							placeholder={'ETH value'}
						/>
						<br />
						<TextFieldElement
							type={'number'}
							name={'minInvest'}
							label={'Minimum invest amount'}
							required={true}
							placeholder={'ETH value'}
						/>
						<br />
						<TextFieldElement
							type={'number'}
							name={'maxInvest'}
							label={'Maximum invest amount'}
							required={true}
							placeholder={'ETH value'}
						/>
						<br />
						<TextFieldElement
							type={'number'}
							name={'totalSupply'}
							label={'Tokens total supply'}
							required={true}
							placeholder={'Please enter a number of tokens'}
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
