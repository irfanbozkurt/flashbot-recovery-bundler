import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import GasSvg from "../../../public/assets/flashbotRecovery/gas.svg";
import { CustomButton } from "../CustomButton/CustomButton";
import styles from "./transactionBundleStep.module.css";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { BigNumber, ethers } from "ethers";
import { motion } from "framer-motion";
import { RecoveryTx } from "~~/types/business";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { usePublicClient } from "wagmi";
import { useInterval } from "usehooks-ts";

interface IProps {
  isVisible: boolean;
  clear: () => void;
  transactions: RecoveryTx[];
  onAddMore: () => void;
  modifyTransactions: Dispatch<SetStateAction<RecoveryTx[]>>;
}
const BLOCKS_IN_THE_FUTURE: { [i: number]: number } = {
  1: 7,
  5: 10,
};

export const TransactionBundleStep = ({
  clear,
  onAddMore,
  isVisible,
  transactions,
  modifyTransactions,
}: IProps) => {
  if (!isVisible) {
    return <></>;
  }
  const targetNetwork = getTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });
  const [totalGasEstimate, setTotalGasEstimate] = useState<BigNumber>(BigNumber.from("0"));


  useEffect(() => {
    if(transactions.length == 0){
      return
    }
    estimateTotalGasPrice(transactions).then(setTotalGasEstimate)
  }, [transactions])

  const updateTotalGasEstimate = async () => {
    setTotalGasEstimate(await estimateTotalGasPrice(transactions));
  };

  useInterval(() => {
    updateTotalGasEstimate();
  }, 5000);
  
  const maxBaseFeeInFuture = async () => {
    const blockNumberNow = await publicClient.getBlockNumber();
    const block = await publicClient.getBlock({ blockNumber: blockNumberNow });
    return FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(
      BigNumber.from(block.baseFeePerGas),
      BLOCKS_IN_THE_FUTURE[targetNetwork.id],
    );
  };

  const estimateTotalGasPrice = async (txs?: RecoveryTx[]) => {
    const tempProvider = new ethers.providers.InfuraProvider(targetNetwork.id, "416f5398fa3d4bb389f18fd3fa5fb58c");
    if (!txs) {
      txs = transactions;
    }

    try {
      const estimates = await Promise.all(
        txs
          .filter(a => a)
          .map((tx, txId) => {
            return tempProvider.estimateGas(tx.toSign).catch(e => {
              console.warn(
                `Following tx will fail when bundle is submitted, so it's removed from the bundle right now. The contract might be a hacky one, and you can try further manipulation via crafting a custom call.`,
              );
              console.warn(tx);
              console.warn(e);
              removeUnsignedTx(txId);
              return BigNumber.from("0");
            });
          }),
      );

      return estimates
        .reduce((acc: BigNumber, val: BigNumber) => acc.add(val), BigNumber.from("0"))
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

  const removeUnsignedTx = (txId: number) => {
    modifyTransactions((prev: RecoveryTx[]) => {
      if (txId < 0 || txId > prev.length) {
        return prev.filter(a => a);
      }
      delete prev[txId];

      const newUnsignedTxArr = prev.filter(a => a);
      return newUnsignedTxArr;
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.container}>
      <h2 className={styles.title}>Your transactions</h2>
      <div></div>
      <div className={styles.assetList}>
        {transactions.map((item, i) => {
          return <TransactionItem key={i} onDelete={() => removeUnsignedTx(i)} tx={item} />;
        })}
      </div>
      <span className={styles.clear} onClick={() => clear()}>
        Clear all
      </span>
      <div className={styles.gasContainer}>
        <Image height={40} width={40} src={GasSvg} alt="" />
        <span className={styles.gasValue}>{ethers.utils.formatEther(totalGasEstimate.toString())}</span>
      </div>

      <div className="m-2"></div>
      <CustomButton type="btn-accent" text={"Assets"} onClick={() => onAddMore()} />
      <div className="m-2"></div>
      <CustomButton type="btn-primary" text={"Start Signing"} onClick={() => ({})} />
    </motion.div>
  );
};

interface ITransactionProps {
  onDelete: () => void;
  tx?: RecoveryTx;
}

const TransactionItem = ({ onDelete, tx }: ITransactionProps) => {
  const getTitle = () => {
    if (!tx) {
      return "";
    }
    if (["erc1155", "erc721"].indexOf(tx.type) != -1) {
      //@ts-ignore
      return `${tx.info} (${tx.tokenId!})`;
    }
    if (tx.type === "erc20") {
      //@ts-ignore
      return `${tx.value} ${tx.symbol} `;
    }
    return tx.info;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${styles.assetItem} bg-base-200 text-secondary-content`}
    >
      <div className={styles.data}>
        <h3>{getTitle()}</h3>
      </div>
      <div className={`${styles.close}`} onClick={() => onDelete()}>
        X
      </div>
    </motion.div>
  );
};
