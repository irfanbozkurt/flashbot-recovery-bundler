# 📦 Flashbot Bundler for Assets Recoveries

_Thanks to Austin Griffith for suggesting this build, Elliot Alexander for their support, and lcfr.eth for inspiration [bundler.lcfr.io](https://bundler.lcfr.io/)_

Live demo on Goerli: [flashbot-recovery-bundler.vercel.app](https://flashbot-recovery-bundler.vercel.app/)

Flashbots have several use cases and it can be hard for beginners to correctly interact with them to save their compromised assets. flashbot-recovery-bundler provides an instructive & beginner-friendly interface to create Flashbot bundles following a whitehat recovery scheme.

Here's a sneak peek on how this works:
- Accepts one funding account to pay for the gas and acquire the locked assets, and one compromised account
- Lets user create a list of recovery transactions (supports ERC20, 721, and 1155 interfaces + a custom call crafter),
- Directs user to help handle the complexities of adding a flashbot RPC network, account switching, and transaction signing processes at correct steps
- Keeps track of the submitted transactions to inform the user upon success or failure, and guides the user with what can be done in case of failure


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
* Switching to a personal Flashbot RPC,
* Switching to the funding account,
* Signing the gas-funding transaction,
* Switching to the compromised account,
* Signing all the recovery transactions one by one,
* Submitting the bundle,
* Watching the transactions and inform upon success or failure

## Handling priority fees

Flashbots might require high bids to include your bundle in a block. It's recommended that **for each transaction you sign**, you set a very generous custom priority fee. When network is not congested, for example, 10 GWEI can be a good bid. In times of congestion this might need to go up way higher (no exact numbers).

You will now you didn't set a nice bid when your bundle fails, and in that case, it's recommended to increase priority fee alongside gas limit and max base fee. See the screenshots in the walkthrough to have a more concrete idea.

## Careful with pending transactions

If the compromised account or the funding account has any pending transactions in the wallet, please **clear activity data**. Otherwise when you join a new personal Flashbot RPC network, these unwanted transactions will also be included in the new bundle you're trying to build. This can cause trouble and be hard to debug.


## Walkthrough

Here we provide a detailed walkthrough and explanations to each step.


<details>
<summary>Entering the safe / funding account & compromised / hacked account</summary>

<br>

![1](/assets/1.png)

</details>

<details>
<summary>Start screen</summary>

<br>

![2](/assets/2.png)

</details>

<details>
<summary>Adding an ERC20 recovery transaction</summary>

<br>

Pasting the token contract will display the hacked account's balance. The program won't let you include this transaction if balance of the compromised account is 0.

![ERC20-1](/assets/ERC20-1.png)

Clicking ADD results in addition of a 'transfer' transaction to the basket. This transaction, like every other, is from the hacked account to the funding account.

![ERC20-2](/assets/ERC20-2.png)

</details>

<details>
<summary>Adding an ERC721 recovery transaction</summary>

<br>

NFTs will require a transfer transaction for every NFT owned by the hacked account (no batch transfer support yet). Enter the contract address alongside a token ID to proceed

![ERC721-1](/assets/ERC721-1.png)

![ERC721-2](/assets/ERC721-2.png)


</details>


<details>
<summary>Adding an ERC1155 recovery transaction</summary>

<br>

ERC1155 supports batch transfer, and user needs to input the token IDs in a **comma-separated format** here

![ERC1155-1](/assets/ERC1155-1.png)



</details>


<details>
<summary>Adding a custom transaction</summary>

<br>

Users can make calls to custom functions of custom contracts here. For example, we use another ERC20 contract and craft a manual call to the contract to transfer tokens to the funding account.

![Custom-1](/assets/Custom-1.png)

After pasting the contract address, user is also required to provide the function signature. For our example, it'll be 'function transfer(address,uint)'. Providing this signature will automatically render a form below

![Custom-2](/assets/Custom-2.png)

Here user has the freedom to provide the arguments as they wish, but they need to be careful as a failing transaction will let the whole bundle fail, and they won't know the reason why. If the transaction is payable, simply include 'payable' keyword in the signature and it will render a value input.

</details>


<details>
<summary>Signing all the transactions</summary>

<br>

After the basket is complete, it's time to sign the transactions. 

![Signing-1](/assets/Signing-1.png)


Once the user clicks 'start signing', a sequence of events will happen, and a sequence of modals will direct the user on what to do.

First the user is prompted to connect the safe / funding account to cover the total gas fee.

![Signing-2](/assets/Signing-2.png)

![Signing-3](/assets/Signing-3.png)

Click anywhere but the modal to close the modal. This will trigger the next action, which is switching to a personal Flashbot RPC network.

![Signing-4](/assets/Signing-4.png)

If you mistakenly 'cancel' the network switch, you might mess the flow, so you should reject the following wallet prompt as well. Assuming you didn't, the next step is signing the gas fee transfer transaction. 

Here click on 'Advanced' to provide a custom priority fee, gas limit, and max base fee:

![Signing-5](/assets/Signing-5.png)

Provide generous fees here, and save as default for incoming signing processes of the hacked account (we don't want to re-do fee setting for all transactions).

Upon confirmation, a modal will ask user to connect their hacked account, because the recovery transfers need to be signed. This modal won't go away unless you switch to the hacked account that you entered in the beginning. If you made a mistake in the flow, clear the cookies and refresh the page to start everything again.

![Signing-6](/assets/Signing-6.png)

Now open the wallet and connect the hacked account. Then you should manually click on the backdrop to close the modal. 

![Signing-7](/assets/Signing-7.png)

After you close the modal, a Metamask prompt will appear for every single transaction in the basket. If you saved the gas settings in the previous steps, you can just keep hitting 'Confirm' here.

Once you confirm all the transactions, a modal will pop up, and it will display how many blocks are left to wait for. We wait for 10 blocks because the bundle might be included in any of the 10 following blocks.

![Info-1](/assets/Info-1.png)

Now wait without refreshing the page until success or failure.

</details>



<details>
<summary>Upon Success</summary>

<br>

If the bundle gets included in a block, a modal will tell in which block it was included. This is a sign of success, and recovery is completed!

![Success-1](/assets/Success-1.png)

</details>

<details>
<summary>Upon Failure</summary>

<br>

There are many reasons why the bundle wasn't included. It's usually that all the other people interacting with the Flashbot bid higher than you did, or that you included a transaction that failed for any reason (and you won't know which and why). 

Failure cases can be a pain in the ass, but if you're sure you crafted the transactions carefully, the first thing to try is providing higher priority fee, higher max base fee, under a higher gas limit. This will require you to sign all the transactions again, so that you can re-set these configurations.

However, you can try to submit the bundle with the same gas you already tried. In this case you won't need to re-sign anything. I personally experienced that this option worked, but I recommend you re-sign everything with higher fees.

![Failure-1](/assets/Failure-1.png)

When you attend to re-sign the transactions, **you need to clear activity data for both hacked and funding accounts**, as explained in section [Careful with pending transactions](#careful-with-pending-transactions)

![Retry-1](/assets/Retry-1.png)

![Retry-2](/assets/Retry-2.png)

Don't try to 'cancel' this transaction, because you're connected to the flashbot RPC anyway, and the only way to submit an order is to submit a bundle here. Just clear the activity data:

![Retry-3](/assets/Retry-3.png)

Again, do this for both your accounts. Then switch to the safe account to return back to the beginning of the whole signing process.

</details>

## Messing up the state

If you think the front-end does not behave logically, you might have messed with the state. The build uses local storage, so clearing the cookies and refreshing the page helps.


## Local Development
⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, and Typescript.

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

```
yarn install
yarn start
```
