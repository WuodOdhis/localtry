import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get("chaji_session")?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("chaji_session");
  return response;
}
