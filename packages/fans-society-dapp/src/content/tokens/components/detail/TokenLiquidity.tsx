import SendIcon from '@mui/icons-material/Send';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { LoadingButton } from '@mui/lab';
import {
	Alert,
	AlertTitle,
	Box,
	Button,
	InputAdornment,
	OutlinedInput,
	Paper,
	useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ChangeEvent, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import CopyAddress from 'src/components/CopyAddress';

import { listenLPBurnt, listenLPMinted } from 'src/store/amm/listeners';
import { RootState } from 'state-types';
import {
	ADD_POOL_LIQUIDITY,
	COMPUTE_POOL_PRICE,
	GET_TOKEN_BALANCE,
	ILPBurntEvent,
	ILPMintedEvent,
	IPoolInfo,
	IToken,
	REMOVE_POOL_LIQUIDITY,
} from '../../../../store/amm/actions';

interface ILiquidityForm {
	amountX: string;
	amountY: string;
}

interface IProps {
	pool?: IPoolInfo;
}

export default ({ pool }: IProps) => {
	const theme = useTheme();
	const dispatch = useDispatch();

	const { account, contracts, balances, poolInfo } = useSelector(
		(state: RootState) => state.amm,
	);

	const [lpMinted, setLpMinted] = useState<ILPMintedEvent>();
	const [lpBurnt, setLpBurnt] = useState<ILPBurntEvent>();
	const [tokenX, setTokenX] = useState<IToken>();
	const [tokenY, setTokenY] = useState<IToken>();

	const [values, setValues] = useState<ILiquidityForm>({
		amountX: '',
		amountY: '',
	});

	useEffect(() => {
		if (pool) {
			setTokenX(pool.tokenY);
			setTokenY(pool.tokenX);
			dispatch(GET_TOKEN_BALANCE.request(pool.poolAddress));
			dispatch(GET_TOKEN_BALANCE.request(pool.tokenX.address));
			dispatch(GET_TOKEN_BALANCE.request(pool.tokenY.address));
		}
	}, []);

	useEffect(() => {
		if (poolInfo?.result) {
			const form: ILiquidityForm =
				poolInfo?.result?.tokenY === tokenY?.address
					? {
							...values,
							amountY: poolInfo?.result?.priceY || '',
					  }
					: {
							...values,
							amountX: poolInfo?.result?.priceY || '',
					  };
			setValues(form);
		}
	}, [poolInfo?.result]);

	const handleChange =
		(prop: keyof ILiquidityForm) => (event: ChangeEvent<HTMLInputElement>) => {
			setValues({ ...values, [prop]: event.target.value });

			if (event.target.value.length) {
				const tokenXChanged = prop === 'amountX';
				dispatch(
					COMPUTE_POOL_PRICE.request({
						poolAddress: pool.poolAddress,
						tokenX: tokenXChanged ? tokenX.address : tokenY.address,
						tokenY: tokenXChanged ? tokenY.address : tokenX.address,
						amountX: event.target.value,
					}),
				);
			}
		};

	const onAddLiquidity = async () => {
		const destroyListener = await listenLPMinted(
			account.address,
			pool.poolAddress,
			async (data) => {
				setLpMinted(data);
				dispatch(GET_TOKEN_BALANCE.request(pool.poolAddress));
				dispatch(GET_TOKEN_BALANCE.request(data.tokenX));
				dispatch(GET_TOKEN_BALANCE.request(data.tokenY));
				destroyListener();
			},
		);
		dispatch(
			ADD_POOL_LIQUIDITY.request({
				tokenX: tokenX.address,
				amountX: values.amountX.toString(),
				tokenY: tokenY.address,
				amountY: values.amountY.toString(),
			}),
		);
	};

	const onRemoveLiquidity = async (liquidity: string) => {
		const destroyListener = await listenLPBurnt(
			account.address,
			pool.poolAddress,
			async (data) => {
				setLpBurnt(data);
				dispatch(GET_TOKEN_BALANCE.request(pool.poolAddress));
				dispatch(GET_TOKEN_BALANCE.request(data.tokenX));
				dispatch(GET_TOKEN_BALANCE.request(data.tokenY));
				destroyListener();
			},
		);
		dispatch(
			REMOVE_POOL_LIQUIDITY.request({
				tokenX: tokenX.address,
				tokenY: tokenY.address,
				amountLP: liquidity,
			}),
		);
	};

	const { txPending } = useSelector((state: RootState) => state.amm);
	return (
		<>
			<Helmet>
				<title>Fans Society Liquidity</title>
			</Helmet>

			<Grid container justifyContent={'center'}>
				<Grid item xs={12} sm={8} md={8} xl={6}>
					<Box display={'flex'} mb={3}>
						<Box>
							<Typography variant={'h3'} component={'h3'} gutterBottom>
								Become a liquidity provider
							</Typography>
						</Box>
					</Box>
					<Paper
						sx={{
							p: 2,
							margin: 'auto',
							flexGrow: 1,
							mb: 3,
						}}
					>
						<Grid item xs={12} sm container>
							<Grid item xs container direction="column" spacing={2}>
								<Grid item xs>
									<Typography variant="subtitle1" component="div">
										LP tokens balance: {balances[pool?.poolAddress]?.balance || 0}
									</Typography>
								</Grid>
							</Grid>
							<Grid item>
								{balances[pool?.poolAddress]?.balance !== '0' && (
									<Button
										sx={{
											'&:hover': {
												background: theme.palette.warning.dark,
											},
											color: theme.palette.warning.contrastText,
											background: theme.palette.warning.light,
										}}
										variant={'contained'}
										color={'inherit'}
										startIcon={<RemoveCircleOutlineIcon />}
										onClick={() => onRemoveLiquidity(balances[pool.poolAddress].balance)}
									>
										Remove liquidity
									</Button>
								)}
							</Grid>
						</Grid>
					</Paper>
					<Box sx={{ display: 'grid' }}>
						<OutlinedInput
							id={'amountX'}
							value={values.amountX}
							onChange={handleChange('amountX')}
							endAdornment={
								<>
									<InputAdornment position="end">{tokenX?.symbol}</InputAdornment>
									<CopyAddress
										title={`Copy ${tokenX?.symbol} token address`}
										address={tokenX?.address}
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
							<Typography>Deposit</Typography>
							<Typography>
								Balance: {(tokenX && balances[tokenX.address]?.balance) || 0}
							</Typography>
						</Box>
						<br />
						<OutlinedInput
							id={'amountY'}
							value={values.amountY}
							onChange={handleChange('amountY')}
							endAdornment={
								<>
									<InputAdornment position="end">{tokenY?.symbol}</InputAdornment>
									<CopyAddress
										title={`Copy ${tokenY?.symbol} token address`}
										address={tokenY?.address}
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
							<Typography>Deposit</Typography>
							<Typography>
								Balance: {(tokenY && balances[tokenY.address]?.balance) || 0}
							</Typography>
						</Box>
						<br />
						{lpMinted != null && (
							<Alert severity={'info'} onClose={() => setLpMinted(undefined)}>
								<AlertTitle>Info</AlertTitle>
								<ul>
									<li>
										<strong>
											{lpMinted.amountX}{' '}
											{lpMinted.tokenX === tokenX.address ? tokenX.symbol : tokenY.symbol}
										</strong>{' '}
										have been staked
									</li>
									<li>
										<strong>
											{lpMinted.amountY}{' '}
											{lpMinted.tokenX === tokenX.address ? tokenY.symbol : tokenX.symbol}
										</strong>{' '}
										have been staked
									</li>
									<li>
										<strong>{lpMinted.liquidity} LP tokens</strong> have been rewarded
									</li>
								</ul>
							</Alert>
						)}
						{lpBurnt != null && (
							<Alert severity={'info'} onClose={() => setLpBurnt(undefined)}>
								<AlertTitle>Info</AlertTitle>
								<ul>
									<li>
										<strong>
											{lpBurnt.amountX}{' '}
											{lpBurnt.tokenX === tokenX.address ? tokenX.symbol : tokenY.symbol}
										</strong>{' '}
										have been returned
									</li>
									<li>
										<strong>
											{lpBurnt.amountY}{' '}
											{lpBurnt.tokenX === tokenX.address ? tokenY.symbol : tokenX.symbol}
										</strong>{' '}
										have been returned
									</li>
									<li>
										<strong>{lpBurnt.liquidity} LP tokens</strong> have been burnt
									</li>
								</ul>
							</Alert>
						)}
						{poolInfo?.error != null && (
							<Alert severity={'error'}>{poolInfo?.error}</Alert>
						)}
						<br />
						{poolInfo?.result?.priceY && (
							<Box sx={{ display: 'flex' }}>
								<Typography>
									Price: {poolInfo.result.priceY} {tokenY?.symbol} per {tokenX?.symbol}
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
							onClick={onAddLiquidity}
						>
							Add liquidity
						</LoadingButton>
					</Box>
				</Grid>
			</Grid>
		</>
	);
};
