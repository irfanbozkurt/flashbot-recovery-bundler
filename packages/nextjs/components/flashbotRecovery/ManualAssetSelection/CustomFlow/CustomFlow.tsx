import { parseAbiItem } from "viem";
import { AddressInput, CustomContractWriteForm, InputBase } from "~~/components/scaffold-eth";
import { AbiFunction } from "abitype";
import styles from "../manualAssetSelection.module.css";
import { RecoveryTx } from "~~/types/business";
import { useState } from "react";
interface ICustomFlowProps {
    hackedAddress: string;
    addAsset: (asset: RecoveryTx) => void;
  }
 export const CustomFlow = ({ hackedAddress, addAsset }: ICustomFlowProps) => {
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
          name="signature"
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
  