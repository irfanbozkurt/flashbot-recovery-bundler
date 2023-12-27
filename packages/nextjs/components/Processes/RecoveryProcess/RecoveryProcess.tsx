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
          "We've encountered an issue with outdated cached data. Please clear your browser's cache to resolve this error."
        }
        image={VideoSvg}
      />
      //TODO provide clear data mechanism
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.NO_SAFE_ACCOUNT) {
    return (
      <CustomPortal
        title={"Switch to safe wallet"}
        description={
          "Connect a wallet that has some funds to pay network fees so you can recover the assets contained in your hacked wallet."
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
        description={
          "Now we will switch to a shielded network to recover your assets without the attacker noticing. Approve the network change in your wallet."
        }
        image={VideoSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.INCREASE_PRIORITY_FEE) {
    return (
      <CustomPortal
        title={"Increase the gas"}
        description={
          "To ensure inclusion of your transaction in the next block, increase the gas fee. Approve the gas increase in your wallet."
        }
        image={VideoSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.SWITCH_TO_HACKED_ACCOUNT) {
    return (
      <CustomPortal
        title={"Switch to Hacked Wallet"}
        description={"To proceed with recovering your assets, switch to the hacked wallet."}
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
          "Now you will be prompted to sign a transaction for each asset you selected for recovery. Approve each transaction as it appears."
        }
        image={LogoSvg}
      />
    );
  }

  if (recoveryStatus == RecoveryProcessStatus.LISTEN_BUNDLE) {
    return (
      <CustomPortal
        title={"Wait for confirmation"}
        description={
          "Your asset recovery is in progress. Stay on this page and wait for your transactions to be included in a block."
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
          "Check the safe wallet for your recovered assets. Share your experience with others and consider supporting this project with a donation so we can continue to offer this service free of charge."
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
            href="https://twitter.com/intent/tweet?url=https://hackedwalletrecovery.com&text=This%20project%20helped%20me%20recover%20my%20assets%20from%20a%20hacked%20wallet.%20I%20highly%20recommend%20it%20to%20anyone%20in%20a%20similar%20situation"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image width={40} src={TwitterSvg} alt={""} />
          </a>
          <a
            href="https://t.me/share/url?url=https://hackedwalletrecovery.com&text=This%20project%20helped%20me%20recover%20my%20assets%20from%20a%20hacked%20wallet.%20I%20highly%20recommend%20it%20to%20anyone%20in%20a%20similar%20situation"
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
          "Your contribution will help us continue to offer this service free of charge. Thank you for your support!"
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
