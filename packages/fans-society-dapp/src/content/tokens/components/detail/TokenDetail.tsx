import { useSelector } from 'react-redux';

import { RootState } from 'state-types';

import { Routes } from 'src/router';
import SuspenseLoader from 'src/components/SuspenseLoader';
import ProjectWrapper from 'src/components/ProjectWrapper';
import TokenSwap from './TokenSwap';
import { ChangeEvent, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Tab, Tabs } from '@mui/material';

export default ({}) => {
	const { currentToken, pools } = useSelector((state: RootState) => state.amm);
	const [currentTab, setCurrentTab] = useState<string>('swap');

	if (!currentToken.item || currentToken.loading || pools.loading) {
		return <SuspenseLoader />;
	}

	const tabs = [
		{ value: 'swap', label: 'Swap' },
		{ value: 'liquidity', label: 'Liquidity' },
	];

	const handleTabsChange = (event: ChangeEvent<{}>, value: string): void => {
		setCurrentTab(value);
	};

	const poolAddress = currentToken.poolIds[0];
	const pool = poolAddress && pools.items[poolAddress];

	return (
		<ProjectWrapper
			name={currentToken.item.name}
			description={currentToken.item.description}
			linkBackRoute={Routes.TOKEN_LIST}
			avatarImageUrl={currentToken.item.avatarImageUrl}
			coverImageUrl={currentToken.item.coverImageUrl}
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
								<Grid item xs={12}>
									<TokenSwap pool={pool} />
								</Grid>
							</Grid>
						)}

						{currentTab === 'liquidity' && (
							<Grid item xs={12}>
								<></>
							</Grid>
						)}
					</Grid>
				</>
			}
		/>
	);
};
