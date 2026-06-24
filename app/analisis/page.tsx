"use client";
import { useEffect, useState, useCallback } from "react";
import WeekCompare, { type WeekData, type WeekDay } from "@/components/WeekCompare";
import PerfectDaysGrid, { type DayScore } from "@/components/PerfectDaysGrid";

interface Habit {
  id: string;
  name: string;
  icon: string;
  isArchived: boolean;
  logs: { date: string; completed: boolean }[];
}

const DAY_LABELS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const DAY_SHORT  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

// Returns Mon-Sun of the Nth completed week ago (0 = last complete week)
function getWeekDays(weeksAgo: number): string[] {
  const today = new Date();
  // Sunday = 0, so daysToLastSunday = today.getDay()
  const daysToLastSunday = today.getDay(); // 0 if already Sunday
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - daysToLastSunday);

  const weekEnd = new Date(lastSunday);
  weekEnd.setDate(lastSunday.getDate() - weeksAgo * 7);

  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekEnd.getDate() - 6);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function buildWeekData(label: string, days: string[], habits: Habit[]): WeekData {
  const activeHabits = habits.filter((h) => !h.isArchived);

  const weekDays: WeekDay[] = days.map((date, i) => {
    const completed = activeHabits.filter((h) =>
      h.logs.some((l) => l.date === date && l.completed)
    ).length;
    const total = activeHabits.length;
    return {
      date,
      dayLabel: DAY_LABELS[i],
      shortLabel: DAY_SHORT[i],
      completed,
      total,
      rate: total > 0 ? completed / total : 0,
    };
  });

  const totalCheckins = weekDays.reduce((a, d) => a + d.completed, 0);
  const avgRate = weekDays.reduce((a, d) => a + d.rate, 0) / 7;
  const perfectDays = weekDays.filter((d) => d.rate >= 1 && d.total > 0).length;

  return { label, days: weekDays, avgRate, perfectDays, totalCheckins };
}

function buildDayScores(habits: Habit[]): DayScore[] {
  const active = habits.filter((h) => !h.isArchived);
  if (active.length === 0) return [];

  // collect all unique dates across all logs
  const allDates = new Set<string>();
  active.forEach((h) => h.logs.forEach((l) => allDates.add(l.date)));

  return [...allDates].map((date) => {
    const completed = active.filter((h) =>
      h.logs.some((l) => l.date === date && l.completed)
    ).length;
    const total = active.length;
    return { date, completed, total, rate: total > 0 ? completed / total : 0 };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

function isSunday(): boolean {
  return new Date().getDay() === 0;
}

function daysUntilSunday(): number {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 0 : 7 - d;
}

export default function AnalisisPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"semanal" | "perfectos">("semanal");

  const fetchHabits = useCallback(async () => {
    const res = await fetch("/api/habits");
    const data: Habit[] = await res.json();
    setHabits(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const weekADays = getWeekDays(0); // last completed week
  const weekBDays = getWeekDays(1); // week before that
  const weekA = buildWeekData("Semana reciente", weekADays, habits);
  const weekB = buildWeekData("Semana anterior", weekBDays, habits);
  const dayScores = buildDayScores(habits);

  const sunday = isSunday();
  const daysLeft = daysUntilSunday();

  const monoSm = {
    fontFamily: "var(--font-mono)" as const,
    fontSize: "0.55rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
  };

  const weekLabel = (days: string[]) => {
    const fmt = (d: string) => {
      const dt = new Date(d + "T12:00:00");
      return `${dt.getDate()} ${["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][dt.getMonth()]}`;
    };
    return `${fmt(days[0])} — ${fmt(days[6])}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Cargando análisis...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* header */}
      <div className="mb-8">
        <p style={{ ...monoSm, color: "var(--muted)", marginBottom: "0.5rem" }}>Revisión profunda</p>
        <h1 style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.9rem", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "0.6rem" }}>
          Análisis.
        </h1>

        {/* Sunday banner or countdown */}
        {sunday ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: "var(--text)", background: "var(--surface2)", display: "inline-flex" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem" }}>●</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.06em", color: "var(--text)" }}>
              Es domingo — revisión semanal disponible.
            </span>
          </div>
        ) : (
          <p style={{ ...monoSm, color: "var(--border)", fontSize: "0.52rem" }}>
            Próxima revisión en {daysLeft} día{daysLeft !== 1 ? "s" : ""} · domingo
          </p>
        )}
      </div>

      {/* tabs */}
      <div className="flex gap-2 mb-6">
        {(["semanal", "perfectos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl border transition-colors"
            style={{
              fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase",
              background: tab === t ? "var(--surface2)" : "transparent",
              borderColor: tab === t ? "var(--text)" : "var(--border)",
              color: tab === t ? "var(--text)" : "var(--muted)",
            }}
          >
            {t === "semanal" ? "Comparar semanas" : "Días perfectos"}
          </button>
        ))}
      </div>

      {tab === "semanal" && (
        <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {/* week labels */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p style={{ ...monoSm, color: "var(--border)", fontSize: "0.5rem", marginBottom: "0.25rem" }}>Semana reciente</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.04em", color: "var(--text)" }}>
                {weekLabel(weekADays)}
              </p>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--border)" }}>◇</span>
            <div className="text-right">
              <p style={{ ...monoSm, color: "var(--border)", fontSize: "0.5rem", marginBottom: "0.25rem" }}>Semana anterior</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.04em", color: "var(--muted)" }}>
                {weekLabel(weekBDays)}
              </p>
            </div>
          </div>

          {habits.filter(h => !h.isArchived).length === 0 ? (
            <div className="text-center py-10">
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--border)" }}>○</p>
              <p style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>Sin datos aún</p>
            </div>
          ) : (
            <WeekCompare weekA={weekA} weekB={weekB} />
          )}

          {/* best / worst habit of the week */}
          {habits.filter(h => !h.isArchived).length > 0 && (() => {
            const active = habits.filter(h => !h.isArchived);
            const habitWeekRates = active.map(h => {
              const done = weekADays.filter(d => h.logs.some(l => l.date === d && l.completed)).length;
              return { name: h.name, icon: h.icon, rate: done / 7 };
            }).sort((a, b) => b.rate - a.rate);
            const best = habitWeekRates[0];
            const worst = habitWeekRates[habitWeekRates.length - 1];
            return (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: "Más consistente", habit: best, sym: "▲" },
                  { label: "A mejorar",        habit: worst, sym: "△" },
                ].map(({ label, habit, sym }) => (
                  <div key={label} className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
                    <p style={{ ...monoSm, color: "var(--border)", fontSize: "0.48rem", marginBottom: "0.5rem" }}>{label}</p>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--muted)" }}>{habit.icon}</span>
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "0.75rem", color: "var(--text)" }}>{habit.name}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "var(--text)", marginTop: "0.3rem", fontVariantNumeric: "tabular-nums" }}>
                      {Math.round(habit.rate * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {tab === "perfectos" && (
        <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p style={{ ...monoSm, color: "var(--muted)", marginBottom: "1.2rem" }}>Días perfectos · sistema de gratificaciones</p>
          {dayScores.length === 0 ? (
            <div className="text-center py-10">
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--border)" }}>●</p>
              <p style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                Completa hábitos para ver tu historial
              </p>
            </div>
          ) : (
            <PerfectDaysGrid scores={dayScores} />
          )}
        </div>
      )}
    </div>
  );
}
