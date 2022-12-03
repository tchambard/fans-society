import { ChangeEvent, useState } from 'react';
import {
	Box,
	FormHelperText,
	InputAdornment,
	OutlinedInput,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'state-types';
import Grid from '@mui/material/Grid';

interface ITokenSwapForm {
	amount: number;
	expected: number;
}

interface IProps {
	tokenX: string;
	tokenY: string;
	symbolX: string;
	symbolY: string;
}

export default ({ tokenX, tokenY, symbolX, symbolY }: IProps) => {
	const dispatch = useDispatch();

	const [values, setValues] = useState<ITokenSwapForm>({
		amount: 0,
		expected: 0,
	});

	const handleChange =
		(prop: keyof ITokenSwapForm) => (event: ChangeEvent<HTMLInputElement>) => {
			setValues({ ...values, [prop]: event.target.value });
		};

	const { txPending } = useSelector((state: RootState) => state.amm);
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={12}>
				<Box sx={{ p: 2, ml: 12, mr: 12, display: 'grid' }}>
					<OutlinedInput
						id="amount"
						value={values.amount}
						onChange={handleChange('amount')}
						endAdornment={<InputAdornment position="end">{symbolY}</InputAdornment>}
						aria-describedby="amount-helper-text"
						inputProps={{
							'aria-label': 'Input',
						}}
					/>
					<FormHelperText id="amount-helper-text">Send</FormHelperText>
					<br />
					<OutlinedInput
						id="amount"
						value={values.expected}
						endAdornment={<InputAdornment position="end">{symbolX}</InputAdornment>}
						aria-describedby="expected-helper-text"
						inputProps={{
							'aria-label': 'Input',
						}}
					/>
					<FormHelperText id="expected-helper-text">Receive</FormHelperText>
					<br />
					<LoadingButton
						loading={txPending}
						loadingPosition={'end'}
						variant={'contained'}
						color={'primary'}
						endIcon={<SendIcon />}
						type={'submit'}
					>
						Exchange
					</LoadingButton>
				</Box>
			</Grid>
		</Grid>
	);
};
