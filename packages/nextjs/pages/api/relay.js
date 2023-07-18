import { FlashbotsBundleProvider, FlashbotsBundleResolution } from "@flashbots/ethers-provider-bundle";
import { ethers } from "ethers";

const goerliProvider = new ethers.providers.InfuraProvider(5);
const goerliFlashbotProvider = await FlashbotsBundleProvider.create(
  goerliProvider,
  ethers.Wallet.createRandom(),
  "https://relay-goerli.flashbots.net/",
  "goerli",
);

export default async function handler(req, res) {
  const body = req.body;
  if (!body || !body.txs || body.txs.length == 0) {
    res.status(400).json({ reason: "Bad bundle" });
  }

  const reformattedBundle = body.txs.map(signedTx => {
    return { signedTransaction: signedTx };
  });
  const signedBundle = await goerliFlashbotProvider.signBundle(reformattedBundle);
  const currentBlockNumber = await goerliProvider.getBlockNumber();

  const submissionPromises = [];
  for (var i = 1; i <= 5; i++) {
    submissionPromises.push(goerliFlashbotProvider.sendRawBundle(signedBundle, currentBlockNumber + i));
    console.log("submitted for block # ", currentBlockNumber + i);
  }
  const awaitedSubmissions = await Promise.all(submissionPromises);
  console.log("-------------------------AWAITED1-----------------------");
  console.log(awaitedSubmissions);

  const awaited2 = await Promise.all(awaitedSubmissions.map(a => a["wait"]()));
  console.log("-----------------------AWAITED2-------------------------");
  console.log(awaited2);

  res.status(200); //.json({ response: result });
}
