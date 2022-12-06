import * as _ from 'lodash';
import * as qs from 'qs';
import { ChangeEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Grid from '@mui/material/Grid';
import { IconButton, Link, Tab, Tabs, Tooltip, useTheme } from '@mui/material';

import { RootState } from 'state-types';

import { Routes } from 'src/router';
import SuspenseLoader from 'src/components/SuspenseLoader';
import ProjectWrapper from 'src/components/ProjectWrapper';
import TokenSwap from './TokenSwap';

export default ({}) => {
	const theme = useTheme();

	const tabHash = qs.parse(window.location.hash.substring(1))?.tab?.toString();
	const { currentToken, pools } = useSelector((state: RootState) => state.amm);
	const [currentTab, setCurrentTab] = useState<string>(tabHash || 'swap');

	if (!currentToken.item || currentToken.loading || pools.loading) {
		return <SuspenseLoader />;
	}

	const tabs = [
		{ value: 'swap', label: 'Swap' },
		{ value: 'pool', label: 'Liquidity' },
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
			avatarCid={currentToken.item.avatarCid}
			coverCid={currentToken.item.coverCid}
			actions={
				<Tooltip placement={'top'} title={'Copy token address'}>
					<IconButton
						sx={{
							'&:hover': {
								background: theme.colors.primary.lighter,
							},
							color: theme.palette.primary.main,
						}}
						color={'inherit'}
						size={'small'}
						onClick={() => navigator.clipboard.writeText(currentToken.item.address)}
					>
						<ContentCopyIcon fontSize={'medium'} />
					</IconButton>
				</Tooltip>
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
								<Grid item xs={12}>
									<TokenSwap pool={pool} />
								</Grid>
							</Grid>
						)}

						{currentTab === 'pool' && (
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
