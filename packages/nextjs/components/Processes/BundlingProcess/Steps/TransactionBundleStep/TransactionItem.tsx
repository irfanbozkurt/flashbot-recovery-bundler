import styles from "./transactionBundleStep.module.css";
import { motion } from "framer-motion";
import { ERC20Tx, ERC721Tx, ERC1155Tx, RecoveryTx } from "~~/types/business";

interface ITransactionProps {
  onDelete: () => void;
  tx?: RecoveryTx;
}
export const TransactionItem = ({ onDelete, tx }: ITransactionProps) => {
  const getTitle = () => {
    if (!tx) {
      return "";
    }
    if (tx.type == "erc721") {
      let typedTx = tx as ERC721Tx;
      return `${typedTx.symbol} - ${typedTx.tokenId} `;
    }
    if (tx.type == "erc1155") {
      const typedTx = tx as ERC1155Tx;
      return `${typedTx.info} `;
    }
    if (tx.type === "erc20") {
      const typedTx = tx as ERC20Tx;
      return `${typedTx.amount} ${typedTx.symbol} `;
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
      <div className={`${styles.close}`} onClick={onDelete}>
        X
      </div>
    </motion.div>
  );
};
