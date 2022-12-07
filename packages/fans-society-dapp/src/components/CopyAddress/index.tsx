import { IconButton, Tooltip, useTheme } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface IProps {
	address: string;
	title: string;
	size?: 'small' | 'medium' | 'large';
}

export default ({ address, title, size }: IProps) => {
	const theme = useTheme();

	return (
		<Tooltip placement={'top'} title={title}>
			<IconButton
				sx={{
					'&:hover': {
						background: theme.colors.primary.lighter,
					},
					color: theme.palette.primary.main,
				}}
				color={'inherit'}
				onClick={() => navigator.clipboard.writeText(address)}
			>
				<ContentCopyIcon fontSize={size || 'small'} />
			</IconButton>
		</Tooltip>
	);
};
