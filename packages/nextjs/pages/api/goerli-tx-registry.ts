import { BigNumber } from "ethers";

export interface TxBody {
  [field: string]: string;
}
interface TxRegistry {
  [bundleId: string]: {
    expectedTx?: TxBody;
    txs: string[];
  };
}
export const txRegistry: TxRegistry = {};

// Incoming tx must have all the fields of the expected transaction. Can and will
// contain more fields, like the v,r,s of the signature
export const isTransactionExpected = (bundleId: string, incomingTx: TxBody) => {
  if (!txRegistry[bundleId]) {
    return false;
  }
  if (!incomingTx || Object.keys(incomingTx).length == 0) {
    return false;
  }
  const expectedTx = txRegistry[bundleId].expectedTx;
  if (!expectedTx) {
    return false;
  }

  for (const [key, value] of Object.entries(expectedTx)) {
    if (!incomingTx[key]) {
      console.log("EXPECTED FIELD" + key + " DOESN'T EXIST IN INCOMING TX");
      return false;
    }
    const expectedVal = value.toString().toLowerCase();
    const incomingVal = incomingTx[key].toString().toLowerCase();
    if (incomingVal != expectedVal) {
      console.log("VALUES ARE NOT EQUAL... RETURNING FALSE");
      console.log("INCOMING VALUE: " + incomingVal);
      console.log("EXPECTED VALUE: " + expectedVal);
      return false;
    }
  }
  return true;
};

export default async function handler(req: any, res: any) {
  const query = req.query;
  if (!query || !query.bundle) {
    res.status(400);
    return;
  }
  const bundleId = query.bundle;
  if (!bundleId) {
    res.status(400);
    return;
  }

  const txBodyString = req.body;
  if (!txBodyString || txBodyString.length == 0) {
    res.status(400).json({ reason: "Send body" });
    return;
  }

  const txBody = JSON.parse(txBodyString, (key, value) => {
    if (["value", "gasLimit", "gasPrice", "maxFeePerGas", "maxPriorityFeePerGas"].includes(key)) {
      return BigNumber.from(value);
    }
    return value;
  }) as TxBody;

  //as TxBody;
  if (!txBody || Object.keys(txBody).length == 0) {
    res.status(400).json({ reason: "Send body" });
    return;
  }

  if (!txRegistry[bundleId]) {
    txRegistry[bundleId] = {
      expectedTx: {},
      txs: [],
    };
  }

  txRegistry[bundleId].expectedTx = txBody;

  res.status(200).json({
    message: "Tx registered as expected",
  });
}
