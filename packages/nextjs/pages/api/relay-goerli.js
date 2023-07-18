import { FlashbotsBundleProvider, FlashbotsBundleResolution } from "@flashbots/ethers-provider-bundle";
import { ethers } from "ethers";

const SEND_ITER = 20;

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
  for (var i = 1; i <= SEND_ITER; i++)
    submissionPromises.push(goerliFlashbotProvider.sendRawBundle(signedBundle, currentBlockNumber + i));
  const awaitedSubmissions = await Promise.all(submissionPromises);

  const awaitedResults = await Promise.all(
    awaitedSubmissions.map(a => a.wait()),
    //   {
    //   const result = await a["wait"]();
    //   console.log(`Awaited result: `);
    //   console.log(result);
    //   if (result == FlashbotsBundleResolution.BundleIncluded) {
    //     res.status(203).json({ response: `Your bundle has been included successfully!` });
    //     return;
    //   }
    // }),
  );

  console.log(awaitedResults);

  if (awaitedResults.includes(FlashbotsBundleResolution.BundleIncluded)) {
    res.status(203).json({ response: `Your bundle has been included successfully!` });
    return;
  }

  res.status(203).json({ response: `Bundle not included. Try again with higher gas` });
}
