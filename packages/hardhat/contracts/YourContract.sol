// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YourContract is ERC20 {
	constructor() ERC20("TTT", "TTT") {
		super._mint(msg.sender, 10);
	}
}
