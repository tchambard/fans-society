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
			<Container sx={{ mt: 5, minHeight: '1024px' }} maxWidth="xl">
				<Grid
					container
					spacing={3}
					justifyContent={'flex-end'}
					alignItems={'center'}
				>
					<Grid item xs={12} md={4}>
						<Card sx={{ maxWidth: 400 }}>
							<Link to={Routes.PROJECT_LIST}>
								<CardActionArea>
									<CardMedia
										component="img"
										height="400"
										image="/static/images/cards/crowdfunding.jpg"
										alt="crowdfunding"
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
					<Grid item xs={12} md={4}>
						<Card sx={{ maxWidth: 400 }}>
							<Link to={Routes.PROJECT_LIST}>
								<CardActionArea>
									<CardMedia
										component="img"
										height="400"
										image="/static/images/cards/tokens.jpg"
										alt="tokens"
									/>
									<CardContent>
										<Typography gutterBottom variant="h5" component="div">
											Tokens
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Projects tokens exchange
										</Typography>
									</CardContent>
								</CardActionArea>
							</Link>
						</Card>
					</Grid>
					<Grid item xs={12} md={4}>
						<Card sx={{ maxWidth: 400 }}>
							<Link to={Routes.PROJECT_LIST}>
								<CardActionArea>
									<CardMedia
										component="img"
										height="400"
										image="/static/images/cards/dashboard.jpg"
										alt="dashboard"
									/>
									<CardContent>
										<Typography gutterBottom variant="h5" component="div">
											Dashboard
										</Typography>
										<Typography variant="body2" color="text.secondary">
											My projects
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
