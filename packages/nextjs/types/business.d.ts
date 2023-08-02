export type RecoverableAssetTypes = "erc20" | "erc721" | "erc1155" | "custom";

export interface CoreTxToSign {
  from: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}`;
}

export interface ExtendedUnsignedTx {
  type: RecoverableAssetTypes;
  info: string;
  toSign: CoreTxToSign;
}

export interface CustomTx extends ExtendedUnsignedTx {}

export interface ERC20Tx extends ExtendedUnsignedTx {
  symbol: string;
  amount: string;
}

export interface ERC721Tx extends ExtendedUnsignedTx {
  symbol: string;
  tokenId: string;
}

export interface ERC1155Tx extends ExtendedUnsignedTx {
  uri: string;
  tokenIds: string[];
  amounts: string[];
}

export type RecoveryTx = CustomTx | ERC20Tx | ERC721Tx | ERC1155Tx;

export type UnsignedTxs = { [index: number]: RecoveryTx };
