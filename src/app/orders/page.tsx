"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, ArrowLeft, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

interface Order { id: string; productName: string; amount: number; merchantWallet: string; txSignature?: string; status?: string; createdAt: string }

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem("chaji_orders") || "[]"));
  }, []);

  const statusBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return <span className="flex items-center gap-1 text-[10px] font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full"><CheckCircle2 size={10} /> Verified</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full"><AlertCircle size={10} /> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50">
        <div className="container px-6 py-4 max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/"><Logo size={20} variant="word" /></Link>
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft size={12} /> Home</Link>
        </div>
      </header>

      <main className="flex-1 container px-6 py-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={40} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link href="/" className="text-primary text-sm font-medium hover:underline">Browse stores</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{o.productName}</p>
                      {statusBadge(o.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(o.createdAt).toLocaleDateString()} &middot; Merchant: {o.merchantWallet?.slice(0, 8)}...</p>
                  </div>
                  <p className="font-bold text-sm">{o.amount} USDT</p>
                </div>
                {o.txSignature && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Tx: {o.txSignature.slice(0, 20)}...</span>
                    <a href={`https://explorer.solana.com/tx/${o.txSignature}?cluster=custom`} target="_blank" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                      View <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/50">
        ChajiPay &mdash; Lipa Chaji Wako
      </footer>
    </div>
  );
}
