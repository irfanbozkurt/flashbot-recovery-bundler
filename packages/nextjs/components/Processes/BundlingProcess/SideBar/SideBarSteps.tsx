import { SideBarStepInfo } from "./SideBarStepInfo";
import styles from "./sidebar.module.css";
import { BundlingSteps } from "~~/types/enums";

interface ISideBar {
  activeStep: BundlingSteps;
}
export const SideBarSteps = ({ activeStep }: ISideBar) => {
  return (
    <div className={styles.steps}>
      <SideBarStepInfo
        index={BundlingSteps.HACKED_ADDRESS_INPUT}
        activeStep={activeStep}
        title={"Enter the hacked address"}
        description={"Provide the address that was hacked so we can search for your assets."}
      />
      <SideBarStepInfo
        index={BundlingSteps.ASSET_SELECTION}
        activeStep={activeStep}
        title={"Select your assets"}
        description={
          "Your assets will be listed, select the ones you want to transfer or add manually if you miss someone"
        }
      />
      <SideBarStepInfo
        index={BundlingSteps.TX_BUNDLE}
        activeStep={activeStep}
        title={"Confirm the bundle"}
        description={"Review the transactions that are going to be generated to recover your assets"}
      />
      <SideBarStepInfo
        index={BundlingSteps.SIGN_RECOVERY_TXS}
        activeStep={activeStep}
        title={"Recover your assets"}
        description={"Follow the steps to retrieve your assets, this is a critical process, so please be patient."}
      />
    </div>
  );
};
