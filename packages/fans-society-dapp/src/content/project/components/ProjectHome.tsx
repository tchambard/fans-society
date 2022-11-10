import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Helmet } from 'react-helmet-async';

import PageTitleWrapper from 'src/components/PageTitleWrapper';

export default () => {
	return (
		<>
			<Helmet>
				<title>Fans Society - Entertainment projects</title>
			</Helmet>
			<PageTitleWrapper>
				<Grid container justifyContent={'space-between'} alignItems={'center'}>
					<Grid item>
						<Typography variant={'h3'} component={'h3'} gutterBottom>
							Entertainment projects creation coming soon !!!
						</Typography>
					</Grid>
				</Grid>
			</PageTitleWrapper>
		</>
	);
};
