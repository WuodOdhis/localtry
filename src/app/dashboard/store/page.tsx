"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Link as LinkIcon, ExternalLink, Copy, CheckCircle2, Wallet, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function StoreSettingsPage() {
  const { publicKey, connected } = useWallet();
  const [copied, setCopied] = useState(false);
  const [receivingWallet, setReceivingWallet] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    fetch(`/api/store/config?wallet=${publicKey.toString()}`)
      .then((r) => r.json())
      .then((data) => setReceivingWallet(data.receivingWallet || publicKey.toString()));
  }, [publicKey]);

  const handleSave = async () => {
    if (!publicKey) return;
    setSaving(true);
    try {
      await fetch("/api/store/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toString(), receivingWallet }),
        credentials: "include",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!connected || !publicKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <h2 className="text-2xl font-bold mb-4">Connect your wallet</h2>
        <p className="text-muted-foreground">Connect to manage your store.</p>
      </div>
    );
  }

  const storeUrl = `/store/${publicKey.toString()}`;

  return (
    <div className="container px-6 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Your Store</h1>

      {/* Setup Instructions */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4">Getting Started</h2>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li><span className="text-primary font-medium">1.</span> Set your receiving wallet below (where buyers send USDT)</li>
          <li><span className="text-primary font-medium">2.</span> Go to <Link href="/dashboard" className="text-primary hover:underline">Products</Link> and create your first product</li>
          <li><span className="text-primary font-medium">3.</span> Share your store link with buyers</li>
          <li><span className="text-primary font-medium">4.</span> Track payments in <Link href="/dashboard/orders" className="text-primary hover:underline">Orders</Link></li>
          <li><span className="text-primary font-medium">5.</span> For mainnet: update <code className="text-xs bg-secondary px-1 py-0.5 rounded">.env.local</code> with your Helius/QuickNode RPC</li>
        </ol>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Store Link</h2>
        <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3">
          <LinkIcon size={16} className="text-muted-foreground flex-shrink-0" />
          <Link href={storeUrl} target="_blank" className="text-sm text-primary hover:underline flex-1 truncate">
            chajipay.com{storeUrl}
          </Link>
          <ExternalLink size={14} className="text-muted-foreground flex-shrink-0" />
        </div>
      </div>

      {/* Receiving Wallet Settings */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Wallet size={16} /> Receiving Wallet
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          This is where your buyers send USDT. Defaults to your connected wallet.
          You can change it to any Solana address you control.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={receivingWallet}
            onChange={(e) => setReceivingWallet(e.target.value)}
            placeholder={publicKey.toString()}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 font-mono text-xs outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleSave}
            disabled={saving || !receivingWallet}
            className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saved ? <><CheckCircle2 size={16} /> Saved</> : <><Save size={16} /> Save</>}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Your Wallet (Connected)</h2>
        <div className="flex items-center justify-between bg-background border border-border rounded-xl px-4 py-3">
          <span className="font-mono text-xs truncate mr-4">{publicKey.toString()}</span>
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium flex-shrink-0">
            {copied ? <><CheckCircle2 size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity">Manage Products</Link>
          <Link href={storeUrl} target="_blank" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1.5">Preview Store <ExternalLink size={12} /></Link>
        </div>
      </div>
    </div>
  );
}
