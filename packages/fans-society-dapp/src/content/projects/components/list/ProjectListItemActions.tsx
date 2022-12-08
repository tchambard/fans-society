import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

import ActionsMenu, { IActionMenuItem } from 'src/components/ActionsMenu';
import { IProjectDetailCapabilities } from '../../../../store/amm/actions';
import ProjectAbortDialog from './ProjectAbortDialog';

interface IProps {
	currentView: 'list' | 'detail';
	projectId: string;
	capabilities?: IProjectDetailCapabilities;
}

export default ({ projectId, capabilities, currentView }: IProps) => {
	const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

	const menuItems: IActionMenuItem[] = [
		{
			title: 'Details',
			description: 'View project details',
			url: `/projects/${projectId}`,
			color: 'primary',
			icon: <AutoGraphIcon fontSize={'small'} />,
			hidden: currentView === 'detail',
		},
		{
			title: 'Delete',
			description: 'Delete project',
			color: 'error',
			icon: <DeleteIcon fontSize={'small'} />,
			url: '',
			hidden: !capabilities?.$canAbort,
			onClick: () => setDeleteDialogVisible(!deleteDialogVisible),
		},
	];

	return (
		<>
			<ActionsMenu items={menuItems} />
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
