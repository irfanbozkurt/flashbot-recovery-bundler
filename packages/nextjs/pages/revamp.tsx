/* eslint-disable */
import { SetStateAction, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LogoSvg from "../public/assets/flashbotRecovery/logo.svg";
import VideoSvg from "../public/assets/flashbotRecovery/video.svg";
import { isAddress } from "ethers/lib/utils";
import { NextPage } from "next";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { AssetSelectionStep } from "~~/components/flashbotRecovery/AssetSelectionStep/AssetSelectionStep";
import { ConnectStep } from "~~/components/flashbotRecovery/ConnectStep/ConnectStep";
import { CustomHeader } from "~~/components/flashbotRecovery/CustomHeader/CustomHeader";
import { CustomPortal } from "~~/components/flashbotRecovery/CustomPortal/CustomPortal";
import { HackedAddressStep } from "~~/components/flashbotRecovery/HackedAddressStep/HackedAddressStep";
import { Layout } from "~~/components/flashbotRecovery/Layout/Layout";
import { RecoveryProcess } from "~~/components/flashbotRecovery/RecoveryProcess/RecoveryProcess";
import { TransactionBundleStep } from "~~/components/flashbotRecovery/TransactionBundleStep/transactionBundleStep";
import { RecoveryProcessStatus, useBundleProcess } from "~~/hooks/flashbotRecoveryBundle/useFlashbotNetworkChange";
import { RecoveryTx } from "~~/types/business";

const Home: NextPage = () => {
  const { isConnected, address } = useAccount();
  const [safeAddress, setSafeAddress] = useLocalStorage<string>("toAddress", "");
  const [hackedAddress, setHackedAddress] = useLocalStorage<string>("hackedAddress", "");
  const [unsignedTxs, setUnsignedTxs] = useLocalStorage<RecoveryTx[]>("unsignedTxs", []);
  const [isOnBasket, setIsOnBasket] = useState(false);
  const [currentBundleId, setCurrentBundleId] = useLocalStorage<string>("bundleUuid", "");

  const { data: processStatus, startBundleProcess, signRecoveryTransactions } = useBundleProcess();

  useEffect(() => {
    if (!!safeAddress || !address) {
      return;
    }
    setSafeAddress(address);
    return () => {};
  }, [address]);

  useEffect(() => {
    if(address === hackedAddress && processStatus === RecoveryProcessStatus.switchToHacked && unsignedTxs.length > 0){
      signRecoveryTransactions(hackedAddress, unsignedTxs, false)
    }
  
    return () => {};
  }, [address])

  const getLayoutActiveStep = () => {
    if (!!isOnBasket) {
      return 2;
    }

    if (unsignedTxs.length > 0) {
      return 3;
    }
    if (hackedAddress !== "") {
      return 2;
    }
    return 1;
  };
  const activeStep = getLayoutActiveStep();

  return (
    <>
      <MetaHeader />
      {!isConnected && <CustomHeader />}
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ConnectStep isVisible={!isConnected} />
        {!!isConnected && (
          <Layout stepActive={activeStep} hackedAddress={hackedAddress} safeAddress={safeAddress}>
            <>
              <HackedAddressStep
                isVisible={activeStep === 1}
                onSubmit={address => {
                  setHackedAddress(address);
                }}
              />
              <AssetSelectionStep
                isVisible={activeStep === 2}
                onSubmit={txsToAdd => {
                  setUnsignedTxs(txsToAdd);
                  setIsOnBasket(false);
                }}
                hackedAddress={hackedAddress}
                safeAddress={safeAddress}
              />
              <TransactionBundleStep
                isVisible={activeStep === 3}
                transactions={unsignedTxs}
                modifyTransactions={setUnsignedTxs}
                onAddMore={() => setIsOnBasket(true)}
                clear={() => setUnsignedTxs([])}
                onSubmit={(totalGas) => {
                  startBundleProcess({safeAddress, modifyBundleId:val => setCurrentBundleId(val),totalGas, hackedAddress, transactions:unsignedTxs})
                }}
              />
            </>
          </Layout>
        )}
        <RecoveryProcess recoveryStatus={processStatus}></RecoveryProcess>
        {/* <CustomPortal
          title={"Clear cache"}
          description={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
          }
          image={VideoSvg}
        /> */}

        {/* <CustomPortal
          title={"Switch to hacked adress"}
          description={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
          }
          image={LogoSvg}
        /> */}
        {/* <CustomPortal
          title={"Rise your gas"}
          description={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
          }
          image={VideoSvg}
        /> */}
        {/* <CustomPortal
          title={"Wait without refreshing the page"}
          description={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
          }
          image={LogoSvg}
        /> */}
        {/* <CustomPortal
          title={"Success"}
          description={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
          }
          image={VideoSvg}
        /> */}
        {/* <CustomPortal
          title={"Error"}
          description={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti."
          }
          image={VideoSvg}
          button={{
            action:() => ({}),
            text:"Retry"
          }}
        /> */}
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
