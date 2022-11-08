import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { deployments, getUnnamedAccounts } = hre;
	const { deploy } = deployments;

	const [deployer] = await getUnnamedAccounts();

	await deploy('Voting', {
		from: deployer,
		log: true,
		autoMine: true, // speed up deployment on local network, no effect on live networks
	});
};
export default func;
func.tags = ['Voting'];
