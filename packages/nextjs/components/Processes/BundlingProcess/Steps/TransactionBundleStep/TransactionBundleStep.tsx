import { Dispatch, SetStateAction, useEffect } from "react";
import Image from "next/image";
import GasSvg from "../../../../../public/assets/flashbotRecovery/gas.svg";
import styles from "./transactionBundleStep.module.css";
import { BigNumber, ethers } from "ethers";
import { motion } from "framer-motion";
import { useInterval } from "usehooks-ts";
import { CustomButton } from "~~/components/CustomButton/CustomButton";
import { TransactionItem } from "~~/components/Processes/BundlingProcess/Steps/TransactionBundleStep/TransactionItem";
import { useGasEstimation } from "~~/hooks/flashbotRecoveryBundle/useGasEstimation";
import { RecoveryTx } from "~~/types/business";

interface IProps {
  isVisible: boolean;
  clear: () => void;
  transactions: RecoveryTx[];
  onBack: () => void;
  modifyTransactions: Dispatch<SetStateAction<RecoveryTx[]>>;
  onSubmit: (val: BigNumber) => void;
  totalGasEstimate: BigNumber;
  setTotalGasEstimate: Dispatch<SetStateAction<BigNumber>>;
}

export const TransactionBundleStep = ({
  clear,
  onBack,
  isVisible,
  onSubmit,
  transactions,
  modifyTransactions,
  totalGasEstimate,
  setTotalGasEstimate,
}: IProps) => {
  if (!isVisible) {
    return <></>;
  }

  const { estimateTotalGasPrice } = useGasEstimation();

  useEffect(() => {
    if (transactions.length == 0) {
      return;
    }
    estimateTotalGasPrice(transactions, removeUnsignedTx).then(setTotalGasEstimate);
  }, [transactions.length]);

  useInterval(() => {
    if (transactions.length == 0) {
      return;
    }
    const updateTotalGasEstimate = async () => {
      setTotalGasEstimate(await estimateTotalGasPrice(transactions, removeUnsignedTx));
    };
    updateTotalGasEstimate();
  }, 5000);

  const removeUnsignedTx = (txId: number) => {
    modifyTransactions((prev: RecoveryTx[]) => {
      if (txId < 0 || txId > prev.length) {
        return prev.filter(a => a);
      }
      delete prev[txId];

      // When user removes the last item
      if (prev.length == 1 && txId == 0) {
        clear();
      }

      return prev.filter(a => a);
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.container}>
      <h2 className={styles.title}>Your transactions</h2>
      <div className={styles.assetList}>
        {transactions.map((item, i) => (
          <TransactionItem key={i} onDelete={() => removeUnsignedTx(i)} tx={item} />
        ))}
      </div>
      <span className={styles.clear} onClick={clear}>
        Clear all
      </span>
      <div className={styles.gasContainer}>
        <Image height={30} width={30} src={GasSvg} alt="" />
        <div className="m-1" />
        <span className={styles.gasValue}>{ethers.utils.formatEther(totalGasEstimate.toString())}</span>
      </div>
      <div className="m-4" />
      <CustomButton type="btn-accent" text={"Back to Assets"} onClick={onBack} />
      <div className="m-2" />
      <CustomButton type="btn-primary" text={"Start Signing"} onClick={() => onSubmit(totalGasEstimate)} />
    </motion.div>
  );
};
