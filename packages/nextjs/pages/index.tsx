/* eslint-disable */
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { BigNumber } from "@ethersproject/bignumber";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { ethers } from "ethers";
import type { NextPage } from "next";
import ReactModal from "react-modal";
import { useInterval, useLocalStorage } from "usehooks-ts";
import { uuid } from "uuidv4";
import { getContract } from "viem";
import { useAccount, useContractRead, useFeeData, usePublicClient, useWalletClient } from "wagmi";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { AddressInput, InputBase, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { ERC20_ABI, ERC721_ABI, ERC1155_ABI } from "~~/utils/constants";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const ERC721_APPROVAL_GAS_UNITS = 55000;

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
  const [safeAddress, setSafeAddress] = useLocalStorage("toAddress", "0xA2539dA2c528d854c0f10aB24DA47Dc5C6FdebA0");
  const [hackedAddress, setHackedAddress] = useLocalStorage(
    "hackedAddress",
    "0x5F1442eF295BC2Ef0a65b7d49198a34B13c1E3aB",
  );

  //////////////////////////////////////////
  //*********** Handling unsigned transactions
  //////////////////////////////////////////
  const [unsignedTxs, setUnsignedTxs] = useLocalStorage<{ [index: number]: object }>("unsignedTxs", {});
  const addUnsignedTx = (newTx: object) =>
    setUnsignedTxs(prev => {
      prev[Object.keys(prev).length] = newTx;
      return prev;
    });
  const removeUnsignedTx = (txId: number) =>
    setUnsignedTxs(prev => {
      delete prev[txId];
      return prev;
    });

  const unsignedTxsDisplay = (
    <>
      {Object.keys(unsignedTxs).length == 0 && (
        <div className="flex justify-center items-center">
          <span className="text-2xl">no unsigned tx</span>
        </div>
      )}
      {Object.keys(unsignedTxs).length > 0 && (
        <div>
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
        </div>
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
    return (
      await Promise.all(
        Object.values(unsignedTxs).map(tx => {
          const nakedTx = Object.assign({}, tx);
          delete (nakedTx as any)["type"];
          return tempProvider.estimateGas(nakedTx);
        }),
      )
    )
      .reduce((acc, val) => acc.add(val), BigNumber.from("0"))
      .mul(await maxBaseFeeInFuture())
      .mul(10)
      .div(9);
  };

  useEffect(() => {
    if (!flashbotsProvider || !feeData || !feeData.gasPrice) return;
    estimateTotalGasPrice().then(setTotalGasEstimate);
  }, [Object.keys(unsignedTxs).length]);

  const totalGasEstimationDisplay = (
    <div className="flex justify-center">
      <span className="text-2xl">⛽💸 {ethers.utils.formatEther(totalGasEstimate.toString())} 💸⛽</span>
    </div>
  );

  //////////////////////////////////////////
  //*********** Handling the current bundle
  //////////////////////////////////////////

  const [gasCovered, setGasCovered] = useState<boolean>(false);
  const [currentBundleId, setCurrentBundleId] = useLocalStorage("bundleUuid", "");
  const [sentTxHash, setSentTxHash] = useState<string>();
  const [sentBlock, setSentBlock] = useState<number>();

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
        const rawRes = await fetch(currentUrl + `api/relay${targetNetwork.network == "goerli" ? "-goerli" : ""}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            txs,
          }),
        });
        const res = await rawRes.json();

        alert(res.response);
      } catch (e) {
        console.log(e);
        setSentTxHash("");
        setSentBlock(undefined);
        alert("Error submitting bundles. Check console for details.");
      }
    } catch (error) {
      console.log(error);
      setSentTxHash("");
      setSentBlock(undefined);
      alert("Error submitting bundles. Check console for details.");
    }
  };

  // poll blocks for txHashes of our bundle
  useInterval(async () => {
    try {
      if (!sentTxHash || !sentBlock) return;

      console.log("checking if TXs were mined...");
      const finalTargetBlock = sentBlock + BLOCKS_IN_THE_FUTURE;
      const currentBlock = parseInt((await publicClient.getBlockNumber()).toString());
      const blockDelta = finalTargetBlock - currentBlock;
      console.log(`Will keep doing that for ${blockDelta} more blocks.`);

      if (blockDelta < 0) {
        alert(
          `Bundle not included in the last ${BLOCKS_IN_THE_FUTURE} blocks. Try again with gas and priority fee 2 to 3 times that of the market`,
        );
        setSentBlock(undefined);
        setSentTxHash("");
        setHackedAddress("");
        setSafeAddress("");
        return;
      }
      const txReceipt = await publicClient.getTransactionReceipt({
        hash: sentTxHash as `0x${string}`,
      });
      if (txReceipt && txReceipt.blockNumber) {
        alert("Bundle successfully mined in block " + txReceipt.blockNumber);
        setSentBlock(undefined);
        setSentTxHash("");
        setCurrentBundleId("");
        setUnsignedTxs([]);
        return;
      }

      console.log("TXs not yet mined");
    } catch (e) {}
  }, 5000);

  //////////////////////////////////////////
  //******** Handle signing & account switching
  //////////////////////////////////////////

  // Step1
  const [step1ModalOpen, setStep1ModalOpen] = useState<boolean>(false);
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
        <span className="text-2xl">And close the modal</span>
      </div>
    </ReactModal>
  );

  // Step2
  const [step2ModalOpen, setStep2ModalOpen] = useState<boolean>(false);
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
      <div className="flex flex-col">
        <span className="text-2xl">Please connect the safe address {safeAddress} from wallet</span>
        <span className="text-2xl">And close the modal. This is necessary to cover the gas fees.</span>
      </div>
    </ReactModal>
  );

  // Step3
  const [step3ModalOpen, setStep3ModalOpen] = useState<boolean>(false);
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
  const [step4ModalOpen, setStep4ModalOpen] = useState<boolean>(false);
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
        <span className="text-2xl">And close the modal. This is necessary to cover the gas fees.</span>
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
            blockExplorerUrls: ["https://goerli.etherscan.io"],
          },
        ],
      });
      console.log("Custom RPC network added to MetaMask");
    } catch (error) {
      console.error("Failed to add custom RPC network to MetaMask:", error);
    }
  };

  //////////////////////////////////////////
  //*********** ERC20 recovery
  //////////////////////////////////////////

  const [erc20ContractAddress, setErc20ContractAddress] = useLocalStorage("erc20ContractAddress", "");

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

  const [erc721ContractAddress, setErc721ContractAddress] = useLocalStorage("erc721ContractAddress", "");
  const [erc721TokenId, setErc721TokenId] = useLocalStorage("erc721TokenId", "");

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

  const [erc1155ContractAddress, setErc1155ContractAddress] = useLocalStorage("erc1155ContractAddress", "");
  const [erc1155TokenIds, setErc1155TokenIds] = useLocalStorage("erc1155TokenIds", "");

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
          console.log("zürten erc1155 tokenIds");
          console.log(tokenIds);

          const balances = (await publicClient.readContract({
            address: erc1155ContractAddress as `0x${string}`,
            abi: ERC1155_ABI,
            functionName: "balanceOfBatch",
            args: [Array(tokenIds.length).fill(hackedAddress), tokenIds],
          })) as BigNumber[];
          console.log("zürten erc1155 balances");
          console.log(balances);

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

  const [contractAddress, setContractAddress] = useLocalStorage("contractAddress", "");
  const [contractABI, setContractABI] = useState<string>("");

  let theExternalContract = getContract({
    address: `0x${contractAddress}`,
    abi: contractABI as any,
  });

  //////////////////////////////////////////
  //*********** Custom / Basic View
  //////////////////////////////////////////
  const [isBasic, setIsBasic] = useState<boolean>(true);

  return (
    <div className="">
      <MetaHeader />

      {step1ModalDisplay}
      {step2ModalDisplay}
      {step3ModalDisplay}
      {step4ModalDisplay}

      <></>
      <></>

      <div className="flex justify-center py-12">
        <span className="text-6xl">FLASHBOT BUNDLER FOR ASSETS RECOVERIES</span>
      </div>

      <></>
      <></>

      <div className="flex">
        <div className="flex w-80">
          <img src="assets/bg.png" alt={`bg`} />
        </div>

        <div className="flex w-full flex-col justify-around items-center">
          {/* <button onClick={sendBundle}>TEST</button> */}
          <div className="flex w-full justify-center">
            <div className="flex w-full flex-col justify-start gap-y-3 gap-x-5 p-2">
              <div className="flex flex-col justify-start">
                <div className="flex justify-start">
                  <span className="text-2xl">safe account</span>
                </div>
                <div className="w-full">
                  <AddressInput value={safeAddress} placeholder={"Funding Address"} onChange={setSafeAddress} />
                </div>
                <div className="flex justify-start">
                  <span className="text-2xl">hacked account</span>
                </div>
                <div className="w-full">
                  <AddressInput value={hackedAddress} placeholder={"Hacked Address"} onChange={setHackedAddress} />
                </div>
              </div>
            </div>
            <></>

            <div
              style={{
                border: "1px solid rgba(215, 215, 215, .20)",
              }}
              className="flex w-full divide-y divide-dashed flex-col justify-start h-48 overflow-auto  rounded-2xl"
            >
              <div className="flex justify-between py-1">
                <span className="text-2xl ml-3">🧺</span>
                <div className="">{totalGasEstimationDisplay}</div>

                {!gasCovered ? (
                  <button
                    style={{ opacity: `${Object.keys(unsignedTxs).length > 0 ? 1 : 0}` }}
                    className={`btn btn-sm mr-3 `}
                    onClick={coverGas}
                  >
                    {!sentTxHash || sentTxHash == "" ? "DONE" : "..."}
                  </button>
                ) : (
                  <></>
                  // <button
                  //   style={{ opacity: `${Object.keys(unsignedTxs).length > 0 ? 1 : 0}` }}
                  //   className={`btn btn-sm mr-3 `}
                  //   onClick={signRecoveryTransactions}
                  // >
                  //   sign txs
                  // </button>
                )}
              </div>
              {unsignedTxsDisplay}
            </div>
          </div>

          <></>

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

          <div
            style={{ minWidth: "400px", maxWidth: "1200px" }}
            className="mx-7 my-5 w-full flex overflow-x-auto space-x-5 border border-gray-200/25 rounded-3xl"
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
        </div>

        <div className="flex w-80">
          <img src="assets/bg2.png" alt={`bg2`} />
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
