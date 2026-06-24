"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import HabitCheckCard from "@/components/HabitCheckCard";
import DayClock from "@/components/DayClock";
import DailyQuote from "@/components/DailyQuote";
import ConfettiEffect from "@/components/ConfettiEffect";
import StreakToast, { type StreakMilestone } from "@/components/StreakToast";
import WeeklyReview from "@/components/WeeklyReview";
import HabitForm from "@/components/HabitForm";
import { calculateStreak, today, TIME_OF_DAY } from "@/lib/utils";
import { useSettings } from "@/components/SettingsProvider";

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
  order: number;
  logs: { date: string; completed: boolean; value?: number | null }[];
}

function isDueToday(habit: HabitWithLogs): boolean {
  const dayOfWeek = new Date().getDay();
  if (habit.frequency === "DAILY") return true;
  if (habit.frequency === "WEEKDAYS") return dayOfWeek >= 1 && dayOfWeek <= 5;
  if (habit.frequency === "WEEKENDS") return dayOfWeek === 0 || dayOfWeek === 6;
  if (habit.frequency === "CUSTOM" && habit.specificDays) {
    const days: number[] = JSON.parse(habit.specificDays);
    return days.includes(dayOfWeek);
  }
  return true;
}

function getGreeting(tz: string): string {
  const hour = parseInt(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(new Date()),
    10
  );
  if (hour >= 5 && hour < 12) return "Buenos días.";
  if (hour >= 12 && hour < 19) return "Buenas tardes.";
  return "Buenas noches.";
}

export default function Dashboard() {
  const { settings } = useSettings();
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Buenos días.");
  const [intention, setIntention] = useState("");
  const [intentionSaved, setIntentionSaved] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [milestone, setMilestone] = useState<StreakMilestone | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const prevCompleted = useRef(0);
  const dateStr = today();

  const fetchHabits = useCallback(async () => {
    const res = await fetch("/api/habits");
    const data: HabitWithLogs[] = await res.json();
    setHabits(data.filter((h) => !h.isArchived));
    setLoading(false);
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  // greeting
  useEffect(() => {
    setGreeting(getGreeting(settings.timezone));
    const id = setInterval(() => setGreeting(getGreeting(settings.timezone)), 60000);
    return () => clearInterval(id);
  }, [settings.timezone]);

  // intention
  useEffect(() => {
    fetch(`/api/intention?date=${dateStr}`)
      .then((r) => r.ok ? r.json() : { text: "" })
      .then((d) => setIntention(d?.text ?? ""))
      .catch(() => {});
  }, [dateStr]);

  async function saveIntention() {
    await fetch("/api/intention", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr, text: intention }),
    });
    setIntentionSaved(true);
    setTimeout(() => setIntentionSaved(false), 1800);
  }

  const todayHabits = habits.filter(isDueToday).sort((a, b) => a.order - b.order).map((h) => {
    const todayLog = h.logs.find((l) => l.date === dateStr);
    return {
      ...h,
      streak: calculateStreak(h.logs),
      completed: todayLog?.completed ?? false,
      value: todayLog?.value ?? null,
    };
  });

  const completedCount = todayHabits.filter((h) => h.completed).length;
  const total = todayHabits.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // trigger confetti when all complete
  useEffect(() => {
    if (total > 0 && completedCount === total && prevCompleted.current < total) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    }
    prevCompleted.current = completedCount;
  }, [completedCount, total]);

  const groups = TIME_OF_DAY.map((t) => ({
    ...t,
    habits: todayHabits.filter((h) => h.timeOfDay === t.value),
  })).filter((g) => g.habits.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm" style={{ color: "var(--muted)" }}>Cargando hábitos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ConfettiEffect active={confetti} />
      <StreakToast milestone={milestone} onDone={() => setMilestone(null)} />
      {showReview && <WeeklyReview habits={habits} onClose={() => setShowReview(false)} />}

      {/* header */}
      <div className="flex items-end justify-between mb-3 gap-8">
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.5rem" }}>
            {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.9rem", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {greeting}
          </h1>
          <DailyQuote />
        </div>
        <DayClock />
      </div>

      {/* objetivos + botones */}
      <div className="flex items-center justify-between mb-8">
        {total > 0 ? (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.14em", color: "var(--muted)" }}>
            Objetivos alcanzados hoy:{" "}
            <span style={{ color: completedCount === total ? "var(--text)" : "var(--muted)", fontWeight: completedCount === total ? 500 : 300 }}>
              {completedCount}/{total}
            </span>
          </p>
        ) : <span />}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReview(true)}
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--border)", background: "transparent", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.3rem 0.7rem", cursor: "pointer" }}
          >
            Semana
          </button>
          <button
            onClick={() => setShowQuickAdd(true)}
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--muted)", background: "transparent", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.3rem 0.6rem", cursor: "pointer" }}
          >
            +
          </button>
        </div>
      </div>

      {/* intención del día */}
      <div className="mb-8">
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--border)", marginBottom: "0.5rem" }}>
          Intención del día
        </p>
        <div className="flex gap-2">
          <input
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveIntention()}
            onBlur={saveIntention}
            placeholder="¿Cuál es tu foco de hoy?"
            className="flex-1 rounded-xl border px-4 py-2.5 outline-none"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)", fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "0.82rem", fontStyle: intention ? "normal" : "italic" }}
          />
          {intentionSaved && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--muted)", alignSelf: "center", letterSpacing: "0.1em" }}>✓</span>
          )}
        </div>
      </div>

      {total > 0 && (
        <div className="p-6 rounded-2xl border mb-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>
            Progreso de hoy
          </p>
          <div className="flex justify-between items-end mb-4">
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "3rem", letterSpacing: "-0.04em", lineHeight: 1, color: "var(--text)" }}>
                {completedCount}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "var(--muted)", marginLeft: "0.5rem" }}>
                / {total}
              </span>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.4rem", letterSpacing: "-0.03em", color: progress === 100 ? "var(--text)" : "var(--muted)" }}>
              {progress}%
            </span>
          </div>
          <div style={{ height: "1px", background: "var(--border)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, background: "var(--text)", transition: "width 0.5s ease" }} />
          </div>
          {progress === 100 && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.16em", color: "var(--muted)", marginTop: "0.6rem", textAlign: "center" }}>
              DÍA PERFECTO.
            </p>
          )}
        </div>
      )}

      {total === 0 ? (
        <div className="text-center py-16 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", color: "var(--border)", marginBottom: "1.5rem" }}>○</p>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "0.85rem", letterSpacing: "0.04em" }}>Sin hábitos todavía</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--muted)", margin: "0.5rem 0 1.5rem" }}>
            Empieza creando tu primer hábito
          </p>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="inline-block rounded-lg border"
            style={{ borderColor: "var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", padding: "0.5rem 1.2rem", background: "transparent", cursor: "pointer" }}
          >
            Crear hábito →
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.value}>
              <div className="flex items-center gap-3 mb-3">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--border)" }}>{group.emoji}</span>
                <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 500 }}>
                  {group.label}
                </h2>
              </div>
              <div className="space-y-2">
                {group.habits.map((habit) => (
                  <HabitCheckCard
                    key={habit.id}
                    habit={habit}
                    date={dateStr}
                    onUpdate={fetchHabits}
                    onMilestone={setMilestone}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* quick add modal */}
      {showQuickAdd && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9980, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowQuickAdd(false)}
        >
          <div
            className="rounded-2xl border w-full max-w-md mx-4 p-6 overflow-y-auto"
            style={{ background: "var(--surface)", borderColor: "var(--border)", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1.2rem" }}>
              Nuevo hábito
            </p>
            <HabitForm
              onSave={() => { setShowQuickAdd(false); fetchHabits(); }}
              onCancel={() => setShowQuickAdd(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
