# 📦 Flashbot Bundler for Assets Recoveries

_Thanks to Austin Griffith for suggesting this build, Elliot Alexander for their support, and lcfr.eth for inspiration [bundler.lcfr.io](https://bundler.lcfr.io/)_

Live on mainnet: [flashbot-recovery-bundler.vercel.app](https://flashbot-recovery-bundler.vercel.app/)

Flashbots have several use cases and it can be hard for beginners to correctly interact with them to save their compromised assets. flashbot-recovery-bundler provides an instructive & beginner-friendly interface to create Flashbot bundles following a whitehat recovery scheme.

Here's a sneak peek on how this works:

- Accepts one funding account to pay for the gas and acquire the locked assets, and one compromised account as inputs in the beginning
- Lists ERC20, ERC721, and ERC1155 assets belonging to the compromised account
  - This list is populated thanks to Transfer events emitted by the asset contracts. Hence, if the compromised account was minted an asset and they didn't interact with it later on, that asset will not show up in the list.
  - Nevertheless user can still use provided UI to include more assets in the recovery bundle, as well as crafting custom transactions if needed.
- Directs user to help handle the complexities of adding a flashbot RPC network, account switching, and transaction signing processes in correct order
- Keeps track of the submitted transactions to inform the user upon success or failure, and guides the user with what can be done in case of failure

See the [this README](./docs/README.md) for more detailed information on how this works and how to interact. See the [walkthrough](./docs/walkthrough.md), and the [sequence diagram](./docs/seq.md) to figure the intended behavior out.
