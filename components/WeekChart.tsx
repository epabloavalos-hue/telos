"use client";

interface Log {
  date: string;
  completed: boolean;
}

interface Props {
  logs: Log[];
}

const DAY_SHORT = ["D", "L", "M", "X", "J", "V", "S"];

export default function WeekChart({ logs }: Props) {
  const completedSet = new Set(logs.filter((l) => l.completed).map((l) => l.date));

  // Last 8 weeks, grouped by week
  const weeks: { label: string; rate: number }[] = [];
  const today = new Date();

  for (let w = 7; w >= 0; w--) {
    const days: string[] = [];
    for (let d = 6; d >= 0; d--) {
      const dd = new Date(today);
      dd.setDate(today.getDate() - w * 7 - d);
      days.push(dd.toISOString().slice(0, 10));
    }
    const done = days.filter((d) => completedSet.has(d)).length;
    const weekStart = new Date(days[0]);
    weeks.push({
      label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
      rate: days.length > 0 ? done / days.length : 0,
    });
  }

  const W = 44;
  const GAP = 6;
  const H = 80;
  const totalW = weeks.length * (W + GAP) - GAP;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={totalW} height={H + 24} style={{ display: "block" }}>
        {weeks.map(({ label, rate }, i) => {
          const barH = Math.max(2, rate * H);
          const x = i * (W + GAP);
          const y = H - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={W}
                height={barH}
                rx={3}
                style={{ fill: rate > 0 ? "var(--text)" : "var(--surface2)", opacity: 0.15 + rate * 0.85 }}
              />
              <text
                x={x + W / 2}
                y={H + 12}
                textAnchor="middle"
                style={{ fontFamily: "var(--font-mono)", fontSize: "7px", fill: "var(--muted)" }}
              >
                {label}
              </text>
              {rate > 0 && (
                <text
                  x={x + W / 2}
                  y={y - 4}
                  textAnchor="middle"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "7px", fill: "var(--muted)" }}
                >
                  {Math.round(rate * 100)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
