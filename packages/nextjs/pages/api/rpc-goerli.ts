import { txRegistry } from "./relay";
import { ethers } from "ethers";
import { jsonSchema } from "uuidv4";

const tempProvider = new ethers.providers.InfuraProvider(5, "416f5398fa3d4bb389f18fd3fa5fb58c");

export default async function handler(req: any, res: any) {
  const body = req.body;
  if (!body || !body.id || !body.jsonrpc || body.jsonrpc != "2.0") {
    res.status(400).json({ reason: "Bad request" });
  }

  const query = req.query;
  if (!query || !query.bundle) {
    res.status(400).json({ reason: "Bad request" });
  }
  const bundleId = query.bundle;

  if (!new RegExp(jsonSchema.v4.pattern).test(bundleId)) {
    res.status(400).json({ reason: "Bad bundle id" });
  }

  if (body.method == "eth_chainId") {
    res.status(200).json({
      id: body.id,
      result: "0x5",
      jsonrpc: "2.0",
    });
    return;
  }

  if (body.method == "eth_getBalance") {
    res.status(200).json({
      id: body.id,
      result: "0x56bc75e2d63100000", // 100 ETH
      jsonrpc: "2.0",
    });
    return;
  }

  if (body.method == "eth_gasPrice") {
    try {
      const estimation = await tempProvider.getGasPrice();
      res.status(200).json({
        id: body.id,
        result: estimation._hex,
        jsonrpc: "2.0",
      });
    } catch (e) {
      res.status(400).json({
        id: body.id,
        error: e,
        jsonrpc: "2.0",
      });
    }
    return;
  }

  if (body.method == "eth_estimateGas") {
    try {
      const estimation = await tempProvider.estimateGas(body.params[0]);
      res.status(200).json({
        id: body.id,
        result: estimation._hex,
        jsonrpc: "2.0",
      });
    } catch (e) {
      res.status(400).json({
        id: body.id,
        error: e,
        jsonrpc: "2.0",
      });
    }
    return;
  }

  if (body.method == "eth_call") {
    const result = await tempProvider.call(body.params[0]);
    try {
      res.status(200).json({
        id: body.id,
        result: result,
        jsonrpc: "2.0",
      });
    } catch (e) {
      res.status(400).json({
        id: body.id,
        error: e,
        jsonrpc: "2.0",
      });
    }
    return;
  }

  if (body.method == "eth_getCode") {
    const result = await tempProvider.call(body.params[0]);
    try {
      res.status(200).json({
        id: body.id,
        result: result,
        jsonrpc: "2.0",
      });
    } catch (e) {
      res.status(400).json({
        id: body.id,
        error: e,
        jsonrpc: "2.0",
      });
    }
    return;
  }

  if (body.method == "eth_blockNumber") {
    try {
      const result = await tempProvider.getBlockNumber();
      res.status(200).json({
        id: body.id,
        result: result,
        jsonrpc: "2.0",
      });
    } catch (e) {
      res.status(400).json({
        id: body.id,
        error: e,
        jsonrpc: "2.0",
      });
    }
    return;
  }

  if (body.method == "eth_getBlockByNumber") {
    try {
      const result = await tempProvider.getBlock(body.params[0]);
      res.status(200).json({
        id: body.id,
        result: result,
        jsonrpc: "2.0",
      });
    } catch (e) {
      res.status(400).json({
        id: body.id,
        error: e,
        jsonrpc: "2.0",
      });
    }
    return;
  }

  if (body.method == "eth_getTransactionCount") {
    try {
      const result = await tempProvider.getTransactionCount(body.params[0], body.params[1]);
      res.status(200).json({
        id: body.id,
        result: result,
        jsonrpc: "2.0",
      });
    } catch (e) {
      res.status(400).json({
        id: body.id,
        error: e,
        jsonrpc: "2.0",
      });
    }
    return;
  }

  if (body.method == "net_version") {
    res.status(200).json({
      id: body.id,
      result: "1",
      jsonrpc: "2.0",
    });
    return;
  }

  if (body.method == "eth_sendRawTransaction") {
    const signedTx = body.params[0];
    const txHash = ethers.utils.keccak256(signedTx);

    if (!txRegistry[bundleId]) {
      txRegistry[bundleId] = new Set<string>();
    }
    txRegistry[bundleId].add(txHash);

    res.status(200).json({
      id: body.id,
      result: txHash,
      jsonrpc: "2.0",
    });
    return;
  }

  res.status(200).json({
    id: body.id,
    jsonrpc: "2.0",
  });
}
