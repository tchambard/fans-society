import {
	ProjectCreated,
	ProjectStatusChanged,
} from 'fans-society-contracts/types/web3/contracts/FansSociety';
import {
	IProjectListItem,
	IProjectsContractInfo,
	IProjectStatusChangedEvent,
	ProjectStatus,
} from './actions';

export const listenProjectStatusChanged = (
	contractInfo: IProjectsContractInfo,
	onData: (data: IProjectStatusChangedEvent) => void,
	projectId?: string,
): (() => void) => {
	const eventHandler = async ({ returnValues }: ProjectStatusChanged) => {
		onData({ id: returnValues.id, status: +returnValues.status });
	};

	const emitter = contractInfo.contract.events
		.ProjectStatusChanged(projectId && { filter: { id: projectId } })
		.on('data', eventHandler);

	return () => emitter.removeListener('data', eventHandler);
};

export const listenProjectCreated = (
	contractInfo: IProjectsContractInfo,
	onData: (data: IProjectListItem) => void,
) => {
	contractInfo.contract.events
		.ProjectCreated()
		.on('data', async ({ returnValues }: ProjectCreated) => {
			onData({
				id: returnValues.id,
				name: returnValues.name,
				description: returnValues.description,
				symbol: returnValues.symbol,
				target: +returnValues.target,
				minInvest: +returnValues.minInvest,
				authorAddress: returnValues.authorAddress,
				status: ProjectStatus.Opened,
				$capabilities: {
					$canAbort: contractInfo.isOwner,
				},
			});
		});
};
