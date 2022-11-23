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
		uint256 fund;
		uint256 liquidity;
		uint32 target;
		uint16 minInvest;
		ProjectStatus status;
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
		string symbol,
		string description,
		uint32 target,
		uint16 minInvest,
		address indexed authorAddress
	);

	event Committed(uint256 indexed id, address indexed caller, uint256 amount);

	event Withdrawed(uint256 indexed id, address indexed caller, uint256 amount);

	event Claimed(uint256 indexed id, address indexed caller, uint256 amount);

	event ProjectStatusChanged(uint256 indexed id, ProjectStatus status);

	modifier onlyAuthor(uint256 _id) {
		require(msg.sender == projects[_id].authorAddress, 'Not author');
		_;
	}

	modifier statusIs(uint256 _id, ProjectStatus _status) {
		require(projects[_id].status == _status, 'Bad project status');
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
		uint32 _target,
		uint16 _minInvest
	) external onlyOwner {

		count++;

		projects[count] = Project({
			name: _name,
			symbol: _symbol,
			description: _description,
			fund: 0,
			liquidity: 0,
			target: _target,
			minInvest: _minInvest,
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
			_authorAddress
		);
	}

	function abortProject(uint256 _id) external onlyOwner statusIs(_id, ProjectStatus.Opened) {
		projects[_id].status = ProjectStatus.Aborted;
		emit ProjectStatusChanged(_id, ProjectStatus.Aborted);
	}

	function commitOnProject(uint256 _id) external payable statusIs(_id, ProjectStatus.Opened) {
		require(msg.value >= 0.01 ether, 'min 0.01 ether');

		Project memory project = projects[_id];

		(uint value, uint liquidity) = computeValueAndLiquidity(msg.value);

		project.fund += value;
		project.liquidity += liquidity;

		commitments[_id][msg.sender] += msg.value;
		emit Committed(_id, msg.sender, msg.value);

		if (project.fund >= project.target) {
			project.status = ProjectStatus.Completed;
			emit ProjectStatusChanged(_id, ProjectStatus.Completed);
		}
	}

	function withdrawOnProject(uint256 _id) external statusIs(_id, ProjectStatus.Opened) isCommited(_id) {
		uint256 commitment = commitments[_id][msg.sender];

		(uint value, uint liquidity) = computeValueAndLiquidity(commitment);
		projects[_id].fund -= value;
		projects[_id].liquidity -= liquidity;

		commitments[_id][msg.sender] = 0;

		(bool sent, ) = msg.sender.call{ value: commitment }('');
		require(sent, 'withdraw failed');

		emit Withdrawed(_id, msg.sender, commitment);
	}

	function launchProject(uint256 _id) external onlyAuthor(_id) statusIs(_id, ProjectStatus.Completed) {
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

		emit ProjectStatusChanged(_id, ProjectStatus.Launched);
	}

	function claimProjectTokens(uint256 _id) external statusIs(_id, ProjectStatus.Completed) isCommited(_id) {
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
