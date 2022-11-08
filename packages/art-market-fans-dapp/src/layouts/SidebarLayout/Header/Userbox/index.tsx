import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import {
	Avatar,
	Box,
	Button,
	Divider,
	Hidden,
	lighten,
	Popover,
	Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';

import { RootState } from 'state-types';

import AddressAvatar from 'src/components/AddressAvatar';

const UserBoxButton = styled(Button)(
	({ theme }) => `
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(1)};
`,
);

const MenuUserBox = styled(Box)(
	({ theme }) => `
        background: ${theme.colors.alpha.black[5]};
        padding: ${theme.spacing(2)};
`,
);

const UserBoxText = styled(Box)(
	({ theme }) => `
        text-align: left;
        padding: ${theme.spacing(1)};
`,
);

const UserBoxLabel = styled(Typography)(
	({ theme }) => `
        font-weight: ${theme.typography.fontWeightBold};
        color: ${theme.palette.secondary.main};
        display: block;
`,
);

const UserBoxDescription = styled(Typography)(
	({ theme }) => `
        color: ${lighten(theme.palette.secondary.main, 0.5)}
`,
);

function HeaderUserbox() {
	const ref = useRef<any>(null);
	const [isOpen, setOpen] = useState<boolean>(false);
	const { account } = useSelector((state: RootState) => state.ethNetwork);

	const handleOpen = (): void => {
		setOpen(true);
	};

	const handleClose = (): void => {
		setOpen(false);
	};

	if (!account) {
		return <div></div>;
	}
	return (
		<>
			<UserBoxButton color="secondary" ref={ref} onClick={handleOpen}>
				<AddressAvatar address={account} />
				<Hidden mdDown>
					<UserBoxText>
						<UserBoxLabel variant="body1">{account.substring(0, 8)}</UserBoxLabel>
					</UserBoxText>
				</Hidden>
				<Hidden smDown>
					<ExpandMoreTwoToneIcon sx={{ ml: 1 }} />
				</Hidden>
			</UserBoxButton>
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
			>
				<MenuUserBox sx={{ minWidth: 210 }} display="flex">
					<AddressAvatar address={account} />
					<Hidden mdDown>
						<UserBoxText>
							<UserBoxLabel variant="body1">{account}</UserBoxLabel>
						</UserBoxText>
					</Hidden>
				</MenuUserBox>
				<Divider sx={{ mb: 0 }} />
				<Box sx={{ m: 1 }}>
					<Button
						color="primary"
						fullWidth
						onClick={() => {
							//window.auth.logout();
						}}
					>
						<LockOpenTwoToneIcon sx={{ mr: 1 }} />
						Sign out
					</Button>
				</Box>
			</Popover>
		</>
	);
}

export default HeaderUserbox;
