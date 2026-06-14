"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!opacity-90 !rounded-full !px-6 !py-2 !h-auto !font-semibold transition-opacity" />;
}
