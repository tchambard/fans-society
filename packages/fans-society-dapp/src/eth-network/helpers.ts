// tslint:disable:no-console
import * as _ from 'lodash';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import services from 'src/services';
import Web3 from 'web3';
import { LOAD_NETWORK_INFO, SET_CURRENT_ACCOUNT } from './actions';

export interface IContractInfo {
	address: string;
	abi: any[];
}

export interface INetworkContractsInfo {
	name: string;
	chainId: string;
	contracts: {
		[contractName: string]: IContractInfo;
	};
}

export interface IDynamicContractImportDefinitions {
	[networkAlias: string]: () => Promise<INetworkContractsInfo | undefined>;
}

export const NETWORKS = {
	5: 'goerli',
	1337: 'localhost',
};

export const WETH_ADDRESSES: any = {
	goerli: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
};

export async function getNetworkInfo(
	web3: Web3,
	importsDefinition: IDynamicContractImportDefinitions,
) {
	const networkId = await web3.eth.net.getId();
	const networkAlias = NETWORKS[networkId];
	if (!networkAlias) {
		throw new Error(`Unknown network ${networkId}`);
	}
	const networkInfo = await importsDefinition[networkAlias]?.();
	if (!networkInfo) {
		throw new Error(`Network ${networkAlias} not supported`);
	}
	return networkInfo;
}

export async function getContractInfo(
	web3: Web3,
	importsDefinition: IDynamicContractImportDefinitions,
	contractName: string,
): Promise<IContractInfo> {
	const networkInfo = await getNetworkInfo(web3, importsDefinition);
	const contractInfo = networkInfo.contracts[contractName];
	if (!contractInfo) {
		throw new Error(`Unknown contract ${contractName}`);
	}
	return contractInfo;
}

export function findRpcMessage(error: Error): string {
	const evmRevertMsg = 'Transaction has been reverted by the EVM';
	if (error.message.startsWith(evmRevertMsg)) {
		return evmRevertMsg;
	}
	let result: string;
	_.forEach(
		[
			'VM Exception while processing transaction: revert ',
			'execution reverted: ',
		],
		(searchText) => {
			const rpcError = error.message.match(/{(.*)}/g);
			let rpcMsg = rpcError?.length && JSON.parse(rpcError[0]);
			if (rpcMsg?.value) {
				result = rpcMsg?.value.data.message.replace(searchText, '');
				return false;
			}
			rpcMsg = error.message.match(new RegExp(`"${searchText}(.*)"`, 'g'));
			const message = rpcMsg?.[0].replace(searchText, '');
			result = message?.substring(1, message.length - 1);
			return false;
		},
	);

	return result || error.message;
}

export function useNetwork(account: string | undefined): void {
	const dispatch = useDispatch();

	useEffect(() => {
		const web3 = services.web3;
		const provider = web3.givenProvider;

		provider.on('accountsChanged', async (accounts: string[]) => {
			// force get account address as accounts[0] does not have correct case
			const _account = (await web3.eth.requestAccounts())[0];
			dispatch(SET_CURRENT_ACCOUNT(_account));
		});

		provider.on('chainChanged', (chainId: number) => {
			window.location.reload();
		});

		provider.on('disconnect', (code: number, reason: string) => {
			dispatch(SET_CURRENT_ACCOUNT(undefined));
		});

		dispatch(LOAD_NETWORK_INFO.request());
	}, []);
}
