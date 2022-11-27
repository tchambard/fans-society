import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import { TokensPoolFactoryInstance } from '../types/truffle/contracts/pools/TokensPoolFactory';
import { AMMInstance } from '../types/truffle/contracts/AMM';
import { WETHTokenInstance } from '../types/truffle/contracts/common/WETHToken';

const ProjectTokenFactory = artifacts.require('ProjectTokenFactory');
const TokensPoolFactory = artifacts.require('TokensPoolFactory');
const WETHTokenFactory = artifacts.require('WETHToken');
const AMM = artifacts.require('AMM');

export async function deployProjectsInstances(
	contractOwnerAddress: string,
	fansSocietyAddress: string,
): Promise<{
	wethToken: WETHTokenInstance;
	projectTokenFactory: ProjectTokenFactoryInstance;
	tokensPoolFactory: TokensPoolFactoryInstance;
	amm: AMMInstance;
}> {
	const wethToken = await deployWethInstance(contractOwnerAddress);
	const projectTokenFactory = await deployProjectTokenFactoryInstance(
		contractOwnerAddress,
	);
	const tokensPoolFactory = await deployTokensPoolFactoryInstance(
		contractOwnerAddress,
	);

	const amm = await AMM.new(
		fansSocietyAddress,
		wethToken.address,
		projectTokenFactory.address,
		tokensPoolFactory.address,
		{
			from: contractOwnerAddress,
		},
	);

	return {
		wethToken,
		projectTokenFactory,
		tokensPoolFactory,
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

export async function deployTokensPoolFactoryInstance(
	contractOwnerAddress: string,
): Promise<TokensPoolFactoryInstance> {
	return TokensPoolFactory.new({
		from: contractOwnerAddress,
	});
}
