// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract DonationMultiSig {
	error PaymentFailed(address to, uint256 amount);
	error ProposalDoesntExist(address proposedContributor);
	error NewContributorCannotHaveZeroWeight(address proposedContributor);
	error NewContributorCannotBeContract(address proposedContributor);
	error NewContributorAlreadyProposed(address proposedContributor);
	error NewContributorAlreadyApproved(
		address proposedContributor,
		address approver
	);

	struct Candidate {
		bool exists;
		uint32 weight;
		mapping(address => bool) approvals;
	}
	mapping(address => Candidate) proposals;

	address[] public contributors;

	uint32[] public weights;
	uint256 public totalWeight;

	event Donation(address sender, uint256 amount);

	modifier onlyContributors() {
		bool contains;
		for (uint8 i = 0; i < contributors.length; i++) {
			if (msg.sender == contributors[i]) {
				contains = true;
				break;
			}
		}
		require(contains, "Only contributors can make this call");
		_;
	}

	constructor(address[] memory _contributors, uint32[] memory _weights) {
		require(
			_contributors.length == _weights.length,
			"Array length mismatch"
		);
		for (uint8 i = 0; i < _contributors.length; i++) {
			require(_weights[i] != 0, "Zero weight not allowed");
			contributors.push(_contributors[i]);
			weights.push(_weights[i]);
			totalWeight += _weights[i];
		}
	}

	fallback() external payable {
		_donate();
	}

	receive() external payable {
		_donate();
	}

	function proposeContributor(
		address newContributor,
		uint32 weight
	) external onlyContributors {
		if (weight == 0) {
			revert NewContributorCannotHaveZeroWeight(newContributor);
		}

		if (!proposals[newContributor].exists) {
			if (_isContract(newContributor)) {
				revert NewContributorCannotBeContract(newContributor);
			}
			proposals[newContributor].exists = true;
		} else {
			if (weight == proposals[newContributor].weight) {
				revert NewContributorAlreadyProposed(newContributor);
			}

			// If proposed weight is different, then reset all approvals
			for (uint8 i = 0; i < contributors.length; i++) {
				proposals[newContributor].approvals[contributors[i]] = false;
			}
		}
		proposals[newContributor].approvals[msg.sender] = true;
		proposals[newContributor].weight = weight;
	}

	function approveContributor(
		address newContributor
	) external onlyContributors {
		if (!proposals[newContributor].exists) {
			revert ProposalDoesntExist(newContributor);
		}
		if (proposals[newContributor].approvals[msg.sender]) {
			revert NewContributorAlreadyApproved(newContributor, msg.sender);
		}
		proposals[newContributor].approvals[msg.sender] = true;
	}

	function _addContributor(address newContributor) internal {
		for (uint8 i = 0; i < contributors.length; i++) {
			if (!proposals[newContributor].approvals[contributors[i]]) {
				return;
			}
		}
		contributors.push(newContributor);
		weights.push(proposals[newContributor].weight);
		totalWeight += proposals[newContributor].weight;

		// Remove the proposal
		for (uint8 i = 0; i < contributors.length; i++) {
			proposals[newContributor].approvals[contributors[i]] = false;
		}
		proposals[newContributor].exists = false;
		proposals[newContributor].weight = 0;
	}

	function _donate() internal {
		if (msg.value == 0) {
			return;
		}

		uint256 totalWeiToSend = address(this).balance;
		if (totalWeiToSend < totalWeight) {
			// Not enough balance, not worth splitting
			return;
		}
		uint256 unitWeiToSend = totalWeiToSend / totalWeight;

		for (uint8 i = 0; i < contributors.length; i++) {
			uint256 amount = unitWeiToSend * weights[i];
			(bool success, ) = payable(contributors[i]).call{ value: amount }(
				""
			);
			if (!success) {
				revert PaymentFailed(contributors[i], amount);
			}
		}
		emit Donation(msg.sender, msg.value);
	}

	function _isContract(address addr) internal view returns (bool) {
		uint size;
		assembly {
			size := extcodesize(addr)
		}
		return size > 0;
	}
}
