import React from "react";
import { CustomPortal } from "../CustomPortal/CustomPortal";
import { RecoveryProcessStatus, useBundleProcess } from "~~/hooks/flashbotRecoveryBundle/useFlashbotNetworkChange";
import LogoSvg from "~~/public/assets/flashbotRecovery/logo.svg";
import VideoSvg from "~~/public/assets/flashbotRecovery/video.svg";

interface IProps {
  recoveryStatus: RecoveryProcessStatus;
  startSigning: () => void;
  resetStatus: () => void;
  startProcess: () => void;
  connectedAddress:string;
  safeAddress:string;
  hackedAddress:string;
}
export const RecoveryProcess = ({ recoveryStatus, startSigning, startProcess, connectedAddress,safeAddress, hackedAddress }: IProps) => {
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
        title={"Switch to safe address"}
        description={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
        }
        button={{
          text: "Continue",
          disabled:connectedAddress !== safeAddress,
          action: () => startProcess(),
        }}
        image={LogoSvg}
      />
    );
  }
  if (
    recoveryStatus == RecoveryProcessStatus.switchFlashbotNetworkAndPayBundleGas ||
    recoveryStatus == RecoveryProcessStatus.gasPaid
  ) {
    return (
      <CustomPortal
        title={"Switching Network"}
        description={"Switch to personal Flashbot RPC network to prepare the transacion you will pay"}
        image={VideoSvg}
      />
    );
  }
  if (recoveryStatus == RecoveryProcessStatus.switchToHacked) {
    return (
      <CustomPortal
        title={"Switch to hacked address"}
        description={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
        }
        button={{
          text: "Continue",
          disabled:connectedAddress !== hackedAddress,
          action: () => startSigning(),
        }}
        image={LogoSvg}
      />
    );
  }
  if (
    recoveryStatus == RecoveryProcessStatus.signEachTransaction ||
    recoveryStatus == RecoveryProcessStatus.allTxSigned
  ) {
    return (
      <CustomPortal
        title={"Sign each transaction"}
        description={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
        }
        image={LogoSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.cachedDataToClean) {
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
  return <></>;
};
