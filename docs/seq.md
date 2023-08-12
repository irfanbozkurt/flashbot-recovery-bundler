# 1- Setup phase

Refers to sequence of occurances from the moment user faces the interface to having the first ready-to-submit bundle of transactions.

```mermaid
sequenceDiagram
    actor User

    participant Bundler UI
    participant Chain Indexer
	participant Chain Provider

	User->>Bundler UI: Compromised address
	Bundler UI->>Chain Indexer: Query address
	Chain Indexer-->>Bundler UI: ERC20-721-1155<br/>'Transfer' Events
	Bundler UI->>Chain Provider: Query all asset contracts
	Chain Provider-->>Bundler UI: Balances of compromised address

	Note over Bundler UI: Eliminates 0 balances

	User->>Bundler UI: Selects assets<br>to recover

	Note over Bundler UI: Auto-crafts recovery <br>transactions

	loop 5 seconds
		Bundler UI->>Chain Provider: Simulate all transactions
		Chain Provider-->>Bundler UI: Gas estimations
		Note over Bundler UI: Calculate total gas
	end
```

<br>

At the end of the setup phase, user has a bundle ready to be submitted already. The gas estimation will require the transactions to be simulated, so failing transactions won't be included in this bundle. Examples include (so-claimed) ERC20 contracts that emit a Transfer event, but don't provide a 'balanceOf' function.

<br>

# 2- Including additional transactions

## ERC20 - ERC721 - ERC1155

Automatic asset detection only relies on Transfer events, so assets that were minted (not transferred) to the compromised account may not show up in the bundle. These assets can still be included in the recovery bundle with little effort.

<details>
<summary> ERC20 </summary>

```mermaid
sequenceDiagram
    actor User

    participant Bundler UI
	participant ERC20 Contract

	User->>Bundler UI: ERC20 address
	Bundler UI->>ERC20 Contract: Query balance of<br>compromised account
	ERC20 Contract-->>Bundler UI: &nbsp

	opt balance = 0
		Note over Bundler UI: Don't include transaction
	end

	opt balance > 0
		Note over Bundler UI: Craft recovery transaction
	end

	Note over Bundler UI: Calculate total gas

```

</details>

<details>
<summary> ERC721 </summary>

```mermaid
sequenceDiagram
    actor User

    participant Bundler UI
	participant ERC721 Contract

	User->>Bundler UI: ERC721 address + <br>claimed token id
	Bundler UI->>ERC721 Contract: Query ownership of token
	ERC721 Contract-->>Bundler UI: &nbsp

	opt not asset owner
		Note over Bundler UI: Don't include transaction
	end

	opt asset owner
		Note over Bundler UI: Craft recovery transaction
	end

	Note over Bundler UI: Calculate total gas
```

</details>

<details>
<summary> ERC1155 </summary>

```mermaid
sequenceDiagram
    actor User

    participant Bundler UI
	participant ERC1155 Contract

	User->>Bundler UI: ERC1155 address + <br> multiple token ids
	Bundler UI->>ERC1155 Contract: Query balances
	ERC1155 Contract-->>Bundler UI: &nbsp

	loop per tokenId
		opt balance = 0
			Note over Bundler UI: Don't include transaction
		end

		opt balance > 0
			Note over Bundler UI: Craft recovery transaction
		end
	end

	Note over Bundler UI: Calculate total gas

```

</details>

<br>

## Custom calls

This bundler can also be used to send custom transactions from the compromised account, and we present a separate UI for this purpose.

```mermaid
sequenceDiagram
    actor User

    participant Bundler UI
	participant Bundler UI

	User->>Bundler UI: Contract address + <br> function signature
	Bundler UI-->>User: Render input form
	User->>Bundler UI: Function arguments

	Note over Bundler UI: Calculate total gas

```

<br>
Please remember that gas calculation will require communication with the chain provider (although not explicit here) and the crafted function call will be simulated remotely. This simulation will fail if the crafted transaction is poorly constructed. In that case, the custom transaction will not be added to the bundle.

<br>

# 3- Signing and submission

This phase requires a set of activities that can be confusing to a web3 beginner. The user has built their bundle of transactions, and now is the time to sign and submit them. Not only the recovery transactions will be signed by the compromised account, but also a funding transaction will be signed by the safe address.

```mermaid
sequenceDiagram
    actor User

	Note over User: Switches to safe account

    participant Bundler UI
	participant Wallet
	participant Flashbot RPC

	User->>Bundler UI: Start signing

	Bundler UI->>Wallet: Add personal<br>flashbot RPC network
	Wallet-->>User: Prompt asking for network switch
	User-->>Wallet: Switch to personal RPC network

	Bundler UI->>Wallet: Propose funding<br> transaction
	Wallet-->>User: Prompt to sign the transaction
	User->>Wallet: Sign
	Wallet-->>Flashbot RPC: Cache transaction

	Note over User: Switches to compromised account

	loop for every recovery transaction
		Bundler UI->>Wallet: Propose recovery<br> transaction
		Wallet-->>User: Prompt to sign the transaction
		User->>Wallet: Sign
		Wallet-->>Flashbot RPC: Cache transaction
    end

	participant Bundler Backend

	Bundler UI->>Bundler Backend: Trigger bundle submission with personal RPC id

	loop 10 times until bundle gets included
		Bundler Backend->>Flashbot RPC: Submit bundle
		Flashbot RPC-->>Bundler Backend: Included / not included
	end

```

<br>

The motivation behind using a back end for submissions is that [mev-relay-js](https://github.com/flashbots/mev-relay-js) does not provide CORS support, preventing access to its endpoints from a browser. Although workarounds like running a local CORS proxy exist, this bundler is built to be as beginner-friendly as possible, so it uses a small piece of serverless code for submissions.

<br>

# 4- Awaiting And Final Reactions

After bundle submission, the UI checks if transactions were included in a new block for 10 blocks. A success message indicates that the transactions were successful and assets are recovered. Failure is not uncommon, and bundler UI asks user to increase the priority fee for all transactions. This requires that the user signs all the transactions again.

```mermaid
sequenceDiagram
    actor User

    participant Bundler UI
	participant Chain Provider

	loop 10 blocks
		Bundler UI->>Chain Provider: Is bundle included?

		opt success
			Chain Provider-->>Bundler UI: Yes
			Note over Bundler UI: Terminate
		end

		Chain Provider-->>Bundler UI: No
	end

	Bundler UI->>User: Notify that higher <br>priority fee required
	Bundler UI->>User: Remind to clear<br>activity data in wallet
	User-->>Bundler UI: Ok
```

<br>
Upon failure, the UI takes the user exactly to the beginning of the 3rd phase: Signing and submission. User needs to perform those steps again, and not only that, they also have to clear their activity data to flush their nonce information. This is required because otherwise, the next submission will include the failing transactions as well, so the next bundle will fail as well. Wallets don't provide an interface to do this operation on behalf of the user, so they must do it themselves.
