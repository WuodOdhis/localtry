/**
 * ChajiPay Transaction Watcher
 *
 * Polls a merchant's USDT ATA for incoming payments on Solana.
 *
 * USAGE:
 *   npx tsx src/scripts/watcher.ts
 *
 * CONFIGURATION (set in .env.local or pass as env vars):
 *   RPC_URL        - Solana RPC endpoint (default: http://127.0.0.1:8899)
 *   USDT_MINT      - USDT mint address (default: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB)
 *   MERCHANT_WALLET- The merchant's receiving wallet address
 *   POLL_INTERVAL  - Polling interval in ms (default: 15000)
 *
 * MAINNET EXAMPLE:
 *   RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY \
 *   USDT_MINT=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB \
 *   MERCHANT_WALLET=YOUR_WALLET_ADDRESS \
 *   npx tsx src/scripts/watcher.ts
 *
 * For production, replace polling with webhooks:
 *   - Helius: https://docs.helius.dev/webhooks-and-websockets/webhooks
 *   - QuickNode: https://www.quicknode.com/guides/solana-development/using-webhooks
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8899";
const USDT_MINT = new PublicKey(process.env.USDT_MINT || "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
const MERCHANT_WALLET = process.env.MERCHANT_WALLET || "";
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "15000", 10);

const connection = new Connection(RPC_URL, "confirmed");

let lastKnownBalance = BigInt(0);

async function checkForPayments() {
  if (!MERCHANT_WALLET) {
    console.log("Set MERCHANT_WALLET env var to start watching.");
    console.log("Example: MERCHANT_WALLET=YOUR_SOLANA_ADDRESS npx tsx src/scripts/watcher.ts");
    return;
  }

  try {
    const merchantPubkey = new PublicKey(MERCHANT_WALLET);
    const ata = await getAssociatedTokenAddress(USDT_MINT, merchantPubkey);

    let currentBalance = BigInt(0);
    try {
      const accountInfo = await getAccount(connection, ata);
      currentBalance = accountInfo.amount;
    } catch {
      // ATA doesn't exist yet — balance is 0
    }

    if (currentBalance > lastKnownBalance) {
      const diff = Number(currentBalance - lastKnownBalance) / 1_000_000;
      console.log(`\n---`);
      console.log(`New payment detected!`);
      console.log(`Amount: ${diff.toFixed(6)} USDT`);
      console.log(`Merchant: ${MERCHANT_WALLET}`);
      console.log(`New Balance: ${Number(currentBalance) / 1_000_000} USDT`);
      console.log(`Check on explorer: https://explorer.solana.com/address/${MERCHANT_WALLET}`);
      console.log(`---\n`);
    }

    lastKnownBalance = currentBalance;
  } catch (err) {
    console.error("Watcher error:", err);
  }
}

console.log(`\nChajiPay Watcher`);
console.log(`===============`);
console.log(`RPC: ${RPC_URL}`);
console.log(`USDT Mint: ${USDT_MINT.toBase58()}`);
console.log(`Merchant Wallet: ${MERCHANT_WALLET || "(not set — watching will not start)"}`);
console.log(`Poll Interval: ${POLL_INTERVAL}ms\n`);

checkForPayments();
setInterval(checkForPayments, POLL_INTERVAL);
