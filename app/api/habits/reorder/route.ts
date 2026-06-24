import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { order }: { order: { id: string; order: number }[] } = await req.json();
  await prisma.$transaction(
    order.map(({ id, order: o }) => prisma.habit.update({ where: { id }, data: { order: o } }))
  );
  return NextResponse.json({ ok: true });
}
