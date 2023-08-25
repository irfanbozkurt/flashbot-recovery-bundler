import { useState } from "react";
import styles from "../manualAssetSelection.module.css";
import { AbiFunction } from "abitype";
import { parseAbiItem } from "viem";
import { AddressInput, CustomContractWriteForm, InputBase } from "~~/components/scaffold-eth";
import { RecoveryTx } from "~~/types/business";

interface ICustomFlowProps {
  hackedAddress: string;
  addAsset: (asset: RecoveryTx) => void;
}
export const CustomFlow = ({ hackedAddress, addAsset }: ICustomFlowProps) => {
  const [customContractAddress, setCustomContractAddress] = useState<string>("");
  const [functionSignature, setFunctionSignatureCore] = useState<string>("");
  const setFunctionSignature = (newSig: string) => {
    let withoutFunctionKeyword = newSig.trimStart();
    if (withoutFunctionKeyword.startsWith("function ")) {
      withoutFunctionKeyword = withoutFunctionKeyword.replace("function ", "").trimStart();
    }
    setFunctionSignatureCore(withoutFunctionKeyword);
  };

  const parsedFunctAbi = (() => {
    if (!customContractAddress || !functionSignature) {
      return null;
    }
    try {
      const parsedFunctAbi = parseAbiItem(`function ${functionSignature}`) as AbiFunction;
      return parsedFunctAbi;
    } catch (e) {
      return null;
    }
  })();

  return (
    <>
      <div className="mt-10" />
      <div className={styles.containerCustom}>
        <label className={styles.label} htmlFor="addressInput">
          Contract Address
        </label>
        <AddressInput
          name="addressInput"
          value={customContractAddress}
          placeholder={"e.g. 0xcEBD023e3a...F7fa035bbf52e6"}
          onChange={setCustomContractAddress}
        />
        <div className="mt-6" />
        <label className={styles.label} htmlFor="functionInput">
          Function Signature
        </label>
        <InputBase
          name="signature"
          value={functionSignature}
          placeholder="e.g. transfer(address,uint)"
          onChange={setFunctionSignature}
        />
        {!!parsedFunctAbi && (
          <div className={styles.contract}>
            <CustomContractWriteForm
              fragmentString={functionSignature}
              abiFunction={parsedFunctAbi}
              addUnsignedTx={addAsset}
              hackedAddress={hackedAddress as `0x${string}`}
              contractAddress={customContractAddress as `0x${string}`}
              resetState={() => {
                setCustomContractAddress("");
                setFunctionSignature("");
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};
