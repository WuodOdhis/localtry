import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Public: anyone can read products for a store
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet query param required" }, { status: 400 });
  }
  const products = await prisma.product.findMany({
    where: { wallet },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(products);
}

// Protected: only the wallet owner can create products
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

  const { wallet, product } = await request.json();
  if (!wallet || !product) {
    return NextResponse.json({ error: "wallet and product required" }, { status: 400 });
  }
  if (session.wallet !== wallet) {
    return NextResponse.json({ error: "Wallet mismatch" }, { status: 403 });
  }

  await prisma.product.create({
    data: {
      wallet,
      name: product.name,
      price: product.price,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      category: product.category || "other",
      stock: product.stock ?? 0,
    },
  });
  const products = await prisma.product.findMany({ where: { wallet }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(products);
}
