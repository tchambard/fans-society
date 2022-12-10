import {
	Committed,
	ProjectCreated,
	ProjectStatusChanged,
	Swapped,
	TokensClaimed,
	Withdrawed,
} from 'fans-society-contracts/types/web3/contracts/AMM';
import {
	LPBurnt,
	LPMinted,
} from 'fans-society-contracts/types/web3/contracts/pools/Pool';
import { TokenCreated } from 'fans-society-contracts/types/web3/contracts/tokens/ProjectTokenFactory';
import { ClientFactory } from 'src/services/ClientFactory';
import logger from 'src/services/logger-service';
import {
	IAMMContractInfo,
	ILPMintedEvent,
	IPoolsFactoryContractInfo,
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
import { getPoolContract } from './contract';

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
		const projectCreated: IProjectListItem = {
			id: returnValues.id,
			name: returnValues.info[0],
			symbol: returnValues.info[1],
			description: returnValues.info[2],
			avatarCid: returnValues.info[3],
			coverCid: returnValues.info[4],
			target: +web3.utils.fromWei(returnValues.ico[0], 'ether'),
			minInvest: +web3.utils.fromWei(returnValues.ico[1], 'ether'),
			maxInvest: +web3.utils.fromWei(returnValues.ico[2], 'ether'),
			partnerAddress: returnValues.partnerAddress,
			status: ProjectStatus.Opened,
			$capabilities: {
				$canAbort: contract.isOwner,
				$canCommit: true,
				$canWithdraw: false,
				$canValidate: false,
				$canClaim: false,
			},
		};
		logger.log(
			'=== Project created ===\n',
			JSON.stringify(projectCreated, null, 2),
		);
		onData(projectCreated);
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
		const projectCommitment: IProjectCommitment = {
			id: returnValues.id,
			address: returnValues.caller,
			amount: +web3.utils.fromWei(returnValues.amount, 'ether'),
		};
		logger.log(
			'=== Project commitment ===\n',
			JSON.stringify(projectCommitment, null, 2),
		);
		onData(projectCommitment);
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
		const projectWithdraw: IProjectWithdraw = {
			id: returnValues.id,
			address: returnValues.caller,
			amount: +web3.utils.fromWei(returnValues.amount, 'ether'),
		};
		logger.log(
			'=== Project withdraw ===\n',
			JSON.stringify(projectWithdraw, null, 2),
		);
		onData(projectWithdraw);
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
		const projectClaim: IProjectClaim = {
			id: returnValues.projectId,
			address: returnValues.caller,
			amount: +web3.utils.fromWei(returnValues.amount, 'ether'),
		};
		logger.log('=== Project claim ===\n', JSON.stringify(projectClaim, null, 2));
		onData(projectClaim);
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
		const tokenCreated: ITokenCreated = {
			projectId: returnValues.projectId,
			address: returnValues.token,
			name: returnValues.name,
			symbol: returnValues.symbol,
		};
		logger.log('=== Token created ===\n', JSON.stringify(tokenCreated, null, 2));
		onData(tokenCreated);
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
		const swap: ISwapEvent = {
			poolAddress: returnValues.poolAddress,
			tokenIn: returnValues.tokenIn,
			amountIn: web3.utils.fromWei(returnValues.amountIn, 'ether'),
			tokenOut: returnValues.tokenOut,
			amountOut: web3.utils.fromWei(returnValues.amountOut, 'ether'),
		};
		logger.log('=== Swap ===\n', JSON.stringify(swap, null, 2));
		onData(swap);
	};
	const emitter = contractInfo.contract.events
		.Swapped({ filter: { caller: account } })
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};

export const listenLPMinted = async (
	account: string,
	poolAddress,
	onData: (data: ILPMintedEvent) => void,
): Promise<() => void> => {
	const web3 = ClientFactory.web3();
	const poolContract = await getPoolContract(web3, poolAddress);
	const eventHandler = async ({ returnValues }: LPMinted) => {
		const lpMinted: ILPMintedEvent = {
			tokenX: returnValues.tokenX,
			amountX: web3.utils.fromWei(returnValues.amountX, 'ether'),
			tokenY: returnValues.tokenY,
			amountY: web3.utils.fromWei(returnValues.amountY, 'ether'),
			liquidity: web3.utils.fromWei(returnValues.liquidity, 'ether'),
		};
		logger.log('=== LP minted ===\n', JSON.stringify(lpMinted, null, 2));
		onData(lpMinted);
	};
	const emitter = poolContract.events
		.LPMinted({ filter: { provider: account } })
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};

export const listenLPBurnt = async (
	account: string,
	poolAddress,
	onData: (data: ILPMintedEvent) => void,
): Promise<() => void> => {
	const web3 = ClientFactory.web3();
	const poolContract = await getPoolContract(web3, poolAddress);
	const eventHandler = async ({ returnValues }: LPBurnt) => {
		const lpBurnt: ILPMintedEvent = {
			tokenX: returnValues.tokenX,
			amountX: web3.utils.fromWei(returnValues.amountX, 'ether'),
			tokenY: returnValues.tokenY,
			amountY: web3.utils.fromWei(returnValues.amountY, 'ether'),
			liquidity: web3.utils.fromWei(returnValues.liquidity, 'ether'),
		};
		logger.log('=== LP burnt ===\n', JSON.stringify(lpBurnt, null, 2));
		onData(lpBurnt);
	};
	const emitter = poolContract.events
		.LPBurnt({ filter: { provider: account } })
		.on('data', eventHandler);
	return () => emitter.removeListener('data', eventHandler);
};
