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
import { AddressInput, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { ERC20_ABI } from "~~/utils/constants";
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
  //*********** Modal
  //////////////////////////////////////////
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<any>(<></>);
  const openModal = (modalContentJsx: any) => {
    setModalContent(modalContentJsx);
    setModalOpen(true);
  };

  const modalDisplay = (
    <ReactModal
      isOpen={modalOpen}
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
      onRequestClose={() => setModalOpen(false)}
      contentLabel="qweqwe"
    >
      {modalContent}
    </ReactModal>
  );

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
      {Object.keys(unsignedTxs).length == 0 && <span className="text-2xl">no unsigned tx</span>}
      {Object.keys(unsignedTxs).length > 0 && (
        <div className="text-2xl">
          {Object.entries(unsignedTxs).map(([idx, tx]) => (
            <div key={idx} className="flex flex-col bg-base-500 bg-opacity-80 z-0 p-2 rounded-2xl shadow-lg">
              <div className="flex gap-x-5 pb-3">
                <XMarkIcon className="w-6 cursor-pointer" onClick={() => removeUnsignedTx(parseInt(idx))} />
                <span className="text-lg">{(tx as any)["type"] ? (tx as any)["type"] : ""}</span>
              </div>
              <span className="text-xl">
                {Object.entries(tx).map(([key, value]) => {
                  if (key == "type") return null;
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-lg">
                        {key} : {value.substring(0, 42) + (value.length > 42 ? "..." : "")}
                      </span>
                    </div>
                  );
                })}
              </span>
            </div>
          ))}
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
      .mul(5)
      .div(4);
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

  const coverGas = async () => {
    if (gasCovered) {
      console.error("you already covered the gas. If you're in a confussy situation, clear cookies and refresh page.");
      return;
    }

    ////////// Enforce switching to the safe address
    if (!connectedAccount) {
      openModal(
        // ToDo: can I make this cover whole screen, and not close until user switches to the safe account?
        <div className="flex flex-col gap-y-3 justify-center items-center">
          <span className="text-2xl">Connect your metamask and switch to the safe account</span>
          <RainbowKitCustomConnectButton />
          <span className="text-2xl">Then close this modal, and click done again</span>
        </div>,
      );
      return;
    } else if (connectedAccount != safeAddress) {
      openModal(
        <div className="flex flex-col">
          <span className="text-2xl">Please switch to the safe address using Metamask</span>
        </div>,
      );
      return;
    }

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
  };

  const signRecoveryTransactions = async () => {
    if (!gasCovered) {
      alert("How did you come here without covering the gas fee first??");
      return;
    }

    ////////// Enforce switching to the hacked address
    if (!connectedAccount) {
      openModal(
        <div className="flex flex-col">
          <span className="text-2xl">Connect your metamask and switch to the hacked account</span>
          <RainbowKitCustomConnectButton />
        </div>,
      );
      return;
    } else if (connectedAccount != hackedAddress) {
      openModal(
        <div className="flex flex-col">
          <span className="text-2xl">Please switch to the hacked address using Metamask</span>
        </div>,
      );
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
      return;
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
    let { data, refetch: refetchErc20Balance } = useContractRead({
      chainId: getTargetNetwork().id,
      functionName: "balanceOf",
      address: erc20ContractAddress as `0x${string}`,
      abi: ERC20_ABI,
      watch: true,
      args: [hackedAddress],
    });
    if (data) erc20Balance = BigNumber.from(data).toString();
  } catch (e) {
    // Most probably the contract address is not valid as user is
    // still typing, so ignore.
  }

  const erc20RecoveryDisplay = (
    <div className="flex w-full flex-col gap-y-2 justify-center bg-base-200 bg-opacity-80 z-0 p-7 rounded-2xl shadow-lg">
      <div className="flex justify-center">
        <span className="text-2xl">Recover ERC20</span>
      </div>
      <AddressInput
        value={erc20ContractAddress}
        placeholder={"ERC20 token contract address"}
        onChange={setErc20ContractAddress}
      />

      <div className="w-full flex gap-x-10">
        <span className="text-xl">Hacked account balance: </span>
        <span className="text-xl">{erc20Balance} </span>
      </div>

      {erc20Balance == "..." ? (
        <div className="flex justify-center">
          <span className="text-xl text-red-800">CHECK CONTRACT ADDRESS</span>
        </div>
      ) : (
        <button
          className="btn btn-primary"
          onClick={async () => {
            const erc20tx = {
              type: `ERC20 transfer to ${safeAddress}`,
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
      )}
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

  return (
    <>
      <MetaHeader />
      {modalDisplay}
      <></>
      <></>

      <div className="flex flex-col items-center flex-grow pt-5">
        <button onClick={sendBundle}>TEST</button>
        <></>
        <></>
        <div className="flex w-11/12 justify-center items-center">
          <div className="flex w-full flex-col gap-y-3 gap-x-5 p-5 ">
            <div className="flex justify-center">
              <span className="text-2xl ml-3">Start by entering the safe funding account</span>
            </div>
            <div className="w-full">
              {/* <RainbowKitCustomConnectButton /> */}
              <AddressInput value={safeAddress} placeholder={"Funding Address"} onChange={setSafeAddress} />
            </div>
            <div className="flex justify-center">
              <span className="text-2xl">and entering hacked account address</span>
            </div>
            <div className="w-full">
              <AddressInput value={hackedAddress} placeholder={"Hacked Address"} onChange={setHackedAddress} />
            </div>
          </div>

          <></>

          <div className="flex w-full divide-y divide-dashed flex-col justify-start h-72 overflow-auto border-2 border-primary rounded-2xl">
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
                <button
                  style={{ opacity: `${Object.keys(unsignedTxs).length > 0 ? 1 : 0}` }}
                  className={`btn btn-sm mr-3 `}
                  onClick={signRecoveryTransactions}
                >
                  sign txs
                </button>
              )}
            </div>
            {unsignedTxsDisplay}
          </div>
        </div>
        <></>
        <></>
        <div className="flex space-around gap-x-5 w-11/12 p-5">
          {erc20RecoveryDisplay}
          <></>
          <div className="flex gap-y-2 w-full flex-col justify-center"></div>
        </div>
        <></>
        <></>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
