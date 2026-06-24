"use client";

export interface DayScore {
  date: string;
  completed: number;
  total: number;
  rate: number;
}

interface Props {
  scores: DayScore[];
}

function rateSymbol(rate: number, total: number): { sym: string; opacity: number } {
  if (total === 0) return { sym: "·", opacity: 0.2 };
  if (rate >= 1)   return { sym: "●", opacity: 1 };
  if (rate >= 0.75) return { sym: "◉", opacity: 0.85 };
  if (rate >= 0.5)  return { sym: "◐", opacity: 0.65 };
  if (rate > 0)     return { sym: "○", opacity: 0.45 };
  return { sym: "·", opacity: 0.15 };
}

const ACHIEVEMENTS = [
  { id: "first_perfect",  sym: "●", label: "Primer día perfecto",      check: (s: DayScore[]) => s.some(d => d.rate >= 1) },
  { id: "streak_3",       sym: "◆", label: "3 días perfectos seguidos",  check: (s: DayScore[]) => bestPerfectStreak(s) >= 3 },
  { id: "streak_7",       sym: "▲", label: "Semana perfecta",            check: (s: DayScore[]) => bestPerfectStreak(s) >= 7 },
  { id: "streak_30",      sym: "✦", label: "Mes de racha perfecta",      check: (s: DayScore[]) => bestPerfectStreak(s) >= 30 },
  { id: "good_week",      sym: "◇", label: "Semana ≥75% todos los días", check: (s: DayScore[]) => hasGoodWeek(s) },
  { id: "century",        sym: "✱", label: "100 días perfectos",         check: (s: DayScore[]) => s.filter(d => d.rate >= 1).length >= 100 },
];

function bestPerfectStreak(scores: DayScore[]): number {
  let best = 0, cur = 0;
  const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));
  for (const s of sorted) {
    if (s.rate >= 1 && s.total > 0) { cur++; best = Math.max(best, cur); }
    else cur = 0;
  }
  return best;
}

function currentPerfectStreak(scores: DayScore[]): number {
  const sorted = [...scores].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const s of sorted) {
    if (s.rate >= 1 && s.total > 0) streak++;
    else break;
  }
  return streak;
}

function hasGoodWeek(scores: DayScore[]): boolean {
  const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 0; i <= sorted.length - 7; i++) {
    if (sorted.slice(i, i + 7).every(s => s.rate >= 0.75 && s.total > 0)) return true;
  }
  return false;
}

function getLast90Days(): string[] {
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    return d.toISOString().slice(0, 10);
  });
}

const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function PerfectDaysGrid({ scores }: Props) {
  const scoreMap = new Map(scores.map(s => [s.date, s]));
  const days90 = getLast90Days();

  const totalPerfect = scores.filter(s => s.rate >= 1 && s.total > 0).length;
  const curStreak = currentPerfectStreak(scores);
  const bestStreak = bestPerfectStreak(scores);

  // group 90 days into weeks (rows of 7, starting from oldest)
  const pad = new Date(days90[0]).getDay(); // 0=Sun
  const paddedDays: (string | null)[] = [...Array(pad === 0 ? 0 : pad).fill(null), ...days90];
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  // month labels
  const monthLabels: { label: string; weekIdx: number }[] = [];
  let lastM = -1;
  weeks.forEach((week, idx) => {
    const first = week.find(Boolean);
    if (!first) return;
    const m = new Date(first).getMonth();
    if (m !== lastM) { monthLabels.push({ label: MONTH_NAMES[m], weekIdx: idx }); lastM = m; }
  });

  const DAY_LABELS = ["D","L","M","X","J","V","S"];

  return (
    <div>
      {/* streak stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Racha actual",  value: curStreak,   sym: "●" },
          { label: "Mejor racha",   value: bestStreak,  sym: "◆" },
          { label: "Total perfectos", value: totalPerfect, sym: "✦" },
        ].map(({ label, value, sym }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: "var(--surface2)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: value > 0 ? "var(--text)" : "var(--border)" }}>{sym}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--border)" }}>{label}</span>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "2rem", letterSpacing: "-0.04em", lineHeight: 1, color: value > 0 ? "var(--text)" : "var(--border)", fontVariantNumeric: "tabular-nums" }}>
              {value}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", color: "var(--muted)", marginTop: "0.25rem" }}>
              {label === "Racha actual" ? "días seguidos" : label === "Mejor racha" ? "días consecutivos" : "días en total"}
            </p>
          </div>
        ))}
      </div>

      {/* 90-day grid */}
      <div className="rounded-xl border p-4 mb-6" style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--border)", marginBottom: "0.8rem" }}>
          Últimos 90 días
        </p>

        {/* grid */}
        <div style={{ display: "flex", gap: "3px" }}>
          {/* day-of-week labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", paddingTop: "14px" }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ height: "13px", display: "flex", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "6px", color: "var(--border)", width: "8px", textAlign: "center" }}>{d}</span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, overflowX: "auto" }}>
            <div style={{ display: "flex", gap: "3px" }}>
              {/* month labels row */}
              <div style={{ display: "flex", gap: "3px", position: "absolute", pointerEvents: "none" }}>
                {/* handled below */}
              </div>

              {weeks.map((week, wIdx) => (
                <div key={wIdx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {/* month label */}
                  <div style={{ height: "12px", display: "flex", alignItems: "center" }}>
                    {monthLabels.find(m => m.weekIdx === wIdx) && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "6px", color: "var(--muted)", whiteSpace: "nowrap" }}>
                        {monthLabels.find(m => m.weekIdx === wIdx)!.label}
                      </span>
                    )}
                  </div>
                  {week.map((day, dIdx) => {
                    if (!day) return <div key={dIdx} style={{ width: "13px", height: "13px" }} />;
                    const score = scoreMap.get(day);
                    const { sym, opacity } = rateSymbol(score?.rate ?? 0, score?.total ?? 0);
                    const isToday = day === new Date().toISOString().slice(0, 10);
                    return (
                      <div
                        key={day}
                        title={`${day}${score ? ` · ${Math.round(score.rate * 100)}% (${score.completed}/${score.total})` : ""}`}
                        style={{
                          width: "13px", height: "13px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: "2px",
                          border: isToday ? "1px solid var(--muted)" : "1px solid transparent",
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", opacity, color: "var(--text)", lineHeight: 1 }}>
                          {sym}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* legend */}
        <div className="flex gap-4 mt-3 flex-wrap">
          {[["●", "Perfecto"], ["◉", "≥75%"], ["◐", "≥50%"], ["○", "Iniciado"], ["·", "Sin registro"]].map(([sym, lbl]) => (
            <span key={lbl} style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.08em", color: "var(--border)" }}>
              {sym} {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* achievements */}
      <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--border)", marginBottom: "0.8rem" }}>
          Logros
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const earned = a.check(scores);
            return (
              <div
                key={a.id}
                className="rounded-lg border p-2.5 flex items-start gap-2"
                style={{ borderColor: earned ? "var(--muted)" : "var(--border)", background: earned ? "var(--surface)" : "transparent", opacity: earned ? 1 : 0.4 }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: earned ? "var(--text)" : "var(--border)", flexShrink: 0, marginTop: "0.05rem" }}>
                  {a.sym}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.04em", color: earned ? "var(--text)" : "var(--border)", lineHeight: 1.4 }}>
                  {a.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
