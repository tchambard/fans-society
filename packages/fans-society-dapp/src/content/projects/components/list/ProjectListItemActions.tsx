import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

import ActionsMenu, { IActionMenuItem } from 'src/components/ActionsMenu';
import { IProjectDetailCapabilities } from '../../../../store/amm/actions';
import ProjectAbortDialog from './ProjectAbortDialog';

interface IProps {
	projectId: string;
	capabilities?: IProjectDetailCapabilities;
}

export default ({ projectId, capabilities }: IProps) => {
	const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

	const menuItems: IActionMenuItem[] = [
		{
			title: 'Abort',
			description: 'Abort project',
			color: 'error',
			icon: <DeleteIcon fontSize={'small'} />,
			url: '',
			hidden: !capabilities?.$canAbort,
			onClick: () => setDeleteDialogVisible(!deleteDialogVisible),
		},
	];

	return (
		<>
			<ActionsMenu items={menuItems} mode={'button'} />
			{deleteDialogVisible && (
				<ProjectAbortDialog
					projectId={projectId}
					dialogVisible={deleteDialogVisible}
					setDialogVisible={setDeleteDialogVisible}
				/>
			)}
		</>
	);
};
