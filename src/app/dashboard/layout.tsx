"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletConnect } from "@/components/WalletConnect";
import { Logo } from "@/components/brand/Logo";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { Link as LinkIcon, ExternalLink } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container px-6 flex h-16 max-w-screen-2xl items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Logo size={22} variant="word" />
              </Link>
              {publicKey && (
                <Link
                  href={`/store/${publicKey.toString()}`}
                  target="_blank"
                  className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <LinkIcon size={12} />
                  Your Store
                  <ExternalLink size={10} />
                </Link>
              )}
            </div>
            <WalletConnect />
          </div>
        </header>

        {publicKey && (
          <nav className="border-b border-border/40 bg-background/50 backdrop-blur">
            <div className="container px-6 max-w-5xl mx-auto flex gap-6">
              <DashboardTab href="/dashboard" label="Products" />
              <DashboardTab href="/dashboard/orders" label="Orders" />
              <DashboardTab href="/dashboard/store" label="Store" />
            </div>
          </nav>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}

function DashboardTab({ href, label }: { href: string; label: string }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
        isActive
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
