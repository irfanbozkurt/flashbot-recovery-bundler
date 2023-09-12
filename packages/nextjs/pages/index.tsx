import { useState } from "react";
import dynamic from "next/dynamic";
import { BigNumber } from "ethers";
import { NextPage } from "next";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { CustomHeader } from "~~/components/CustomHeader/CustomHeader";
import { CustomPortal } from "~~/components/CustomPortal/CustomPortal";
import { MetaHeader } from "~~/components/MetaHeader";
import { BundlingProcess } from "~~/components/Processes/BundlingProcess/BundlingProcess";
import { ConnectionProcess } from "~~/components/Processes/ConnectionProcess/ConnectionProcess";
import { HackedAddressProcess } from "~~/components/Processes/HackedAddressProcess/HackedAddressProcess";
import { RecoveryProcess } from "~~/components/Processes/RecoveryProcess/RecoveryProcess";
import { useRecoveryProcess } from "~~/hooks/flashbotRecoveryBundle/useRecoveryProcess";
import { useShowError } from "~~/hooks/flashbotRecoveryBundle/useShowError";
import ErrorSvg from "~~/public/assets/flashbotRecovery/error.svg";
import { RecoveryTx } from "~~/types/business";
import { BundlingSteps, RecoveryProcessStatus } from "~~/types/enums";
import { DUMMY_ADDRESS } from "~~/utils/constants";

const Home: NextPage = () => {
  const { isConnected: walletConnected, address: connectedAddress } = useAccount();
  const [safeAddress, setSafeAddress] = useState(DUMMY_ADDRESS);
  const [hackedAddress, setHackedAddress] = useLocalStorage<string>("hackedAddress", "");
  const [totalGasEstimate, setTotalGasEstimate] = useState<BigNumber>(BigNumber.from("0"));
  const [isOnBasket, setIsOnBasket] = useState(false);
  const [currentBundleId, setCurrentBundleId] = useLocalStorage<string>("bundleUuid", "");
  const { error, resetError } = useShowError();

  const {
    data: processStatus,
    startRecoveryProcess,
    signRecoveryTransactions,
    blockCountdown,
    showTipsModal,
    unsignedTxs, setUnsignedTxs
  } = useRecoveryProcess();

  const startSigning = () => {
    signRecoveryTransactions(hackedAddress, unsignedTxs, currentBundleId, false);
  };
  const startRecovery = (safe?:string) => {
    const accountToUse = safe ? safe :DUMMY_ADDRESS
    setSafeAddress(accountToUse);
    startRecoveryProcess({
      safeAddress:accountToUse,
      modifyBundleId: setCurrentBundleId,
      totalGas: totalGasEstimate,
      hackedAddress,
      currentBundleId,
      transactions: unsignedTxs,
    });
  };
  const getActiveStep = () => {
    if (processStatus === RecoveryProcessStatus.SUCCESS || processStatus === RecoveryProcessStatus.DONATE) {
      return BundlingSteps.SIGN_RECOVERY_TXS;
    }

    if (!!isOnBasket) {
      return BundlingSteps.ASSET_SELECTION;
    }
    if (processStatus !== RecoveryProcessStatus.INITIAL) {
      return BundlingSteps.SIGN_RECOVERY_TXS;
    }
    if (unsignedTxs.length > 0) {
      return BundlingSteps.TX_BUNDLE;
    }
    if (hackedAddress !== "") {
      return BundlingSteps.ASSET_SELECTION;
    }
    return BundlingSteps._;
  };

  const reload = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      <MetaHeader />

      <CustomHeader isVisible={!walletConnected} />

      <div
        style={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <HackedAddressProcess
          isVisible={!hackedAddress}
          onSubmit={newAddress => setHackedAddress(newAddress)}
        />

        <BundlingProcess
          isVisible={!!hackedAddress}
          activeStep={getActiveStep()}
          hackedAddress={hackedAddress}
          safeAddress={safeAddress}
          totalGasEstimate={totalGasEstimate}
          unsignedTxs={unsignedTxs}
          setHackedAddress={setHackedAddress}
          setUnsignedTxs={setUnsignedTxs}
          setIsOnBasket={setIsOnBasket}
          setTotalGasEstimate={setTotalGasEstimate}
          startRecovery={(add) => startRecovery(add)}
        />

        <RecoveryProcess
          recoveryStatus={processStatus}
          finishProcess={reload}
          startSigning={startSigning}
          showTipsModal={showTipsModal}
          startProcess={startRecovery}
          blockCountdown={blockCountdown}
          connectedAddress={connectedAddress}
          safeAddress={safeAddress}
          hackedAddress={hackedAddress}
        />

        {error != "" ? (
          <CustomPortal
            close={() => resetError()}
            title={"Something wrong has happend"}
            description={error}
            image={ErrorSvg}
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
