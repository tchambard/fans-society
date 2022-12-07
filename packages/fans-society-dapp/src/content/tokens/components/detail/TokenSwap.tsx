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
import SwapVertIcon from '@mui/icons-material/SwapVert';

import { RootState } from 'state-types';
import {
	COMPUTE_SWAP_OUT,
	GET_TOKEN_BALANCE,
	IPoolInfo,
	IToken,
	SWAP,
} from '../../../../store/amm/actions';
import { listenSwap } from '../../../../store/amm/listeners';
import CopyAddress from 'src/components/CopyAddress';
import { getWethAddress } from 'src/store/amm/contract';
import { Helmet } from 'react-helmet-async';

interface ITokenSwapForm {
	amountIn: string;
	amountOut: string;
}

interface IProps {
	pool?: IPoolInfo;
}

export default ({ pool }: IProps) => {
	const theme = useTheme();
	const dispatch = useDispatch();

	const { account, contracts, balances, swapInfo } = useSelector(
		(state: RootState) => state.amm,
	);

	const [swapped, setSwapped] = useState<{ amount: string; symbol: string }>();
	const [tokenIn, setTokenIn] = useState<IToken>();
	const [tokenOut, setTokenOut] = useState<IToken>();

	const [values, setValues] = useState<ITokenSwapForm>({
		amountIn: '',
		amountOut: '',
	});

	useEffect(() => {
		if (pool) {
			setTokenIn(pool.tokenY);
			setTokenOut(pool.tokenX);
			dispatch(GET_TOKEN_BALANCE.request(pool.tokenX.address));
			dispatch(GET_TOKEN_BALANCE.request(pool.tokenY.address));
		}
	}, []);

	useEffect(() => {
		if (swapInfo?.result) {
			const form: ITokenSwapForm =
				swapInfo?.result?.tokenOut === tokenOut?.address
					? {
							...values,
							amountOut: swapInfo?.result?.amountOut || '',
					  }
					: {
							...values,
							amountIn: swapInfo?.result?.amountOut || '',
					  };
			setValues(form);
		}
	}, [swapInfo?.result]);

	const handleChange =
		(prop: keyof ITokenSwapForm) => (event: ChangeEvent<HTMLInputElement>) => {
			setValues({ ...values, [prop]: event.target.value });

			if (event.target.value.length) {
				const tokenInChanged = prop === 'amountIn';
				dispatch(
					COMPUTE_SWAP_OUT.request({
						poolAddress: pool.poolAddress,
						tokenIn: tokenInChanged ? tokenIn.address : tokenOut.address,
						tokenOut: tokenInChanged ? tokenOut.address : tokenIn.address,
						amountIn: event.target.value,
					}),
				);
			}
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
				poolAddress: pool.poolAddress,
				tokenIn: tokenIn.address,
				amountIn: values.amountIn.toString(),
				tokenOut: tokenOut.address,
				amountOut: values.amountOut.toString(),
			}),
		);
	};

	const { txPending } = useSelector((state: RootState) => state.amm);
	return (
		<>
			<Helmet>
				<title>Fans Society Swap</title>
			</Helmet>
			<Grid container justifyContent={'center'}>
				<Grid item xs={12} sm={8} md={8} xl={6}>
					<Box display={'flex'} mb={3}>
						<Box>
							<Typography variant={'h3'} component={'h3'} gutterBottom>
								Exchange tokens
							</Typography>{' '}
						</Box>
					</Box>
					<Box sx={{ display: 'grid' }}>
						<OutlinedInput
							id={'amount'}
							value={values.amountIn}
							onChange={handleChange('amountIn')}
							endAdornment={
								<>
									<InputAdornment position="end">{tokenIn?.symbol}</InputAdornment>
									<CopyAddress
										title={`Copy ${tokenIn?.symbol} token address`}
										address={tokenIn?.address}
										size={'small'}
									/>
								</>
							}
							aria-describedby="amount-helper-text"
							inputProps={{
								'aria-label': 'Input',
							}}
							autoComplete={'off'}
						/>
						<Box
							id={'amount-helper-text'}
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
						<br />
						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<IconButton
								sx={{
									'&:hover': {
										background: theme.colors.primary.lighter,
									},
									color: theme.palette.primary.main,
									border: 'double',
								}}
								color={'inherit'}
								size={'small'}
								onClick={() => {
									setTokenOut(tokenIn);
									setTokenIn(tokenOut);
									setValues({ ...values, amountIn: values.amountOut });
									if (values.amountOut?.length) {
										dispatch(
											COMPUTE_SWAP_OUT.request({
												poolAddress: pool.poolAddress,
												tokenIn: tokenOut.address,
												tokenOut: tokenIn.address,
												amountIn: values.amountOut,
											}),
										);
									}
								}}
							>
								<SwapVertIcon fontSize={'small'} />
							</IconButton>
						</Box>
						<br />
						<OutlinedInput
							id={'amount'}
							value={values.amountOut}
							onChange={handleChange('amountOut')}
							endAdornment={
								<>
									<InputAdornment position="end">{tokenOut?.symbol}</InputAdornment>
									<CopyAddress
										title={`Copy ${tokenOut?.symbol} token address`}
										address={tokenOut?.address}
										size={'small'}
									/>
								</>
							}
							aria-describedby={'expected-helper-text'}
							inputProps={{
								'aria-label': 'Input',
							}}
							autoComplete={'off'}
						/>
						<Box
							id={'expected-helper-text'}
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
						{swapInfo?.error != null && (
							<Alert severity={'error'}>{swapInfo?.error}</Alert>
						)}
						<br />
						{swapInfo?.result?.priceOut && (
							<Box sx={{ display: 'flex' }}>
								<Typography>
									Price: {swapInfo.result.priceOut} {tokenOut?.symbol} per{' '}
									{tokenIn?.symbol}
								</Typography>
							</Box>
						)}
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
		</>
	);
};
