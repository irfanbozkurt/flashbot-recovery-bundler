import { Dispatch, SetStateAction } from "react";
import styles from "./bundlingProcess.module.css";
import { BigNumber } from "ethers";
import { motion } from "framer-motion";
import { useLocalStorage } from "usehooks-ts";
import { SideBar } from "~~/components/Processes/BundlingProcess/SideBar/SideBar";
import { AssetSelectionStep } from "~~/components/Processes/BundlingProcess/Steps/AssetSelectionStep/AssetSelectionStep";
import { HackedAddressStep } from "~~/components/Processes/BundlingProcess/Steps/HackedAddressStep/HackedAddressStep";
import { TransactionBundleStep } from "~~/components/Processes/BundlingProcess/Steps/TransactionBundleStep/TransactionBundleStep";
import { RecoveryTx } from "~~/types/business";
import { BundlingSteps } from "~~/types/enums";

interface IProps {
  isVisible: boolean;
  activeStep: BundlingSteps;
  safeAddress: string;
  hackedAddress: string;
  totalGasEstimate: BigNumber;
  unsignedTxs: RecoveryTx[];
  setHackedAddress: Dispatch<SetStateAction<string>>;
  setUnsignedTxs: Dispatch<SetStateAction<RecoveryTx[]>>;
  setIsOnBasket: Dispatch<SetStateAction<boolean>>;
  setTotalGasEstimate: Dispatch<SetStateAction<BigNumber>>;
  startRecovery: () => void;
}
export const BundlingProcess = ({
  isVisible,
  activeStep,
  hackedAddress,
  safeAddress,
  totalGasEstimate,
  unsignedTxs,
  setHackedAddress,
  setTotalGasEstimate,
  setIsOnBasket,
  setUnsignedTxs,
  startRecovery,
}: IProps) => {
  if (!isVisible) {
    return <></>;
  }

  const [accountAssets, setAccountAssets] = useLocalStorage<RecoveryTx[]>("accountAssets", []);
  const [selectedAssetIndices, setSelectedAssetIndices] = useLocalStorage<number[]>("selectedAssetIndices", []);

  const stateTransitionFunctions = {
    fromHackedAddressInputToAssetSelection: setHackedAddress,
    fromAssetSelectionToHackedAddressInput: () => {
      setIsOnBasket(false);
      setSelectedAssetIndices([]);
      setUnsignedTxs([]);
      setHackedAddress("");
    },
    fromAssetSelectionToBundling: (txsToAdd: RecoveryTx[]) => {
      setUnsignedTxs(txsToAdd);
      setIsOnBasket(false);
    },
    fromBundlingToAssetSelection: (clearUnsignedTxs: boolean = false) => {
      let selectedIndices: number[] = [];
      if (clearUnsignedTxs) {
        setUnsignedTxs([]);
      } else {
        selectedIndices = unsignedTxs.map(tx => accountAssets.findIndex(asset => asset.toSign.data == tx.toSign.data));
      }
      setSelectedAssetIndices(selectedIndices);
      setIsOnBasket(true);
    },
    fromBundlingToRecoveryPhase: startRecovery,
  };

  return (
    <motion.div className={styles.bundling} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SideBar activeStep={activeStep} hackedAddress={hackedAddress} safeAddress={safeAddress} />
      <div className={`${styles.content} bg-base-300`}>
        <HackedAddressStep
          isVisible={activeStep === BundlingSteps.HACKED_ADDRESS_INPUT}
          safeAddress={safeAddress}
          onSubmit={stateTransitionFunctions.fromHackedAddressInputToAssetSelection}
        />
        <AssetSelectionStep
          isVisible={activeStep === BundlingSteps.ASSET_SELECTION}
          hackedAddress={hackedAddress}
          safeAddress={safeAddress}
          accountAssets={accountAssets}
          setAccountAssets={setAccountAssets}
          setSelectedAssetIndices={setSelectedAssetIndices}
          selectedAssetIndices={selectedAssetIndices}
          onBack={stateTransitionFunctions.fromAssetSelectionToHackedAddressInput}
          onSubmit={stateTransitionFunctions.fromAssetSelectionToBundling}
        />
        <TransactionBundleStep
          isVisible={activeStep === BundlingSteps.TX_BUNDLE}
          setTotalGasEstimate={setTotalGasEstimate}
          totalGasEstimate={totalGasEstimate}
          transactions={unsignedTxs}
          modifyTransactions={setUnsignedTxs}
          clear={() => stateTransitionFunctions.fromBundlingToAssetSelection(true)}
          onBack={stateTransitionFunctions.fromBundlingToAssetSelection}
          onSubmit={stateTransitionFunctions.fromBundlingToRecoveryPhase}
        />
      </div>
    </motion.div>
  );
};
