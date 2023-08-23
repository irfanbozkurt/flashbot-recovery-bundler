import React, { useState } from "react";
import { BigNumber } from "ethers";
import { useLocalStorage } from "usehooks-ts";
import { v4 } from "uuid";
import { useAccount, useWalletClient } from "wagmi";
import { RecoveryTx } from "~~/types/business";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { useGasEstimation } from "./useGasEstimation";

interface IStartProcessPops {
  safeAddress:string,
    modifyBundleId:(arg: string) => void,
    totalGas:BigNumber,
    hackedAddress:string,
    transactions:RecoveryTx[]
}

export enum RecoveryProcessStatus {
  initial,
  gasCovered,
  noAccountConnected,
  noSafeAccountConnected,
  switchFlashbotNetworkAndPayBundleGas,
  imposible,
  increaseGas,
  gasPaid,
  switchToHacked,
  allTxSigned,
  signEachTransaction,
  cachedDataToClean,
  success,
}

export const useBundleProcess = () => {
  const targetNetwork = getTargetNetwork();
  const [gasCovered, setGasCovered] = useState<boolean>(false);
  const [stepActive, setStepActive] = useState<RecoveryProcessStatus>(RecoveryProcessStatus.initial);
  const {estimateTotalGasPrice} = useGasEstimation()
  const { address } = useAccount();
  
  const { data: walletClient } = useWalletClient();

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




  const signRecoveryTransactions = async (hackedAddress:string, transactions:RecoveryTx[], surpass: boolean = false) => {

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
      setStepActive(RecoveryProcessStatus.allTxSigned);
      // sendBundle();
    } catch (e) {
      alert(`FAILED TO SIGN TXS Error: ${e}`);
      resetStatus()
    }
  };




  const startBundleProcess = async ({safeAddress,modifyBundleId,totalGas, hackedAddress, transactions }:IStartProcessPops) => {
    const isValid = validateBundleIsReady(safeAddress);
    if (!isValid) {
      return;
    }
    try {
      ////////// Create new bundle uuid & add corresponding RPC 'subnetwork' to Metamask
      const bundleId = await changeFlashbotNetwork();
      modifyBundleId(bundleId);
      //ODO review how to set the removed
      const total = await estimateTotalGasPrice(transactions, () => ({}))
      // ////////// Cover the envisioned total gas fee from safe account
      await payTheGas(total, hackedAddress)
      setStepActive(RecoveryProcessStatus.gasPaid);
      signRecoveryTransactions(hackedAddress, transactions, true);
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
    startBundleProcess,
    signRecoveryTransactions,
    resetStatus
  }
};
