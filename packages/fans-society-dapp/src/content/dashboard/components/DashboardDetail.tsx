import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { RootState } from 'state-types';
import DashboardTokensList from './tokens/DashboardTokensList';

export default ({}) => {
	const theme = useTheme();

	const { contracts } = useSelector((state: RootState) => state.amm);

	const [expanded, setExpanded] = useState<string | false>('tokens');

	const handleChange =
		(panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false);
		};

	useEffect(() => {
		if (expanded === 'tokens') {
		}
	}, [expanded]);

	return (
		<>
			<Accordion
				expanded={expanded === 'tokens'}
				onChange={handleChange('tokens')}
			>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="tokens-content"
					id="tokens-header"
				>
					<Typography
						sx={{ fontSize: '1.5em', lineHeight: 2, width: '33%', flexShrink: 0 }}
					>
						My entertainment tokens
					</Typography>
				</AccordionSummary>
				<AccordionDetails
					sx={{ backgroundColor: theme.palette.background.default }}
				>
					<DashboardTokensList />
				</AccordionDetails>
			</Accordion>
			<Accordion
				expanded={expanded === 'pending-claims'}
				onChange={handleChange('pending-claims')}
			>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="pending-claims-content"
					id="pending-claims-header"
				>
					<Typography
						sx={{ fontSize: '1.5em', lineHeight: 2, width: '33%', flexShrink: 0 }}
					>
						My pending claims
					</Typography>
				</AccordionSummary>
				<AccordionDetails
					sx={{ backgroundColor: theme.palette.background.default }}
				>
					<Typography>TODO.</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion
				expanded={expanded === 'liquidities'}
				onChange={handleChange('liquidities')}
			>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="liquidities-content"
					id="liquidities-header"
				>
					<Typography
						sx={{ fontSize: '1.5em', lineHeight: 2, width: '33%', flexShrink: 0 }}
					>
						Liquidity
					</Typography>
				</AccordionSummary>
				<AccordionDetails
					sx={{ backgroundColor: theme.palette.background.default }}
				>
					<Typography>TODO.</Typography>
				</AccordionDetails>
			</Accordion>
		</>
	);
};
