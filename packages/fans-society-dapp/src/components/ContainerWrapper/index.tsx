import { Container } from '@mui/material';
import { ReactNode } from 'react';

import Footer from 'src/components/Footer';

interface IContainerWrapperProps {
	children?: ReactNode;
}

export default ({ children }: IContainerWrapperProps) => {
	return (
		<>
			<Container sx={{ mt: 3, minHeight: '1024px' }} maxWidth="xl">
				{children}
			</Container>

			<Footer />
		</>
	);
};
