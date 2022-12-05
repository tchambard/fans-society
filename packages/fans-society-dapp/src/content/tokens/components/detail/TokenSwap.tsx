import { ChangeEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Alert,
	AlertTitle,
	Box,
	IconButton,
	InputAdornment,
	OutlinedInput,
	useTheme,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CachedIcon from '@mui/icons-material/Cached';

import { RootState } from 'state-types';
import {
	GET_TOKEN_BALANCE,
	IPoolInfo,
	IToken,
	SWAP,
} from '../../../../store/amm/actions';
import { listenSwap } from '../../../../store/amm/listeners';

interface ITokenSwapForm {
	amount: number;
	expected: number;
}

interface IProps {
	pool?: IPoolInfo;
}

export default ({ pool }: IProps) => {
	const theme = useTheme();
	const dispatch = useDispatch();

	const { account, contracts, balances } = useSelector(
		(state: RootState) => state.amm,
	);

	const [swapped, setSwapped] = useState<{ amount: number; symbol: string }>();
	const [tokenIn, setTokenIn] = useState<IToken>();
	const [tokenOut, setTokenOut] = useState<IToken>();

	const [values, setValues] = useState<ITokenSwapForm>({
		amount: 0,
		expected: 0,
	});

	useEffect(() => {
		if (pool) {
			setTokenIn(pool.tokenY);
			setTokenOut(pool.tokenX);
			dispatch(GET_TOKEN_BALANCE.request(pool.tokenX.address));
			dispatch(GET_TOKEN_BALANCE.request(pool.tokenY.address));
		}
	}, []);

	const handleChange =
		(prop: keyof ITokenSwapForm) => (event: ChangeEvent<HTMLInputElement>) => {
			setValues({ ...values, [prop]: event.target.value });
		};

	const onSwap = async () => {
		const destroyListener = await listenSwap(
			account.address,
			contracts.amm,
			async (data) => {
				setSwapped({ amount: data.amountOut, symbol: tokenOut.symbol });
				dispatch(GET_TOKEN_BALANCE.request(data.tokenIn));
				dispatch(GET_TOKEN_BALANCE.request(data.tokenOut));
				destroyListener();
			},
		);
		dispatch(
			SWAP.request({
				tokenIn: tokenIn.address,
				tokenOut: tokenOut.address,
				amountIn: values.amount,
			}),
		);
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
						endAdornment={
							<InputAdornment position="end">{tokenIn?.symbol}</InputAdornment>
						}
						aria-describedby="amount-helper-text"
						inputProps={{
							'aria-label': 'Input',
						}}
					/>
					<Box
						id="amount-helper-text"
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
						}}
					>
						<Typography>Send</Typography>
						<Typography>
							Balance: {(tokenIn && balances[tokenIn.address]?.balance) || 0}
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<IconButton
							sx={{
								'&:hover': {
									background: theme.colors.primary.lighter,
								},
								color: theme.palette.primary.main,
							}}
							color={'inherit'}
							size={'small'}
							onClick={() => {
								setTokenOut(tokenIn);
								setTokenIn(tokenOut);
								setValues({ amount: values.expected, expected: values.amount });
							}}
						>
							<CachedIcon fontSize={'small'} />
						</IconButton>
					</Box>
					<br />
					<OutlinedInput
						id="amount"
						value={values.expected}
						endAdornment={
							<InputAdornment position="end">{tokenOut?.symbol}</InputAdornment>
						}
						aria-describedby="expected-helper-text"
						inputProps={{
							'aria-label': 'Input',
						}}
					/>
					<Box
						id="expected-helper-text"
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
						}}
					>
						<Typography>Receive</Typography>
						<Typography>
							Balance: {(tokenOut && balances[tokenOut.address]?.balance) || 0}
						</Typography>
					</Box>
					<br />
					{swapped != null && (
						<Alert severity={'info'} onClose={() => setSwapped(undefined)}>
							<AlertTitle>Info</AlertTitle>
							<strong>
								{swapped.amount} {swapped.symbol}
							</strong>{' '}
							have been transferred
						</Alert>
					)}
					<br />
					<LoadingButton
						loading={txPending}
						loadingPosition={'end'}
						variant={'contained'}
						color={'primary'}
						endIcon={<SendIcon />}
						type={'submit'}
						onClick={onSwap}
					>
						Exchange
					</LoadingButton>
				</Box>
			</Grid>
		</Grid>
	);
};