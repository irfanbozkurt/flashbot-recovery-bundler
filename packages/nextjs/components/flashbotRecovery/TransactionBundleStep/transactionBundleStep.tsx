import React, { Dispatch, SetStateAction, useEffect } from "react";
import Image from "next/image";
import GasSvg from "../../../public/assets/flashbotRecovery/gas.svg";
import { CustomButton } from "../CustomButton/CustomButton";
import styles from "./transactionBundleStep.module.css";
import { BigNumber, ethers } from "ethers";
import { motion } from "framer-motion";
import { RecoveryTx } from "~~/types/business";
import { useInterval } from "usehooks-ts";
import { useGasEstimation } from "~~/hooks/flashbotRecoveryBundle/useGasEstimation";

interface IProps {
  isVisible: boolean;
  clear: () => void;
  transactions: RecoveryTx[];
  onAddMore: () => void;
  modifyTransactions: Dispatch<SetStateAction<RecoveryTx[]>>;
  onSubmit:(val:BigNumber) => void;
  totalGasEstimate:BigNumber;
  setTotalGasEstimate:Dispatch<SetStateAction<BigNumber>>;
}

export const TransactionBundleStep = ({
  clear,
  onAddMore,
  isVisible,
  onSubmit,
  transactions,
  modifyTransactions,
  totalGasEstimate,
  setTotalGasEstimate
}: IProps) => {

  const {estimateTotalGasPrice} = useGasEstimation()
 
  useEffect(() => {
    if(transactions.length == 0){
      return
    }
    estimateTotalGasPrice(transactions, removeUnsignedTx).then(setTotalGasEstimate)
  }, [transactions])

  const updateTotalGasEstimate = async () => {
    setTotalGasEstimate(await estimateTotalGasPrice(transactions, removeUnsignedTx));
  };

  useInterval(() => {
    if(transactions.length == 0){
      return
    }
    updateTotalGasEstimate();
  }, 5000);

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

  if (!isVisible) {
    return <></>;
  }
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
        <Image height={30} width={30} src={GasSvg} alt="" />
        <div className="m-1"></div>
        <span className={styles.gasValue}>{ethers.utils.formatEther(totalGasEstimate.toString())}</span>
      </div>
      <div className="m-4"></div>
      <CustomButton type="btn-accent" text={"Back to Assets"} onClick={() => onAddMore()} />
      <div className="m-2"></div>
      <CustomButton type="btn-primary" text={"Start Signing"} onClick={() => onSubmit(totalGasEstimate)} />
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
