import {
	Committed,
	ProjectCreated,
	ProjectStatusChanged,
	Swapped,
	TokensClaimed,
	Withdrawed,
} from 'fans-society-contracts/types/web3/contracts/AMM';
import { TokenCreated } from 'fans-society-contracts/types/web3/contracts/tokens/ProjectTokenFactory';
import { ClientFactory } from 'src/services/ClientFactory';
import {
	IAMMContractInfo,
	IProjectClaim,
	IProjectCommitment,
	IProjectListItem,
	IProjectStatusChangedEvent,
	IProjectWithdraw,
	ISwapEvent,
	ITokenCreated,
	ITokensFactoryContractInfo,
	ProjectStatus,
} from './actions';
import { getWethAddress } from './contract';

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
			symbol: returnValues.symbol,
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

export const listenTokenCreated = (
	contractInfo: ITokensFactoryContractInfo,
	onData: (data: ITokenCreated) => void,
): (() => void) => {
	const eventHandler = async ({ returnValues }: TokenCreated) => {
		onData({
			projectId: returnValues.projectId,
			address: returnValues.token,
			name: returnValues.name,
			symbol: returnValues.symbol,
		});
	};
	const emitter = contractInfo.contract.events
		.TokenCreated()
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};

export const listenSwap = async (
	account: string,
	contractInfo: IAMMContractInfo,
	onData: (data: ISwapEvent) => void,
): Promise<() => void> => {
	const web3 = ClientFactory.web3();
	const eventHandler = async ({ returnValues }: Swapped) => {
		const wethAddress = await getWethAddress(web3);
		onData({
			tokenIn: returnValues.tokenIn,
			amountIn:
				returnValues.tokenIn === wethAddress
					? +web3.utils.fromWei(returnValues.amountIn, 'ether')
					: +returnValues.amountIn,
			tokenOut: returnValues.tokenOut,
			amountOut:
				returnValues.tokenOut === wethAddress
					? +web3.utils.fromWei(returnValues.amountOut, 'ether')
					: +returnValues.amountOut,
		});
	};
	const emitter = contractInfo.contract.events
		.Swapped({ filter: { caller: account } })
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};
