import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { deployments, getUnnamedAccounts } = hre;
	const { deploy } = deployments;

	const [deployer] = await getUnnamedAccounts();

	const fansSocietyAddress = '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720'; // TODO

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

	const { address: poolFactoryAddress } = await deploy('PoolFactory', {
		from: deployer,
		log: true,
		autoMine: true,
		args: [fansSocietyAddress],
	});

	await deploy('AMM', {
		from: deployer,
		log: true,
		autoMine: true,
		args: [
			fansSocietyAddress,
			wethTokenAddress,
			projectTokenFactoryAddress,
			poolFactoryAddress,
		],
	});
};
export default func;
func.tags = ['AMM'];
