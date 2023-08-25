import Image from "next/image";
import CloseSvg from "../../../../../../public/assets/flashbotRecovery/close.svg";
import { BasicFlow } from "./BasicFlow/BasicFlow";
import { CustomFlow } from "./CustomFlow/CustomFlow";
import styles from "./manualAssetSelection.module.css";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Tabs } from "~~/components/tabs/Tabs";
import { RecoveryTx } from "~~/types/business";

interface IProps {
  isVisible: boolean;
  close: () => void;
  hackedAddress: string;
  safeAddress: string;
  addAsset: (asset: RecoveryTx) => void;
}
export const ManualAssetSelection = ({ isVisible, close, safeAddress, addAsset, hackedAddress }: IProps) => {
  const portalSelector = document.querySelector("#myportal");
  if (!portalSelector || !isVisible) {
    return <></>;
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${styles.modalContainer}`}
    >
      <div className={`${styles.modal} bg-base-300`}>
        <span className={`${styles.close}`}>
          {" "}
          {!!close ? <Image src={CloseSvg} alt={""} onClick={() => close()} /> : <></>}
        </span>
        <div className={`${styles.modalContent}`}>
          <h3 className={`${styles.title}`}>{"Add assets manually"}</h3>
          <Tabs tabTitles={["Basic", "Custom"]}>
            {active => {
              const isBasic = active == 0;
              if (isBasic) {
                return <BasicFlow safeAddress={safeAddress} hackedAddress={hackedAddress} addAsset={addAsset} />;
              }
              return <CustomFlow hackedAddress={hackedAddress} addAsset={item => addAsset(item)} />;
            }}
          </Tabs>
        </div>
      </div>
    </motion.div>,
    portalSelector,
  );
};
