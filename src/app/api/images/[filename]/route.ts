import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const filename = params.filename;
  const filepath = path.join(process.cwd(), "public", "uploads", filename);

  if (!fs.existsSync(filepath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const mime: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };

  const buffer = fs.readFileSync(filepath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mime[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
