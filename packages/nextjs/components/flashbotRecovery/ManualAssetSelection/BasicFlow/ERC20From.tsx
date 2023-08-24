import { useState } from "react";
import styles from "../manualAssetSelection.module.css";
import { useContractRead } from "wagmi";
import { ERC20_ABI } from "~~/utils/constants";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { ITokenForm } from "./BasicFlow";
import { BigNumber, ethers } from "ethers";
import { isAddress } from "viem";
import Image from "next/image";
import BackSvg from "../../../../public/assets/flashbotRecovery/back.svg";
import { ERC20Tx } from "~~/types/business";
import { AddressInput } from "~~/components/scaffold-eth";
import { CustomButton } from "../../CustomButton/CustomButton";
const erc20Interface = new ethers.utils.Interface(ERC20_ABI);

export const ERC20Form = ({ hackedAddress, safeAddress, addAsset, close }: ITokenForm) => {
    const [contractAddress, setContractAddress] = useState<string>("");
  
    let erc20Balance: string = "NO INFO";
    try {
      let { data } = useContractRead({
        chainId: getTargetNetwork().id,
        functionName: "balanceOf",
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        watch: true,
        args: [hackedAddress],
      });
      if (data) {
        erc20Balance = BigNumber.from(data).toString();
        if (erc20Balance == "0") erc20Balance = "NO INFO";
      }
    } catch (e) {
      // Most probably the contract address is not valid as user is
      // still typing, so ignore.
    }
  
    const addErc20TxToBasket = (balance: string) => {
      if (!isAddress(contractAddress)) {
        alert("Provide a contract first");
        return;
      }
      if (balance == "NO INFO") {
        alert("Hacked account has no balance in given erc20 contract");
        return;
      }
  
      const newErc20tx: ERC20Tx = {
        type: "erc20",
        info: "changeme",
        symbol: "changeme",
        amount: balance,
        toSign: {
          from: hackedAddress as `0x${string}`,
          to: contractAddress as `0x${string}`,
          data: erc20Interface.encodeFunctionData("transfer", [safeAddress, BigNumber.from(balance)]) as `0x${string}`,
        },
      };
      addAsset(newErc20tx);
    };
  
    return (
      <div className={styles.containerBasic}>
        <Image src={BackSvg} alt={""} className={styles.back} onClick={() => close()} />
        <h3 className={`${styles.title}`}>{"ERC20"}</h3>
        <div className="mt-8"></div>
        <label className={styles.label} htmlFor="addressInput">
          Contract Address
        </label>
        <AddressInput
          name="addressInput"
          value={contractAddress}
          placeholder={"0xcEBD023e3a...F7fa035bbf52e6"}
          onChange={e => setContractAddress(e)}
        />
        <div className={styles.bottom}></div>
        <CustomButton type="btn-primary" text={"Add"} onClick={() => addErc20TxToBasket(erc20Balance)} />
      </div>
    );
  };
  