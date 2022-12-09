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
		ethUsdAggregatorAddress = '0x0000000000000000000000000000000000000000'; // no aggregator on localhost
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

	// Main fans society protocol contract
	const amm = await deploy('AMM', {
		from: deployer,
		log: true,
		autoMine: true,
		args: [fansSocietyAddress, wethTokenAddress, ethUsdAggregatorAddress],
	});

	// deploy implementation of ProjectTokenERC20 for future Clones
	const projectTokenImplementation = await deploy('ProjectTokenERC20', {
		from: deployer,
	});

	// deploy ProjectToken factory
	const tokenFactory = await deploy('ProjectTokenFactory', {
		from: deployer,
		log: true,
		autoMine: true,
		args: [amm.address, projectTokenImplementation.address],
	});

	// deploy implementation of Pool for future Clones
	const poolImplementation = await deploy('Pool', { from: deployer });

	// deploy Pool factory
	const poolFactory = await deploy('PoolFactory', {
		from: deployer,
		log: true,
		autoMine: true,
		args: [amm.address, poolImplementation.address, fansSocietyAddress],
	});

	const ammContract = await hre.ethers.getContractAt('AMM', amm.address);
	await ammContract.setFactories(tokenFactory.address, poolFactory.address, {
		from: deployer,
	});
};
export default func;
func.tags = ['AMM'];
