import { ReactNode } from 'react';
import { Container, Grid, styled } from '@mui/material';

const Root = styled('div')(
	() => `
    flexGrow: 1;
`,
);

interface IPageTitleWrapperProps {
	children?: ReactNode;
}

export default ({ children }: IPageTitleWrapperProps) => {
	return (
		<Root>
			<Container maxWidth={'xl'}>
				<Grid item xs={12}>
					{children}
				</Grid>
			</Container>
		</Root>
	);
};
