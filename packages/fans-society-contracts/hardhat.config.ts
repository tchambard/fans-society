import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-truffle5';
import 'hardhat-gas-reporter';
import 'hardhat-deploy';

import { task__createProjects } from './tasks/create-projects';

require('dotenv').config();
const {
	DEPLOYER_PRIVATE_KEY,
	ALCHEMY_FANS_SOCIETY_GOERLI_API_KEY,
	ALCHEMY_FANS_SOCIETY_MUMBAI_API_KEY,
	ETHERSCAN_API_KEY,
} = process.env;

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
	etherscan: {
		apiKey: {} as any,
	},
};

if (ALCHEMY_FANS_SOCIETY_GOERLI_API_KEY && DEPLOYER_PRIVATE_KEY) {
	config.networks!.goerli = {
		url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_FANS_SOCIETY_GOERLI_API_KEY}`,
		accounts: [DEPLOYER_PRIVATE_KEY],
	};
}

if (ALCHEMY_FANS_SOCIETY_MUMBAI_API_KEY && DEPLOYER_PRIVATE_KEY) {
	config.networks!.mumbai = {
		url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_FANS_SOCIETY_MUMBAI_API_KEY}`,
		accounts: [DEPLOYER_PRIVATE_KEY],
	};
}

if (ETHERSCAN_API_KEY) {
	(config.etherscan!.apiKey as any).goerli = ETHERSCAN_API_KEY;
}

task('create-projects', 'Create projects').setAction(task__createProjects);

export default config;
