import { prisma } from "./prisma";
import { PublicKey } from "@solana/web3.js";
import * as nacl from "tweetnacl";
import bs58 from "bs58";
import { cookies } from "next/headers";

const SESSION_COOKIE = "chaji_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function createAuthMessage(wallet: string, nonce: string): string {
  return `ChajiPay\n\nSign in with your Solana wallet.\n\nWallet: ${wallet}\nNonce: ${nonce}`;
}

export function verifySignature(message: string, signature: string, wallet: string): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = new PublicKey(wallet).toBytes();
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

export async function createSession(wallet: string): Promise<string> {
  const token = crypto.randomUUID();
  await prisma.session.create({
    data: {
      wallet,
      token,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
  });
  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  });
}

export async function getAuthWallet(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      return null;
    }
    return session.wallet;
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
      cookieStore.delete(SESSION_COOKIE);
    }
  } catch {
    // ignore
  }
}
