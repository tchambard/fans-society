import { assert } from 'chai';
import { BN, expectEvent, expectRevert } from '@openzeppelin/test-helpers';

import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import { deployProjectTokenFactoryInstance } from './TestHelpers';

const FSOCIETY_SUPPLY = 900000000; // 9%
const AUTHOR_SUPPLY = 100000000; // 1%
const CROWD_SUPPLY = 9000000000; // 90%

const mapTokenCreatedEvent = ({ returnValues }) => ({
	token: returnValues.token,
	name: returnValues.name,
	symbol: returnValues.symbol,
});

contract('Tokens', (accounts) => {
	const administrator = accounts[0];
	const fsociety = accounts[1];
	const author = accounts[2];
	const account3 = accounts[3];

	let projectTokenFactory: ProjectTokenFactoryInstance;

	beforeEach(async () => {
		projectTokenFactory = await deployProjectTokenFactoryInstance(administrator);
	});

	describe('> Some access controls prevent functions to be called by non owners', () => {
		describe('> createToken should fail when called with registered voter address', async () => {
			await expectRevert(
				projectTokenFactory.createToken(
					'test',
					'TEST',
					fsociety,
					FSOCIETY_SUPPLY,
					author,
					AUTHOR_SUPPLY,
					CROWD_SUPPLY,
					{
						from: fsociety,
					},
				),
				'Ownable: caller is not the owner',
			);
		});
	});

	describe('> createToken', () => {
		const name = 'The god father';
		const symbol = 'TGF';

		beforeEach(async () => {
			await projectTokenFactory.createToken(
				name,
				symbol,
				fsociety,
				FSOCIETY_SUPPLY,
				author,
				AUTHOR_SUPPLY,
				CROWD_SUPPLY,
				{ from: administrator },
			);
		});

		it('> should succeed when called with contract owner address', async () => {
			const event = (
				await projectTokenFactory.getPastEvents('TokenCreated', {
					fromBlock: 0,
				})
			).map(mapTokenCreatedEvent)[0];

			assert.equal(event.name, name);
			assert.equal(event.symbol, symbol);
			assert.isDefined(event.token);
		});
	});
});
