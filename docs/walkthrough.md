## Walkthrough

Here we provide a detailed walkthrough and explanations to each step.

<details>
<summary>Entering the safe / funding account & compromised / hacked account</summary>

<br>

![1](/assets/1.png)

</details>

<details>
<summary>Main screen</summary>

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

NFTs will require a transfer transaction for every NFT owned by the hacked account (no batch transfer support). Enter the contract address alongside a token ID

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
