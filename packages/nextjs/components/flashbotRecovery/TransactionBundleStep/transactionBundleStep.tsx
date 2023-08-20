import React, { useState } from "react";
import Image from "next/image";
import LogoSvg from "../../../public/assets/flashbotRecovery/logo.svg";
import styles from "./transactionBundleStep.module.css";
import { AnimatePresence, motion } from "framer-motion";

interface IProps {
  isVisible: boolean;
}
export const TransactionBundleStep = ({ isVisible }: IProps) => {
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  const list = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

  const onAssetSelected = (i: number) => {
    const currentIndex = selectedAssets.indexOf(i);
    let newAssets: number[] = [];
    if (currentIndex === -1) {
      newAssets.push(i);
      newAssets.push(...selectedAssets);
    } else {
      newAssets = selectedAssets.filter(item => item !== i);
    }
    setSelectedAssets(newAssets);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.container}
        >
          <h2 className={styles.title}>Your transactions</h2>
          <div className={styles.assetList}>
            {list.map((item, i) => (
              <TransactionItem
                isSelected={selectedAssets.indexOf(i) != -1}
                key={i}
                onDelete={() => onAssetSelected(i)}
                title={i%2 === 0 ? "Custom call (transfer) to 0x24923bah971904020q9q98198y83": "NFT recovery for tokenID 1"}
              />
            ))}
          </div>
          <span className={styles.clear}>Clear all</span>
          <div className="m-2"></div>
          <button className={`${styles.button} btn btn-accent`}>Add manually</button>
          <div className="m-2"></div>
          <button className={`${styles.button} btn btn-primary`}>Start Signing</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ITransactionProps {
  onDelete: () => void;
  isSelected: boolean;
  title: string;
}

const TransactionItem = ({ onDelete, title }: ITransactionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onDelete()}
      className={`${styles.assetItem} bg-base-200 text-secondary-content`}
    >
      <div className={styles.data}>
        <h3>{title}</h3>
      </div>
      <div className={`${styles.logoContainer}`}>X</div>
    </motion.div>
  );
};
