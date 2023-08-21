import React from "react";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { BigNumber, ethers } from "ethers";
import { usePublicClient } from "wagmi";
import { RecoveryTx } from "~~/types/business";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const BLOCKS_IN_THE_FUTURE: { [i: number]: number } = {
  1: 7,
  5: 10,
};

export const useGasEstimation = () => {
  const targetNetwork = getTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });

  const estimateTotalGasPrice = async (txs: RecoveryTx[], deleteTransaction: (id: number) => void) => {
    const tempProvider = new ethers.providers.InfuraProvider(targetNetwork.id, "416f5398fa3d4bb389f18fd3fa5fb58c");
    try {
      const estimates = await Promise.all(
        txs
          .filter(a => a)
          .map((tx, txId) => {
            return tempProvider.estimateGas(tx.toSign).catch(e => {
              console.warn(
                `Following tx will fail when bundle is submitted, so it's removed from the bundle right now. The contract might be a hacky one, and you can try further manipulation via crafting a custom call.`,
              );
              console.warn(tx);
              console.warn(e);
              deleteTransaction(txId);
              return BigNumber.from("0");
            });
          }),
      );

      return estimates
        .reduce((acc: BigNumber, val: BigNumber) => acc.add(val), BigNumber.from("0"))
        .mul(await maxBaseFeeInFuture())
        .mul(105)
        .div(100);
    } catch (e) {
      alert(
        "Error estimating gas prices. Something can be wrong with one of the transactions. Check the console and remove problematic tx.",
      );
      console.error(e);
      return BigNumber.from("0");
    }
  };

  const maxBaseFeeInFuture = async () => {
    const blockNumberNow = await publicClient.getBlockNumber();
    const block = await publicClient.getBlock({ blockNumber: blockNumberNow });
    return FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(
      BigNumber.from(block.baseFeePerGas),
      BLOCKS_IN_THE_FUTURE[targetNetwork.id],
    );
  };

  return {
    estimateTotalGasPrice
  };
};
