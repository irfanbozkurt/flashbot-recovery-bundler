// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract A is ERC20 {
	constructor() ERC20("aaa", "aaa") {
		super._mint(0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB, 11);
	}
}

contract Z is ERC20 {
	constructor() ERC20("bbb", "bbb") {
		super._mint(0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB, 12);
	}
}

contract B is ERC721 {
	constructor() ERC721("nft", "nft") {
		super._mint(0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB, 0);
		super._mint(0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB, 1);
		super._mint(0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB, 2);
		super._mint(0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB, 3);
	}
}

contract C is ERC1155, Ownable {
	constructor() ERC1155("ccc") {
		super._mint(
			0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB,
			0,
			100000,
			"cc1"
		);
		super._mint(0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB, 1, 1, "cc2");
		super._mint(0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB, 2, 35, "cc3");
	}
}

contract YourContract {
	constructor() {}
}
