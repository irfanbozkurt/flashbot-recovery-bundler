import Image from "next/image";
import LogoSvg from "../../../../public/assets/flashbotRecovery/logo.svg";
import { SideBarSteps } from "./SideBarSteps";
import styles from "./sidebar.module.css";
import { Address } from "~~/components/scaffold-eth";
import { BundlingSteps } from "~~/types/enums";

interface ISideBar {
  activeStep: BundlingSteps;
  safeAddress: string;
  hackedAddress: string;
}
export const SideBar = ({ activeStep, safeAddress, hackedAddress }: ISideBar) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <div className={styles.logoContainer}>
          <Image className={styles.logo} src={LogoSvg} alt="" />
          <h1 className={styles.title} >Hacked Wallet Recovery</h1>
        </div>
        <SideBarSteps activeStep={activeStep} />
      </div>
      <div className={`${styles.addresess} bg-base-300`}>
        <div className={`${styles.addressContainer}`}>
          <span>Hacked Address</span>
          <div className="m-2"></div>
          <Address format={"long"} address={hackedAddress} disableAddressLink={true} ></Address>
        </div>
      </div>
    </div>
  );
};
