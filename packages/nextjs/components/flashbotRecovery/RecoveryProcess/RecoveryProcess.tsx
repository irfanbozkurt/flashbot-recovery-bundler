import React from "react";
import { CustomPortal } from "../CustomPortal/CustomPortal";
import { RecoveryProcessStatus, useBundleProcess } from "~~/hooks/flashbotRecoveryBundle/useFlashbotNetworkChange";
import LogoSvg from "~~/public/assets/flashbotRecovery/logo.svg";
import VideoSvg from "~~/public/assets/flashbotRecovery/video.svg";

interface IProps {
  recoveryStatus: RecoveryProcessStatus;
  startSigning:() => void
}
export const RecoveryProcess = ({ recoveryStatus, startSigning }: IProps) => {
  if (recoveryStatus == RecoveryProcessStatus.initial) {
    return <></>;
  }
  if (recoveryStatus == RecoveryProcessStatus.gasCovered) {
    alert("you already covered the gas. If you're in a confussy situation, clear cookies and refresh page.");
    return;
  }
  if (recoveryStatus == RecoveryProcessStatus.noAccountConnected) {
    //TODO move the user to connect account
    return;
  }

  if (recoveryStatus == RecoveryProcessStatus.noSafeAccountConnected) {
    return (
      <CustomPortal
        title={"Clear cache"}
        description={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
        }
        image={VideoSvg}
      />
    );
  }
  if (
    recoveryStatus == RecoveryProcessStatus.switchFlashbotNetworkAndPayBundleGas ||
    recoveryStatus == RecoveryProcessStatus.gasPaid
  ) {
    return (
      <CustomPortal
        title={"Switching Netork"}
        description={"Switch to personal Flashbot RPC network to prepare the transacion you will pay"}
        image={VideoSvg}
        close={false}
      />
    );
  }
  if (recoveryStatus == RecoveryProcessStatus.switchToHacked) {
    return (
      <CustomPortal
        title={"Switch to hacked address"}
        close={false}
        description={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
        }
        button={{
          text:"Continue",
          action:() => startSigning()
        }}
        image={LogoSvg}
      />
    );
  }
  if (recoveryStatus == RecoveryProcessStatus.signEachTransaction || recoveryStatus == RecoveryProcessStatus.allTxSigned) {
    return (
      <CustomPortal
        title={"Sign each transaction"}
        close={false}
        description={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
        }
        image={LogoSvg}
      />
    );
  }
  return <></>;
};
