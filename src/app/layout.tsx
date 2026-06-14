import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

import AppWalletProvider from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "ChajiPay | Non-Custodial Payments on Solana",
  description: "Lipa Chaji Wako — Non-custodial USDT payments on Solana.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "ChajiPay", statusBarStyle: "black-translucent" },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark font-sans">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppWalletProvider>
          <div className="animate-in fade-in duration-500">{children}</div>
        </AppWalletProvider>
      </body>
    </html>
  );
}
