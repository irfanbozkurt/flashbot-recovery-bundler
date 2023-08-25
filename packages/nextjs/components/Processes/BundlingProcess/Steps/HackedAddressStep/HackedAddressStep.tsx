import { useState } from "react";
import styles from "./hackedAddressStep.module.css";
import { isAddress } from "ethers/lib/utils";
import { motion } from "framer-motion";
import { CustomButton } from "~~/components/CustomButton/CustomButton";
import { AddressInput } from "~~/components/scaffold-eth";

interface IProps {
  isVisible: boolean;
  safeAddress: string;
  onSubmit: (address: string) => void;
}
export const HackedAddressStep = ({ isVisible, safeAddress, onSubmit }: IProps) => {
  if (!isVisible) {
    return <></>;
  }

  const [hackedAddress, setHackedAddressCore] = useState<string>("");
  const setHackedAddress = (hackedAddress: string) => {
    if (safeAddress == hackedAddress) {
      //TODO: modal
      alert("Cannot select safe and hacked addresses the same");
      setHackedAddressCore("");
      return;
    }
    setHackedAddressCore(hackedAddress);
  };

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
      <div className="m2" />
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
