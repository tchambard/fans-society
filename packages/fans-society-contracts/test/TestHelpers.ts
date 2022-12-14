import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import { PoolFactoryInstance } from '../types/truffle/contracts/pools/PoolFactory';
import { AMMInstance } from '../types/truffle/contracts/AMM';
import { WETHTokenInstance } from '../types/truffle/contracts/common/WETHToken';
import { ProjectTokenERC20Instance } from '../types/truffle/contracts/tokens/ProjectTokenERC20';
import { PoolInstance } from '../types/truffle/contracts/pools/Pool';

const ProjectTokenERC20 = artifacts.require('ProjectTokenERC20');
const ProjectTokenFactory = artifacts.require('ProjectTokenFactory');
const Pool = artifacts.require('Pool');
const PoolFactory = artifacts.require('PoolFactory');
const WETHTokenFactory = artifacts.require('WETHToken');
const AMM = artifacts.require('AMM');

export interface IToken {
	token: string;
	name: string;
	symbol: string;
}

export interface IPool {
	pool: string;
	tokenX: string;
	tokenY: string;
}

export interface ITokenTransfer {
	from: string;
	to: string;
	value: number;
}

export interface IWethTransfer {
	src: string;
	dst: string;
	wad: number;
}

export interface IWethDeposit {
	dst: string;
	wad: number;
}

export interface ILpMinted {
	tokenX: string;
	tokenY: string;
	amountX: string;
	amountY: string;
	provider: string;
	liquidity: string;
}

export interface ILPBurnt {
	tokenX: string;
	tokenY: string;
	amountX: string;
	amountY: string;
	provider: string;
	liquidity: string;
}

export const address0 = '0x0000000000000000000000000000000000000000';

export async function deployProjectsInstances(
	from: string,
	fansSocietyAddress: string,
): Promise<{
	wethToken: WETHTokenInstance;
	projectTokenFactory: ProjectTokenFactoryInstance;
	poolFactory: PoolFactoryInstance;
	amm: AMMInstance;
}> {
	const wethToken = await deployWethInstance(from);
	const ethUsdAggregatorAddress = address0;

	const amm = await AMM.new(
		fansSocietyAddress,
		wethToken.address,
		ethUsdAggregatorAddress,
		{
			from,
		},
	);

	const projectTokenFactory = await deployProjectTokenFactoryInstance(
		from,
		amm.address,
	);
	const PoolFactory = await deployPoolFactoryInstance(
		from,
		amm.address,
		fansSocietyAddress,
	);

	await amm.setFactories(projectTokenFactory.address, PoolFactory.address);

	return {
		wethToken,
		projectTokenFactory,
		poolFactory: PoolFactory,
		amm,
	};
}

export async function deployWethInstance(
	from: string,
): Promise<WETHTokenInstance> {
	return WETHTokenFactory.new({
		from,
	});
}

export async function deployProjectTokenFactoryInstance(
	from: string,
	ammAddress: string,
): Promise<ProjectTokenFactoryInstance> {
	const tokenImplementation = await ProjectTokenERC20.new(ammAddress, {
		from,
	});
	return ProjectTokenFactory.new(ammAddress, tokenImplementation.address, {
		from,
	});
}

export async function deployPoolFactoryInstance(
	from: string,
	ammAddress: string,
	fansSocietyAddress: string,
): Promise<PoolFactoryInstance> {
	const poolImplementation = await Pool.new({ from });
	return PoolFactory.new(
		ammAddress,
		poolImplementation.address,
		fansSocietyAddress,
		{
			from,
		},
	);
}

export function sortTokens(tokenX: string, tokenY: string) {
	return tokenX < tokenY ? -1 : 1;
}

export async function getTokensCreatedFromPastEvents(
	projectTokenFactory: ProjectTokenFactoryInstance,
): Promise<IToken[]> {
	return (
		await projectTokenFactory.getPastEvents('TokenCreated', { fromBlock: 0 })
	).map(({ returnValues }) => ({
		token: returnValues.token,
		name: returnValues.name,
		symbol: returnValues.symbol,
	}));
}

export async function getPoolsCreatedFromPastEvents(
	PoolFactory: PoolFactoryInstance,
): Promise<IPool[]> {
	return (await PoolFactory.getPastEvents('PoolCreated', { fromBlock: 0 })).map(
		({ returnValues }) => ({
			pool: returnValues.pool,
			tokenX: returnValues.tokenX,
			tokenY: returnValues.tokenY,
		}),
	);
}

export async function getTokenTransfersFromPastEvents(
	erc20Instance: ProjectTokenERC20Instance,
): Promise<ITokenTransfer[]> {
	return (await erc20Instance.getPastEvents('Transfer', { fromBlock: 0 })).map(
		({ returnValues }) => ({
			from: returnValues.from,
			to: returnValues.to,
			value: +returnValues.value,
		}),
	);
}

export async function getWethTransfersFromPastEvents(
	wethInstance: WETHTokenInstance,
): Promise<IWethTransfer[]> {
	return (await wethInstance.getPastEvents('Transfer', { fromBlock: 0 })).map(
		({ returnValues }) => ({
			src: returnValues.src,
			dst: returnValues.dst,
			wad: +returnValues.wad,
		}),
	);
}

export async function getWethDepositsFromPastEvents(
	wethInstance: WETHTokenInstance,
): Promise<IWethDeposit[]> {
	return (await wethInstance.getPastEvents('Deposit', { fromBlock: 0 })).map(
		({ returnValues }) => ({
			dst: returnValues.dst,
			wad: +returnValues.wad,
		}),
	);
}

export async function getLastSortedTokenAddressesFromPastEvents(
	projectTokenFactory: ProjectTokenFactoryInstance,
	count: number,
): Promise<string[]> {
	return (await getTokensCreatedFromPastEvents(projectTokenFactory))
		.slice(-count)
		.map((t) => t.token)
		.sort(sortTokens);
}

export async function getLpMintedFromPastEvents(
	poolInstance: PoolInstance,
): Promise<ILpMinted[]> {
	return (await poolInstance.getPastEvents('LPMinted', { fromBlock: 0 })).map(
		({ returnValues }) => ({
			tokenX: returnValues.tokenX,
			tokenY: returnValues.tokenX,
			amountX: returnValues.amountX,
			amountY: returnValues.amountY,
			provider: returnValues.provider,
			liquidity: returnValues.liquidity,
		}),
	);
}

export async function getLpBurntFromPastEvents(
	poolInstance: PoolInstance,
): Promise<ILPBurnt[]> {
	return (await poolInstance.getPastEvents('LPBurnt', { fromBlock: 0 })).map(
		({ returnValues }) => ({
			tokenX: returnValues.tokenX,
			tokenY: returnValues.tokenY,
			amountX: returnValues.amountX,
			amountY: returnValues.amountY,
			provider: returnValues.provider,
			liquidity: returnValues.liquidity,
		}),
	);
}
