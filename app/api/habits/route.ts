import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const archived = searchParams.get("archived") === "true";

  const habits = await prisma.habit.findMany({
    where: { isArchived: archived },
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        orderBy: { date: "desc" },
        take: 60,
      },
    },
  });

  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const habit = await prisma.habit.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      category: body.category ?? "SALUD",
      type: body.type ?? "POSITIVE",
      timeOfDay: body.timeOfDay ?? "ANYTIME",
      frequency: body.frequency ?? "DAILY",
      specificDays: body.specificDays ?? null,
      isNumeric: body.isNumeric ?? false,
      targetValue: body.targetValue ?? null,
      unit: body.unit ?? null,
      color: body.color ?? "#6366f1",
      icon: body.icon ?? "⭐",
      reminderTime: body.reminderTime ?? null,
    },
  });

  return NextResponse.json(habit, { status: 201 });
}
