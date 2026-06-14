import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import * as nacl from "tweetnacl";
import bs58 from "bs58";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { wallet, signature, nonce } = await request.json();
  if (!wallet || !signature || !nonce) {
    return NextResponse.json({ error: "wallet, signature, and nonce required" }, { status: 400 });
  }

  const message = `ChajiPay\n\nSign in with your Solana wallet.\n\nWallet: ${wallet}\nNonce: ${nonce}`;

  try {
    const storedNonce = await prisma.authNonce.findUnique({ where: { nonce } });
    if (!storedNonce || storedNonce.wallet !== wallet || storedNonce.used) {
      return NextResponse.json({ error: "Invalid nonce" }, { status: 401 });
    }

    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = new PublicKey(wallet).toBytes();
    const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    await prisma.authNonce.update({ where: { nonce }, data: { used: true } });

    const token = crypto.randomUUID();
    await prisma.session.create({
      data: {
        wallet,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const response = NextResponse.json({ wallet, token });
    response.cookies.set("chaji_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 401 });
  }
}
