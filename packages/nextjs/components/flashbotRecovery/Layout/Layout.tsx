import React from "react";
import Image from "next/image";
import LogoSvg from "../../../public/assets/flashbotRecovery/logo.svg";
import styles from "./layout.module.css";
import { motion } from "framer-motion";

interface IProps {
  children: JSX.Element;
  stepActive: number;
}
export const Layout = ({ children, stepActive }: IProps) => {
  return (
    <motion.div className={styles.layout} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.logoContainer}>
            <Image className={styles.logo} src={LogoSvg} alt="" />
            Recovery Flashbot
          </div>
          <div className={styles.steps}>
            <Step
              isActive={stepActive == 1}
              index={1}
              title={"Enter the hacked address"}
              description={"Provide the address that was hacked so we can search for your assets."}
            />
            <Step
              isActive={stepActive == 2}
              index={2}
              title={"Select your assets"}
              description={
                "Your assets will be listed, select the ones you want to transfer or add manually if you miss someone"
              }
            />

            <Step
              isActive={stepActive == 3}
              index={3}
              title={"Confirm the bundle"}
              description={"Review the transactions that are going to be generated to recover your assets"}
            />

            <Step
              isActive={stepActive == 4}
              index={4}
              title={"Recover your assets"}
              description={"Follow the steps to retrieve your assets, this is a critical process, so please be patient. Remember to increase the gas amount for higher chances of success."}
            />
          </div>
        </div>
      </div>
      <div className={`${styles.content} bg-base-300`}>{children}</div>
    </motion.div>
  );
};

interface IStepProps {
  isActive: boolean;
  index: number;
  title: string;
  description: string;
}
const Step = ({ isActive, index, title, description }: IStepProps) => {
  return (
    <div className={`${styles.step} ${isActive ? "" : "text-secondary-content"}`}>
      <div>
        <span className={`${styles.badge} ${isActive ? "btn-primary" : ""}`}>{index}</span>
      </div>
      <div className={styles.stepContainer}>
        <h2 className={styles.stepTitle}>{title}</h2>
        <p className={styles.stepDescription}>{description}</p>
      </div>
    </div>
  );
};
