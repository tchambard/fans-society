import * as _ from 'lodash';
import * as qs from 'qs';
import { ChangeEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import { Tab, Tabs } from '@mui/material';

import { RootState } from 'state-types';

import { Routes } from 'src/router';
import SuspenseLoader from 'src/components/SuspenseLoader';
import ProjectWrapper from 'src/components/ProjectWrapper';
import TokenSwap from './TokenSwap';
import TokenLiquidity from './TokenLiquidity';
import CopyAddress from 'src/components/CopyAddress';
import { GET_ETH_USD_PRICE } from 'src/store/amm/actions';

export default ({}) => {
	const dispatch = useDispatch();

	let tabHash = qs.parse(window.location.hash.substring(1))?.tab?.toString();
	if (!tabHash) {
		tabHash = 'swap';
		window.location.hash = `#tab=${tabHash}`;
	}
	const { currentToken, pools } = useSelector((state: RootState) => state.amm);
	const [currentTab, setCurrentTab] = useState<string>(tabHash);

	useEffect(() => {
		dispatch(GET_ETH_USD_PRICE.request());
	}, []);

	if (!currentToken.item || currentToken.loading || pools.loading) {
		return <SuspenseLoader />;
	}

	const tabs = [
		{ value: 'swap', label: 'Swap' },
		{ value: 'pool', label: 'Liquidity' },
	];

	const handleTabsChange = (event: ChangeEvent<{}>, value: string): void => {
		setCurrentTab(value);
		window.location.hash = `#tab=${value}`;
	};

	const poolAddress = currentToken.poolIds[0];
	const pool = poolAddress && pools.items[poolAddress];

	return (
		<ProjectWrapper
			name={currentToken.item.name}
			description={currentToken.item.description}
			linkBackRoute={Routes.TOKEN_LIST}
			avatarCid={currentToken.item.avatarCid}
			coverCid={currentToken.item.coverCid}
			actions={
				<CopyAddress
					title={'Copy LP token address'}
					address={pool?.poolAddress}
					size={'medium'}
				/>
			}
			content={
				<>
					<Grid
						container
						direction={'row'}
						justifyContent={'center'}
						alignItems={'stretch'}
						spacing={3}
					>
						<Grid item xs={12}>
							<Tabs
								onChange={handleTabsChange}
								value={currentTab}
								centered={true}
								textColor={'primary'}
								indicatorColor={'primary'}
							>
								{tabs.map((tab) => (
									<Tab key={tab.value} label={tab.label} value={tab.value} />
								))}
							</Tabs>
						</Grid>

						{currentTab === 'swap' && (
							<Grid item xs={12}>
								<TokenSwap pool={pool} />
							</Grid>
						)}

						{currentTab === 'pool' && (
							<Grid item xs={12}>
								<TokenLiquidity pool={pool} />
							</Grid>
						)}
					</Grid>
				</>
			}
		/>
	);
};
function dispatch(arg0: any) {
	throw new Error('Function not implemented.');
}
