import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {
      ...(body.language !== undefined && { language: body.language }),
      ...(body.timezone !== undefined && { timezone: body.timezone }),
      ...(body.userName !== undefined && { userName: body.userName }),
      ...(body.soundEnabled !== undefined && { soundEnabled: body.soundEnabled }),
    },
    create: {
      id: "singleton",
      language: body.language ?? "es",
      timezone: body.timezone ?? "America/Mexico_City",
      userName: body.userName ?? "Pablo",
      soundEnabled: body.soundEnabled ?? false,
    },
  });
  return NextResponse.json(settings);
}
