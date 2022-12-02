import { useTheme } from '@mui/material';

import { useSelector } from 'react-redux';

import { RootState } from 'state-types';

import SuspenseLoader from 'src/components/SuspenseLoader';
import { Routes } from 'src/router';
import ProjectWrapper from '../../../../components/ProjectWrapper/index';
import ProjectActions from 'src/content/projects/components/detail/ProjectActions';

export default ({}) => {
	const theme = useTheme();

	const { currentProject, commitments } = useSelector(
		(state: RootState) => state.amm,
	);

	if (!currentProject.item || currentProject.loading) {
		return <SuspenseLoader />;
	}

	return (
		<ProjectWrapper
			name={currentProject.item.name}
			description={currentProject.item.description}
			linkBackRoute={Routes.TOKEN_LIST}
			avatarImageUrl={currentProject.item.avatarImageUrl}
			coverImageUrl={currentProject.item.coverImageUrl}
			actions={
				<ProjectActions
					projectId={currentProject.item.id}
					capabilities={currentProject.item.$capabilities}
				/>
			}
			content={<>TODO</>}
		/>
	);
};
