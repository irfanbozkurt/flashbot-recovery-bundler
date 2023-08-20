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
              title={"Title"}
              description={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"}
            />
            <Step
              isActive={stepActive == 2}
              index={2}
              title={"Title"}
              description={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"}
            />

            <Step
              isActive={stepActive == 3}
              index={3}
              title={"Title"}
              description={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"}
            />

            <Step
              isActive={stepActive == 4}
              index={4}
              title={"Title"}
              description={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"}
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
