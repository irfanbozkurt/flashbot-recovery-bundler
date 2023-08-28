import React from "react";
import { CustomPortal } from "~~/components/CustomPortal/CustomPortal";
import { useShowError } from "~~/hooks/flashbotRecoveryBundle/useShowError";
import ClockSvg from "~~/public/assets/flashbotRecovery/clock.svg";
import LogoSvg from "~~/public/assets/flashbotRecovery/logo.svg";
import SuccessSvg from "~~/public/assets/flashbotRecovery/success.svg";
import VideoSvg from "~~/public/assets/flashbotRecovery/video.svg";
import { RecoveryProcessStatus } from "~~/types/enums";

interface IProps {
  recoveryStatus: RecoveryProcessStatus;
  startSigning: () => void;
  finishProcess: () => void;
  startProcess: () => void;
  connectedAddress: string | undefined;
  safeAddress: string;
  hackedAddress: string;
  blockCountdown: number;
}

export const RecoveryProcess = ({
  recoveryStatus,
  startSigning,
  startProcess,
  finishProcess,
  blockCountdown,
  connectedAddress,
  safeAddress,
  hackedAddress,
}: IProps) => {
  const {showError} = useShowError();

  if (recoveryStatus == RecoveryProcessStatus.INITIAL) {
    return <></>;
  }

  if (recoveryStatus == RecoveryProcessStatus.GAS_PAID) {
    showError("you already covered the gas. If you're in a confussy situation, clear cookies and refresh page.");
    return;
  }

  if (recoveryStatus == RecoveryProcessStatus.CLEAR_ACTIVITY_DATA) {
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

  if (recoveryStatus == RecoveryProcessStatus.NO_SAFE_ACCOUNT) {
    return (
      <CustomPortal
        title={"Switch to safe address"}
        description={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
        }
        button={{
          text: "Continue",
          disabled: connectedAddress !== safeAddress,
          action: () => startProcess(),
        }}
        image={LogoSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.SWITCH_RPC_AND_PAY_GAS) {
    return (
      <CustomPortal
        title={"Switching Network"}
        description={"Switch to personal Flashbot RPC network to prepare the transacion you will pay"}
        image={VideoSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.INCREASE_PRIORITY_FEE) {
    return (
      <CustomPortal
        title={"Increase the gas"}
        description={"Switch to personal Flashbot RPC network to prepare the transacion you will pay"}
        image={VideoSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.SWITCH_TO_HACKED_ACCOUNT) {
    return (
      <CustomPortal
        title={"Switch to hacked address"}
        description={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
        }
        button={{
          text: "Continue",
          disabled: connectedAddress !== hackedAddress,
          action: () => startSigning(),
        }}
        image={LogoSvg}
      />
    );
  }

  if (
    recoveryStatus == RecoveryProcessStatus.SIGN_RECOVERY_TXS ||
    recoveryStatus == RecoveryProcessStatus.RECOVERY_TXS_SIGNED ||
    recoveryStatus == RecoveryProcessStatus.SEND_BUNDLE
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

  if (recoveryStatus == RecoveryProcessStatus.LISTEN_BUNDLE) {
    return (
      <CustomPortal
        title={"Wait without refreshing the page"}
        description={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio matt"
        }
        image={ClockSvg}
        indicator={blockCountdown}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.SUCCESS) {
    return (
      <CustomPortal
        title={"Your assets have been recovered!"}
        description={
          "If we have helped you please, share the tool and if you want let us a tip to continue contributing"
        }
        button={{
          text: "Continue",
          disabled: connectedAddress !== hackedAddress,
          action: () => finishProcess(),
        }}
        image={SuccessSvg}
      />
    );
  }

  return <></>;
};
