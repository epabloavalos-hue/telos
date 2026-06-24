import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    if (!date) return NextResponse.json({ text: "" });
    const intention = await prisma.dayIntention.findUnique({ where: { date } });
    return NextResponse.json({ text: intention?.text ?? "" });
  } catch {
    return NextResponse.json({ text: "" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { date, text } = await req.json();
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
    const intention = await prisma.dayIntention.upsert({
      where: { date },
      update: { text },
      create: { date, text },
    });
    return NextResponse.json(intention);
  } catch {
    return NextResponse.json({ ok: false });
  }
}
