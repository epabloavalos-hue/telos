"use client";
import { useEffect, useState, useCallback } from "react";
import HabitCheckCard from "@/components/HabitCheckCard";
import { calculateStreak, today } from "@/lib/utils";

const ROUTINES = [
  { value: "MORNING", label: "Rutina de Mañana", emoji: "🌅", desc: "El mejor momento para empezar con energía" },
  { value: "AFTERNOON", label: "Rutina de Tarde", emoji: "☀️", desc: "Mantén el impulso en la mitad del día" },
  { value: "EVENING", label: "Rutina de Noche", emoji: "🌙", desc: "Cierra el día con tus hábitos nocturnos" },
  { value: "ANYTIME", label: "Sin horario fijo", emoji: "⏰", desc: "Hábitos que puedes hacer en cualquier momento" },
];

interface HabitWithLogs {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  type: string;
  timeOfDay: string;
  isNumeric: boolean;
  targetValue: number | null;
  unit: string | null;
  frequency: string;
  specificDays: string | null;
  isArchived: boolean;
  logs: { date: string; completed: boolean; value?: number | null }[];
}

export default function RutinasPage() {
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string>("MORNING");
  const dateStr = today();

  const fetchHabits = useCallback(async () => {
    const res = await fetch("/api/habits");
    const data: HabitWithLogs[] = await res.json();
    setHabits(data.filter((h) => !h.isArchived));
    setLoading(false);
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const enriched = habits.map((h) => {
    const todayLog = h.logs.find((l) => l.date === dateStr);
    return {
      ...h,
      streak: calculateStreak(h.logs),
      completed: todayLog?.completed ?? false,
      value: todayLog?.value ?? null,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm" style={{ color: "var(--muted)" }}>Cargando rutinas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.5rem" }}>
          Momento del día
        </p>
        <h1 style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.9rem", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Rutinas.
        </h1>
      </div>

      <div className="space-y-3">
        {ROUTINES.map((routine) => {
          const routineHabits = enriched.filter((h) => h.timeOfDay === routine.value);
          const done = routineHabits.filter((h) => h.completed).length;
          const isOpen = open === routine.value;

          return (
            <div
              key={routine.value}
              className="rounded-2xl border overflow-hidden"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <button
                onClick={() => setOpen(isOpen ? "" : routine.value)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--border)", width: "1rem", textAlign: "center" }}>{routine.emoji}</span>
                  <div>
                    <p style={{ fontFamily: "var(--font-mono)", fontWeight: 400, fontSize: "0.78rem", letterSpacing: "0.04em" }}>{routine.label}</p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em", color: "var(--muted)", marginTop: "0.1rem" }}>{routine.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {routineHabits.length > 0 && (
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        background: "var(--surface2)",
                        color: done === routineHabits.length ? "var(--text)" : "var(--muted)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {done}/{routineHabits.length}
                    </span>
                  )}
                  <span style={{ color: "var(--muted)" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4">
                  {routineHabits.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm" style={{ color: "var(--muted)" }}>
                        No tienes hábitos en esta rutina.{" "}
                        <a href="/habitos" className="underline" style={{ color: "var(--text)" }}>
                          Agrega uno →
                        </a>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {routineHabits.map((habit) => (
                        <HabitCheckCard
                          key={habit.id}
                          habit={habit}
                          date={dateStr}
                          onUpdate={fetchHabits}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
