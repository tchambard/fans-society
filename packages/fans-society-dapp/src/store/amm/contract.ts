import Web3 from 'web3';

import { contracts } from 'fans-society-contracts';
import {
	getContractInfo,
	getNetworkInfo,
	IDynamicContractImportDefinitions,
	WETH_ADDRESSES,
} from 'src/eth-network/helpers';

const imports: IDynamicContractImportDefinitions = {
	localhost: () => import('fans-society-contracts/deployments/localhost.json'),
	goerli: () => import('fans-society-contracts/deployments/goerli.json'),
	mumbai: () => import('fans-society-contracts/deployments/mumbai.json'),
};

export async function getAMMContract(web3: Web3): Promise<contracts.AMM> {
	const contractInfo = await getContractInfo(web3, imports, 'AMM');
	return new web3.eth.Contract(
		contractInfo.abi,
		contractInfo.address,
	) as unknown as contracts.AMM;
}

export async function getTokensFactoryContract(
	web3: Web3,
): Promise<contracts.tokens.ProjectTokenFactory> {
	const contractInfo = await getContractInfo(
		web3,
		imports,
		'ProjectTokenFactory',
	);
	return new web3.eth.Contract(
		contractInfo.abi,
		contractInfo.address,
	) as unknown as contracts.tokens.ProjectTokenFactory;
}

export async function getTokenContract(
	web3: Web3,
	address: string,
): Promise<contracts.tokens.ProjectTokenERC20> {
	const contractInfo = await getContractInfo(web3, imports, 'ProjectTokenERC20');
	return new web3.eth.Contract(
		contractInfo.abi,
		address,
	) as unknown as contracts.tokens.ProjectTokenERC20;
}

export async function getPoolFactoryContract(
	web3: Web3,
): Promise<contracts.pools.PoolFactory> {
	const contractInfo = await getContractInfo(web3, imports, 'PoolFactory');
	return new web3.eth.Contract(
		contractInfo.abi,
		contractInfo.address,
	) as unknown as contracts.pools.PoolFactory;
}

export async function getPoolContract(
	web3: Web3,
	address: string,
): Promise<contracts.pools.Pool> {
	const contractInfo = await getContractInfo(web3, imports, 'Pool');
	return new web3.eth.Contract(
		contractInfo.abi,
		address,
	) as unknown as contracts.pools.Pool;
}

export async function getWethAddress(web3: Web3): Promise<string> {
	const networkInfo = await getNetworkInfo(web3, imports);
	if (WETH_ADDRESSES[networkInfo.name]) {
		return WETH_ADDRESSES[networkInfo.name];
	}
	const contractInfo = networkInfo.contracts.WETHToken;
	if (!contractInfo) {
		throw new Error(`Unknown contract WETHToken`);
	}
	return contractInfo.address;
}
