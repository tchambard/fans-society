import { assert } from 'chai';
import { BN, expectEvent, expectRevert } from '@openzeppelin/test-helpers';

import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import { TokensPoolFactoryInstance } from '../types/truffle/contracts/pool/TokensPoolFactory';
import {
	deployProjectTokenFactoryInstance,
	deployTokensPoolFactoryInstance,
} from './TestHelpers';

interface IToken {
	token: string;
	name: string;
	symbol: string;
}

const FSOCIETY_SUPPLY = 900000000; // 9%
const AUTHOR_SUPPLY = 100000000; // 1%
const CROWD_SUPPLY = 9000000000; // 90%

const mapTokenCreatedEvent = ({ returnValues }): IToken => ({
	token: returnValues.token,
	name: returnValues.name,
	symbol: returnValues.symbol,
});

const mapPoolCreatedEvent = ({ returnValues }) => ({
	poolAddress: returnValues.poolAddress,
	hash: returnValues._hash,
});

contract('Pools', (accounts) => {
	const administrator = accounts[0];
	const fsociety = accounts[1];
	const author1 = accounts[2];
	const author2 = accounts[3];

	let projectTokenFactory: ProjectTokenFactoryInstance;
	let tokensPoolFactory: TokensPoolFactoryInstance;

	let tokens: IToken[];

	beforeEach(async () => {
		projectTokenFactory = await deployProjectTokenFactoryInstance(administrator);
		tokensPoolFactory = await deployTokensPoolFactoryInstance(administrator);

		await projectTokenFactory.createToken(
			'token1',
			'TKN1',
			fsociety,
			FSOCIETY_SUPPLY,
			author1,
			AUTHOR_SUPPLY,
			CROWD_SUPPLY,
			{
				from: administrator,
			},
		);

		await projectTokenFactory.createToken(
			'token2',
			'TKN2',
			fsociety,
			FSOCIETY_SUPPLY,
			author2,
			AUTHOR_SUPPLY,
			CROWD_SUPPLY,
			{
				from: administrator,
			},
		);

		tokens = (
			await projectTokenFactory.getPastEvents('TokenCreated', {
				fromBlock: 0,
			})
		).map(mapTokenCreatedEvent);
	});

	describe('> createPool', () => {
		beforeEach(async () => {
			await tokensPoolFactory.createPool(tokens[0].token, tokens[1].token, {
				from: administrator,
			});
		});

		it('> should create a token pair pool', async () => {
			const events = (
				await tokensPoolFactory.getPastEvents('PoolCreated', {
					fromBlock: 0,
				})
			).map(mapPoolCreatedEvent);

			assert.lengthOf(events, 1);
			assert.isDefined(events[0].hash);
			assert.isDefined(events[0].poolAddress);
		});
	});
});
