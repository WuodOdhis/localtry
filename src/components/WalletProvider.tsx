"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { LocalWalletAdapter } from "@/components/LocalWalletAdapter";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function AppWalletProvider({ children }: { children: React.ReactNode }) {
    const network = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl("devnet");

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new LocalWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={network}>
            <SolanaWalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
}
