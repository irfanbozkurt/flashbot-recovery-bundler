/* eslint-disable */
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { BigNumber } from "@ethersproject/bignumber";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { AbiFunction } from "abitype";
import { ethers } from "ethers";
import type { NextPage } from "next";
import ReactModal from "react-modal";
import { useInterval, useLocalStorage } from "usehooks-ts";
import { uuid } from "uuidv4";
import { parseAbiItem } from "viem";
import { useAccount, useContractRead, useFeeData, usePublicClient, useWalletClient } from "wagmi";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import {
  AddressInput,
  CustomContractWriteForm,
  InputBase,
  RainbowKitCustomConnectButton,
} from "~~/components/scaffold-eth";
import { ERC20_ABI, ERC721_ABI, ERC1155_ABI } from "~~/utils/constants";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const BLOCKS_IN_THE_FUTURE = 10;

const flashbotSigner = ethers.Wallet.createRandom();

const Home: NextPage = () => {
  const targetNetwork = getTargetNetwork();
  const { address: connectedAccount } = useAccount();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const { data: feeData } = useFeeData();

  //////////////////////////////////////////
  //*********** FlashbotProvider
  //////////////////////////////////////////
  const FLASHBOTS_ENDPOINT = `https://relay${targetNetwork.network == "goerli" ? "-goerli" : ""}.flashbots.net/`;
  const [flashbotsProvider, setFlashbotsProvider] = useState<FlashbotsBundleProvider>();
  useEffect(() => {
    const setFlashbotsProviderOnce = async () => {
      if (!targetNetwork || !targetNetwork.blockExplorers) return;
      if (targetNetwork.network == "goerli")
        setFlashbotsProvider(
          await FlashbotsBundleProvider.create(
            new ethers.providers.InfuraProvider(targetNetwork.id),
            flashbotSigner,
            FLASHBOTS_ENDPOINT,
            "goerli",
          ),
        );
      else
        setFlashbotsProvider(
          await FlashbotsBundleProvider.create(
            new ethers.providers.InfuraProvider(targetNetwork.id),
            flashbotSigner,
            FLASHBOTS_ENDPOINT,
            "goerli",
          ),
        );
    };
    setFlashbotsProviderOnce();
  }, [targetNetwork.id]);

  //////////////////////////////////////////
  //*********** Hacked and safe accounts
  //////////////////////////////////////////
  const [safeAddress, setSafeAddress] = useLocalStorage<string>("toAddress", "");
  const [hackedAddress, setHackedAddress] = useLocalStorage<string>("hackedAddress", "");
  const [accountsInputGiven, setAccountsInputGiven] = useLocalStorage<boolean>("accountsInputGiven", false);
  const displayAddressInput =
    accountsInputGiven && ethers.utils.isAddress(safeAddress) && ethers.utils.isAddress(hackedAddress);

  const addressInputDisplay = (
    <div className="pt-10 flex w-full flex-col justify-start gap-y-3 gap-x-5 p-2">
      <div className="w-full">
        <AddressInput value={safeAddress} placeholder={"Funding Address"} onChange={setSafeAddress} />
      </div>
      <div className="w-full">
        <AddressInput value={hackedAddress} placeholder={"Hacked Address"} onChange={setHackedAddress} />
      </div>

      <div className="w-full">
        <button
          className="btn btn-primary w-full"
          onClick={() => {
            if (!ethers.utils.isAddress(safeAddress)) {
              alert("Given safe address is not a valid address");
              return;
            }
            if (!ethers.utils.isAddress(hackedAddress)) {
              alert("Given hacked address is not a valid address");
              return;
            }
            setAccountsInputGiven(true);
          }}
        >
          next
        </button>
      </div>
    </div>
  );

  //////////////////////////////////////////
  //*********** Handling unsigned transactions
  //////////////////////////////////////////
  const [unsignedTxs, setUnsignedTxs] = useLocalStorage<{ [index: number]: object }>("unsignedTxs", {});
  const addUnsignedTx = (newTx: object) => {
    setUnsignedTxs(prev => {
      prev[Object.keys(prev).length] = newTx;
      return prev;
    });
    estimateTotalGasPrice().then(setTotalGasEstimate);
  };
  const removeUnsignedTx = (txId: number) => {
    setUnsignedTxs(prev => {
      delete prev[txId];
      return prev;
    });
    estimateTotalGasPrice().then(setTotalGasEstimate);
  };

  const unsignedTxsDisplay = (
    <>
      {Object.keys(unsignedTxs).length == 0 && (
        <div className="flex justify-center items-center">
          <span className="text-2xl">no unsigned tx</span>
        </div>
      )}
      {Object.keys(unsignedTxs).length > 0 && (
        <>
          {Object.entries(unsignedTxs).map(
            ([idx, tx]) =>
              tx && (
                <div key={idx} className="flex flex-row items-center gap-x-2 p-2 w-full">
                  <div>
                    <XMarkIcon className="w-6 cursor-pointer" onClick={() => removeUnsignedTx(parseInt(idx))} />
                  </div>

                  <div className="w-full">
                    <select className="w-full p-1 text-gray-500 rounded-md shadow-sm appearance-none">
                      <option>{(tx as any)["type"] ? (tx as any)["type"] : ""}</option>

                      {Object.entries(tx).map(([key, value]) => {
                        if (key == "type") return null;
                        return <option key={key} disabled={true}>{`${key}:${value.toString()}`}</option>;
                      })}
                    </select>
                  </div>
                </div>
              ),
          )}
        </>
      )}
    </>
  );

  //////////////////////////////////////////
  //*********** Gas Estimation
  //////////////////////////////////////////
  const [totalGasEstimate, setTotalGasEstimate] = useState<BigNumber>(BigNumber.from("0"));

  const maxBaseFeeInFuture = async () => {
    const blockNumberNow = await publicClient.getBlockNumber();
    const block = await publicClient.getBlock({ blockNumber: blockNumberNow });
    return FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(
      BigNumber.from(block.baseFeePerGas),
      BLOCKS_IN_THE_FUTURE,
    );
  };

  const estimateTotalGasPrice = async () => {
    const tempProvider = new ethers.providers.InfuraProvider("goerli", "416f5398fa3d4bb389f18fd3fa5fb58c");
    try {
      const estimates = await Promise.all(
        Object.values(unsignedTxs).map(tx => {
          const nakedTx = Object.assign({}, tx);
          delete (nakedTx as any)["type"];
          return tempProvider.estimateGas(nakedTx);
        }),
      );
      return estimates
        .reduce((acc, val) => acc.add(val), BigNumber.from("0"))
        .mul(await maxBaseFeeInFuture())
        .mul(105)
        .div(100);
    } catch (e) {
      alert(
        "Error estimating gas prices. Something can be wrong with one of the transactions. Check the console and remove problematic tx.",
      );
      console.error(e);
      return BigNumber.from("0");
    }
  };

  const updateTotalGasEstimate = async () => {
    if (!flashbotsProvider || !feeData || !feeData.gasPrice || sentTxHash.length == 0) return;
    if (Object.keys(unsignedTxs).length == 0) setTotalGasEstimate(BigNumber.from("0"));
    setTotalGasEstimate(await estimateTotalGasPrice());
  };

  useEffect(() => {
    updateTotalGasEstimate();
  }, [Object.keys(unsignedTxs).length]);

  useInterval(() => {
    updateTotalGasEstimate();
  }, 5000);

  const totalGasEstimationDisplay = (
    <div className="flex justify-center">
      <span className="text-2xl">⛽💸 {ethers.utils.formatEther(totalGasEstimate.toString())} 💸⛽</span>
    </div>
  );

  //////////////////////////////////////////
  //*********** Handling the current bundle
  //////////////////////////////////////////

  const [gasCovered, setGasCovered] = useLocalStorage<boolean>("gasCovered", false);
  const [currentBundleId, setCurrentBundleId] = useLocalStorage<string>("bundleUuid", "");
  const [sentTxHash, setSentTxHash] = useLocalStorage<string>("sentTxHash", "");
  const [sentBlock, setSentBlock] = useLocalStorage<number>("sentBlock", 0);

  const sendBundle = async () => {
    if (!flashbotsProvider) {
      alert("Flashbot provider not available");
      return;
    }
    try {
      const finalBundle = await (
        await fetch(
          `https://rpc${targetNetwork.network == "goerli" ? "-goerli" : ""}.flashbots.net/bundle?id=${currentBundleId}`,
        )
      ).json();
      if (!finalBundle || !finalBundle.rawTxs) {
        alert("Couldn't fetch latest bundle");
        return;
      }

      const txs = finalBundle.rawTxs.reverse();

      try {
        setSentTxHash(ethers.utils.keccak256(txs[0]));
        setSentBlock(parseInt((await publicClient.getBlockNumber()).toString()));

        const currentUrl = window.location.href.replace("?", "");
        await fetch(currentUrl + `api/relay${targetNetwork.network == "goerli" ? "-goerli" : ""}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            txs,
          }),
        });
      } catch (e) {
        console.error(e);
        setSentTxHash("");
        setSentBlock(0);
        alert("Error submitting bundles. Check console for details.");
      }
    } catch (e) {
      console.error(e);
      setSentTxHash("");
      setSentBlock(0);
      alert("Error submitting bundles. Check console for details.");
    }
  };

  // poll blocks for txHashes of our bundle
  useInterval(async () => {
    try {
      if (!sentTxHash || sentBlock == 0) return;

      const finalTargetBlock = sentBlock + BLOCKS_IN_THE_FUTURE;
      const currentBlock = parseInt((await publicClient.getBlockNumber()).toString());
      const blockDelta = finalTargetBlock - currentBlock;
      setBlockCountdown(blockDelta);

      if (!countdownModalOpen) {
        setCountdownModalOpen(true);
      }

      if (blockDelta < 0) {
        setCountdownModalOpen(false);
        setTryAgainModalOpen(true);
        setSentBlock(0);
        setSentTxHash("");
        return;
      }
      const txReceipt = await publicClient.getTransactionReceipt({
        hash: sentTxHash as `0x${string}`,
      });
      if (txReceipt && txReceipt.blockNumber) {
        resetState();
        setCountdownModalOpen(false);
        openCustomModal(
          <div style={{ maxWidth: "800px" }} className="flex flex-col gap-y-3 justify-center items-center">
            <span className="text-2xl">Bundle successfully mined in block {txReceipt.blockNumber.toString()}</span>
          </div>,
        );
        return;
      }
      console.log("TXs not yet mined");
    } catch (e) {}
  }, 5000);

  //////////////////////////////////////////
  //******** Handle signing & account switching
  //////////////////////////////////////////

  // Step1
  const [step1ModalOpen, setStep1ModalOpen] = useLocalStorage<boolean>("step1ModalOpen", false);
  const step1ModalDisplay = step1ModalOpen && (
    <ReactModal
      isOpen={step1ModalOpen}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgb(99 102 241)",
        },
      }}
      ariaHideApp={false}
      onRequestClose={() => {
        setStep1ModalOpen(false);
        coverGas();
      }}
    >
      <div className="flex flex-col gap-y-3 justify-center items-center">
        <span className="text-2xl">Connect the safe account</span>
        <RainbowKitCustomConnectButton />
        <span className="text-2xl">Then close the modal to switch to personal Flashbot RPC network</span>
      </div>
    </ReactModal>
  );

  // Step2
  const [step2ModalOpen, setStep2ModalOpen] = useLocalStorage<boolean>("step2ModalOpen", false);
  const step2ModalDisplay = step2ModalOpen && (
    <ReactModal
      isOpen={step2ModalOpen}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgb(99 102 241)",
        },
      }}
      ariaHideApp={false}
      onRequestClose={() => {
        setStep2ModalOpen(false);
        coverGas();
      }}
    >
      <div className="flex flex-col text-center">
        <span className="text-2xl">
          Before moving on, if the safe or hacked accounts have any pending transactions in the wallet, clear activity
          data for both of them.
        </span>
        <span className="text-2xl">
          We'll add a new personal Flashbot RPC network to your wallet, then sign the funding transaction.
        </span>
        <span className="text-2xl">Connect the safe address {safeAddress} using your wallet and close the modal.</span>
      </div>
    </ReactModal>
  );

  // Step3
  const [step3ModalOpen, setStep3ModalOpen] = useLocalStorage<boolean>("step3ModalOpen", false);
  const step3ModalDisplay = step3ModalOpen && (
    <ReactModal
      isOpen={step3ModalOpen}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgb(99 102 241)",
        },
      }}
      ariaHideApp={false}
      onRequestClose={() => {
        setStep3ModalOpen(false);
        signRecoveryTransactions();
      }}
    >
      <div className="flex flex-col">
        <span className="text-2xl">Connect your metamask and switch to the hacked account</span>
        <RainbowKitCustomConnectButton />
      </div>
    </ReactModal>
  );

  // Step4
  const [step4ModalOpen, setStep4ModalOpen] = useLocalStorage<boolean>("step4ModalOpen", false);
  const step4ModalDisplay = step4ModalOpen && (
    <ReactModal
      isOpen={step4ModalOpen}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgb(99 102 241)",
        },
      }}
      ariaHideApp={false}
      onRequestClose={() => {
        setStep4ModalOpen(false);
        signRecoveryTransactions();
      }}
    >
      <div className="flex flex-col">
        <span className="text-2xl">Please switch to the hacked address {hackedAddress}</span>
        <span className="text-2xl">And close the modal to sign the transactions</span>
      </div>
    </ReactModal>
  );

  const coverGas = async () => {
    if (gasCovered) {
      alert("you already covered the gas. If you're in a confussy situation, clear cookies and refresh page.");
      return;
    }

    ////////// Enforce switching to the safe address
    if (!connectedAccount) {
      setStep1ModalOpen(true);
      return;
    } else if (connectedAccount != safeAddress) {
      setStep2ModalOpen(true);
      return;
    }

    try {
      ////////// Create new bundle uuid & add corresponding RPC 'subnetwork' to Metamask
      const newBundleUuid = uuid();
      setCurrentBundleId(newBundleUuid);
      await addRelayRPC(newBundleUuid);

      ////////// Cover the envisioned total gas fee from safe account
      const totalGas = await estimateTotalGasPrice();
      await walletClient!.sendTransaction({
        to: hackedAddress as `0x${string}`,
        value: BigInt(totalGas.toString()),
      });

      setGasCovered(true);
      signRecoveryTransactions(true);
    } catch (e) {
      alert(`Error while adding a custom RPC and signing the funding transaction with the safe account. Error: ${e}`);
    }
  };

  const signRecoveryTransactions = async (surpass: boolean = false) => {
    if (!surpass && !gasCovered) {
      alert("How did you come here without covering the gas fee first??");
      return;
    }

    ////////// Enforce switching to the hacked address
    if (!connectedAccount) {
      setStep3ModalOpen(true);
      return;
    } else if (connectedAccount != hackedAddress) {
      setStep4ModalOpen(true);
      return;
    }

    ////////// Sign the transactions in the basket one after another
    const orderedTxIds = Object.keys(unsignedTxs)
      .sort()
      .map(a => parseInt(a));
    const orderedTxHashes: string[] = [];

    try {
      for (const txId of orderedTxIds) {
        const { type, ...pureTx } = unsignedTxs[txId] as { type: string };
        orderedTxHashes.push(await walletClient!.sendTransaction(pureTx));
      }
      setGasCovered(false);
      sendBundle();
    } catch (e) {
      console.error(`FAILED TO SIGN TXS`);
      console.error(e);
    }
  };

  //////////////////////////////////////////
  //******** Switch to Flashbot RPC Network
  //////////////////////////////////////////

  const addRelayRPC = async (bundleUuid: string) => {
    if (!window.ethereum || !window.ethereum.request) {
      console.error("MetaMask Ethereum provider is not available");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${targetNetwork.network == "goerli" ? 5 : 1}`,
            chainName: "Flashbot Personal RPC",
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [
              `https://rpc${targetNetwork.network == "goerli" ? "-goerli" : ""}.flashbots.net?bundle=${bundleUuid}`,
            ],
            blockExplorerUrls: [`https://${targetNetwork.network == "goerli" ? "goerli." : ""}etherscan.io`],
          },
        ],
      });
    } catch (error) {
      console.error("Failed to add custom RPC network to MetaMask:", error);
    }
  };

  //////////////////////////////////////////
  //*********** ERC20 recovery
  //////////////////////////////////////////

  const [erc20ContractAddress, setErc20ContractAddress] = useLocalStorage<string>("erc20ContractAddress", "");

  let erc20Balance: string = "NO INFO";
  try {
    let { data } = useContractRead({
      chainId: getTargetNetwork().id,
      functionName: "balanceOf",
      address: erc20ContractAddress as `0x${string}`,
      abi: ERC20_ABI,
      watch: true,
      args: [hackedAddress],
    });
    if (data) {
      erc20Balance = BigNumber.from(data).toString();
      if (erc20Balance == "0") erc20Balance = "NO INFO";
    }
  } catch (e) {
    // Most probably the contract address is not valid as user is
    // still typing, so ignore.
  }

  const erc20RecoveryDisplay = (
    <div className="w-full h-full flex flex-col gap-y-2 justify-center bg-base-200 bg-opacity-80 z-0 p-7 rounded-2xl shadow-lg">
      <div className="flex justify-center">
        <span className="text-2xl">ERC20</span>
      </div>
      <AddressInput
        value={erc20ContractAddress}
        placeholder={"ERC20 contract address"}
        onChange={setErc20ContractAddress}
      />

      {erc20Balance != "NO INFO" && (
        <div className="w-full flex gap-x-10">
          <span className="text-xl">Hacked account balance: </span>
          <span className="text-xl">{erc20Balance} </span>
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={async () => {
          if (!erc20ContractAddress) {
            alert("Provide a contract first");
            return;
          }
          if (erc20Balance == "NO INFO") {
            alert("Hacked account has no balance in given erc20 contract");
            return;
          }
          const erc20tx = {
            type: `ERC20 recovery`,
            from: hackedAddress,
            to: erc20ContractAddress,
            data: new ethers.utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [
              safeAddress,
              BigNumber.from(erc20Balance),
            ]),
          };
          addUnsignedTx(erc20tx);
          setErc20ContractAddress("");
        }}
      >
        <span className="text-2xl">🧺 add 🧺</span>
      </button>
    </div>
  );

  //////////////////////////////////////////
  //*********** ERC721 recovery
  //////////////////////////////////////////

  const [erc721ContractAddress, setErc721ContractAddress] = useLocalStorage<string>("erc721ContractAddress", "");
  const [erc721TokenId, setErc721TokenId] = useLocalStorage<string>("erc721TokenId", "");

  const erc721RecoveryDisplay = (
    <div className="w-full h-full flex flex-col overflow-auto gap-y-2 justify-center bg-base-200 bg-opacity-80 z-0 p-7 rounded-2xl shadow-lg">
      <div className="flex justify-center">
        <span className="text-2xl">ERC721</span>
      </div>
      <AddressInput
        value={erc721ContractAddress}
        placeholder={"ERC721 contract address"}
        onChange={setErc721ContractAddress}
      />
      <InputBase<string> placeholder={"ERC721 tokenId"} value={erc721TokenId} onChange={setErc721TokenId} />
      <button
        className="btn btn-primary"
        onClick={async () => {
          if (!erc721ContractAddress || !erc721TokenId) {
            alert("Provide a contract and a token ID");
            return;
          }

          let ownerOfGivenTokenId;
          try {
            ownerOfGivenTokenId = await publicClient.readContract({
              address: erc721ContractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "ownerOf",
              args: [BigNumber.from(erc721TokenId)],
            });
          } catch (e) {}

          if (!ownerOfGivenTokenId || ownerOfGivenTokenId.toString() != hackedAddress) {
            alert(`Couldn't verify hacked account's ownership. Cannot add to the basket...`);
            return;
          }

          const erc721tx = {
            type: `NFT recovery for tokenId ${erc721TokenId}`,
            from: hackedAddress,
            to: erc721ContractAddress,
            data: new ethers.utils.Interface(ERC721_ABI).encodeFunctionData("transferFrom", [
              hackedAddress,
              safeAddress,
              BigNumber.from(erc721TokenId),
            ]),
          };

          addUnsignedTx(erc721tx);
          setErc721ContractAddress("");
          setErc721TokenId("");
        }}
      >
        <span className="text-2xl">🧺 add 🧺</span>
      </button>
    </div>
  );

  //////////////////////////////////////////
  //*********** ERC1155 recovery
  //////////////////////////////////////////

  const [erc1155ContractAddress, setErc1155ContractAddress] = useLocalStorage<string>("erc1155ContractAddress", "");
  const [erc1155TokenIds, setErc1155TokenIds] = useLocalStorage<string>("erc1155TokenIds", "");

  const erc1155RecoveryDisplay = (
    <div className="w-full h-full flex flex-col overflow-auto gap-y-2 justify-center bg-base-200 bg-opacity-80 z-0 p-7 rounded-2xl shadow-lg">
      <div className="flex justify-center">
        <span className="text-2xl">ERC1155</span>
      </div>
      <AddressInput
        value={erc1155ContractAddress}
        placeholder={"ERC1155 contract address"}
        onChange={setErc1155ContractAddress}
      />
      <InputBase<string>
        placeholder={"Comma-separated token ids"}
        value={erc1155TokenIds}
        onChange={str => setErc1155TokenIds(str.replace(" ", ""))}
      />

      <button
        className="btn btn-primary"
        onClick={async () => {
          const tokenIds = erc1155TokenIds
            .split(",")
            .map(a => a)
            .map(a => BigNumber.from(a));
          const balances = (await publicClient.readContract({
            address: erc1155ContractAddress as `0x${string}`,
            abi: ERC1155_ABI,
            functionName: "balanceOfBatch",
            args: [Array(tokenIds.length).fill(hackedAddress), tokenIds],
          })) as BigNumber[];
          const tokenIdsWithInvalidBalances: BigNumber[] = [];
          for (let i = 0; i < tokenIds.length; i++) {
            if (!balances[i] || balances[i].toString() == "0") {
              tokenIdsWithInvalidBalances.push(tokenIds[i]);
            }
          }
          if (tokenIdsWithInvalidBalances.length > 0) {
            alert(
              `Remove following tokenIds as hacked account does not own them: ${tokenIdsWithInvalidBalances.toString()}`,
            );
            return;
          }

          const erc1155tx = {
            type: `ERC1155 for tokenIds ${tokenIds.toString()}`,
            from: hackedAddress,
            to: erc1155ContractAddress,
            data: new ethers.utils.Interface(ERC1155_ABI).encodeFunctionData("safeBatchTransferFrom", [
              hackedAddress,
              safeAddress,
              tokenIds,
              balances,
              ethers.constants.HashZero,
            ]),
          };
          addUnsignedTx(erc1155tx);
          setErc1155ContractAddress("");
          setErc1155TokenIds("");
        }}
      >
        <span className="text-2xl">🧺 add 🧺</span>
      </button>
    </div>
  );

  //////////////////////////////////////////
  //*********** Handling External Contract
  //////////////////////////////////////////

  const [customContractAddress, setCustomContractAddress] = useLocalStorage<string>("customContractAddress", "");
  const [customFunctionABIString, setCustomFunctionABIString] = useLocalStorage<string>("customFunctionABI", "");
  const [externalContractDisplay, setExternalContractDisplay] = useState(<></>);

  useEffect(() => {
    try {
      const parsedFunctAbi = parseAbiItem(customFunctionABIString) as AbiFunction;
      setExternalContractDisplay(
        <div className="p-5 divide-y divide-base-300">
          <CustomContractWriteForm
            fragmentString={customFunctionABIString}
            abiFunction={parsedFunctAbi}
            addUnsignedTx={addUnsignedTx}
            hackedAddress={hackedAddress as `0x${string}`}
            contractAddress={customContractAddress as `0x${string}`}
            resetState={() => {
              setCustomContractAddress("");
              setCustomFunctionABIString("");
              setExternalContractDisplay(<></>);
            }}
          />
        </div>,
      );
    } catch (e) {
      setExternalContractDisplay(<></>);
    }
  }, [customFunctionABIString, customContractAddress]);

  //////////////////////////////////////////
  //*********** Custom / Basic View
  //////////////////////////////////////////
  const [isBasic, setIsBasic] = useLocalStorage<boolean>("isBasic", true);

  const basicViewDisplay = (
    <div
      style={{
        border: "1px solid rgba(215, 215, 215, .20)",
      }}
      className="my-10 w-full flex space-x-5 overflow-x-auto rounded-3xl"
    >
      <div style={{ minWidth: "400px" }} className="w-full py-3">
        {erc20RecoveryDisplay}
      </div>
      <div style={{ minWidth: "400px" }} className="w-full py-3">
        {erc721RecoveryDisplay}
      </div>
      <div style={{ minWidth: "400px", maxHeight: "275px" }} className="w-full py-3">
        {erc1155RecoveryDisplay}
      </div>
    </div>
  );

  const customViewDisplay = (
    <div style={{ maxWidth: "1000px" }} className="my-10 w-full gap-y-3 flex flex-col">
      <div style={{ padding: 4 }}>
        <AddressInput
          placeholder="Enter Contract Address"
          value={customContractAddress}
          onChange={setCustomContractAddress}
        />
      </div>

      <textarea
        value={customFunctionABIString}
        onChange={e => {
          setCustomFunctionABIString(e.target.value);
        }}
        style={{ minHeight: "100px" }}
        className="w-full textarea textarea-info textarea-lg text-sm rounded-lg bg-opacity-20"
        placeholder={`Function ABI Here \n e.g. function transfer(address,uint)`}
      />

      <div>{externalContractDisplay}</div>
    </div>
  );

  //////////////////////////////////////////
  //*********** Custom / Basic View
  //////////////////////////////////////////

  const [customModalOpen, setCustomModalOpen] = useLocalStorage<boolean>("customModalOpen", false);
  const [customModalContent, setCustomModalContent] = useState<React.JSX.Element>(<></>);

  const openCustomModal = (content: React.JSX.Element) => {
    setCustomModalContent(content);
    setCustomModalOpen(true);
  };
  const customModalDisplay = customModalOpen && (
    <ReactModal
      isOpen={customModalOpen}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgb(99 102 241)",
        },
      }}
      ariaHideApp={false}
      onRequestClose={() => {
        setCustomModalOpen(false);
      }}
    >
      {customModalContent}
    </ReactModal>
  );

  //////////////////////////////////////////
  //*********** Modals after submission
  //////////////////////////////////////////

  const [countdownModalOpen, setCountdownModalOpen] = useLocalStorage<boolean>("countdownModalOpen", false);
  const [blockCountdown, setBlockCountdown] = useLocalStorage<number>("blockCountdown", 0);

  const countdownModalDisplay = countdownModalOpen && (
    <ReactModal
      isOpen={countdownModalOpen}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgb(99 102 241)",
        },
      }}
      ariaHideApp={false}
    >
      <div className="flex flex-col gap-y-3 justify-center items-center">
        <span className="text-2xl">Checking if the transactions are mined</span>
        <span className="text-2xl">Wait without refreshing the page</span>
        <span className="text-2xl">Remaining: {blockCountdown + 1} blocks</span>
      </div>
    </ReactModal>
  ); // try again modal resets bundle uuid

  const [tryAgainModalOpen, setTryAgainModalOpen] = useLocalStorage<boolean>("tryAgainModalOpen", false);
  const tryAgainModalDisplay = tryAgainModalOpen && (
    <ReactModal
      isOpen={tryAgainModalOpen}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgb(99 102 241)",
        },
      }}
      ariaHideApp={false}
    >
      <div style={{ maxWidth: "800px" }} className="flex flex-col gap-y-3 justify-center items-center">
        <span className="text-2xl">Bundle not included in the last {BLOCKS_IN_THE_FUTURE} blocks</span>
        <span className="text-2xl">
          You can try again with same gas, but ideally you should clear activity data for funding and hacked accounts,
          and re-sign the transactions with higher max base fee and priority fee.
        </span>

        <button
          style={{ opacity: `${Object.keys(unsignedTxs).length > 0 ? 1 : 0}` }}
          className={`btn btn-sm mr-3 `}
          onClick={() => {
            setTryAgainModalOpen(false);
            sendBundle();
          }}
        >
          TRY AGAIN WITH SAME GAS
        </button>
        <button
          style={{ opacity: `${Object.keys(unsignedTxs).length > 0 ? 1 : 0}` }}
          className={`btn btn-sm mr-3 `}
          onClick={() => {
            setTryAgainModalOpen(false);
            coverGas();
          }}
        >
          RE-SIGN TRANSACTIONS
        </button>
      </div>
    </ReactModal>
  );

  const resetState = () => {
    setHackedAddress("");
    setSafeAddress("");
    setAccountsInputGiven(false);
    setUnsignedTxs({});
    setTotalGasEstimate(BigNumber.from("0"));
    setGasCovered(false);
    setCurrentBundleId("");
    setSentTxHash("");
    setSentBlock(0);
    setStep1ModalOpen(false);
    setStep2ModalOpen(false);
    setStep3ModalOpen(false);
    setStep4ModalOpen(false);
    setErc20ContractAddress("");
    setErc721ContractAddress("");
    setErc721TokenId("");
    setErc1155ContractAddress("");
    setErc1155TokenIds("");
    setCustomContractAddress("");
    setCustomFunctionABIString("");
    setIsBasic(true);
    setExternalContractDisplay(<></>);
  };

  return (
    <>
      <MetaHeader />

      {customModalDisplay}
      {step1ModalDisplay}
      {step2ModalDisplay}
      {step3ModalDisplay}
      {step4ModalDisplay}
      {countdownModalDisplay}
      {tryAgainModalDisplay}

      <div className="flex justify-center text-center items-center py-12">
        {displayAddressInput && (
          <button
            onClick={() => setAccountsInputGiven(false)}
            style={{ left: "10px" }}
            className={`relative top-0 btn btn-primary text-2xl bg-orange-800 bg-opacity-20 border-none`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z"
              />
            </svg>
          </button>
        )}
        <div className="w-full">
          <span className="text-6xl">FLASHBOT BUNDLER FOR ASSETS RECOVERIES</span>
        </div>
      </div>

      <div className="flex px-5 justify-center">
        <div className="flex w-4/5 flex-col justify-center items-center">
          {!displayAddressInput && addressInputDisplay}

          {displayAddressInput && (
            <div className="flex flex-col justify-center items-center w-full">
              <div className="flex justify-center items-center pt-5 gap-x-5">
                <button
                  disabled={isBasic}
                  onClick={() => setIsBasic(true)}
                  className={`btn btn-primary text-2xl bg-orange-300 border-none`}
                >
                  BASIC
                </button>
                <button
                  disabled={!isBasic}
                  onClick={() => setIsBasic(false)}
                  className={`btn btn-primary text-2xl bg-orange-300 border-none`}
                >
                  CUSTOM
                </button>
              </div>

              <></>

              {isBasic ? basicViewDisplay : customViewDisplay}

              <></>

              <div
                style={{
                  border: "1px solid rgba(215, 215, 215, .20)",
                }}
                className="mt-10 flex grow w-full divide-y divide-dashed flex-col justify-start rounded-2xl"
              >
                <div className="flex justify-between items-center py-1">
                  <button
                    onClick={() => setUnsignedTxs([])}
                    style={{ opacity: `${Object.keys(unsignedTxs).length > 0 ? 1 : 0}` }}
                    className="btn btn-sm btn-primary text-sm ml-3"
                  >
                    clear🧺
                  </button>

                  {totalGasEstimationDisplay}

                  <button
                    disabled={gasCovered || !!sentTxHash || Object.keys(unsignedTxs).length == 0}
                    className={`btn btn-sm mr-3 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-none`}
                    onClick={coverGas}
                  >
                    start signing
                  </button>
                </div>

                <div className="flex grow w-full flex-col justify-start">{unsignedTxsDisplay}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
