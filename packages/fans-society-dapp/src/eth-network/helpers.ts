// tslint:disable:no-console
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
	1: 'mainnet',
	5: 'goerli',
	31337: 'localhost',
};

export async function getContractInfo(
	web3: Web3,
	importsDefinition: IDynamicContractImportDefinitions,
	contractName: string,
): Promise<IContractInfo> {
	const networkId = await web3.eth.net.getId();
	const networkAlias = NETWORKS[networkId];
	if (!networkAlias) {
		throw new Error(`Unknown network ${networkId}`);
	}
	const networkInfo = await importsDefinition[networkAlias]?.();
	if (!networkInfo) {
		throw new Error(`Network ${networkAlias} not supported`);
	}
	const contractInfo = networkInfo.contracts[contractName];
	if (!contractInfo) {
		throw new Error(`Unknown contract ${contractName}`);
	}
	return contractInfo;
}

export function findRpcMessage(error: Error): string {
	const rpcError = error.message.match(/{(.*)}/g);
	const rpcMsg = rpcError?.length && JSON.parse(rpcError[0]);
	return (
		rpcMsg?.value.data.message.replace(
			'VM Exception while processing transaction: revert ',
			'',
		) || error.message
	);
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
