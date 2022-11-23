import DeleteIcon from '@mui/icons-material/Delete';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from 'state-types';

import ActionsMenu, { IActionMenuItem } from 'src/components/ActionsMenu';
import { IProjectDetailCapabilities } from '../../actions';
import ProjectAbortDialog from '../list/ProjectAbortDialog';
import ProjectCommitDialog from './ProjectCommitDialog';
import ProjectWithdrawDialog from './ProjectWithdrawDialog';
import SuspenseLoader from 'src/components/SuspenseLoader';

interface IProps {
	projectId: string;
	capabilities: IProjectDetailCapabilities;
}

export default ({ projectId, capabilities }: IProps) => {
	const [abortDialogVisible, setAbortDialogVisible] = useState(false);
	const [commitDialogVisible, setCommitDialogVisible] = useState(false);
	const [withdrawDialogVisible, setWithdrawDialogVisible] = useState(false);

	const menuItems: IActionMenuItem[] = [
		{
			title: 'Commit',
			description: 'Commit on project',
			color: 'primary',
			icon: <PlaylistAddIcon fontSize={'small'} />,
			url: '',
			onClick: () => setCommitDialogVisible(!commitDialogVisible),
		},
		{
			title: 'Withdraw',
			description: 'Withdraw on project',
			color: 'primary',
			icon: <PlaylistRemoveIcon fontSize={'small'} />,
			url: '',
			onClick: () => setWithdrawDialogVisible(!withdrawDialogVisible),
		},
		{
			title: 'Abort',
			description: 'Delete project',
			color: 'error',
			icon: <DeleteIcon fontSize={'small'} />,
			url: '',
			hidden: !capabilities.$canAbort,
			onClick: () => setAbortDialogVisible(!abortDialogVisible),
		},
	];

	return (
		<>
			<ActionsMenu items={menuItems} mode={'button'} />

			{abortDialogVisible && (
				<ProjectAbortDialog
					projectId={projectId}
					dialogVisible={abortDialogVisible}
					setDialogVisible={setAbortDialogVisible}
				/>
			)}

			{commitDialogVisible && (
				<ProjectCommitDialog
					projectId={projectId}
					dialogVisible={commitDialogVisible}
					setDialogVisible={setCommitDialogVisible}
				/>
			)}

			{withdrawDialogVisible && (
				<ProjectWithdrawDialog
					projectId={projectId}
					dialogVisible={withdrawDialogVisible}
					setDialogVisible={setWithdrawDialogVisible}
				/>
			)}
		</>
	);
};
