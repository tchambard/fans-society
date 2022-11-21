// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { IProjectTokenFactory } from './tokens/interfaces/IProjectTokenFactory.sol';
import { ITokensPoolFactory } from './pools/interfaces/ITokensPoolFactory.sol';

contract Projects is Ownable {
	struct Project {
		string name;
		string description;
		string symbol;
		uint256 target;
		uint256 fund;
		uint256 liquidity;
		uint32 startsAt;
		uint32 endsAt;
		bool completed;
		address authorAddress;
		address tokenAddress;
	}

	address internal wethTokenAddress;

	address internal tokenFactoryAddress;
	address internal poolFactoryAddress;

	uint256 private constant FSOCIETY_SUPPLY = 27;
	uint256 private constant AUTHOR_SUPPLY = 27;
	uint256 private constant LIQUIDITY_SUPPLY = 30;
	uint256 private constant INVESTORS_SUPPLY = 35;

	uint256 private constant MAX_DURATION = 604800; // 1 week

	uint256 private constant PRECISION = 2;


	uint256 public count;

	mapping(uint256 => Project) public projects;

	mapping(uint256 => mapping(address => uint256)) public commitments;

	event ProjectCreated(
		uint256 id,
		string name,
		string description,
		uint256 target,
		uint32 indexed startsAt,
		uint32 indexed endsAt,
		address indexed author
	);

	event ProjectCancelled(uint256 id);

	event Committed(uint256 indexed id, address indexed caller, uint256 amount);

	event Withdrawed(uint256 indexed id, address indexed caller, uint256 amount);

	event Claimed(uint256 indexed id, address indexed caller, uint256 amount);

	event ProjectCompleted(uint256 indexed id, uint fund, uint liquidity);

	event ProjectValidated(uint256 indexed id);

	modifier onlyAuthor(uint256 _id) {
		require(msg.sender == projects[_id].authorAddress, 'Not author');
		_;
	}

	modifier crowdfundingOpened(uint256 _id) {
		//require(block.timestamp >= projects[_id].startsAt, 'not started');
		require(block.timestamp <= projects[_id].endsAt, 'Already ended');
		require(projects[_id].completed == false, 'Project completed');
		_;
	}

	modifier crowdfundingClosed(uint256 _id) {
		require(
			block.timestamp > projects[_id].endsAt || projects[_id].completed,
			'not closed'
		);
		_;
	}

	modifier isCommited(uint256 _id) {
		require(commitments[_id][msg.sender] >= 0, 'No commitment');
		_;
	}

	constructor(
		address _wethTokenAddress,
		address _tokenFactoryAddress, 
		address _poolFactoryAddress
	) {
		wethTokenAddress = _wethTokenAddress;
		tokenFactoryAddress = _tokenFactoryAddress;
		poolFactoryAddress = _poolFactoryAddress;
	}

	function createProject(
		address _authorAddress,
		string calldata _name,
		string calldata _symbol,
		string calldata _description,
		uint256 _target,
		uint32 _startsAt,
		uint32 _endsAt
	) external onlyOwner {
		require(_startsAt >= block.timestamp, 'Invalid start time');
		require(_endsAt > _startsAt, 'Invalid end time');
		require(
			_endsAt <= block.timestamp + MAX_DURATION,
			'Maximum duration exceeded'
		);

		count++;

		projects[count] = Project({
			name: _name,
			description: _description,
			symbol: _symbol,
			target: _target,
			fund: 0,
			liquidity: 0,
			startsAt: _startsAt,
			endsAt: _endsAt,
			completed: false,
			authorAddress: _authorAddress,
			tokenAddress: address(0)
		});

		emit ProjectCreated(
			count,
			_name,
			_description,
			_target,
			_startsAt,
			_endsAt,
			_authorAddress
		);
	}

	function cancelProject(uint256 _id) external onlyOwner crowdfundingOpened(_id) {
		require(projects[_id].startsAt > block.timestamp, 'Project already started');
		delete projects[_id];
		emit ProjectCancelled(_id);
	}

	function commitOnProject(uint256 _id) external payable crowdfundingOpened(_id) {
		require(msg.value >= 0.01 ether, 'min 0.01 ether');

		Project memory project = projects[_id];

		(uint value, uint liquidity) = computeValueAndLiquidity(msg.value);

		project.fund += value;
		project.liquidity += liquidity;

		commitments[_id][msg.sender] += msg.value;
		emit Committed(_id, msg.sender, msg.value);

		if (project.fund >= project.target) {
			project.completed = true;
			emit ProjectCompleted(_id, project.fund, project.liquidity);
		}
	}

	function withdrawOnProject(uint256 _id) external crowdfundingOpened(_id) isCommited(_id) {
		uint256 commitment = commitments[_id][msg.sender];

		(uint value, uint liquidity) = computeValueAndLiquidity(commitment);
		projects[_id].fund -= value;
		projects[_id].liquidity -= liquidity;

		commitments[_id][msg.sender] = 0;

		(bool sent, ) = msg.sender.call{ value: commitment }('');
		require(sent, 'withdraw failed');

		emit Withdrawed(_id, msg.sender, commitment);
	}

	function validateProject(uint256 _id) external onlyAuthor(_id) crowdfundingClosed(_id) {
		Project memory project = projects[_id];

		address tokenAddress = IProjectTokenFactory(tokenFactoryAddress).createToken(
			project.name,
			project.symbol,
			address(this),
			FSOCIETY_SUPPLY,
			project.authorAddress,
			AUTHOR_SUPPLY,
			INVESTORS_SUPPLY
		);

		(address poolAddress, ) = ITokensPoolFactory(poolFactoryAddress).createPool(
			tokenAddress,
			wethTokenAddress
		);

		// TODO: add pool liquidity here 

		emit ProjectValidated(_id);
	}

	function claimProjectTokens(uint256 _id) external crowdfundingClosed(_id) isCommited(_id) {
		uint256 commitment = commitments[_id][msg.sender];

		(uint value, ) = computeValueAndLiquidity(commitment);

		uint256 tokenAmount = (INVESTORS_SUPPLY / projects[_id].fund) * value;
		
		IProjectTokenFactory(tokenFactoryAddress)
			.tokens(projects[_id].tokenAddress)
			.transfer(msg.sender, tokenAmount);
	}

	function computeValueAndLiquidity(uint256 _value) private pure returns (uint256 amount, uint256 liquidity) {
		uint256 _liquidity = (_value ** PRECISION) / 20; // 5%
		uint256 _amount = (_value ** PRECISION) - liquidity;
		return (_amount, _liquidity);
	}
}
