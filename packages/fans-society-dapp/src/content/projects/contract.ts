import Web3 from 'web3';

import { contracts } from 'fans-society-contracts';
import {
	getContractInfo,
	IDynamicContractImportDefinitions,
} from 'src/eth-network/helpers';

const imports: IDynamicContractImportDefinitions = {
	localhost: () => import('fans-society-contracts/deployments/localhost.json'),
	// goerli: () => import('fans-society-contracts/deployments/goerli.json'),
	// mumbai: () => import('fans-society-contracts/deployments/mumbai.json'),
};

export async function getAMMContract(
	web3: Web3,
): Promise<contracts.AMM> {
	const contractInfo = await getContractInfo(web3, imports, 'FansSociety');
	return new web3.eth.Contract(
		contractInfo.abi,
		contractInfo.address,
	) as unknown as contracts.AMM;
}
