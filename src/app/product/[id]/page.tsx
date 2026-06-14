"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, ArrowLeft, Loader2, Copy, AlertCircle, Package, Search } from "lucide-react";
import Link from "next/link";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, createTransferInstruction, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import Confetti from "@/components/Confetti";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
}

const USDT_MINT = new PublicKey(process.env.NEXT_PUBLIC_USDT_MINT || "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
const USDT_DECIMALS = 6;

function shorten(s: string, n = 6) {
  return s.length > n * 2 + 3 ? `${s.slice(0, n)}...${s.slice(-n)}` : s;
}

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("store");
  const productId = params.id;
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txSig, setTxSig] = useState("");
  const [verifyInput, setVerifyInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<"idle" | "verified" | "invalid">("idle");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [receivingWallet, setReceivingWallet] = useState(storeId || "");
  const networkLabel = (process.env.NEXT_PUBLIC_SOLANA_RPC || "").includes("devnet") ? "Devnet" :
    (process.env.NEXT_PUBLIC_SOLANA_RPC || "").includes("mainnet") ? "Mainnet" : "Localnet";

  useEffect(() => {
    if (storeId) {
      // Fetch the merchant's receiving wallet config
      fetch(`/api/store/config?wallet=${storeId}`)
        .then((r) => r.json())
        .then((data) => {
          setReceivingWallet(data.receivingWallet || storeId);
        })
        .catch(() => {});
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) {
      fetch(`/api/products?wallet=${storeId}`)
        .then((r) => r.json())
        .then((products: Product[]) => {
          const p = products.find((x) => x.id === productId);
          if (p) setProduct(p);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [storeId, productId]);

  const handlePay = async () => {
    if (!connected || !publicKey || !product) return;
    if (product.stock <= 0) {
      setErrorMsg("This product is out of stock");
      setPaymentStatus("error");
      return;
    }
    setPaymentStatus("processing");
    setErrorMsg("");

    try {
      const amountRaw = Math.floor(product.price * 10 ** USDT_DECIMALS);
      const buyerAta = await getAssociatedTokenAddress(USDT_MINT, publicKey);
      const merchantAta = await getAssociatedTokenAddress(USDT_MINT, new PublicKey(receivingWallet));

      const tx = new Transaction();

      // Create merchant's ATA if it doesn't exist (one-time ~0.002 SOL rent fee)
      try {
        await getAccount(connection, merchantAta);
      } catch {
        tx.add(createAssociatedTokenAccountInstruction(
          publicKey,
          merchantAta,
          new PublicKey(receivingWallet),
          USDT_MINT
        ));
      }

      tx.add(createTransferInstruction(buyerAta, merchantAta, publicKey, amountRaw));

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
      setVerifyResult("verified");
      setVerifyMsg("Transaction confirmed on-chain!");
      setPaymentStatus("success");

      const order = {
        id: Math.random().toString(36).substring(2, 12),
        productId: product.id,
        productName: product.name,
        amount: product.price,
        merchantWallet: storeId,
        receivingWallet,
        txSignature: sig,
        status: "verified",
        createdAt: new Date().toISOString(),
      };
      const orders = JSON.parse(localStorage.getItem("chaji_orders") || "[]");
      orders.unshift(order);
      localStorage.setItem("chaji_orders", JSON.stringify(orders));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setErrorMsg(msg);
      setPaymentStatus("error");
    }
  };

  const handleVerifyTx = async () => {
    if (!verifyInput.trim() || !product || !receivingWallet) return;
    setVerifying(true);
    setVerifyResult("idle");
    setVerifyMsg("");

    try {
      const sig = verifyInput.trim();
      const tx = await connection.getTransaction(sig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });

      if (!tx) {
        setVerifyResult("invalid");
        setVerifyMsg(`Transaction not found on ${networkLabel}. Make sure your RPC endpoint (${process.env.NEXT_PUBLIC_SOLANA_RPC?.slice(0, 40)}...) matches the network you paid on.`);
        return;
      }

      const preBalances = tx.meta?.preTokenBalances || [];
      const postBalances = tx.meta?.postTokenBalances || [];

      const targetMint = USDT_MINT.toBase58();

      // Find the USDT account that received funds (balance increased)
      let diff = 0;
      for (const post of postBalances) {
        if (post.mint !== targetMint) continue;
        const pre = preBalances.find(
          (b) => b.mint === targetMint && b.accountIndex === post.accountIndex
        );
        const p = pre ? Number(pre.uiTokenAmount.amount) : 0;
        const a = Number(post.uiTokenAmount.amount);
        if (a - p > diff) diff = a - p;
      }

      if (diff <= 0) {
        setVerifyResult("invalid");
        setVerifyMsg("No incoming USDT transfer found in this transaction.");
        return;
      }

      setTxSig(sig);
      setVerifyResult("verified");
      setVerifyMsg(`Payment of ${product.price} USDT confirmed on-chain!`);

      // Save verified order
      const order = {
        id: Math.random().toString(36).substring(2, 12),
        productId: product.id,
        productName: product.name,
        amount: product.price,
        merchantWallet: storeId,
        receivingWallet,
        txSignature: sig,
        status: "verified",
        createdAt: new Date().toISOString(),
      };
      const orders = JSON.parse(localStorage.getItem("chaji_orders") || "[]");
      orders.unshift(order);
      localStorage.setItem("chaji_orders", JSON.stringify(orders));
      setPaymentStatus("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setVerifyResult("invalid");
      setVerifyMsg(msg);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Package size={48} className="text-muted-foreground mb-4" /><p>Product not found.</p></div>;
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Confetti active />
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <CheckCircle2 size={64} className="text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Payment Successful!</h1>
        <p className="text-lg text-muted-foreground mb-8">{product.name}</p>
        <div className="bg-card border border-border rounded-xl p-6 mb-8 w-full max-w-md text-left shadow-lg">
          <div className="flex justify-between mb-3">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-bold">{product.price} USDT</span>
          </div>
          {txSig && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction</span>
              <span className="font-mono text-xs text-primary truncate max-w-[200px]">{shorten(txSig)}</span>
            </div>
          )}
          {verifyMsg && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-500">
              <CheckCircle2 size={12} /> {verifyMsg}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/store/${storeId}`} className="text-primary font-medium hover:underline flex items-center gap-2">
            <ArrowLeft size={16} /> Return to Store
          </Link>
          <Link href="/orders" className="text-muted-foreground font-medium hover:text-primary transition-colors text-sm">
            View all orders →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          {product.imageUrl && (
            <div className="rounded-2xl overflow-hidden bg-secondary/50">
              <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground capitalize">{product.category}</span>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">Only {product.stock} left</span>
              )}
              {product.stock <= 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">Out of Stock</span>
              )}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">{product.name}</h1>
            <p className="text-lg text-muted-foreground">{product.description}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex justify-between items-end">
              <span className="text-muted-foreground font-medium">Total</span>
              <span className="text-4xl font-extrabold text-primary">{product.price} <span className="text-lg text-foreground">USDT</span></span>
            </div>
          </div>

          {/* Manual TX Verification Section */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Search size={14} /> Already paid? Verify your transaction
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Paid with Binance, OKX, or another wallet? Paste the transaction signature to verify
              on <span className="text-primary font-medium">{networkLabel}</span>.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                placeholder="Paste tx signature..."
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleVerifyTx}
                disabled={verifying || !verifyInput.trim()}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {verifying ? <Loader2 size={14} className="animate-spin" /> : "Verify"}
              </button>
            </div>
            {verifyResult === "verified" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-500">
                <CheckCircle2 size={12} /> {verifyMsg}
              </div>
            )}
            {verifyResult === "invalid" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-destructive">
                <AlertCircle size={12} /> {verifyMsg}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl flex flex-col items-center text-center">
          <h3 className="text-xl font-bold mb-6">Pay with Wallet</h3>

          <div className="bg-white p-4 rounded-xl mb-6 shadow-sm">
            <QRCodeSVG value={receivingWallet} size={200} />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Scan to copy address, then send {product.price} USDT (Solana network)</p>
          <p className="text-[10px] text-muted-foreground mb-6">Works with Phantom, Solflare, Binance, OKX, and any Solana wallet</p>

          <div className="w-full bg-secondary/50 rounded-xl p-4 mb-6 flex flex-col gap-2">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Send Exactly {product.price} USDT to:</span>
            <div className="flex items-center justify-between bg-background border border-border p-3 rounded-lg">
              <span className="font-mono text-xs truncate max-w-[200px]">{receivingWallet}</span>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(receivingWallet);
                  } catch {
                    const el = document.createElement("textarea");
                    el.value = receivingWallet;
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand("copy");
                    document.body.removeChild(el);
                  }
                  const btn = document.activeElement as HTMLElement;
                  const orig = btn.innerHTML;
                  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied';
                  setTimeout(() => btn.innerHTML = orig, 1500);
                }}
                className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-semibold"
              >
                <Copy size={16} /> Copy
              </button>
            </div>
          </div>

          <div className="w-full flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-border/50" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">or connect wallet</span>
            <div className="flex-1 border-t border-border/50" />
          </div>

          <div className="w-full flex flex-col gap-4">
            {!connected ? (
              <WalletMultiButton className="!bg-secondary !text-secondary-foreground hover:!bg-secondary/80 !rounded-full !w-full !justify-center !h-12 !font-semibold transition-colors" />
            ) : (
              <button
                onClick={handlePay}
                disabled={paymentStatus === "processing" || product.stock <= 0}
                className="w-full bg-primary text-primary-foreground h-12 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {paymentStatus === "processing" ? (
                  <><Loader2 className="animate-spin" size={18} /> Sending...</>
                ) : product.stock <= 0 ? (
                  "Out of Stock"
                ) : (
                  `Pay ${product.price} USDT`
                )}
              </button>
            )}
            {paymentStatus === "error" && (
              <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                <AlertCircle size={14} /> {errorMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
