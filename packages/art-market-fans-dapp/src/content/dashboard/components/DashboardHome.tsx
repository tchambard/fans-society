import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Helmet } from 'react-helmet-async';

import PageTitleWrapper from 'src/components/PageTitleWrapper';

export default () => {
	return (
		<>
			<Helmet>
				<title>Art Market Fans - Projects dashboard</title>
			</Helmet>
			<PageTitleWrapper>
				<Grid container justifyContent={'space-between'} alignItems={'center'}>
					<Grid item>
						<Typography variant={'h3'} component={'h3'} gutterBottom>
						Projects dashboard coming soon !!!
						</Typography>
					</Grid>
				</Grid>
			</PageTitleWrapper>
		</>
	);
};
