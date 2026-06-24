import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("photo") as File | null;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `avatar.${ext}`;
  await writeFile(join(uploadsDir, filename), buffer);

  const photoPath = `/uploads/${filename}?t=${Date.now()}`;

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { photoPath },
    create: { id: "singleton", photoPath },
  });

  return NextResponse.json({ photoPath });
}
