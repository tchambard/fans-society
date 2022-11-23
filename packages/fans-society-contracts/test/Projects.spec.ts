import { assert } from 'chai';
import { BN, expectEvent, expectRevert } from '@openzeppelin/test-helpers';

import { ProjectsInstance } from '../types/truffle/contracts/Projects';
import { deployProjectsInstances } from './TestHelpers';

contract('Projects', (accounts) => {
	const administrator = accounts[0];
	const fsociety = accounts[1];
	const authorAddress = accounts[2];

	let projectsContract: ProjectsInstance;

	beforeEach(async () => {
		const contracts = await deployProjectsInstances(administrator, fsociety);
		projectsContract = contracts.projects;
	});

	describe('> createProject', () => {
		it('> should succeed when called with contract owner address', async () => {
			const name = 'The god father';
			const description = 'A very famous mafia film';
			const symbol = 'TGF';
			const target = 10000;
			const minInvest = 10;

			const receipt = await projectsContract.createProject(
				authorAddress,
				name,
				symbol,
				description,
				BN(target),
				BN(minInvest),
				{ from: administrator },
			);

			await expectEvent(receipt, 'ProjectCreated', {
				id: BN(1),
				name,
				symbol,
				description,
				target: BN(target),
				minInvest: BN(minInvest),
				authorAddress,
			});

			const createdProject = await projectsContract.projects(1);
			assert.equal(createdProject['name'], name);
			assert.equal(createdProject['symbol'], symbol);
			assert.equal(createdProject['description'], description);
			assert.equal(createdProject['fund'].toNumber(), 0);
			assert.equal(createdProject['liquidity'].toNumber(), 0);
			assert.equal(createdProject['target'].toNumber(), target);
			assert.equal(createdProject['minInvest'].toNumber(), minInvest);
			assert.equal(createdProject['status'].toNumber(), 0);
			assert.equal(createdProject['authorAddress'], authorAddress);
			assert.equal(
				createdProject['tokenAddress'],
				'0x0000000000000000000000000000000000000000',
			);
		});
	});
});
