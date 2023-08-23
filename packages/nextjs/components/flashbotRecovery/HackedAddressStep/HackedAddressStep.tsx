import React, { useState } from "react";
import { CustomButton } from "../CustomButton/CustomButton";
import styles from "./hackedAddressStep.module.css";
import { isAddress } from "ethers/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AddressInput } from "~~/components/scaffold-eth";

interface IProps {
  isVisible: boolean;
  onSubmit: (address: string) => void;
}
export const HackedAddressStep = ({ isVisible, onSubmit }: IProps) => {
  if (!isVisible) {
    return <></>;
  }

  const [hackedAddress, setHackedAddress] = useState<string>("");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.container}>
      <label className={styles.label} htmlFor="addressInput">
        Hacked address
      </label>
      <AddressInput
        name="addressInput"
        value={hackedAddress}
        placeholder={"0xcEBD023e3a...F7fa035bbf52e6"}
        onChange={setHackedAddress}
      />
      <div className="m2"></div>
      <CustomButton
        type="btn-primary"
        text={"Continue"}
        onClick={() => {
          if (!isAddress(hackedAddress)) {
            alert("Given hacked address is not a valid address");
            return;
          }
          onSubmit(hackedAddress);
        }}
      />
    </motion.div>
  );
};
