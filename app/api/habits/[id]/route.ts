import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const habit = await prisma.habit.findUnique({
    where: { id },
    include: { logs: { orderBy: { date: "desc" } } },
  });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(habit);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const habit = await prisma.habit.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description ?? null,
      category: body.category,
      type: body.type,
      timeOfDay: body.timeOfDay,
      frequency: body.frequency,
      specificDays: body.specificDays ?? null,
      isNumeric: body.isNumeric,
      targetValue: body.targetValue ?? null,
      unit: body.unit ?? null,
      color: body.color,
      icon: body.icon,
      reminderTime: body.reminderTime ?? null,
      isArchived: body.isArchived ?? false,
    },
  });

  return NextResponse.json(habit);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.habit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
