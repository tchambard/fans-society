import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-truffle5';
import 'hardhat-gas-reporter';
import 'hardhat-deploy';

require('dotenv').config();
const { MNEMONIC, GOERLI_PRIVATE_KEY, INFURA_API_KEY } = process.env;

const config: HardhatUserConfig = {
	solidity: {
		version: '0.8.17',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	typechain: {
		outDir: 'types/truffle',
		target: 'truffle-v5',
	},
	networks: {
		localhost: {
			url: 'http://localhost:8545/',
		},
	},
	gasReporter: {
		currency: 'EUR',
		enabled: process.env.REPORT_GAS ? true : false,
		showTimeSpent: true,
	},
};

if (INFURA_API_KEY && GOERLI_PRIVATE_KEY) {
	config.networks!.goerli = {
		url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
		accounts: [GOERLI_PRIVATE_KEY],
	};
}

export default config;
