import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import { PoolFactoryInstance } from '../types/truffle/contracts/pools/PoolFactory';
import { AMMInstance } from '../types/truffle/contracts/AMM';
import { WETHTokenInstance } from '../types/truffle/contracts/common/WETHToken';
import { ProjectTokenERC20Instance } from '../types/truffle/contracts/tokens/ProjectTokenERC20';

const ProjectTokenFactory = artifacts.require('ProjectTokenFactory');
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
	token1: string;
	token2: string;
}

export interface ITokenTransfer {
	from: string;
	to: string;
	value: number;
}

export const MULTIPLIER = 100;

export const AMM_SUPPLY = 15;
export const INVESTORS_SUPPLY = 15;
export const AUTHOR_SUPPLY = 70;

export const AMM_TOKENS_TEAM_SHARES = 20;
export const AMM_TOKENS_POOL_SHARES = 80;
export const AUTHOR_TOKENS_POOL_SHARES = 80;

export const AMM_FUNDS = 15;
export const AUTHOR_FUNDS = 85;
export const AMM_FUNDS_FSOCIETY_SHARES = 20;
export const AMM_FUNDS_POOL_SHARES = 80;
export const AUTHOR_FUNDS_POOL_SHARES = 30;

export async function deployProjectsInstances(
	contractOwnerAddress: string,
	fansSocietyAddress: string,
): Promise<{
	wethToken: WETHTokenInstance;
	projectTokenFactory: ProjectTokenFactoryInstance;
	PoolFactory: PoolFactoryInstance;
	amm: AMMInstance;
}> {
	const wethToken = await deployWethInstance(contractOwnerAddress);
	const projectTokenFactory = await deployProjectTokenFactoryInstance(
		contractOwnerAddress,
	);
	const PoolFactory = await deployPoolFactoryInstance(
		contractOwnerAddress,
	);

	const amm = await AMM.new(
		fansSocietyAddress,
		wethToken.address,
		projectTokenFactory.address,
		PoolFactory.address,
		{
			from: contractOwnerAddress,
		},
	);

	return {
		wethToken,
		projectTokenFactory,
		PoolFactory,
		amm,
	};
}

export async function deployWethInstance(
	contractOwnerAddress: string,
): Promise<WETHTokenInstance> {
	return WETHTokenFactory.new({
		from: contractOwnerAddress,
	});
}
export async function deployProjectTokenFactoryInstance(
	contractOwnerAddress: string,
): Promise<ProjectTokenFactoryInstance> {
	return ProjectTokenFactory.new({
		from: contractOwnerAddress,
	});
}

export async function deployPoolFactoryInstance(
	contractOwnerAddress: string,
): Promise<PoolFactoryInstance> {
	return PoolFactory.new({
		from: contractOwnerAddress,
	});
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
	return (
		await PoolFactory.getPastEvents('PoolCreated', { fromBlock: 0 })
	).map(({ returnValues }) => ({
		pool: returnValues.pool,
		token1: returnValues.token1,
		token2: returnValues.token2,
	}));
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
