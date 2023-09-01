import { useState } from "react";
import { AbiFunction } from "abitype";
import { ethers } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import { Address } from "viem";

import {
  ContractInput,
  IntegerInput,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  getParsedError,
} from "~~/components/scaffold-eth";
import { CustomTx, RecoveryTx } from "~~/types/business";
import { notification } from "~~/utils/scaffold-eth";
import { useShowError } from "~~/hooks/flashbotRecoveryBundle/useShowError";

type WriteOnlyFunctionFormProps = {
  abiFunction: AbiFunction;
  addUnsignedTx: (newTx: RecoveryTx) => void;
  contractAddress: Address;
  hackedAddress: Address;
  fragmentString: string;
  resetState: () => void;
};

export const CustomContractWriteForm = ({
  abiFunction,
  addUnsignedTx,
  fragmentString,
  resetState,
  hackedAddress,
  contractAddress,
}: WriteOnlyFunctionFormProps) => {
  const {showError} = useShowError();

  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [txValue, setTxValue] = useState<string | bigint>("");

  const inputs = abiFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });
  const zeroInputs = inputs.length === 0 && abiFunction.stateMutability !== "payable";

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <p className="font-medium my-0 break-words">{abiFunction.name}</p>

        {inputs}

        {abiFunction.stateMutability === "payable" ? (
          <IntegerInput
            value={txValue}
            onChange={updatedTxValue => {
              setTxValue(updatedTxValue);
            }}
            placeholder="value (wei)"
          />
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            disabled={!ethers.utils.isAddress(contractAddress)}
            className={`btn btn-secondary btn-sm`}
            onClick={async () => {
              try {
                if (!fragmentString) {
                  showError("refresh page and try again");
                  return;
                }

                const callParams = [...getParsedContractFunctionArgs(form), ...(txValue ? [txValue] : [])];

                const fragment = FunctionFragment.fromString(fragmentString.replace("function", "").trim());

                const customTx: CustomTx = {
                  type: "custom",
                  info: `Custom call (${abiFunction.name}) to ${contractAddress}`,
                  toEstimate: {
                    from: hackedAddress,
                    to: contractAddress,
                    data: new ethers.utils.Interface([fragment]).encodeFunctionData(
                      abiFunction.name,
                      callParams,
                    ) as `0x${string}`,
                  },
                };

                addUnsignedTx(customTx);

                setForm(() => getInitialFormState(abiFunction));
                setTxValue(0n);
                resetState();
              } catch (e: any) {
                const message = getParsedError(e);
                notification.error(message);
                console.error(e);
              }
            }}
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
};
