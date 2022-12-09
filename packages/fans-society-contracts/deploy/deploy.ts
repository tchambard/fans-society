import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const weth = {
	goerli: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
};

const ethUsdAggregator = {
	goerli: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
};

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { deployments, getUnnamedAccounts } = hre;
	const { deploy } = deployments;

	const [deployer] = await getUnnamedAccounts();

	const fansSocietyAddress = '0x3827b4a96Ce521f8E408c124D7DbE2B6c1F78E1F';

	let wethTokenAddress: string;
	let ethUsdAggregatorAddress: string;
	if (hre.network.name === 'localhost') {
		wethTokenAddress = (
			await deploy('WETHToken', {
				from: deployer,
				log: true,
				autoMine: true,
			})
		).address;
		ethUsdAggregatorAddress = '0x0000000000000000000000000000000000000000';
	} else {
		wethTokenAddress = weth[hre.network.name];
		ethUsdAggregatorAddress = ethUsdAggregator[hre.network.name];
	}

	if (!wethTokenAddress) {
		throw new Error('Missing weth token address');
	}
	if (!ethUsdAggregatorAddress) {
		throw new Error('Missing eth/usd aggregator token address');
	}

	const projectTokenImplementation = await deploy('ProjectTokenERC20', {
		from: deployer,
	});
	const projectTokenFactory = await deploy('ProjectTokenFactory', {
		from: deployer,
		log: true,
		autoMine: true,
		args: [projectTokenImplementation.address],
	});

	const poolImplementation = await deploy('Pool', { from: deployer });
	const poolFactory = await deploy('PoolFactory', {
		from: deployer,
		log: true,
		autoMine: true,
		args: [poolImplementation.address, fansSocietyAddress],
	});

	await deploy('AMM', {
		from: deployer,
		log: true,
		autoMine: true,
		args: [
			fansSocietyAddress,
			wethTokenAddress,
			ethUsdAggregatorAddress,
			projectTokenFactory.address,
			poolFactory.address,
		],
	});
};
export default func;
func.tags = ['AMM'];
