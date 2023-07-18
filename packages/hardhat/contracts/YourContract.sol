// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YourContract is ERC20 {
	constructor() ERC20("TTT", "TTT") {
		super._mint(0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB, 5);
	}
}
