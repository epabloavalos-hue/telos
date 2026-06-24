"use client";

interface Log {
  date: string;
  completed: boolean;
}

interface Props {
  logs: Log[];
  color?: string;
}

function getLast365Days(): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = 364; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    days.push(dd.toISOString().slice(0, 10));
  }
  return days;
}

const MONTH_LABELS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function HeatMap({ logs, color = "var(--text)" }: Props) {
  const completedSet = new Set(logs.filter((l) => l.completed).map((l) => l.date));
  const days = getLast365Days();

  // Pad to start on Sunday
  const firstDay = new Date(days[0]).getDay();
  const padded: (string | null)[] = [...Array(firstDay).fill(null), ...days];
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month labels: find first week where month changes
  const monthPositions: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstReal = week.find(Boolean);
    if (!firstReal) return;
    const m = new Date(firstReal).getMonth();
    if (m !== lastMonth) {
      monthPositions.push({ label: MONTH_LABELS[m], col });
      lastMonth = m;
    }
  });

  const cellSize = 10;
  const gap = 2;
  const width = weeks.length * (cellSize + gap);
  const height = 7 * (cellSize + gap) + 18;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={width} height={height} style={{ display: "block" }}>
        {/* month labels */}
        {monthPositions.map(({ label, col }) => (
          <text
            key={`${label}-${col}`}
            x={col * (cellSize + gap)}
            y={10}
            style={{ fontFamily: "var(--font-mono)", fontSize: "7px", fill: "var(--muted)" }}
          >
            {label}
          </text>
        ))}

        {/* cells */}
        {weeks.map((week, col) =>
          week.map((day, row) => {
            if (!day) return null;
            const done = completedSet.has(day);
            const isToday = day === new Date().toISOString().slice(0, 10);
            return (
              <rect
                key={day}
                x={col * (cellSize + gap)}
                y={18 + row * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                style={{
                  fill: done ? color : "var(--surface2)",
                  opacity: done ? 0.9 : 1,
                  stroke: isToday ? "var(--muted)" : "none",
                  strokeWidth: 1,
                }}
              >
                <title>{day}{done ? " · completado" : ""}</title>
              </rect>
            );
          })
        )}
      </svg>
    </div>
  );
}
