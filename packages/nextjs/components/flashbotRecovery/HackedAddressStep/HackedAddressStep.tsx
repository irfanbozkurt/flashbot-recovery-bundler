import React from "react";
import Image from "next/image";
import IllustrationSvg from "../../../public/assets/flashbotRecovery/logo.svg";
import styles from "./hackedAddressStep.module.css";
import { AnimatePresence, motion } from "framer-motion";
import { useLocalStorage } from "usehooks-ts";
import { AddressInput, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

interface IProps {
  isVisible: boolean;
}
export const HackedAddressStep = ({ isVisible }: IProps) => {
  const [hackedAddress, setHackedAddress] = useLocalStorage<string>("hackedAddress", "");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.container}
        >
          <label className={styles.label} htmlFor="addressInput">
            Hacked address
          </label>
          <AddressInput
            name="addressInput"
            value={hackedAddress}
            placeholder={"0xcEBD023e3a...F7fa035bbf52e6"}
            onChange={setHackedAddress}
          />
          <button className={`${styles.button} btn btn-primary btn-xs`}>Continue</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
