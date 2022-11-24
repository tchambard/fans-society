import {
	Claimed,
	Committed,
	ProjectCreated,
	ProjectStatusChanged,
	Withdrawed,
} from 'fans-society-contracts/types/web3/contracts/FansSociety';
import { ClientFactory } from 'src/services/ClientFactory';
import {
	IProjectClaim,
	IProjectCommitment,
	IProjectListItem,
	IProjectsContractInfo,
	IProjectStatusChangedEvent,
	IProjectWithdraw,
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
): (() => void) => {
	const web3 = ClientFactory.web3();
	const eventHandler = async ({ returnValues }: ProjectCreated) => {
		onData({
			id: returnValues.id,
			name: returnValues.name,
			description: returnValues.description,
			target: +web3.utils.fromWei(returnValues.target, 'ether'),
			minInvest: +web3.utils.fromWei(returnValues.minInvest, 'ether'),
			maxInvest: +web3.utils.fromWei(returnValues.maxInvest, 'ether'),
			authorAddress: returnValues.authorAddress,
			status: ProjectStatus.Opened,
			$capabilities: {
				$canAbort: contractInfo.isOwner,
			},
		});
	};
	const emitter = contractInfo.contract.events
		.ProjectCreated()
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};

export const listenCommitted = (
	contractInfo: IProjectsContractInfo,
	onData: (data: IProjectCommitment) => void,
): (() => void) => {
	const web3 = ClientFactory.web3();
	const eventHandler = async ({ returnValues }: Committed) => {
		onData({
			id: returnValues.id,
			address: returnValues.caller,
			amount: +web3.utils.fromWei(returnValues.amount, 'ether'),
		});
	};
	const emitter = contractInfo.contract.events
		.Committed()
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};

export const listenWithdrawed = (
	contractInfo: IProjectsContractInfo,
	onData: (data: IProjectWithdraw) => void,
): (() => void) => {
	const web3 = ClientFactory.web3();
	const eventHandler = async ({ returnValues }: Withdrawed) => {
		onData({
			id: returnValues.id,
			address: returnValues.caller,
			amount: +web3.utils.fromWei(returnValues.amount, 'ether'),
		});
	};
	const emitter = contractInfo.contract.events
		.Withdrawed()
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};

export const listenClaimed = (
	contractInfo: IProjectsContractInfo,
	onData: (data: IProjectClaim) => void,
): (() => void) => {
	const web3 = ClientFactory.web3();
	const eventHandler = async ({ returnValues }: Claimed) => {
		onData({
			id: returnValues.id,
			address: returnValues.caller,
			amount: +web3.utils.fromWei(returnValues.amount, 'ether'),
		});
	};
	const emitter = contractInfo.contract.events
		.Claimed()
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};
