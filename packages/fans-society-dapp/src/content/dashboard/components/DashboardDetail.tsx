import * as _ from 'lodash';
import { useState } from 'react';
import { useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { RootState } from 'state-types';
import DashboardTokensList from './tokens/DashboardTokensList';
import DashboardProjectsList from './projects/DashboardProjectsList';

export default ({}) => {
	const theme = useTheme();

	const { contracts } = useSelector((state: RootState) => state.amm);

	const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
		tokens: true,
	});

	const handleChange =
		(panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(
				isExpanded
					? { ...expanded, [panel]: true }
					: { ...expanded, [panel]: false },
			);
		};

	return (
		<>
			<Accordion expanded={expanded.tokens} onChange={handleChange('tokens')}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="tokens-content"
					id="tokens-header"
				>
					<Typography
						sx={{ fontSize: '1.5em', lineHeight: 2, width: '33%', flexShrink: 0 }}
					>
						Tokens
					</Typography>
				</AccordionSummary>
				<AccordionDetails
					sx={{ backgroundColor: theme.palette.background.default }}
				>
					<DashboardTokensList />
				</AccordionDetails>
			</Accordion>
			<Accordion expanded={expanded.projects} onChange={handleChange('projects')}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="projects-content"
					id="projects-header"
				>
					<Typography
						sx={{ fontSize: '1.5em', lineHeight: 2, width: '33%', flexShrink: 0 }}
					>
						Projects ICO
					</Typography>
				</AccordionSummary>
				<AccordionDetails
					sx={{ backgroundColor: theme.palette.background.default }}
				>
					<DashboardProjectsList />
				</AccordionDetails>
			</Accordion>
			<Accordion
				expanded={expanded.liquidities}
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
						Yield farming
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
