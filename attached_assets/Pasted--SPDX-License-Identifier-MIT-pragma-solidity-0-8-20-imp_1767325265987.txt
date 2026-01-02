// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IGovernor {
    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description) external returns (uint256);
    function castVote(uint256 proposalId, uint8 support) external returns (uint256);
    function execute(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash) external payable returns (uint256);
    function state(uint256 proposalId) external view returns (uint8); // 4 = Succeeded, 5 = Queued
}

contract DominanceGavel is Ownable {
    IGovernor public dao;
    address public syt;

    struct BreachRecord {
        address recipient;
        uint256 amount;
        string motive;
    }

    mapping(uint256 => BreachRecord) public breaches;

    event DominanceInitiated(uint256 indexed proposalId, address recipient);
    event DominanceSealed(uint256 indexed proposalId);

    constructor(address _dao, address _syt) Ownable(msg.sender) {
        dao = IGovernor(_dao);
        syt = _syt;
    }

    // Step 1: Initiate the Breach & Auto-Vote
    function dominateBreach(address target, uint256 amount, string calldata motive) external onlyOwner {
        address[] memory targets = new address[](1);
        targets[0] = syt;
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSignature("mint(address,uint256)", target, amount);

        uint256 proposalId = dao.propose(targets, values, calldatas, motive);
        dao.castVote(proposalId, 1);

        breaches[proposalId] = BreachRecord(target, amount, motive);
        emit DominanceInitiated(proposalId, target);
    }

    // Step 2: Seal the Breach (Call after Timelock/Voting Period)
    function executeDomination(uint256 proposalId) external onlyOwner {
        BreachRecord memory b = breaches[proposalId];
        require(b.amount > 0, "Record not found");

        address[] memory targets = new address[](1);
        targets[0] = syt;
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSignature("mint(address,uint256)", b.recipient, b.amount);

        dao.execute(targets, values, calldatas, keccak256(bytes(b.motive)));
        delete breaches[proposalId]; // Clear storage to recover gas
        emit DominanceSealed(proposalId);
    }
}
