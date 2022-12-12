import TokenContainerWrapper from '../../../ContentContainerWrapper';
import TokenList from './TokenList';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LIST_PROJECTS } from 'src/store/amm/actions';

import { RootState } from 'state-types';

export default () => {
	const dispatch = useDispatch();

	const { contracts } = useSelector((state: RootState) => state.amm);

	useEffect(() => {
		if (contracts.amm?.contract) {
			dispatch(LIST_PROJECTS.request());
		}
	}, [contracts.amm]);

	return (
		<TokenContainerWrapper>
			<TokenList />
		</TokenContainerWrapper>
	);
};
