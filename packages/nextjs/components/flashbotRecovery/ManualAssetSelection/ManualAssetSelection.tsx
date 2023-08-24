import { useEffect, useState } from "react";
import Image from "next/image";
import CloseSvg from "../../../public/assets/flashbotRecovery/close.svg";
import { CustomButton } from "../CustomButton/CustomButton";
import { Tabs } from "../tabs/tabs";
import styles from "./manualAssetSelection.module.css";
import { AbiFunction } from "abitype";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { parseAbiItem } from "viem";
import { AddressInput, CustomContractWriteForm, InputBase } from "~~/components/scaffold-eth";
import { RecoveryTx } from "~~/types/business";

interface IProps {
  isVisible: boolean;
  close: () => void;
  hackedAddress: string;
  addAsset: (asset: RecoveryTx) => void;
}
export const ManualAssetSelection = ({ isVisible, close, addAsset, hackedAddress }: IProps) => {
  const portalSelector = document.querySelector("#myportal");
  if (!portalSelector) {
    return <></>;
  }

  return isVisible
    ? createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${styles.modalContainer}`}
        >
          <div className={`${styles.modal} bg-base-300`}>
            <span className={`${styles.close}`}>
              {" "}
              {!!close ? <Image src={CloseSvg} alt={""} onClick={() => close()} /> : <></>}
            </span>
            <div className={`${styles.modalContent}`}>
              <h3 className={`${styles.title}`}>{"Add assets manually"}</h3>
              <Tabs tabTitles={["Basic", "Custom"]}>
                {active => {
                  const isBasic = active == 0;
                  if (isBasic) {
                    return <BasicFlow />;
                  }
                  return <CustomFlow hackedAddress={hackedAddress} addAsset={item => addAsset(item)} />;
                }}
              </Tabs>
            </div>
          </div>
        </motion.div>,
        portalSelector,
      )
    : null;
};

const BasicFlow = () => {
  return (
    <ul className={styles.list}>
      <li className={`${styles.basicItem} bg-base-100`}>
        <h3>ERC20</h3>
        <CustomButton type="btn-primary" text={"Add"} onClick={() => ({})} />
      </li>
      <li className={`${styles.basicItem} bg-base-100`}>
        <h3>ERC721</h3>
        <CustomButton type="btn-primary" text={"Add"} onClick={() => ({})} />
      </li>
      <li className={`${styles.basicItem} bg-base-100`}>
        <h3>ERC1551</h3>
        <CustomButton type="btn-primary" text={"Add"} onClick={() => ({})} />
      </li>
    </ul>
  );
};

interface ICustomFlowProps {
  hackedAddress: string;
  addAsset: (asset: RecoveryTx) => void;
}
const CustomFlow = ({ hackedAddress, addAsset }: ICustomFlowProps) => {
  const [customContractAddress, setCustomContractAddress] = useState<string>("");
  const [customFunctionSignature, setCustomFunctionSignature] = useState<string>("");

  const getParsedAbi = () => {
    if (!customContractAddress || !customFunctionSignature) {
      return null;
    }
    try {
      const parsedFunctAbi = parseAbiItem(customFunctionSignature) as AbiFunction;
      return parsedFunctAbi;
    } catch (e) {
      return null;
    }
  };
  const parsedFunctAbi = getParsedAbi();

  return (
    <>
       <div className="mt-10"></div>
       
    <div className={styles.containerCustom}>
   
      <label className={styles.label} htmlFor="addressInput">
        Contract Address
      </label>
      <AddressInput
        name="addressInput"
        value={customContractAddress}
        placeholder={"0xcEBD023e3a...F7fa035bbf52e6"}
        onChange={e => setCustomContractAddress(e)}
      />
      <div className="mt-6"></div>
      <label className={styles.label} htmlFor="functionInput">
        Function to call
      </label>
      <InputBase
        name="addressInput"
        value={customFunctionSignature}
        placeholder={"transfer()"}
        onChange={e => setCustomFunctionSignature(e)}
      />
      {!!parsedFunctAbi ? (
        <div className={styles.contract}>
          <CustomContractWriteForm
            fragmentString={customFunctionSignature}
            abiFunction={parsedFunctAbi}
            addUnsignedTx={addAsset}
            hackedAddress={hackedAddress as `0x${string}`}
            contractAddress={customContractAddress as `0x${string}`}
            resetState={() => {
              setCustomContractAddress("");
              setCustomFunctionSignature("");
            }}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
    </>
  );
};
