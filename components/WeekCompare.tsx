"use client";

export interface WeekDay {
  date: string;
  dayLabel: string;
  shortLabel: string;
  completed: number;
  total: number;
  rate: number;
}

export interface WeekData {
  label: string;
  days: WeekDay[];
  avgRate: number;
  perfectDays: number;
  totalCheckins: number;
}

const WEEK_DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

function symbol(rate: number): string {
  if (rate === 0) return "·";
  if (rate < 0.5) return "○";
  if (rate < 1)   return "◐";
  return "●";
}

export default function WeekCompare({ weekA, weekB }: { weekA: WeekData; weekB: WeekData }) {
  const delta = weekA.avgRate - weekB.avgRate;
  const deltaSign = delta > 0 ? "+" : delta < 0 ? "−" : "=";
  const deltaAbs = Math.abs(Math.round(delta * 100));

  // SVG abstract chart — two arcs of dots
  const W = 320;
  const H = 110;
  const PAD = 24;
  const dayW = (W - PAD * 2) / 7;

  return (
    <div>
      {/* abstract dot-chart */}
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", overflow: "visible", marginBottom: "1.5rem" }}
      >
        {/* center divider */}
        <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2}
          stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,4" />

        {/* day labels */}
        {WEEK_DAY_SHORT.map((d, i) => (
          <text
            key={d}
            x={PAD + i * dayW + dayW / 2}
            y={H / 2 + 3}
            textAnchor="middle"
            style={{ fontFamily: "var(--font-mono)", fontSize: "6px", fill: "var(--border)" }}
          >
            {d}
          </text>
        ))}

        {weekA.days.map((day, i) => {
          const cx = PAD + i * dayW + dayW / 2;
          const rA = day.rate;
          const rB = weekB.days[i]?.rate ?? 0;
          const maxR = 10;
          const yA = H / 2 - 14 - rA * 26;
          const yB = H / 2 + 14 + rB * 26;
          const radA = 1.5 + rA * (maxR - 1.5);
          const radB = 1.5 + rB * (maxR - 1.5);

          return (
            <g key={day.date}>
              {/* connector */}
              <line x1={cx} y1={yA} x2={cx} y2={yB}
                stroke="var(--border)" strokeWidth="0.5" opacity="0.4" />

              {/* week A — top */}
              <circle cx={cx} cy={yA} r={radA}
                fill={rA >= 1 ? "var(--text)" : "transparent"}
                stroke="var(--text)" strokeWidth="1"
                opacity={0.3 + rA * 0.7}
              />

              {/* week B — bottom */}
              <circle cx={cx} cy={yB} r={radB}
                fill={rB >= 1 ? "var(--muted)" : "transparent"}
                stroke="var(--muted)" strokeWidth="1"
                opacity={0.2 + rB * 0.6}
              />
            </g>
          );
        })}

        {/* legend labels */}
        <text x={PAD} y={14} style={{ fontFamily: "var(--font-mono)", fontSize: "6px", fill: "var(--text)" }}>
          {weekA.label}
        </text>
        <text x={PAD} y={H - 4} style={{ fontFamily: "var(--font-mono)", fontSize: "6px", fill: "var(--muted)" }}>
          {weekB.label}
        </text>
      </svg>

      {/* metrics grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {
            label: "Tasa promedio",
            a: `${Math.round(weekA.avgRate * 100)}%`,
            b: `${Math.round(weekB.avgRate * 100)}%`,
            delta: delta !== 0 ? `${deltaSign}${deltaAbs}pp` : "igual",
            up: delta > 0,
          },
          {
            label: "Días perfectos",
            a: String(weekA.perfectDays),
            b: String(weekB.perfectDays),
            delta: weekA.perfectDays - weekB.perfectDays === 0 ? "igual"
              : (weekA.perfectDays - weekB.perfectDays > 0 ? "+" : "") + (weekA.perfectDays - weekB.perfectDays),
            up: weekA.perfectDays >= weekB.perfectDays,
          },
          {
            label: "Check-ins",
            a: String(weekA.totalCheckins),
            b: String(weekB.totalCheckins),
            delta: weekA.totalCheckins - weekB.totalCheckins === 0 ? "igual"
              : (weekA.totalCheckins - weekB.totalCheckins > 0 ? "+" : "") + (weekA.totalCheckins - weekB.totalCheckins),
            up: weekA.totalCheckins >= weekB.totalCheckins,
          },
        ].map(({ label, a, b, delta, up }) => (
          <div key={label} className="rounded-xl border p-3"
            style={{ background: "var(--surface2)", borderColor: "var(--border)" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--border)", marginBottom: "0.5rem" }}>
              {label}
            </p>
            <div className="flex items-end gap-2 mb-1">
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.4rem", letterSpacing: "-0.03em", lineHeight: 1, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                {a}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "-0.01em", color: "var(--muted)", paddingBottom: "0.1rem" }}>
                {b}
              </span>
            </div>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.08em",
              color: delta === "igual" ? "var(--border)" : up ? "var(--text)" : "var(--muted)",
            }}>
              {delta}
            </span>
          </div>
        ))}
      </div>

      {/* day-by-day symbol row */}
      <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--border)", marginBottom: "0.8rem" }}>
          Día a día
        </p>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekA.days.map((d) => (
            <div key={d.date} className="flex flex-col items-center gap-1">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: d.rate >= 1 ? "var(--text)" : d.rate > 0 ? "var(--muted)" : "var(--border)" }}>
                {symbol(d.rate)}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.1em", color: "var(--border)" }}>
                {d.shortLabel}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekB.days.map((d) => (
            <div key={d.date} className="flex flex-col items-center">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--border)", opacity: 0.5 }}>
                {symbol(d.rate)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          {[["●", "Perfecto"], ["◐", "Parcial"], ["○", "Iniciado"], ["·", "Sin datos"]].map(([sym, lbl]) => (
            <span key={lbl} style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.1em", color: "var(--border)" }}>
              {sym} {lbl}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
