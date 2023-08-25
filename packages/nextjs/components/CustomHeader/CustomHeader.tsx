import React from "react";
import Image from "next/image";
import LogoSvg from "../../public/assets/flashbotRecovery/logo.svg";
import styles from "./customheader.module.css";

interface IProps {
  isVisible: boolean;
}
export const CustomHeader = ({ isVisible }: IProps) => {
  if (!isVisible) {
    return <></>;
  }

  return (
    <div className={styles.header}>
      <div className={styles.logoContainer}>
        <Image className={styles.logo} src={LogoSvg} alt="" />
        Recovery Flashbot
      </div>
    </div>
  );
};
