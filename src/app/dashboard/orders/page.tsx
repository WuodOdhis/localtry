"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { ShoppingBag, ExternalLink, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  productName: string;
  amount: number;
  merchantWallet: string;
  receivingWallet?: string;
  buyerWallet?: string;
  txSignature?: string;
  status?: string;
  createdAt: string;
}

export default function MerchantOrdersPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [orders, setOrders] = useState<Order[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const loadOrders = () => {
    if (!publicKey) return;
    const all = JSON.parse(localStorage.getItem("chaji_orders") || "[]");
    setOrders(all.filter((o: Order) => o.merchantWallet === publicKey.toString()));
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const handleVerify = async (order: Order) => {
    if (!order.txSignature) return;
    setVerifyingId(order.id);
    try {
      const tx = await connection.getTransaction(order.txSignature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
      if (tx) {
        const updated = JSON.parse(localStorage.getItem("chaji_orders") || "[]").map((o: Order) =>
          o.id === order.id ? { ...o, status: "verified" } : o
        );
        localStorage.setItem("chaji_orders", JSON.stringify(updated));
        loadOrders();
      }
    } catch {
      // ignore
    } finally {
      setVerifyingId(null);
    }
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return <span className="flex items-center gap-1 text-[10px] font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full"><CheckCircle2 size={10} /> Verified</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full"><AlertCircle size={10} /> Pending</span>;
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <h2 className="text-2xl font-bold mb-4">Connect your wallet</h2>
        <p className="text-muted-foreground">Connect to see your orders.</p>
      </div>
    );
  }

  return (
    <div className="container px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button onClick={loadOrders} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      {orders.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl">
          <ShoppingBag size={40} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders yet</p>
          <Link href={`/store/${publicKey?.toString()}`} target="_blank" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">View your store</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{o.productName}</p>
                    {statusBadge(o.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()} &middot; {o.buyerWallet?.slice(0, 8)}...</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="font-bold text-sm">{o.amount} USDT</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  {o.receivingWallet && o.receivingWallet !== o.merchantWallet && (
                    <span>Receiving: {o.receivingWallet.slice(0, 6)}...</span>
                  )}
                  {o.txSignature && (
                    <a href={`https://explorer.solana.com/tx/${o.txSignature}?cluster=custom`} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                      View Tx <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                {o.txSignature && o.status !== "verified" && (
                  <button
                    onClick={() => handleVerify(o)}
                    disabled={verifyingId === o.id}
                    className="text-[10px] font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                  >
                    {verifyingId === o.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}
                    Verify on-chain
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
