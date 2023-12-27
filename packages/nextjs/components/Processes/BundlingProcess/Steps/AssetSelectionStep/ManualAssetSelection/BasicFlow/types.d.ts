export interface ITokenForm {
  hackedAddress: string;
  safeAddress: string;
  close: () => void;
  addAsset: (arg: RecoveryTx) => void;
}
