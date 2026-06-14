import { Keypair, Transaction, type VersionedTransaction } from "@solana/web3.js";
import type { WalletName } from "@solana/wallet-adapter-base";
import { BaseMessageSignerWalletAdapter, WalletReadyState } from "@solana/wallet-adapter-base";
import * as nacl from "tweetnacl";

export const LocalWalletName = "Local Wallet (Dev)" as WalletName<"Local Wallet (Dev)">;

export class LocalWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = LocalWalletName;
  url = "https://localhost";
  icon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2ZmNjQyZSIvPjwvc3ZnPg==";
  supportedTransactionVersions = null;

  private _keypair: Keypair;
  private _connecting = false;

  constructor() {
    super();
    this._keypair = Keypair.generate();
  }

  get publicKey() { return this._keypair.publicKey; }
  get readyState() { return WalletReadyState.Installed; }
  get connecting() { return this._connecting; }

  async connect(): Promise<void> {
    this._connecting = true;
    try {
      this.emit("connect", this._keypair.publicKey);
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    this.emit("disconnect");
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (tx instanceof Transaction) {
      tx.partialSign(this._keypair);
      return tx as T;
    }
    tx.sign([this._keypair]);
    return tx;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    return txs.map(tx => {
      if (tx instanceof Transaction) {
        tx.partialSign(this._keypair);
        return tx;
      }
      tx.sign([this._keypair]);
      return tx;
    });
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    return nacl.sign.detached(message, this._keypair.secretKey);
  }
}
