const contracts = {
  31337: [
    {
      chainId: "31337",
      name: "localhost",
      contracts: {
        DonationMultiSig: {
          address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          abi: [
            {
              inputs: [
                {
                  internalType: "address[]",
                  name: "_contributors",
                  type: "address[]",
                },
                {
                  internalType: "uint32[]",
                  name: "_weights",
                  type: "uint32[]",
                },
              ],
              stateMutability: "nonpayable",
              type: "constructor",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "proposedContributor",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "approver",
                  type: "address",
                },
              ],
              name: "NewContributorAlreadyApproved",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "proposedContributor",
                  type: "address",
                },
              ],
              name: "NewContributorAlreadyProposed",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "proposedContributor",
                  type: "address",
                },
              ],
              name: "NewContributorCannotBeContract",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "proposedContributor",
                  type: "address",
                },
              ],
              name: "NewContributorCannotHaveZeroWeight",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              name: "PaymentFailed",
              type: "error",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "proposedContributor",
                  type: "address",
                },
              ],
              name: "ProposalDoesntExist",
              type: "error",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: false,
                  internalType: "address",
                  name: "sender",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              name: "Donation",
              type: "event",
            },
            {
              stateMutability: "payable",
              type: "fallback",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "newContributor",
                  type: "address",
                },
              ],
              name: "approveContributor",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              name: "contributors",
              outputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "newContributor",
                  type: "address",
                },
                {
                  internalType: "uint32",
                  name: "weight",
                  type: "uint32",
                },
              ],
              name: "proposeContributor",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "totalWeight",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              name: "weights",
              outputs: [
                {
                  internalType: "uint32",
                  name: "",
                  type: "uint32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              stateMutability: "payable",
              type: "receive",
            },
          ],
        },
      },
    },
  ],
} as const;

export default contracts;
