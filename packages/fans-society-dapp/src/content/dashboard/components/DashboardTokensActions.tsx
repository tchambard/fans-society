import ActionsMenu, { IActionMenuItem } from 'src/components/ActionsMenu';
import { buildRoute, Routes } from 'src/router';

interface IProps {
	projectId: string;
}

export default ({ projectId }: IProps) => {
	const menuItems: IActionMenuItem[] = [
		{
			title: 'Swap',
			description: 'Exchange token',
			color: 'primary',
			url: buildRoute(Routes.TOKEN_DETAIL, { projectId }, { tab: 'swap' }),
		},
		{
			title: 'Farm',
			description: 'Yield farming',
			color: 'warning',
			url: buildRoute(Routes.TOKEN_DETAIL, { projectId }, { tab: 'pool' }),
		},
	];

	return <ActionsMenu items={menuItems} mode={'button'} />;
};
