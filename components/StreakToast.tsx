"use client";
import { useEffect, useState } from "react";

export interface StreakMilestone {
  habitName: string;
  streak: number;
}

const MILESTONES = [7, 14, 21, 30, 60, 100, 365];

export function isMilestone(streak: number): boolean {
  return MILESTONES.includes(streak);
}

export default function StreakToast({
  milestone,
  onDone,
}: {
  milestone: StreakMilestone | null;
  onDone: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!milestone) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 4000);
    return () => clearTimeout(t);
  }, [milestone, onDone]);

  if (!milestone) return null;

  const label =
    milestone.streak >= 365 ? "Un año de constancia." :
    milestone.streak >= 100 ? "100 días sin parar." :
    milestone.streak >= 60  ? "Dos meses seguidos." :
    milestone.streak >= 30  ? "Un mes de racha." :
    milestone.streak >= 21  ? "21 días — ya es hábito." :
    milestone.streak >= 14  ? "Dos semanas seguidas." :
                               "Primera semana completada.";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9998,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "1rem 1.4rem",
        maxWidth: "20rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(1rem)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        pointerEvents: "none",
      }}
    >
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.35rem" }}>
        Racha · {milestone.streak}d
      </p>
      <p style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "0.88rem", letterSpacing: "-0.01em", color: "var(--text)", marginBottom: "0.2rem" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "0.72rem", color: "var(--muted)" }}>
        {milestone.habitName}
      </p>
    </div>
  );
}
