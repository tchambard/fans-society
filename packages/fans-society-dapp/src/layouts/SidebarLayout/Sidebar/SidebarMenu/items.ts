import { ReactNode } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import TokenIcon from '@mui/icons-material/Token';
import DashboardIcon from '@mui/icons-material/Dashboard';

export interface IMenuItem {
	link?: string;
	icon?: ReactNode;
	badge?: string;
	items?: IMenuItem[];
	name: string;
}

export interface IMenuItems {
	items: IMenuItem[];
	heading: string;
}

const menuItems: IMenuItems[] = [
	{
		heading: '',
		items: [
			{
				name: 'Home',
				link: '/home',
				icon: HomeIcon,
			},
			{
				name: 'Projects',
				link: '/projects',
				icon: ArtTrackIcon,
			},
			{
				name: 'Tokens',
				link: '/tokens',
				icon: TokenIcon,
			},
			{
				name: 'Dashboard',
				link: '/dashboard',
				icon: DashboardIcon,
			},
		],
	},
];

export default menuItems;
