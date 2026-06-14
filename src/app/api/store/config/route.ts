import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Public: anyone can read store config
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet query param required" }, { status: 400 });
  }
  const config = await prisma.storeConfig.findUnique({ where: { wallet } });
  return NextResponse.json({
    wallet,
    receivingWallet: config?.receivingWallet || wallet,
  });
}

// Protected: only wallet owner can update store config
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("chaji_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await prisma.session.findUnique({ where: { token: sessionToken } });
  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const { wallet, receivingWallet } = await request.json();
  if (!wallet || !receivingWallet) {
    return NextResponse.json({ error: "wallet and receivingWallet required" }, { status: 400 });
  }
  if (session.wallet !== wallet) {
    return NextResponse.json({ error: "Wallet mismatch" }, { status: 403 });
  }

  const config = await prisma.storeConfig.upsert({
    where: { wallet },
    update: { receivingWallet },
    create: { wallet, receivingWallet },
  });
  return NextResponse.json(config);
}
