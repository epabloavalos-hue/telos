"use client";
import { useEffect, useState } from "react";
import { calculateStreak } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  icon: string;
  logs: { date: string; completed: boolean }[];
}

interface Props {
  habits: Habit[];
  onClose: () => void;
}

function getLast7Dates(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function WeeklyReview({ habits, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  const week = getLast7Dates();
  const completedSets = habits.map((h) => new Set(h.logs.filter((l) => l.completed).map((l) => l.date)));

  const perfectDays = week.filter((day) =>
    habits.length > 0 && habits.every((_, i) => completedSets[i].has(day))
  ).length;

  const totalCheckins = habits.reduce((acc, _, i) => acc + week.filter((d) => completedSets[i].has(d)).length, 0);
  const totalPossible = habits.length * 7;
  const weekRate = totalPossible > 0 ? Math.round((totalCheckins / totalPossible) * 100) : 0;

  const habitStats = habits.map((h, i) => ({
    name: h.name,
    icon: h.icon,
    streak: calculateStreak(h.logs),
    weekDone: week.filter((d) => completedSets[i].has(d)).length,
  })).sort((a, b) => b.weekDone - a.weekDone);

  const best = habitStats[0];

  const mono = (sz = "0.6rem", ls = "0.08em") => ({
    fontFamily: "var(--font-mono)" as const,
    fontSize: sz,
    letterSpacing: ls,
  });

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9990, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
      onClick={close}
    >
      <div
        className="rounded-2xl border w-full max-w-md mx-4"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          padding: "2rem",
          transform: visible ? "translateY(0)" : "translateY(1.5rem)",
          transition: "transform 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p style={{ ...mono("0.52rem", "0.2em"), textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.4rem" }}>
              Revisión semanal
            </p>
            <h2 style={{ ...mono("1.5rem", "-0.02em"), fontWeight: 300, color: "var(--text)", lineHeight: 1 }}>
              Esta semana.
            </h2>
          </div>
          <button
            onClick={close}
            style={{ ...mono("0.65rem"), color: "var(--border)", background: "transparent", border: "none", cursor: "pointer", padding: "0.25rem" }}
          >
            ×
          </button>
        </div>

        {/* big stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Tasa", value: `${weekRate}%` },
            { label: "Días perfectos", value: String(perfectDays) },
            { label: "Check-ins", value: String(totalCheckins) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border p-3 text-center" style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
              <p style={{ ...mono("1.3rem", "-0.03em"), fontWeight: 300, color: "var(--text)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {value}
              </p>
              <p style={{ ...mono("0.52rem", "0.12em"), textTransform: "uppercase", color: "var(--muted)", marginTop: "0.35rem" }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* best habit */}
        {best && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
            <p style={{ ...mono("0.52rem", "0.18em"), textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.5rem" }}>
              Hábito más consistente
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ ...mono("0.8rem"), color: "var(--text)" }}>{best.icon}</span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "0.85rem", color: "var(--text)" }}>
                  {best.name}
                </span>
              </div>
              <span style={{ ...mono("0.75rem", "-0.01em"), color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                {best.weekDone}/7d · {best.streak}d racha
              </span>
            </div>
          </div>
        )}

        {/* habit mini list */}
        <div className="space-y-1 mb-6">
          {habitStats.map((h) => (
            <div key={h.name} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span style={{ ...mono("0.65rem"), color: "var(--muted)", width: "1rem", textAlign: "center" }}>{h.icon}</span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "0.78rem", color: h.weekDone > 0 ? "var(--text)" : "var(--muted)" }}>
                  {h.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: "4rem", height: "2px", background: "var(--surface2)", borderRadius: "1px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(h.weekDone / 7) * 100}%`, background: "var(--text)" }} />
                </div>
                <span style={{ ...mono("0.6rem", "0.04em"), color: "var(--muted)", fontVariantNumeric: "tabular-nums", minWidth: "2rem", textAlign: "right" }}>
                  {h.weekDone}/7
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={close}
          className="w-full py-2.5 rounded-xl border"
          style={{ borderColor: "var(--border)", color: "var(--muted)", ...mono("0.62rem", "0.16em"), textTransform: "uppercase", background: "transparent", cursor: "pointer" }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
