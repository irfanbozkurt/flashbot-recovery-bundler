import { FlashbotsBundleProvider, FlashbotsBundleResolution } from "@flashbots/ethers-provider-bundle";
import { ethers } from "ethers";

const mainnetProvider = new ethers.providers.InfuraProvider(1, "416f5398fa3d4bb389f18fd3fa5fb58c");
const flashbotProvider = await FlashbotsBundleProvider.create(
  mainnetProvider,
  ethers.Wallet.createRandom(),
  "https://relay.flashbots.net/",
);

export default async function handler(req, res) {
  const body = req.body;
  if (!body || !body.txs || body.txs.length == 0) {
    res.status(400).json({ reason: "Bad bundle" });
  }

  const reformattedBundle = body.txs.map(signedTx => {
    return { signedTransaction: signedTx };
  });
  const signedBundle = await flashbotProvider.signBundle(reformattedBundle);
  const currentBlockNumber = await mainnetProvider.getBlockNumber();

  await flashbotProvider.sendRawBundle(signedBundle, currentBlockNumber + 1);

  res.status(203).json({ response: `Bundle submitted` });
}
