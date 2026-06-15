"use client";

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, AlertCircle } from "lucide-react";
import bs58 from "bs58";

interface AuthContextType {
  wallet: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  wallet: null,
  signIn: async () => {},
  signOut: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { publicKey, connected, signMessage } = useWallet();
  const [sessionWallet, setSessionWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.ok ? r.json() : { wallet: null })
      .then((d) => setSessionWallet(d.wallet))
      .catch(() => setSessionWallet(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async () => {
    if (!connected || !publicKey) {
      setError("Connect your wallet first.");
      return;
    }
    if (!signMessage) {
      setError("This wallet does not support message signing. Use Phantom or Solflare for merchant login.");
      return;
    }
    setSigningIn(true);
    setError("");
    try {
      const wallet = publicKey.toString();
      const nonceRes = await fetch(`/api/auth/nonce?wallet=${wallet}`);
      const { nonce, message } = await nonceRes.json();
      const encoded = new TextEncoder().encode(message);
      const signature = await signMessage(encoded);
      const sigBs58 = bs58.encode(signature);
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, signature: sigBs58, nonce }),
        credentials: "include",
      });
      if (!verifyRes.ok) {
        setError("Signature verification failed");
        return;
      }
      setSessionWallet(wallet);
    } catch {
      setError("Sign-in failed");
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setSessionWallet(null);
  };

  useEffect(() => {
    if (!sessionWallet) return;
    if (!connected || !publicKey || sessionWallet !== publicKey.toString()) {
      signOut();
    }
  }, [connected, publicKey, sessionWallet]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (!sessionWallet && connected && publicKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Sign in to continue</h2>
        <p className="text-sm text-muted-foreground mb-6">Sign a message to prove you own this wallet.</p>
        <button
          onClick={signIn}
          disabled={signingIn}
          className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-opacity"
        >
          {signingIn ? <><Loader2 className="animate-spin" size={16} /> Signing...</> : "Sign in with Solana"}
        </button>
        {error && <p className="mt-4 text-sm text-destructive flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
      </div>
    );
  }

  if (!connected) {
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider value={{ wallet: sessionWallet, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
