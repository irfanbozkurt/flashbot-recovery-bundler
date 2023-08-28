import React, { useState } from "react";
import Image from "next/image";
import styles from "./recoveryProcess.module.css";
import { CustomPortal } from "~~/components/CustomPortal/CustomPortal";
import { InputBase } from "~~/components/scaffold-eth";
import { useShowError } from "~~/hooks/flashbotRecoveryBundle/useShowError";
import ClockSvg from "~~/public/assets/flashbotRecovery/clock.svg";
import HackedWalletSvg from "~~/public/assets/flashbotRecovery/hacked.svg";
import LogoSvg from "~~/public/assets/flashbotRecovery/logo.svg";
import SafeWalletSvg from "~~/public/assets/flashbotRecovery/safe.svg";
import SuccessSvg from "~~/public/assets/flashbotRecovery/success.svg";
import TelegramSvg from "~~/public/assets/flashbotRecovery/telegram.svg";
import TipsSvg from "~~/public/assets/flashbotRecovery/tips.svg";
import TwitterSvg from "~~/public/assets/flashbotRecovery/twitter.svg";
import VideoSvg from "~~/public/assets/flashbotRecovery/video.svg";
import { RecoveryProcessStatus } from "~~/types/enums";

interface IProps {
  recoveryStatus: RecoveryProcessStatus;
  startSigning: () => void;
  finishProcess: () => void;
  showTipsModal: () => void;
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
  showTipsModal,
  blockCountdown,
  connectedAddress,
  safeAddress,
  hackedAddress,
}: IProps) => {
  const { showError } = useShowError();
  const [donationValue, setDonationValue] = useState<string>("");

  if (recoveryStatus == RecoveryProcessStatus.INITIAL) {
    return <></>;
  }

  if (recoveryStatus == RecoveryProcessStatus.GAS_PAID) {
    showError(
      "It appears that gas costs have been covered for this action. If you're encountering any confusion, consider clearing your cookies and refreshing the page.",
    );
    //TODO provide clear data mechanism title "Gas Covered Already"
    return;
  }

  if (recoveryStatus == RecoveryProcessStatus.CLEAR_ACTIVITY_DATA) {
    return (
      <CustomPortal
        title={"Clear cache"}
        description={
          "We've encountered an issue due to outdated cached data. Please clear your app's cache to resolve this error."
        }
        image={VideoSvg}
      />
      //TODO provide clear data mechanism
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.NO_SAFE_ACCOUNT) {
    return (
      <CustomPortal
        title={"Switch to safe address"}
        description={
          "To ensure a secure asset transfer, switch to your safe wallet. This step guarantees the safe retrieval of your assets without any further risks."
        }
        button={{
          text: "Continue",
          disabled: connectedAddress !== safeAddress,
          action: () => startProcess(),
        }}
        image={SafeWalletSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.SWITCH_RPC_AND_PAY_GAS) {
    return (
      <CustomPortal
        title={"Switching Network"}
        description={"Allow us to create and switch to your personal RPC network to prepare the transaction bundle"}
        image={VideoSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.INCREASE_PRIORITY_FEE) {
    return (
      <CustomPortal
        title={"Increase the gas"}
        description={
          "We recommend set a hight gas to ensure a successful asset recovery. Your increased gas allocation will facilitate the seamless completion of the transaction."
        }
        image={VideoSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.SWITCH_TO_HACKED_ACCOUNT) {
    return (
      <CustomPortal
        title={"Switch to Hacked Address"}
        description={
          "To proceed with asset recovery, switch to the compromised address in your wallet. This step is essential to verify ownership and continue with the recovery process."
        }
        button={{
          text: "Continue",
          disabled: connectedAddress !== hackedAddress,
          action: () => startSigning(),
        }}
        image={HackedWalletSvg}
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
          "Each bundled transaction requires your individual signature to verify and complete the asset recovery process. Please sign each transaction as they appear."
        }
        image={LogoSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.LISTEN_BUNDLE) {
    return (
      <CustomPortal
        title={"Stay Patient, Stay Secure"}
        description={
          "Your asset recovery is in progress. To ensure a successful retrieval and accurate transaction completion stay on the page."
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
          "Check your safe wallet for your retrieved assets. Share your journey and consider to support us with a tip to continue serving the crypto community."
        }
        button={{
          text: "Finish",
          disabled: false,
          action: () => showTipsModal(),
        }}
        image={SuccessSvg}
      >
        <div className={styles.shareButtons}>
          <a
            href="https://twitter.com/intent/tweet?url=https://yourwebsite.com&text=I%20have%20been%20helped%20to%20recover%20my%20assets%20with%20this%20amazing%20tool"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image width={40} src={TwitterSvg} alt={""} />
          </a>
          <a
            href="https://t.me/share/url?url=https://yourwebsite.com&text=I%20have%20been%20helped%20to%20recover%20my%20assets%20with%20this%20amazing%20tool"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image width={40} src={TelegramSvg} alt={""} />
          </a>
        </div>
      </CustomPortal>
    );
  }
  if (recoveryStatus === RecoveryProcessStatus.DONATE) {
    return (
      <CustomPortal
        title={"Support Our Mission"}
        description={
          "Your contribution can significantly impact our mission to provide safe and free tools that empower the community."
        }
        button={{
          text: "Finish",
          disabled: false,
          action: () => finishProcess(),
        }}
        image={TipsSvg}
      >
        <div className={styles.inputContainer}>
          <label className={styles.label} htmlFor="tip">
            Tip
          </label>
          <div className="mt-2" />
          <InputBase name="tip" placeholder="0.0" value={donationValue} onChange={setDonationValue} />
          <span className={`${styles.eth} text-base-100`}>ETH</span>
        </div>
      </CustomPortal>
    );
  }

  return <></>;
};
