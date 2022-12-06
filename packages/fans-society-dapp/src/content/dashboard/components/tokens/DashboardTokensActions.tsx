import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';

import ActionsMenu, { IActionMenuItem } from 'src/components/ActionsMenu';
import { buildRoute, Routes } from 'src/router';
import { ITokenWithBalance } from 'src/store/amm/actions';

interface IProps {
	token: ITokenWithBalance;
}

export default ({ token }: IProps) => {
	const menuItems: IActionMenuItem[] = [
		{
			title: 'Swap',
			description: 'Exchange token',
			color: 'primary',
			url: buildRoute(
				Routes.TOKEN_DETAIL,
				{ projectId: token.projectId },
				{ tab: 'swap' },
			),
		},
		{
			title: 'Farm',
			description: 'Yield farming',
			color: 'warning',
			url: buildRoute(
				Routes.TOKEN_DETAIL,
				{ projectId: token.projectId },
				{ tab: 'pool' },
			),
		},
	];

	return <ActionsMenu items={menuItems} mode={'button'} />;
};
