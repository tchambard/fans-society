import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import {
	Box,
	Button,
	Chip,
	Grid,
	Hidden,
	Popover,
	Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';

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

function HeaderUserbox() {
	const ref = useRef<any>(null);
	const [isOpen, setOpen] = useState<boolean>(false);
	const { account, networkAlias } = useSelector(
		(state: RootState) => state.ethNetwork,
	);

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
				<MenuUserBox sx={{ minWidth: 210 }} display={'flex'}>
					<Hidden mdDown>
						<Grid
							container
							display={'flex'}
							direction={'column'}
							justifyContent={'center'}
						>
							<Grid container justifyContent={'flex-end'} alignItems={'center'}>
								<AddressAvatar address={account} size={24} />
								<UserBoxText>
									<UserBoxLabel variant={'body1'}>{account}</UserBoxLabel>
								</UserBoxText>
							</Grid>
							<UserBoxText>
								<Grid container justifyContent={'center'} alignItems={'center'}>
									<Chip
										label={networkAlias}
										color={'info'}
										size={'medium'}
										variant={'outlined'}
									/>
								</Grid>
							</UserBoxText>
						</Grid>
					</Hidden>
				</MenuUserBox>
			</Popover>
		</>
	);
}

export default HeaderUserbox;
