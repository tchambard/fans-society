import { assert } from 'chai';
import { expectRevert } from '@openzeppelin/test-helpers';

import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import {
	deployProjectTokenFactoryInstance,
	getTokensCreatedFromPastEvents,
} from './TestHelpers';
import _ from 'lodash';
import { ProjectTokenERC20Instance } from '../types/truffle/contracts/tokens/ProjectTokenERC20';

const ProjectTokenERC20 = artifacts.require('ProjectTokenERC20');

contract('Tokens', (accounts) => {
	const administrator = accounts[0];
	const amm = accounts[1];
	const partner = accounts[2];
	const account3 = accounts[3];

	let projectTokenFactory: ProjectTokenFactoryInstance;

	const totalSupply = 1_000_000;
	const ammGlobalShare = 10_000;
	const ammPoolShare = 9_000;
	const partnerGlobalShare = 800_000;

	beforeEach(async () => {
		projectTokenFactory = await deployProjectTokenFactoryInstance(
			administrator,
			amm,
		);
	});

	describe('> Project token factory', () => {
		describe('> createToken', () => {
			it('> should fail with total supply lower than distributed shared', async () => {
				await expectRevert(
					projectTokenFactory.createToken(
						0,
						'Test',
						'TEST',
						100,
						ammGlobalShare + partnerGlobalShare,
						{ from: amm },
					),
					'total supply too small',
				);
			});

			it('> should create token with expected supply and max supply', async () => {
				const name = 'Test';
				const symbol = 'TEST';

				await projectTokenFactory.createToken(
					0,
					name,
					symbol,
					totalSupply,
					ammGlobalShare + partnerGlobalShare,
					{ from: amm },
				);

				const lastTokenCreated = _.last(
					await getTokensCreatedFromPastEvents(projectTokenFactory),
				);

				assert.equal(lastTokenCreated?.name, name);
				assert.equal(lastTokenCreated?.symbol, symbol);

				const erc20Instance = await ProjectTokenERC20.at(lastTokenCreated?.token);
				assert.equal(
					(await erc20Instance.totalSupply()).toNumber(),
					ammGlobalShare + partnerGlobalShare,
				);
				assert.equal(
					(await erc20Instance.maxTotalSupply()).toNumber(),
					totalSupply,
				);
			});
		});
	});

	describe('> Project token ERC20', () => {
		let erc20Instance: ProjectTokenERC20Instance;

		beforeEach(async () => {
			await projectTokenFactory.createToken(
				0,
				'Test',
				'TEST',
				totalSupply,
				ammGlobalShare + partnerGlobalShare,
				{ from: amm },
			);
			const lastTokenCreated = _.last(
				await getTokensCreatedFromPastEvents(projectTokenFactory),
			);
			erc20Instance = await ProjectTokenERC20.at(lastTokenCreated?.token);
		});

		describe('> claim', () => {
			it('> should fail when called out of amm contract', async () => {
				await expectRevert(
					erc20Instance.claim(account3, 10, { from: account3 }),
					'Caller is not AMM',
				);
			});

			it('> should fail if total supply is lower than distributed shared', async () => {
				const availableSupply = totalSupply - (ammGlobalShare + partnerGlobalShare);
				await expectRevert(
					erc20Instance.claim(account3, availableSupply + 1, {
						from: amm,
					}),
					'maxTotalSupply limit',
				);
			});

			it('> should mint new tokens', async () => {
				assert.equal((await erc20Instance.balanceOf(account3)).toNumber(), 0);
				await erc20Instance.claim(account3, 1000, { from: amm });
				assert.equal((await erc20Instance.balanceOf(account3)).toNumber(), 1000);
			});

			it('> should fail when claim is already done for same account', async () => {
				await erc20Instance.claim(account3, 1000, { from: amm });
				await expectRevert(
					erc20Instance.claim(account3, 1000 + 1, {
						from: amm,
					}),
					'already claimed',
				);
			});
		});
	});
});
