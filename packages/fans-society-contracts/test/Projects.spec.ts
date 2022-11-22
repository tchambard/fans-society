import { assert } from 'chai';
import { BN, expectEvent, expectRevert } from '@openzeppelin/test-helpers';

import { ProjectsInstance } from '../types/truffle/contracts/Projects';
import { deployProjectsInstances } from './TestHelpers';

contract('Projects', (accounts) => {
	const administrator = accounts[0];
	const fsociety = accounts[1];
	const author = accounts[2];

	let projects: ProjectsInstance;

	beforeEach(async () => {
		const contracts = await deployProjectsInstances(administrator, fsociety);
		projects = contracts.projects;
	});

	describe('> createProject', () => {
		it('> should succeed when called with contract owner address', async () => {
			const name = 'The god father';
			const description = 'A very famous mafia film';
			const symbol = 'TGF';
			const target = 10000;
			const startsAt = Math.floor(Date.now() / 1000) + 10;
			const endsAt = Math.floor(Date.now() / 1000) + 3600;

			const receipt = await projects.createProject(
				author,
				name,
				symbol,
				description,
				target,
				startsAt,
				endsAt,
				{ from: administrator },
			);

			await expectEvent(receipt, 'ProjectCreated', {
				id: BN(1),
				name,
				description,
				author: author,
				target: BN(target),
				startsAt: BN(startsAt),
				endsAt: BN(endsAt),
			});

			const createdProject = await projects.projects(1);
			assert.equal(createdProject['0'], name);
			assert.equal(createdProject['1'], description);
			assert.equal(createdProject['2'], symbol);
			assert.equal(createdProject['3'].toNumber(), target);
			assert.equal(createdProject['4'].toNumber(), 0);
			assert.equal(createdProject['5'].toNumber(), 0);
			assert.equal(createdProject['6'].toNumber(), startsAt);
			assert.equal(createdProject['7'].toNumber(), endsAt);
			assert.equal(createdProject['8'], false);
			assert.equal(createdProject['9'], author);
			assert.equal(
				createdProject['10'],
				'0x0000000000000000000000000000000000000000',
			);
		});
	});
});
