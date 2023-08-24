import { useState } from "react";
import { CustomButton } from "../../CustomButton/CustomButton";
import { ERC20Form } from "./ERC20From";
import { ERC721Form } from "./ERC721Form";
import { ERC1155Form } from "./ERC1155Form";
import styles from "../manualAssetSelection.module.css";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { RecoveryTx } from "~~/types/business";

interface IBasicFlowProps {
  safeAddress: string;
  hackedAddress: string;
  addAsset: (asset: RecoveryTx) => void;
}

export interface ITokenForm {
  hackedAddress: string;
  safeAddress: string;
  close: () => void;
  addAsset: (arg: RecoveryTx) => void;
}

export const BasicFlow = ({ safeAddress, hackedAddress, addAsset }: IBasicFlowProps) => {
  const [tokenActive, setTokenActive] = useState(0);
  return (
    <>
      <TokenSelection
        tokenActive={tokenActive}
        hackedAddress={hackedAddress}
        addAsset={addAsset}
        close={() => {
          setTokenActive(0);
        }}
        safeAddress={safeAddress}
      />
      <ul className={styles.list}>
        <li className={`${styles.basicItem} bg-base-100`}>
          <h3>ERC20</h3>
          <CustomButton type="btn-primary" text={"Add"} onClick={() => setTokenActive(1)} />
        </li>
        <li className={`${styles.basicItem} bg-base-100`}>
          <h3>ERC721</h3>
          <CustomButton type="btn-primary" text={"Add"} onClick={() => setTokenActive(2)} />
        </li>
        <li className={`${styles.basicItem} bg-base-100`}>
          <h3>ERC1551</h3>
          <CustomButton type="btn-primary" text={"Add"} onClick={() => setTokenActive(3)} />
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

  return tokenActive != 0
    ? createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${styles.modalContainer}`}
        >
          <div className={`${styles.modal} bg-base-300`}>
            <div className="mt-10"></div>
            <div className={`${styles.modalContent}`}>
              {tokenActive === 1 ? (
                <ERC20Form close={close} hackedAddress={hackedAddress} safeAddress={safeAddress} addAsset={addAsset} />
              ) : (
                <></>
              )}
              {tokenActive === 2 ? (
                <ERC721Form close={close} hackedAddress={hackedAddress} safeAddress={safeAddress} addAsset={addAsset} />
              ) : (
                <></>
              )}
              {tokenActive === 3 ? (
                <ERC1155Form
                  close={close}
                  hackedAddress={hackedAddress}
                  safeAddress={safeAddress}
                  addAsset={addAsset}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
        </motion.div>,
        portalSelector,
      )
    : null;
};
