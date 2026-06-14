import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  const nonce = crypto.randomUUID();
  const message = `ChajiPay\n\nSign in with your Solana wallet.\n\nWallet: ${wallet}\nNonce: ${nonce}`;

  await prisma.authNonce.create({ data: { wallet, nonce } });

  return NextResponse.json({ nonce, message });
}
