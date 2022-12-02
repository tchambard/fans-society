import {
	Committed,
	ProjectCreated,
	ProjectStatusChanged,
	TokensClaimed,
	Withdrawed,
} from 'fans-society-contracts/types/web3/contracts/AMM';
import { ClientFactory } from 'src/services/ClientFactory';
import {
	IAMMContractInfo,
	IContractsInfo,
	IProjectClaim,
	IProjectCommitment,
	IProjectListItem,
	IProjectStatusChangedEvent,
	IProjectWithdraw,
	ProjectStatus,
} from './actions';

export const listenProjectStatusChanged = (
	contractInfo: IAMMContractInfo,
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
	account: string,
	contract: IAMMContractInfo,
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
			partnerAddress: returnValues.partnerAddress,
			status: ProjectStatus.Opened,
			$capabilities: {
				$canAbort: contract.isOwner,
				$canCommit: true,
				$canWithdraw: false,
				$canValidate: account === returnValues.partnerAddress,
			},
		});
	};
	const emitter = contract.contract.events
		.ProjectCreated()
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};

export const listenCommitted = (
	contractInfo: IAMMContractInfo,
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
	contractInfo: IAMMContractInfo,
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
	contractInfo: IAMMContractInfo,
	onData: (data: IProjectClaim) => void,
): (() => void) => {
	const web3 = ClientFactory.web3();
	const eventHandler = async ({ returnValues }: TokensClaimed) => {
		onData({
			id: returnValues.projectId,
			address: returnValues.caller,
			amount: +web3.utils.fromWei(returnValues.amount, 'ether'),
		});
	};
	const emitter = contractInfo.contract.events
		.TokensClaimed()
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};
