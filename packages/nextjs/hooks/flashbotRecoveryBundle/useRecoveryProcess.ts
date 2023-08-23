import React, { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useInterval, useLocalStorage } from "usehooks-ts";
import { v4 } from "uuid";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { RecoveryTx } from "~~/types/business";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";

interface IStartProcessPops {
  safeAddress:string,
    modifyBundleId:(arg: string) => void,
    totalGas:BigNumber,
    hackedAddress:string,
    transactions:RecoveryTx[],
    currentBundleId:string;
}

const BLOCKS_IN_THE_FUTURE: { [i: number]: number } = {
  1: 7,
  5: 10,
};

export enum RecoveryProcessStatus {
  initial,
  gasCovered,
  cachedDataToClean,
  noAccountConnected,
  noSafeAccountConnected,
  switchFlashbotNetworkAndPayBundleGas,
  imposible,
  increaseGas,
  switchToHacked,
  signEachTransaction,
  allTxSigned,
  sendingBundle,
  listeningToBundle,
  success,
}

const flashbotSigner = ethers.Wallet.createRandom();


export const useRecoveryProcess = () => {
  const targetNetwork = getTargetNetwork();
  const [flashbotsProvider, setFlashbotsProvider] = useState<FlashbotsBundleProvider>();
  const [gasCovered, setGasCovered] = useState<boolean>(false);
  const [sentTxHash, setSentTxHash] = useLocalStorage<string>("sentTxHash", "");
  const [sentBlock, setSentBlock] = useLocalStorage<number>("sentBlock", 0);
  const [blockCountdown, setBlockCountdown] = useLocalStorage<number>("blockCountdown", 0);

  const [stepActive, setStepActive] = useState<RecoveryProcessStatus>(RecoveryProcessStatus.initial);
  const publicClient = usePublicClient({ chainId: targetNetwork.id });
  const { address } = useAccount();
  
  const { data: walletClient } = useWalletClient();
  const FLASHBOTS_RELAY_ENDPOINT = `https://relay${targetNetwork.network == "goerli" ? "-goerli" : ""}.flashbots.net/`;


  useEffect(() => {
    (async () => {
      if (!targetNetwork || !targetNetwork.blockExplorers) return;
      setFlashbotsProvider(
        await FlashbotsBundleProvider.create(
          new ethers.providers.InfuraProvider(targetNetwork.id),
          flashbotSigner,
          FLASHBOTS_RELAY_ENDPOINT,
          targetNetwork.network == "goerli" ? "goerli": undefined
        ),
      );
    })();
  }, [targetNetwork.id]);

  useInterval(async () => {
    const isNotAbleToListenBundle = stepActive != RecoveryProcessStatus.listeningToBundle || !sentTxHash || sentBlock == 0
    try {
      if (isNotAbleToListenBundle) return;
      const finalTargetBlock = sentBlock + BLOCKS_IN_THE_FUTURE[targetNetwork.id];
      const currentBlock = parseInt((await publicClient.getBlockNumber()).toString());
      const blockDelta = finalTargetBlock - currentBlock;
      setBlockCountdown(blockDelta);

      if (blockDelta < 0) {
        alert("Error, try again");
        setSentBlock(0);
        setSentTxHash("");
        resetStatus();
        return;
      }
      const txReceipt = await publicClient.getTransactionReceipt({
        hash: sentTxHash as `0x${string}`,
      });
      if (txReceipt && txReceipt.blockNumber) {
        setStepActive(RecoveryProcessStatus.success);
      }
      //   return;
      console.log("TXs not yet mined");
    } catch (e) {}
  }, 5000);

  

  const resetStatus = () => {
    setStepActive(RecoveryProcessStatus.initial);
  }
  const validateBundleIsReady = (safeAddress: string) => {
    if (gasCovered) {
      setStepActive(RecoveryProcessStatus.gasCovered);
      return false;
    }

    ////////// Enforce switching to the safe address
    if (!address) {
      setStepActive(RecoveryProcessStatus.noAccountConnected);
      return false;
    } else if (address != safeAddress) {
      setStepActive(RecoveryProcessStatus.noSafeAccountConnected);
      return false;
    }
    setStepActive(RecoveryProcessStatus.switchFlashbotNetworkAndPayBundleGas);
    return true;
  };

  const changeFlashbotNetwork = async () => {
    const newBundleUuid = v4();
    await addRelayRPC(newBundleUuid);
    return newBundleUuid;
  };

  const payTheGas = async (totalGas: BigNumber, hackedAddress: string) => {
    await walletClient!.sendTransaction({
      to: hackedAddress as `0x${string}`,
      value: BigInt(totalGas.toString()),
    });
    setGasCovered(true);
  };




  const signRecoveryTransactions = async (hackedAddress:string, transactions:RecoveryTx[],currentBundleId:string, surpass: boolean = false) => {

    if (!surpass && !gasCovered) {
      alert("How did you come here without covering the gas fee first??");
      resetStatus()
      return;
    }

    ////////// Enforce switching to the hacked address
    if (address != hackedAddress) {
      setStepActive(RecoveryProcessStatus.switchToHacked);
      return;
    }
    setStepActive(RecoveryProcessStatus.signEachTransaction);
    ////////// Sign the transactions in the basket one after another
    try {
      for (const tx of transactions) {
        await walletClient!.sendTransaction(tx.toSign);
      }
      setGasCovered(false);
      await sendBundle(currentBundleId);
    } catch (e) {
      alert(`FAILED TO SIGN TXS Error: ${e}`);
      resetStatus()
    }
  };



  const sendBundle = async (currentBundleId:string) => {
    if (!flashbotsProvider) {
      alert("Flashbot provider not available");
      resetStatus()
      return;
    }
    setStepActive(RecoveryProcessStatus.sendingBundle);
    try {
      const finalBundle = await (
        await fetch(
          `https://rpc${targetNetwork.network == "goerli" ? "-goerli" : ""}.flashbots.net/bundle?id=${currentBundleId}`,
        )
      ).json();
      if (!finalBundle || !finalBundle.rawTxs) {
        alert("Couldn't fetch latest bundle");
        resetStatus()
        return;
      }

      const txs = finalBundle.rawTxs.reverse();

      try {
        setSentTxHash(ethers.utils.keccak256(txs[0]));
        setSentBlock(parseInt((await publicClient.getBlockNumber()).toString()));

        const currentUrl = window.location.href.replace("?", "");
        const response = await fetch(currentUrl + `api/relay${targetNetwork.network == "goerli" ? "-goerli" : ""}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            txs,
          }),
        });

        await response.json()
        setStepActive(RecoveryProcessStatus.listeningToBundle);
      } catch (e) {
        console.error(e);
        setSentTxHash("");
        setSentBlock(0);
        alert("Error submitting bundles. Check console for details.");
        resetStatus();
      }
    } catch (e) {
      console.error(e);
      setSentTxHash("");
      setSentBlock(0);
      alert("Error submitting bundles. Check console for details.");
      resetStatus();
    }
  };





  const startRecoveryProcess = async ({safeAddress,modifyBundleId,totalGas,currentBundleId, hackedAddress, transactions }:IStartProcessPops) => {
    const isValid = validateBundleIsReady(safeAddress);
    if (!isValid) {
      return;
    }
    try {
      ////////// Create new bundle uuid & add corresponding RPC 'subnetwork' to Metamask
      const bundleId = await changeFlashbotNetwork();
      modifyBundleId(bundleId);
      setStepActive(RecoveryProcessStatus.increaseGas);
      // ////////// Cover the envisioned total gas fee from safe account
      await payTheGas(totalGas, hackedAddress)
      signRecoveryTransactions(hackedAddress, transactions, currentBundleId,true);
      return;
    } catch (e) {
      resetStatus()
      alert(`Error while adding a custom RPC and signing the funding transaction with the safe account. Error: ${e}`);
    }
  };

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

  return {
    data:stepActive,
    sentBlock,
    sentTxHash,
    blockCountdown,
    startRecoveryProcess,
    signRecoveryTransactions,
    resetStatus
  }
};
