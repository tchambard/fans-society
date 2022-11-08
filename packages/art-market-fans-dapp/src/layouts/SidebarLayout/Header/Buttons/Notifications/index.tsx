import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as _ from 'lodash';
import {
	alpha,
	Badge,
	Box,
	Divider,
	IconButton,
	Popover,
	Tooltip,
	Typography,
	styled,
} from '@mui/material';
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';

import NotificationList from '../../../../../content/home/components/Home';

const NotificationsBadge = styled(Badge)(
	({ theme }) => `  
    .MuiBadge-badge {
        background-color: ${alpha(theme.palette.error.main, 0.1)};
        color: ${theme.palette.error.main};
        min-width: 16px; 
        height: 16px;
        padding: 0;

        &::after {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            box-shadow: 0 0 0 1px ${alpha(theme.palette.error.main, 0.3)};
            content: "";
        }
    }
`,
);

function HeaderNotifications() {
	const ref = useRef<any>(null);

	const notifications = [];
	const notificationsCount = notifications.length;

	const [isOpen, setOpen] = useState<boolean>(false);

	const handleOpen = (): void => {
		setOpen(true);
	};

	const handleClose = (): void => {
		setOpen(false);
	};

	return (
		<>
			<Tooltip arrow title={'Notifications'}>
				<IconButton color={'primary'} ref={ref} onClick={handleOpen}>
					<NotificationsBadge
						badgeContent={notificationsCount}
						anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
					>
						<NotificationsActiveTwoToneIcon />
					</NotificationsBadge>
				</IconButton>
			</Tooltip>
			<Popover
				anchorEl={ref.current}
				onClose={handleClose}
				open={isOpen}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				PaperProps={{
					style: { width: '400px' },
				}}
			>
				<Box
					sx={{ p: 2 }}
					display={'flex'}
					alignItems={'center'}
					justifyContent={'space-between'}
				>
					<Typography variant={'h5'}>Notifications</Typography>
				</Box>
				<Divider />
				<NotificationList />
			</Popover>
		</>
	);
}

export default HeaderNotifications;
