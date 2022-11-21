import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { deployments, getUnnamedAccounts } = hre;
	const { deploy } = deployments;

	const [deployer] = await getUnnamedAccounts();

	let wethTokenAddress: string;
	if (hre.network.name === 'localhost') {
		wethTokenAddress = (
			await deploy('WETHToken', {
				from: deployer,
				log: true,
				autoMine: true,
			})
		).address;
	} else {
		// TODO
		wethTokenAddress = '';
	}

	const { address: projectTokenFactoryAddress } = await deploy(
		'ProjectTokenFactory',
		{
			from: deployer,
			log: true,
			autoMine: true,
		},
	);

	const { address: tokensPoolFactoryAddress } = await deploy(
		'TokensPoolFactory',
		{
			from: deployer,
			log: true,
			autoMine: true,
		},
	);

	await deploy('FansSociety', {
		from: deployer,
		log: true,
		autoMine: true,
		args: [
			wethTokenAddress,
			projectTokenFactoryAddress,
			tokensPoolFactoryAddress,
		],
	});
};
export default func;
func.tags = ['Voting'];
