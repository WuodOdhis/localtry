import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("chaji_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await prisma.session.findUnique({ where: { token: sessionToken } });
  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet query param required" }, { status: 400 });
  }
  if (session.wallet !== wallet) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product || product.wallet !== wallet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id: params.id } });
  const products = await prisma.product.findMany({ where: { wallet }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(products);
}
