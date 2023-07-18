export interface BlocksApiResponseTransactionDetails {
  transaction_hash: string;
  tx_index: number;
  bundle_type: "rogue" | "flashbots" | "mempool";
  bundle_index: number;
  block_number: number;
  eoa_address: string;
  to_address: string;
  gas_used: number;
  gas_price: string;
  coinbase_transfer: string;
  eth_sent_to_fee_recipient: string;
  total_miner_reward: string;
  fee_recipient_eth_diff: string;
}
export interface TransactionSimulationBase {
  txHash: string;
  gasUsed: number;
  gasFees: string;
  gasPrice: string;
  toAddress: string;
  fromAddress: string;
  coinbaseDiff: string;
}

export interface TransactionSimulationSuccess extends TransactionSimulationBase {
  value: string;
  ethSentToCoinbase: string;
  coinbaseDiff: string;
}

export interface TransactionSimulationRevert extends TransactionSimulationBase {
  error: string;
  revert: string;
}

export type TransactionSimulation = TransactionSimulationSuccess | TransactionSimulationRevert;
