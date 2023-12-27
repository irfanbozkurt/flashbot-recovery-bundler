import React, { useEffect } from "react";
import Image from "next/image";
import IllustrationSvg from "../../../public/assets/flashbotRecovery/logo.svg";
import styles from "./connectionProcess.module.css";
import { AnimatePresence, motion } from "framer-motion";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

interface IProps {
  isVisible: boolean;
  safeAddress: string;
  connectedAddress: string | undefined;
  setSafeAddress: (newAdd: string) => void;
}
export const ConnectionProcess = ({ isVisible, safeAddress, connectedAddress, setSafeAddress }: IProps) => {
  useEffect(() => {
    if (!!safeAddress || !connectedAddress) {
      return;
    }
    setSafeAddress(connectedAddress);
    return () => {};
  }, [connectedAddress]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.container}
        >
          <h1 className={styles.title}>Let&apos;s recover your hacked assets</h1>
          <Image
            className={styles.illustration}
            src={IllustrationSvg}
            alt="An ethereum icon with nfts and tokens around"
          />
          <h2 className={`${styles.text} text-secondary-content`}>
            Follow the steps to recover any remaining assets from your hacked wallet. Start by connecting a safe wallet with some funds to pay for gas.
          </h2>
          <div className={styles.buttonContainer}>
            <RainbowKitCustomConnectButton />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
