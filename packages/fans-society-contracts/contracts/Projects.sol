// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { IProjectTokenFactory } from './tokens/interfaces/IProjectTokenFactory.sol';
import { ITokensPoolFactory } from './pools/interfaces/ITokensPoolFactory.sol';

contract Projects is Ownable {
	enum ProjectStatus {
		Opened,
		Aborted,
		Completed,
		Launched
	}

	struct Project {
		string name;
		string symbol;
		string description;
		uint fund;
		uint target;
		uint minInvest;
		uint maxInvest;
		ProjectStatus status;
		address authorAddress;
		address tokenAddress;
	}

	address internal wethTokenAddress;

	address internal tokenFactoryAddress;
	address internal poolFactoryAddress;

	uint private constant FSOCIETY_SUPPLY = 27;
	uint private constant AUTHOR_SUPPLY = 27;
	uint private constant LIQUIDITY_SUPPLY = 30;
	uint private constant INVESTORS_SUPPLY = 35;

	uint private constant MAX_DURATION = 604800; // 1 week

	uint private constant PRECISION = 2;


	uint public count;

	mapping(uint => Project) public projects;

	mapping(uint => mapping(address => uint)) public commitments;

	event ProjectCreated(
		uint id,
		string name,
		string symbol,
		string description,
		uint target,
		uint minInvest,
		uint maxInvest,
		address indexed authorAddress
	);

	event Committed(uint indexed id, address indexed caller, uint amount);

	event Withdrawed(uint indexed id, address indexed caller, uint amount);

	event Claimed(uint indexed id, address indexed caller, uint amount);

	event ProjectStatusChanged(uint indexed id, ProjectStatus status);

	modifier onlyAuthor(uint _id) {
		require(msg.sender == projects[_id].authorAddress, 'Not author');
		_;
	}

	modifier statusIs(uint _id, ProjectStatus _status) {
		require(projects[_id].status == _status, 'Bad project status');
		_;
	}

	modifier isCommited(uint _id) {
		require(commitments[_id][msg.sender] > 0, 'No commitment');
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
		uint _target,
		uint _minInvest,
		uint _maxInvest
	) external onlyOwner {

		count++;

		projects[count] = Project({
			name: _name,
			symbol: _symbol,
			description: _description,
			fund: 0,
			target: _target,
			minInvest: _minInvest,
			maxInvest: _maxInvest,
			status: ProjectStatus.Opened,
			authorAddress: _authorAddress,
			tokenAddress: address(0)
		});

		emit ProjectCreated(
			count,
			_name,
			_symbol,
			_description,
			_target,
			_minInvest,
			_maxInvest,
			_authorAddress
		);
	}

	function abortProject(uint _id) external onlyOwner statusIs(_id, ProjectStatus.Opened) {
		projects[_id].status = ProjectStatus.Aborted;
		emit ProjectStatusChanged(_id, ProjectStatus.Aborted);
	}

	function commitOnProject(uint _id) external payable statusIs(_id, ProjectStatus.Opened) {
		Project storage project = projects[_id];
		require(msg.value + commitments[_id][msg.sender] >= project.minInvest, 'Not enough');
		require(msg.value + commitments[_id][msg.sender] <= project.maxInvest, 'Too much');


		project.fund += msg.value;

		commitments[_id][msg.sender] += msg.value;
		emit Committed(_id, msg.sender, msg.value);

		if (project.fund >= project.target) {
			project.status = ProjectStatus.Completed;
			emit ProjectStatusChanged(_id, ProjectStatus.Completed);
		}
	}

	function withdrawOnProject(uint _id) external statusIs(_id, ProjectStatus.Opened) isCommited(_id) {
		uint commitment = commitments[_id][msg.sender];

		projects[_id].fund -= commitment;

		commitments[_id][msg.sender] = 0;

		(bool sent, ) = msg.sender.call{ value: commitment }('');
		require(sent, 'withdraw failed');

		emit Withdrawed(_id, msg.sender, commitment);
	}

	function launchProject(uint _id) external onlyAuthor(_id) statusIs(_id, ProjectStatus.Completed) {
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

		projects[_id].status = ProjectStatus.Launched;
		emit ProjectStatusChanged(_id, ProjectStatus.Launched);
	}

	function claimProjectTokens(uint _id) external statusIs(_id, ProjectStatus.Completed) isCommited(_id) {
		uint commitment = commitments[_id][msg.sender];

		uint tokenAmount = (INVESTORS_SUPPLY / projects[_id].fund) * commitment;
		
		IProjectTokenFactory(tokenFactoryAddress)
			.tokens(projects[_id].tokenAddress)
			.transfer(msg.sender, tokenAmount);
	}

}
