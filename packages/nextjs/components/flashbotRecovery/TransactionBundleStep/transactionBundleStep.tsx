import React, { Dispatch, SetStateAction } from "react";
import { CustomButton } from "../CustomButton/CustomButton";
import styles from "./transactionBundleStep.module.css";
import { AnimatePresence, motion } from "framer-motion";
import { RecoveryTx } from "~~/types/business";

interface IProps {
  isVisible: boolean;
  clear: () => void;
  transactions: RecoveryTx[];
  onAddMore: () => void;
  modifyTransactions: Dispatch<SetStateAction<RecoveryTx[]>>;
}
export const TransactionBundleStep = ({ clear, onAddMore, isVisible, transactions, modifyTransactions }: IProps) => {
  if (!isVisible) {
    return <></>;
  }

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
      <div className={styles.assetList}>
        {transactions.map((item, i) => {
          return <TransactionItem key={i} onDelete={() => removeUnsignedTx(i)} tx={item} />;
        })}
      </div>
      <span className={styles.clear} onClick={() => clear()}>
        Clear all
      </span>
      <div className="m-2"></div>
      <CustomButton type="accent" text={"Add"} onClick={() => onAddMore()} />
      <div className="m-2"></div>
      <CustomButton type="primary" text={"Start Signing"} onClick={() => ({})} />
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
