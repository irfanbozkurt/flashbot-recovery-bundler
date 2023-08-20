import React from 'react'
import styles from "./customheader.module.css"
import Image from 'next/image'
import LogoSvg from "../../../public/assets/flashbotRecovery/logo.svg"

export const CustomHeader = () => {
  return (
    <div className={styles.header}>
        <div className={styles.logoContainer}>
            <Image className={styles.logo} src={LogoSvg} alt="" />
            Recovery Flashbot
        </div>
    </div>
  )
}
