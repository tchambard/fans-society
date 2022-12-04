import { useSelector } from 'react-redux';

import { RootState } from 'state-types';

import { Routes } from 'src/router';
import SuspenseLoader from 'src/components/SuspenseLoader';
import ProjectWrapper from 'src/components/ProjectWrapper';
import TokenSwap from './TokenSwap';

export default ({}) => {
	const { currentToken, pools } = useSelector((state: RootState) => state.amm);

	if (!currentToken.item || currentToken.loading || pools.loading) {
		return <SuspenseLoader />;
	}

	const poolAddress = currentToken.poolIds[0];
	const pool = poolAddress && pools.items[poolAddress];

	return (
		<ProjectWrapper
			name={currentToken.item.name}
			description={currentToken.item.description}
			linkBackRoute={Routes.TOKEN_LIST}
			avatarImageUrl={currentToken.item.avatarImageUrl}
			coverImageUrl={currentToken.item.coverImageUrl}
			content={
				<>
					<TokenSwap pool={pool} />
				</>
			}
		/>
	);
};
