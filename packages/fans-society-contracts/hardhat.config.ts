import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-truffle5';
import 'hardhat-gas-reporter';
import 'hardhat-deploy';

import { task__createProjects } from './tasks/create-projects';

require('dotenv').config();
const { GOERLI_PRIVATE_KEY, ALCHEMY_FANS_SOCIETY_API_KEY } = process.env;

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

if (ALCHEMY_FANS_SOCIETY_API_KEY && GOERLI_PRIVATE_KEY) {
	config.networks!.goerli = {
		url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_FANS_SOCIETY_API_KEY}`,
		accounts: [GOERLI_PRIVATE_KEY],
	};
}

task('create-projects', 'Create projects').setAction(task__createProjects);

export default config;
