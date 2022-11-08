import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Footer from 'src/components/Footer';
import { Routes } from 'src/router';

export default () => {
	return (
		<>
			<Helmet>
				<title>Welcome to Art Market Fans</title>
			</Helmet>
			<Container sx={{ mt: 3, minHeight: '1024px' }} maxWidth="xl">
				<Grid
					container
					spacing={{ xs: 2, md: 3 }}
					columns={{ xs: 4, sm: 8, md: 12 }}
				>
					<Grid item xs={3}>
						<Card sx={{ maxWidth: 345 }}>
							<Link to={Routes.PROJECT_LIST}>
								<CardActionArea>
									<CardMedia
										component="img"
										height="140"
										image="/static/images/cards/eth-voting-240.jpeg"
										alt="ethereum voting"
									/>
									<CardContent>
										<Typography gutterBottom variant="h5" component="div">
											Crowdfunding
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Entertainment projects
										</Typography>
									</CardContent>
								</CardActionArea>
							</Link>
						</Card>
					</Grid>
				</Grid>
			</Container>
			<Footer />
		</>
	);
};
