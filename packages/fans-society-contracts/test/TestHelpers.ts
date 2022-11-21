import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import { TokensPoolFactoryInstance } from '../types/truffle/contracts/pool/TokensPoolFactory';
import { ProjectsInstance } from '../types/truffle/contracts/Projects';

const ProjectTokenFactory = artifacts.require('ProjectTokenFactory');
const TokensPoolFactory = artifacts.require('TokensPoolFactory');
const Projects = artifacts.require('Projects');

export async function deployProjectsInstances(
	contractOwnerAddress: string,
	fansSocietyAddress: string,
): Promise<{
	projectTokenFactory: ProjectTokenFactoryInstance;
	tokensPoolFactory: TokensPoolFactoryInstance;
	projects: ProjectsInstance;
}> {
	const projectTokenFactory = await deployProjectTokenFactoryInstance(
		contractOwnerAddress,
	);
	const tokensPoolFactory = await deployTokensPoolFactoryInstance(
		contractOwnerAddress,
	);

	const projects = await Projects.new(
		fansSocietyAddress,
		projectTokenFactory.address,
		tokensPoolFactory.address,
		{
			from: contractOwnerAddress,
		},
	);

	return {
		projectTokenFactory,
		tokensPoolFactory,
		projects,
	};
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
