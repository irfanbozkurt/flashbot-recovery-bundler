import React, { useEffect, useState } from "react";
import Image from "next/image";
import LogoSvg from "../../../public/assets/flashbotRecovery/logo.svg";
import styles from "./assetSelectionStep.module.css";
import { motion } from "framer-motion";
import { useAutodetectAssets } from "~~/hooks/flashbotRecoveryBundle/useAutodetectAssets";
import { RecoveryTx } from "~~/types/business";
import { CustomButton } from "../CustomButton/CustomButton";

interface IProps {
  isVisible: boolean;
  hackedAddress: string;
  safeAddress: string;
  onSubmit: (txs: RecoveryTx[]) => void;
}
export const AssetSelectionStep = ({ isVisible, onSubmit, hackedAddress, safeAddress }: IProps) => {

  const { getAutodetectedAssets } = useAutodetectAssets();
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  const [accountAssets, setAccountAssets] = useState<RecoveryTx[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const onAssetSelected = (index: number) => {
    const currentIndex = selectedAssets.indexOf(index);
    let newAssets: number[] = [];
    if (currentIndex === -1) {
      newAssets.push(index);
      newAssets.push(...selectedAssets);
    } else {
      newAssets = selectedAssets.filter(item => item !== index);
    }
    setSelectedAssets(newAssets);
  };

  useEffect(() => {
    if (accountAssets.length > 0 || !isVisible) {
      return;
    }
    init();
  }, [isVisible]);

  const init = async () => {
    const result = await getAutodetectedAssets({ hackedAddress, safeAddress });
    if (!result) {
      return;
    }
    setAccountAssets(result);
    setIsLoading(false);
  };

  const onAddAssetsClick = () => {
    const txsToAdd = accountAssets.filter((item, i) => selectedAssets.indexOf(i) != -1);
    onSubmit(txsToAdd);
  };
  if (!isVisible) {
    return <></>;
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.container}>
      <h2 className={styles.title}>Your assets</h2>

      <div className={styles.assetList}>
        {!!isLoading
          ? [1, 2, 3].map((item, i) => (
              <AssetItem
                isLoading={true}
                isSelected={selectedAssets.indexOf(i) != -1}
                key={i}
                onClick={() => onAssetSelected(i)}
              />
            ))
          : accountAssets.map((item, i) => {
              return (
                <AssetItem
                  tx={item}
                  isLoading={false}
                  isSelected={selectedAssets.indexOf(i) != -1}
                  key={i}
                  onClick={() => onAssetSelected(i)}
                />
              );
            })}
      </div>
      <CustomButton type="accent" text={"Add Manually"} onClick={() => ({})} />
      <div className="m-2"></div>
      <CustomButton type="primary" text={"Continue"} onClick={() => onAddAssetsClick()} />
    </motion.div>
  );
};

interface IAssetProps {
  onClick: () => void;
  isSelected: boolean;
  tx?: RecoveryTx;
  isLoading: boolean;
}

const AssetItem = ({ onClick, isSelected, tx, isLoading }: IAssetProps) => {
  const getSubtitleTitle = () => {
    if (!tx) {
      return "";
    }
    if (["erc1155", "erc721"].indexOf(tx.type) != -1) {
      //@ts-ignore
      return `Token ID: ${tx.tokenId!}`;
    }
    if (tx.type === "erc20") {
      //@ts-ignore
      return tx.value;
    }
    return "";
  };
  const getTitle = () => {
    if (!tx) {
      return "";
    }
    if (tx.type === "erc20") {
      //@ts-ignore
      return tx.symbol;
    }
    return tx.info;
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onClick()}
      className={`${isSelected ? "bg-base-200" : ""} ${styles.assetItem}  ${isLoading ? styles.loading : ""}`}
    >
      <div className={`${styles.logoContainer}`}>
        <Image className={styles.logo} src={LogoSvg} alt="" />
      </div>
      <div className={`${styles.data}`}>
        <h3>{getTitle()}</h3>
        <span>{getSubtitleTitle()}</span>
      </div>
    </motion.div>
  );
};
