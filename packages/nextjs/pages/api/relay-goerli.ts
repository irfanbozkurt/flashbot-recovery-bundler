import {
  FlashbotsBundleProvider,
  FlashbotsTransaction,
  FlashbotsTransactionResponse,
} from "@flashbots/ethers-provider-bundle";
import { ethers } from "ethers";

const SEND_ITER = 20;

const goerliProvider = new ethers.providers.InfuraProvider("goerli", "416f5398fa3d4bb389f18fd3fa5fb58c");
const goerliFlashbotProvider = await FlashbotsBundleProvider.create(
  goerliProvider,
  ethers.Wallet.createRandom(),
  "https://relay-goerli.flashbots.net/",
  "goerli",
);

export default async function handler(req: any, res: any) {
  const body = req.body;
  if (!body || !body.txs || body.txs.length == 0) {
    res.status(400).json({ reason: "Bad bundle" });
  }

  const reformattedBundle = body.txs.map((signedTx: any) => {
    return { signedTransaction: signedTx };
  });
  const signedBundle = await goerliFlashbotProvider.signBundle(reformattedBundle);
  const currentBlockNumber = await goerliProvider.getBlockNumber();

  // const simulationResult = await goerliFlashbotProvider.simulate(signedBundle, currentBlockNumber + 2);
  // console.log("simulation result:");
  // console.log(simulationResult);

  const submissionPromises = [];
  for (var i = 1; i <= SEND_ITER; i++)
    submissionPromises.push(goerliFlashbotProvider.sendRawBundle(signedBundle, currentBlockNumber + i));
  const results = await Promise.all(submissionPromises);

  // console.log("-------------------------------- SUBMITTED");
  // Promise.all(
  //   results.map(async (r: FlashbotsTransaction) => {
  //     const res = await (r as FlashbotsTransactionResponse).wait();
  //     console.log("RES:  " + res);
  //   }),
  // );

  res.status(203).json({ response: `Bundle submitted` });
}
