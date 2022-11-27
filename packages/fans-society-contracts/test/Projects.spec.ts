import * as _ from 'lodash';
import { assert } from 'chai';
import { BN, expectEvent, expectRevert } from '@openzeppelin/test-helpers';

import { deployProjectsInstances } from './TestHelpers';
import { AllEvents, AMMInstance } from '../types/truffle/contracts/AMM';
import { ProjectTokenFactoryInstance } from '../types/truffle/contracts/tokens/ProjectTokenFactory';
import { ProjectTokenERC20Instance } from '../types/truffle/contracts/tokens/ProjectTokenERC20';
import { TokensPoolFactoryInstance } from '../types/truffle/contracts/pools/TokensPoolFactory';
import { TokensPoolInstance } from '../types/truffle/contracts/pools/TokensPool';

const ProjectTokenERC20 = artifacts.require('ProjectTokenERC20');
const TokensPool = artifacts.require('TokensPool');

enum ProjectStatus {
	Opened,
	Aborted,
	Completed,
	Launched,
}

const address0 = '0x0000000000000000000000000000000000000000';

const MULTIPLIER = 100;

const AMM_SUPPLY = 15;
const INVESTORS_SUPPLY = 15;
const AUTHOR_SUPPLY = 70;

const AMM_TOKENS_TEAM_SHARES = 20;
const AMM_TOKENS_POOL_SHARES = 80;
const AUTHOR_TOKENS_POOL_SHARES = 80;

const AMM_FUNDS = 15;
const AUTHOR_FUNDS = 85;
const AMM_FUNDS_FSOCIETY_SHARES = 20;
const AMM_FUNDS_POOL_SHARES = 80;
const AUTHOR_FUNDS_POOL_SHARES = 30;

contract.only('Projects', (accounts) => {
	const administrator = accounts[0];
	const fsociety = accounts[1];
	const authorAddress = accounts[2];
	const fans = accounts.splice(3);

	let amm: AMMInstance;
	let projectTokenFactory: ProjectTokenFactoryInstance;
	let tokensPoolFactory: TokensPoolFactoryInstance;

	async function getTokensCreatedFromPastEvents() {
		return (
			await projectTokenFactory.getPastEvents('TokenCreated', { fromBlock: 0 })
		).map(({ returnValues }) => ({
			token: returnValues.token,
			name: returnValues.name,
			symbol: returnValues.symbol,
		}));
	}

	async function getPoolsCreatedFromPastEvents() {
		return (
			await tokensPoolFactory.getPastEvents('PoolCreated', { fromBlock: 0 })
		).map(({ returnValues }) => ({
			pool: returnValues.pool,
			token1: returnValues.token1,
			token2: returnValues.token2,
		}));
	}

	async function getTokenTransfersFromPastEvents(
		erc20Instance: ProjectTokenERC20Instance,
	) {
		return (await erc20Instance.getPastEvents('Transfer', { fromBlock: 0 })).map(
			({ returnValues }) => ({
				from: returnValues.from,
				to: returnValues.to,
				value: +returnValues.value,
			}),
		);
	}

	beforeEach(async () => {
		const contracts = await deployProjectsInstances(administrator, fsociety);
		amm = contracts.amm;
		projectTokenFactory = contracts.projectTokenFactory;
		tokensPoolFactory = contracts.tokensPoolFactory;
	});

	const name = 'The god father';
	const description = 'A very famous mafia film';
	const symbol = 'TGF';
	const target = web3.utils.toWei('1'); // 1 ETH
	const minInvest = web3.utils.toWei('0.01'); // 0.1 ETH
	const maxInvest = web3.utils.toWei('0.1'); // 0.01 ETH
	const totalSupply = 10_000; // multiplier is 10_000 on solidity side so total supply is 100_000_000

	describe('> no project exixt', () => {
		it('> createProject should succeed when called with contract owner address', async () => {
			const receipt = await amm.createProject(
				authorAddress,
				name,
				symbol,
				description,
				target,
				minInvest,
				maxInvest,
				BN(totalSupply),
				{ from: administrator },
			);

			await expectEvent(receipt, 'ProjectCreated', {
				id: BN(1),
				name,
				symbol,
				description,
				target,
				minInvest,
				maxInvest,
				totalSupply: BN(totalSupply),
				authorAddress,
			});

			const createdProject = await amm.projects(1);
			assert.equal(createdProject['id'].toNumber(), 1);
			assert.equal(createdProject['name'], name);
			assert.equal(createdProject['symbol'], symbol);
			assert.equal(createdProject['description'], description);
			assert.equal(createdProject['fund'], 0);
			assert.equal(createdProject['target'], target);
			assert.equal(createdProject['minInvest'], minInvest);
			assert.equal(createdProject['maxInvest'], maxInvest);
			assert.equal(createdProject['totalSupply'].toNumber(), totalSupply);
			assert.equal(createdProject['status'].toNumber(), 0);
			assert.equal(createdProject['authorAddress'], authorAddress);
			assert.equal(createdProject['tokenAddress'], address0);
		});
	});

	describe('> one project is created', () => {
		let projectId: number;

		beforeEach(async () => {
			await amm.createProject(
				authorAddress,
				name,
				symbol,
				description,
				BN(target),
				BN(minInvest),
				BN(maxInvest),
				BN(totalSupply),
				{ from: administrator },
			);
			const createdProject = await amm.projects(1);
			projectId = createdProject['id'].toNumber();
		});

		describe('> commitments', () => {
			it('> commit on project with unsufficient amount should fail', async () => {
				// TODO
			});

			it('> commit on project with too large amount should fail', async () => {
				// TODO
			});

			it('> many commits on project should succeed until commitments is larger than maxInvest', async () => {
				// TODO
			});

			it('> commit on project with correct correct amount should succeed', async () => {
				const amount = web3.utils.toWei('0.1', 'ether');
				const receipt = await amm.commitOnProject(projectId, {
					from: fans[0],
					value: amount,
				});
				await expectEvent(receipt, 'Committed', {
					id: BN(1),
					caller: fans[0],
					amount,
				});
			});

			it('> withdraw should succeed if commitments is done before', async () => {
				const amount = web3.utils.toWei('0.1', 'ether');
				await amm.commitOnProject(projectId, {
					from: fans[0],
					value: amount,
				});
				const receipt = await amm.withdrawOnProject(projectId, {
					from: fans[0],
				});
				await expectEvent(receipt, 'Withdrawed', {
					id: BN(1),
					caller: fans[0],
					amount,
				});
			});
		});

		describe('> project funds are completed', () => {
			const nbFans = 10;

			const expectedAuthorSupply = totalSupply * AUTHOR_SUPPLY * MULTIPLIER;
			const expectedAmmSupply = totalSupply * AMM_SUPPLY * MULTIPLIER;

			beforeEach(async () => {
				for (let i = 0; i < nbFans; i++) {
					await amm.commitOnProject(projectId, {
						from: fans[i],
						value: web3.utils.toWei('0.1', 'ether'),
					});
				}
				const event = _.last(
					await amm.getPastEvents('ProjectStatusChanged', {
						fromBlock: 0,
					}),
				);
				assert.equal(event?.returnValues.status, ProjectStatus.Completed);
			});

			it('> launchProject should succeed when funds are completed', async () => {
				const receipt = await amm.launchProject(projectId, { from: administrator });

				await expectEvent(receipt, 'ProjectStatusChanged', {
					id: BN(1),
					status: BN(ProjectStatus.Launched),
				});

				const lastTokenCreated = _.last(await getTokensCreatedFromPastEvents());

				assert.equal(lastTokenCreated?.name, name);
				assert.equal(lastTokenCreated?.symbol, symbol);

				const erc20Instance = await ProjectTokenERC20.at(lastTokenCreated?.token);
				assert.equal(
					(await erc20Instance.totalSupply()).toNumber(),
					expectedAuthorSupply + expectedAmmSupply,
				);
				assert.equal(
					(await erc20Instance.maxTotalSupply()).toNumber(),
					totalSupply * 10_000,
				);
			});

			describe('> project is launched', () => {
				let launchProjectReceipt: Truffle.TransactionResponse<AllEvents>;
				let erc20Instance: ProjectTokenERC20Instance;
				let poolInstance: TokensPoolInstance;

				beforeEach(async () => {
					launchProjectReceipt = await amm.launchProject(projectId, {
						from: administrator,
					});
					const tokenCreated = _.last(await getTokensCreatedFromPastEvents());
					erc20Instance = await ProjectTokenERC20.at(tokenCreated?.token);
					const poolCreated = _.last(await getPoolsCreatedFromPastEvents());
					poolInstance = await TokensPool.at(poolCreated?.pool);
				});

				it('> should create new token with dispatched supply', async () => {
					const transfers = await getTokenTransfersFromPastEvents(erc20Instance);

					const expectedAmmToPoolTransferAmount =
						(expectedAmmSupply * AMM_TOKENS_POOL_SHARES) / 100;

					const expectedAuthorToPoolTransferAmount =
						(expectedAuthorSupply * AUTHOR_TOKENS_POOL_SHARES) / 100;

					assert.sameDeepOrderedMembers(transfers, [
						// transfer from erc20 to amm
						{
							from: address0,
							to: amm.address,
							value: expectedAmmSupply,
						},
						// transfer from erc20 to author
						{
							from: address0,
							to: authorAddress,
							value: expectedAuthorSupply,
						},
						// transfer from amm to pool
						{
							from: amm.address,
							to: poolInstance.address,
							value: expectedAmmToPoolTransferAmount,
						},
						// transfer from author to pool
						{
							from: authorAddress,
							to: poolInstance.address,
							value: expectedAuthorToPoolTransferAmount,
						},
					]);

					assert.equal(
						(await erc20Instance.balanceOf(authorAddress)).toNumber(),
						expectedAuthorSupply - expectedAuthorToPoolTransferAmount,
						'Author balance assertion failed',
					);

					assert.equal(
						(await erc20Instance.balanceOf(amm.address)).toNumber(),
						expectedAmmSupply - expectedAmmToPoolTransferAmount,
						'AMM balance assertion failed',
					);
				});

				it('> should allow a project participant to claim his token share', async () => {
					const receipt = await amm.claimProjectTokens(projectId, { from: fans[0] });
					const expectedAmount = (totalSupply * INVESTORS_SUPPLY) / nbFans; // 150_000

					await expectEvent(receipt, 'TokensClaimed', {
						projectId: BN(1),
						caller: fans[0],
						token: erc20Instance.address,
						amount: BN(expectedAmount),
					});

					assert.equal(
						(await erc20Instance.balanceOf(fans[0])).toNumber(),
						expectedAmount,
						'Participant balance assertion failed',
					);
				});
			});
		});
	});
});
