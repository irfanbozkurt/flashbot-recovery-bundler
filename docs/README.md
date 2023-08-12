## Story and Caveats

Compromised accounts need some funding to pay for the gas, so that they can transfer the locked assets to a safe account. Sending ether to hacked accounts can be frustrating as the malicious actor will drain any funds immediately, because they're operating bots that actively monitor the mempool.

Flashbots operate on their own RPC network in which they receive bundles of transactions and they can push these bundles to Ethereum network without exposing individual transfers in the mempool. This prevents malicious actors from sniffing the intermediary funding transactions, making white hat recoveries possible.

See the following links, but beware Flashbots have many use cases, so don't get lost within

- [About FlashBots](https://docs.flashbots.net/)
- [Understanding Bundles](https://docs.flashbots.net/flashbots-auction/searchers/advanced/understanding-bundles)

Users need to build a bundle of signed transactions to send to the Flashbots network. Flashbots expose a [bundle caching API](https://docs.flashbots.net/flashbots-protect/rpc/bundle-cache) so that users can use their wallets to sign transactions one by one. These transactions will be cached by Flashbots' infrastructure remotely, to be submitted with a POST request. We abstract-away all these complexities and ease the ordering of signing and account switching operations, and provide instructive modals to the user to reduce error rate.

Another point to note is these transactions won't be listed on Etherscan, and debugging a failing bundle can be a trouble. Users are recommended to build transactions carefully as we're lacking a debug mechanism.

## How it works

flashbot-recovery-bundler introduces the concept of **recovery basket**, which is a list of transactions **from the compromised account to asset contract accounts**. Building these transactions and adding them the basket does not require wallet interaction, as it purely happens at the front-end.

When the basket is done, we get an accurate estimation on the gas price. This gas price has nothing to do with the priority fee, and purely represents the total gas price to be paid to Ethereum validators. This estimation is crucial because should any transaction in the basket fail, the whole bundle fails.

Users can then **start signing**, and the front-end will start a sequence of events consisting of

- Switching to a personal Flashbot RPC,
- Switching to the funding account,
- Signing the gas-funding transaction,
- Switching to the compromised account,
- Signing all the recovery transactions one by one,
- Submitting the bundle,
- Watching the transactions and inform upon success or failure

## Handling priority fees

Flashbots might require high bids to include your bundle in a block. It's recommended that **for each transaction you sign**, you set a very generous priority fee. When network is not congested, for example, 10 GWEI can be a good bid. In times of congestion this might need to go up way higher (no exact numbers).

You will now you didn't set a nice bid when your bundle fails, and in that case, it's recommended to increase the priority fee and max base fee even further. See the screenshots in the walkthrough to have a more concrete idea.

## Careful with pending transactions

If the compromised account or the funding account has any pending transactions in the wallet, please **clear activity data**. Otherwise when you join a new personal Flashbot RPC network, these unwanted transactions will also be included in the new bundle you're trying to build. This can cause trouble and be hard to debug.

## Messing up the state

If you think the front-end does not behave logically, you might have messed with the state. The build uses local storage, so clearing the cookies and refreshing the page helps.

## Local Development

Built on [scaffold-eth-2](https://github.com/scaffold-eth/scaffold-eth-2), so the same technical details apply here.
