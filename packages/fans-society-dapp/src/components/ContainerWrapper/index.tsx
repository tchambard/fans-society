import { Alert, CircularProgress, Container, Snackbar } from '@mui/material';
import { ReactNode } from 'react';

import Footer from 'src/components/Footer';

interface IContainerWrapperProps {
	children?: ReactNode;
	txPending?: boolean;
	error?: string;
	handleCloseErrorSnack: (
		event?: React.SyntheticEvent | Event,
		reason?: string,
	) => void;
}

export default ({
	children,
	txPending,
	error,
	handleCloseErrorSnack,
}: IContainerWrapperProps) => {
	return (
		<>
			<Container sx={{ mt: 3, minHeight: '1024px' }} maxWidth="xl">
				{children}

				<Snackbar open={error != null} onClose={handleCloseErrorSnack}>
					<Alert
						severity={'error'}
						sx={{ width: '100%', color: 'red' }}
						onClose={handleCloseErrorSnack}
					>
						{error}
					</Alert>
				</Snackbar>

				<Snackbar open={txPending}>
					<Alert severity={'info'} sx={{ width: '100%' }}>
						<CircularProgress size={16} disableShrink thickness={3} />
						Transaction pending
					</Alert>
				</Snackbar>
			</Container>

			<Footer />
		</>
	);
};
