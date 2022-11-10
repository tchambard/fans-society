import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const PageTitle = styled(Box)(
	({ theme }) => `
    padding: ${theme.spacing(2, 0)};
`,
);

interface IPageTitleWrapperProps {
	children?: ReactNode;
}

export default ({ children }: IPageTitleWrapperProps) => {
	return (
		<>
			<PageTitle>
				<Container maxWidth={'xl'}>{children}</Container>
			</PageTitle>
		</>
	);
};
