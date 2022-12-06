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

	struct ProjectInfo {
		string name;
		string symbol;
		string description;
		string avatarCid;
		string coverCid;
	}

	struct ProjectICO {
		uint256 target;
		uint256 minInvest;
		uint256 maxInvest;
	}

	struct Project {
		uint256 id;
		uint256 fund;
		uint112 totalSupply;
		ProjectInfo info;
		ProjectICO ico;
		ProjectStatus status;
		address partnerAddress;
		address tokenAddress;
	}

	uint256 public count;

	mapping(uint256 => Project) public projects;

	mapping(uint256 => mapping(address => uint256)) public commitments;

	event ProjectCreated(
		uint256 id,
		ProjectInfo info,
		ProjectICO ico,
		address indexed partnerAddress,
		uint112 totalSupply
	);

	event Committed(uint256 indexed id, address indexed caller, uint256 amount);

	event Withdrawed(uint256 indexed id, address indexed caller, uint256 amount);

	event ProjectStatusChanged(uint256 indexed id, ProjectStatus status);

	modifier onlyPartner(uint256 _id) {
		require(msg.sender == projects[_id].partnerAddress, 'Not partner');
		_;
	}

	modifier statusIs(uint256 _id, ProjectStatus _status) {
		require(projects[_id].status == _status, 'Bad project status');
		_;
	}

	modifier statusLessThan(uint256 _id, ProjectStatus _status) {
		require(projects[_id].status < _status, 'Bad project status');
		_;
	}

	modifier isCommited(uint256 _id) {
		require(commitments[_id][msg.sender] > 0, 'No commitment');
		_;
	}

	function createProject(
		ProjectInfo calldata _info,
		ProjectICO calldata _ico,
		address _partnerAddress,
		uint112 _totalSupply
	) external onlyOwner {
		count++;

		projects[count] = Project({
			id: count,
			fund: 0,
			totalSupply: _totalSupply,
			info: _info,
			ico: _ico,
			status: ProjectStatus.Opened,
			partnerAddress: _partnerAddress,
			tokenAddress: address(0)
		});

		emit ProjectCreated(count, _info, _ico, _partnerAddress, _totalSupply);
	}

	function abortProject(uint256 _id)
		external
		onlyOwner
		statusIs(_id, ProjectStatus.Opened)
	{
		projects[_id].status = ProjectStatus.Aborted;
		emit ProjectStatusChanged(_id, ProjectStatus.Aborted);
	}

	function commitOnProject(uint256 _id)
		external
		payable
		statusIs(_id, ProjectStatus.Opened)
	{
		Project storage project = projects[_id];
		require(
			msg.value + commitments[_id][msg.sender] >= project.ico.minInvest,
			'Not enough'
		);
		require(
			msg.value + commitments[_id][msg.sender] <= project.ico.maxInvest,
			'Too much'
		);

		project.fund += msg.value;

		commitments[_id][msg.sender] += msg.value;
		emit Committed(_id, msg.sender, msg.value);

		if (project.fund >= project.ico.target) {
			project.status = ProjectStatus.Completed;
			emit ProjectStatusChanged(_id, ProjectStatus.Completed);
		}
	}

	function withdrawOnProject(uint256 _id)
		external
		statusLessThan(_id, ProjectStatus.Completed)
		isCommited(_id)
	{
		uint256 commitment = commitments[_id][msg.sender];

		projects[_id].fund -= commitment;

		commitments[_id][msg.sender] = 0;

		(bool sent, ) = msg.sender.call{ value: commitment }('');
		require(sent, 'withdraw failed');

		emit Withdrawed(_id, msg.sender, commitment);
	}
}
