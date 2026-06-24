import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { today } from "@/lib/utils";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const logs = await prisma.habitLog.findMany({
    where: { habitId: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const date = body.date ?? today();

  const log = await prisma.habitLog.upsert({
    where: { habitId_date: { habitId: id, date } },
    update: {
      completed: body.completed,
      value: body.value ?? null,
      notes: body.notes ?? null,
    },
    create: {
      habitId: id,
      date,
      completed: body.completed,
      value: body.value ?? null,
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json(log);
}
