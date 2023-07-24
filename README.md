# 📦 Flashbot Bundler for Assets Recoveries

_Thanks to Austin Griffith for suggesting this build, Elliot Alexander for their support, and lcfr.eth for inspiration [bundler.lcfr.io](https://bundler.lcfr.io/)_

Live demo on Goerli: [flashbot-recovery-bundler.vercel.app](https://flashbot-recovery-bundler.vercel.app/)

Flashbots have several use cases and it can be hard for beginners to correctly interact with them to save their compromised assets. flashbot-recovery-bundler provides an instructive & beginner-friendly interface to create Flashbot bundles following a whitehat recovery scheme.

Here's a sneak peek on how this works:
- Accepts one funding account to pay for the gas and acquire the locked assets, and one compromised account
- Lets user create a list of recovery transactions (supports ERC20, 721, and 1155 interfaces + a custom call crafter),
- Directs user to help handle the complexities of adding a flashbot RPC network, account switching, and transaction signing processes at correct steps
- Keeps track of the submitted transactions to inform the user upon success or failure, and guides the user with what can be done in case of failure


## Requirements & Quickstart
⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, and Typescript.

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

```
yarn install
yarn start
```
