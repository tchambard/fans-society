import Web3 from 'web3';

export class ClientFactory {
	public static web3() {
		return new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
	}
}
