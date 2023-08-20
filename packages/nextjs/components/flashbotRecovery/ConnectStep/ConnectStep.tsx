import React from "react";
import Image from "next/image";
import IllustrationSvg from "../../../public/assets/flashbotRecovery/logo.svg"
import styles from "./connectStep.module.css"
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { AnimatePresence, motion } from "framer-motion";
interface IProps{
  isVisible:boolean
}
export const ConnectStep = ({isVisible}:IProps) => {

  return <AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.container}
    >
      <h1 className={styles.title}>Welcome to Flashbot Recovery</h1>
      <Image className={styles.illustration} src={IllustrationSvg} alt="" />
      <p className={`${styles.text} text-secondary-content`}>
        Lorem ipsum dolor sit amet, consectetur dipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet
        odio mattis.
      </p>
      <div className={styles.buttonContainer}>
        <RainbowKitCustomConnectButton/>
      </div>
    </motion.div>
  )}
</AnimatePresence>
};