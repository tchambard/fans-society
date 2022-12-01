// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { ERC20Wrapper } from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

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
		uint id;
		uint fund;
		uint target;
		uint minInvest;
		uint maxInvest;
		uint32 totalSupply;
		ProjectStatus status;
		address partnerAddress;
		address tokenAddress;
	}

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
		uint32 totalSupply,
		address indexed partnerAddress
	);

	event Committed(uint indexed id, address indexed caller, uint amount);

	event Withdrawed(uint indexed id, address indexed caller, uint amount);

	event ProjectStatusChanged(uint indexed id, ProjectStatus status);

	modifier onlyPartner(uint _id) {
		require(msg.sender == projects[_id].partnerAddress, 'Not partner');
		_;
	}

	modifier statusIs(uint _id, ProjectStatus _status) {
		require(projects[_id].status == _status, 'Bad project status');
		_;
	}

	modifier statusLessThan(uint _id, ProjectStatus _status) {
		require(projects[_id].status < _status, 'Bad project status');
		_;
	}

	modifier isCommited(uint _id) {
		require(commitments[_id][msg.sender] > 0, 'No commitment');
		_;
	}

	function createProject(
		address _partnerAddress,
		string calldata _name,
		string calldata _symbol,
		string calldata _description,
		uint _target,
		uint _minInvest,
		uint _maxInvest,
		uint32 _totalSupply
	) external onlyOwner {
		count++;

		projects[count] = Project({
			id: count,
			name: _name,
			symbol: _symbol,
			description: _description,
			fund: 0,
			target: _target,
			minInvest: _minInvest,
			maxInvest: _maxInvest,
			totalSupply: _totalSupply,
			status: ProjectStatus.Opened,
			partnerAddress: _partnerAddress,
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
			_totalSupply,
			_partnerAddress
		);
	}

	function abortProject(
		uint _id
	) external onlyOwner statusIs(_id, ProjectStatus.Opened) {
		projects[_id].status = ProjectStatus.Aborted;
		emit ProjectStatusChanged(_id, ProjectStatus.Aborted);
	}

	function commitOnProject(
		uint _id
	) external payable statusIs(_id, ProjectStatus.Opened) {
		Project storage project = projects[_id];
		require(
			msg.value + commitments[_id][msg.sender] >= project.minInvest,
			'Not enough'
		);
		require(
			msg.value + commitments[_id][msg.sender] <= project.maxInvest,
			'Too much'
		);

		project.fund += msg.value;

		commitments[_id][msg.sender] += msg.value;
		emit Committed(_id, msg.sender, msg.value);

		if (project.fund >= project.target) {
			project.status = ProjectStatus.Completed;
			emit ProjectStatusChanged(_id, ProjectStatus.Completed);
		}
	}

	function withdrawOnProject(
		uint _id
	) external statusLessThan(_id, ProjectStatus.Completed) isCommited(_id) {
		uint commitment = commitments[_id][msg.sender];

		projects[_id].fund -= commitment;

		commitments[_id][msg.sender] = 0;

		(bool sent, ) = msg.sender.call{ value: commitment }('');
		require(sent, 'withdraw failed');

		emit Withdrawed(_id, msg.sender, commitment);
	}
}
