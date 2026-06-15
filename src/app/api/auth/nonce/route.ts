import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  const nonce = `${Date.now()}.${crypto.randomUUID()}`;
  const message = `ChajiPay\n\nSign in with your Solana wallet.\n\nWallet: ${wallet}\nNonce: ${nonce}`;

  return NextResponse.json({ nonce, message });
}
