import { assert } from 'chai';
import { BN, expectEvent, expectRevert } from '@openzeppelin/test-helpers';

import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import { TokensPoolFactoryInstance } from '../types/truffle/contracts/pools/TokensPoolFactory';
import {
	deployProjectTokenFactoryInstance,
	deployTokensPoolFactoryInstance,
	getPoolsCreatedFromPastEvents,
	getTokensCreatedFromPastEvents,
	IToken,
} from './TestHelpers';

contract('Pools', (accounts) => {
	const administrator = accounts[0];
	const author1 = accounts[1];
	const author2 = accounts[2];

	let projectTokenFactory: ProjectTokenFactoryInstance;
	let tokensPoolFactory: TokensPoolFactoryInstance;

	let tokens: IToken[];

	const t1_totalSupply = 1_000_000;
	const t1_ammGlobalShare = 10_000;
	const t1_ammPoolShare = 9_000;
	const t1_authorGlobalShare = 800_000;
	const t1_authorPoolShare = 700_000;

	const t2_totalSupply = 1_000_000;
	const t2_ammGlobalShare = 10_000;
	const t2_ammPoolShare = 9_000;
	const t2_authorGlobalShare = 800_000;
	const t2_authorPoolShare = 700_000;

	beforeEach(async () => {
		projectTokenFactory = await deployProjectTokenFactoryInstance(administrator);
		tokensPoolFactory = await deployTokensPoolFactoryInstance(administrator);

		await projectTokenFactory.createToken(
			'token1',
			'TKN1',
			t1_totalSupply,
			t1_ammGlobalShare,
			t1_ammPoolShare,
			t1_authorGlobalShare,
			t1_authorPoolShare,
			administrator,
			author1,
			{
				from: administrator,
			},
		);

		await projectTokenFactory.createToken(
			'token2',
			'TKN2',
			t2_totalSupply,
			t2_ammGlobalShare,
			t2_ammPoolShare,
			t2_authorGlobalShare,
			t2_authorPoolShare,
			administrator,
			author2,
			{
				from: administrator,
			},
		);

		tokens = await getTokensCreatedFromPastEvents(projectTokenFactory);
	});

	describe('> createPool', () => {
		beforeEach(async () => {
			await tokensPoolFactory.createPool(tokens[0].token, tokens[1].token, {
				from: administrator,
			});
		});

		it('> should create a token pair pool', async () => {
			const events = await getPoolsCreatedFromPastEvents(tokensPoolFactory);

			assert.lengthOf(events, 1);
			assert.isDefined(events[0].pool);
		});
	});
});
