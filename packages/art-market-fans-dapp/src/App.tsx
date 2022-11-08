import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { RootState } from 'state-types';

import { routes } from './router';
import ThemeProvider from './theme/ThemeProvider';
import { useNetwork } from './eth-network/helpers';
import SuspenseLoader from './components/SuspenseLoader';

export default () => {
	const { account, networkId } = useSelector(
		(state: RootState) => state.ethNetwork,
	);

	useNetwork(account);

	const content = useRoutes(routes);

	if (!networkId) {
		return <SuspenseLoader />;
	}

	return (
		<>
			<ThemeProvider>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<CssBaseline />
					{content}
				</LocalizationProvider>
			</ThemeProvider>
		</>
	);
};
