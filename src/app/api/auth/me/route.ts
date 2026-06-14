import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("chaji_session")?.value;
  if (!token) {
    return NextResponse.json({ wallet: null }, { status: 401 });
  }

  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return NextResponse.json({ wallet: null }, { status: 401 });
  }

  return NextResponse.json({ wallet: session.wallet });
}
