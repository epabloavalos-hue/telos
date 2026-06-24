"use client";
import { useEffect, useState, useCallback } from "react";
import { calculateStreak, getLast30Days, getLast7Days, CATEGORIES } from "@/lib/utils";
import HeatMap from "@/components/HeatMap";
import WeekChart from "@/components/WeekChart";

interface HabitWithLogs {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  isArchived: boolean;
  logs: { date: string; completed: boolean }[];
}

export default function EstadisticasPage() {
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"30d" | "heatmap" | "tendencia">("30d");

  const fetchHabits = useCallback(async () => {
    const res = await fetch("/api/habits");
    const data: HabitWithLogs[] = await res.json();
    const active = data.filter((h: HabitWithLogs) => !h.isArchived);
    setHabits(active);
    if (active.length > 0) setSelected(active[0].id);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const last30 = getLast30Days();
  const last7 = getLast7Days();
  const habit = habits.find((h) => h.id === selected);
  const completedSet = new Set(habit?.logs.filter((l) => l.completed).map((l) => l.date) ?? []);

  const rate30 = last30.length > 0
    ? Math.round((last30.filter((d) => completedSet.has(d)).length / last30.length) * 100)
    : 0;
  const rate7 = last7.length > 0
    ? Math.round((last7.filter((d) => completedSet.has(d)).length / last7.length) * 100)
    : 0;

  const totalStreak = habits.reduce((acc, h) => acc + calculateStreak(h.logs), 0);
  const bestStreak = habits.reduce((best, h) => Math.max(best, calculateStreak(h.logs)), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = habits.filter((h) => h.logs.some((l) => l.date === todayStr && l.completed)).length;

  const monoSm = { fontFamily: "var(--font-mono)" as const, fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase" as const };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <p style={{ ...monoSm, color: "var(--muted)", marginBottom: "0.5rem" }}>Progreso histórico</p>
        <h1 style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.9rem", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Estadísticas.
        </h1>
      </div>

      {/* resumen global */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Hoy", value: completedToday, sub: `de ${habits.length}` },
          { label: "Mejor racha", value: bestStreak, sub: "días" },
          { label: "Total", value: totalStreak, sub: "días" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p style={{ ...monoSm, color: "var(--border)", marginBottom: "0.6rem" }}>{label}</p>
            <p style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "2.4rem", letterSpacing: "-0.04em", lineHeight: 1, color: "var(--text)" }}>
              {value}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", color: "var(--muted)", marginTop: "0.3rem" }}>{sub}</p>
          </div>
        ))}
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: "var(--border)", marginBottom: "1rem" }}>▲</p>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "0.85rem", letterSpacing: "0.04em" }}>Sin datos aún</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--muted)", marginTop: "0.4rem" }}>
            Crea hábitos y empieza a trackear
          </p>
        </div>
      ) : (
        <>
          {/* detalle por hábito */}
          <div className="rounded-2xl border p-5 mb-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p style={{ ...monoSm, color: "var(--muted)", marginBottom: "0.9rem" }}>Detalle por hábito</p>

            {/* selector */}
            <div className="flex gap-2 flex-wrap mb-5">
              {habits.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelected(h.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors"
                  style={{
                    background: selected === h.id ? "var(--surface2)" : "transparent",
                    borderColor: selected === h.id ? "var(--text)" : "var(--border)",
                    color: selected === h.id ? "var(--text)" : "var(--muted)",
                    fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                  }}
                >
                  <span>{h.icon}</span> {h.name}
                </button>
              ))}
            </div>

            {habit && (
              <>
                {/* métricas */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Racha", value: calculateStreak(habit.logs), sub: "días" },
                    { label: "7 días", value: `${rate7}%`, sub: "completado" },
                    { label: "30 días", value: `${rate30}%`, sub: "completado" },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className="rounded-xl p-4" style={{ background: "var(--surface2)" }}>
                      <p style={{ ...monoSm, color: "var(--border)", fontSize: "0.52rem", marginBottom: "0.4rem" }}>{label}</p>
                      <p style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.8rem", letterSpacing: "-0.04em", lineHeight: 1, color: "var(--text)" }}>
                        {value}
                      </p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em", color: "var(--muted)", marginTop: "0.25rem" }}>{sub}</p>
                    </div>
                  ))}
                </div>

                {/* vista selector */}
                <div className="flex gap-2 mb-4">
                  {(["30d", "heatmap", "tendencia"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className="px-3 py-1 rounded-lg border transition-colors"
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em",
                        background: view === v ? "var(--surface2)" : "transparent",
                        borderColor: view === v ? "var(--text)" : "var(--border)",
                        color: view === v ? "var(--text)" : "var(--muted)",
                      }}
                    >
                      {v === "30d" ? "30 días" : v === "heatmap" ? "Año" : "Tendencia"}
                    </button>
                  ))}
                </div>

                {view === "30d" && (
                  <>
                    <p style={{ ...monoSm, color: "var(--muted)", marginBottom: "0.7rem", fontSize: "0.52rem" }}>Últimos 30 días</p>
                    <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
                      {last30.map((d) => {
                        const done = completedSet.has(d);
                        return (
                          <div key={d} title={d} className="aspect-square rounded-sm"
                            style={{ background: done ? "var(--text)" : "var(--surface2)", opacity: done ? 1 : 0.3 }} />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", color: "var(--border)" }}>— 30d</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", color: "var(--border)" }}>hoy</span>
                    </div>
                  </>
                )}

                {view === "heatmap" && (
                  <>
                    <p style={{ ...monoSm, color: "var(--muted)", marginBottom: "0.7rem", fontSize: "0.52rem" }}>Últimos 365 días</p>
                    <HeatMap logs={habit.logs} />
                  </>
                )}

                {view === "tendencia" && (
                  <>
                    <p style={{ ...monoSm, color: "var(--muted)", marginBottom: "0.7rem", fontSize: "0.52rem" }}>Últimas 8 semanas</p>
                    <WeekChart logs={habit.logs} />
                  </>
                )}
              </>
            )}
          </div>

          {/* por categoría */}
          <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p style={{ ...monoSm, color: "var(--muted)", marginBottom: "1rem" }}>Por categoría</p>
            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const catHabits = habits.filter((h) => h.category === cat.value);
                if (catHabits.length === 0) return null;
                const avgStreak = Math.round(catHabits.reduce((a, h) => a + calculateStreak(h.logs), 0) / catHabits.length);
                return (
                  <div key={cat.value} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 300, letterSpacing: "0.04em" }}>{cat.label}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em", color: "var(--muted)" }}>
                          {catHabits.length}h · {avgStreak}d
                        </span>
                      </div>
                      <div style={{ height: "1px", background: "var(--surface2)", position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(catHabits.length / habits.length) * 100}%`, background: "var(--muted)" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
