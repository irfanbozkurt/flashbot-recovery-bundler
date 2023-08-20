import React, { useState } from "react";
import styles from "./assetSelectionStep.module.css";
import { AnimatePresence, motion } from "framer-motion";
import LogoSvg from "../../../public/assets/flashbotRecovery/logo.svg";

import Image from "next/image";

interface IProps {
  isVisible: boolean;
}
export const AssetSelectionStep = ({ isVisible }: IProps) => {
  const [selectedAssets, setSelectedAssets] = useState<number[]>([])
  const list = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];


  const onAssetSelected = (i:number) => {
    const currentIndex = selectedAssets.indexOf(i);
    let newAssets:number[] = [];
    if(currentIndex === -1){
      newAssets.push(i)
      newAssets.push(...selectedAssets)
    }else{
      newAssets = selectedAssets.filter(item => item !== i)
    }
    setSelectedAssets(newAssets);
  }
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.container}
        >
          <h2 className={styles.title}>Your assets</h2>
          <div className={styles.assetList}>
            {list.map((item, i) => <AssetItem isSelected={selectedAssets.indexOf(i) != -1} key={i} onClick={() => onAssetSelected(i)}/>)}
          </div>
          <button className={`${styles.button} btn btn-primary btn-xs`}>Add</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface IAssetProps{
  onClick:() => void;
  isSelected:boolean
}


const AssetItem = ({onClick, isSelected}:IAssetProps) => {
  return <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  onClick={() => onClick()}
  className={`${isSelected ? "bg-base-200" : ""} ${styles.assetItem}`}
>
    <div className={`${styles.logoContainer}`}>
    <Image className={styles.logo} src={LogoSvg} alt="" />
    </div>
    <div className={styles.data}>
      <h3>Name</h3>
      <span>ID</span>
    </div>
  </motion.div>
}
