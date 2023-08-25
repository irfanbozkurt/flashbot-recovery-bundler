import { useState } from "react";
import styles from "../manualAssetSelection.module.css";
import { ERC20Form } from "./ERC20From";
import { ERC721Form } from "./ERC721Form";
import { ERC1155Form } from "./ERC1155Form";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { CustomButton } from "~~/components/CustomButton/CustomButton";
import { RecoveryTx } from "~~/types/business";

enum ActiveAssetType {
  _,
  ERC20,
  ERC721,
  ERC1155,
}

interface IBasicFlowProps {
  safeAddress: string;
  hackedAddress: string;
  addAsset: (asset: RecoveryTx) => void;
}
export const BasicFlow = ({ safeAddress, hackedAddress, addAsset }: IBasicFlowProps) => {
  const [activeAssetType, setActiveAssetType] = useState(ActiveAssetType._);
  return (
    <>
      <TokenSelection
        tokenActive={activeAssetType}
        hackedAddress={hackedAddress}
        addAsset={addAsset}
        close={() => setActiveAssetType(ActiveAssetType._)}
        safeAddress={safeAddress}
      />
      <ul className={styles.list}>
        <li className={`${styles.basicItem} bg-base-100`}>
          <h3>ERC20</h3>
          <CustomButton type="btn-primary" text={"Add"} onClick={() => setActiveAssetType(ActiveAssetType.ERC20)} />
        </li>
        <li className={`${styles.basicItem} bg-base-100`}>
          <h3>ERC721</h3>
          <CustomButton type="btn-primary" text={"Add"} onClick={() => setActiveAssetType(ActiveAssetType.ERC721)} />
        </li>
        <li className={`${styles.basicItem} bg-base-100`}>
          <h3>ERC1155</h3>
          <CustomButton type="btn-primary" text={"Add"} onClick={() => setActiveAssetType(ActiveAssetType.ERC1155)} />
        </li>
      </ul>
    </>
  );
};

interface ITokenSelectionProps {
  tokenActive: number;
  close: () => void;
  hackedAddress: string;
  safeAddress: string;
  addAsset: (asset: RecoveryTx) => void;
}
const TokenSelection = ({ close, addAsset, tokenActive, hackedAddress, safeAddress }: ITokenSelectionProps) => {
  const portalSelector = document.querySelector("#myportal2");
  if (!portalSelector) {
    return <></>;
  }

  return (
    tokenActive != ActiveAssetType._ &&
    createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`${styles.modalContainer}`}
      >
        <div className={`${styles.modal} bg-base-300`}>
          <div className="mt-10" />
          <div className={`${styles.modalContent}`}>
            {tokenActive === ActiveAssetType.ERC20 && (
              <ERC20Form close={close} hackedAddress={hackedAddress} safeAddress={safeAddress} addAsset={addAsset} />
            )}
            {tokenActive === ActiveAssetType.ERC721 && (
              <ERC721Form close={close} hackedAddress={hackedAddress} safeAddress={safeAddress} addAsset={addAsset} />
            )}
            {tokenActive === ActiveAssetType.ERC1155 && (
              <ERC1155Form close={close} hackedAddress={hackedAddress} safeAddress={safeAddress} addAsset={addAsset} />
            )}
          </div>
        </div>
      </motion.div>,
      portalSelector,
    )
  );
};
