"use client";
import { useState, useEffect, useRef } from "react";
import { CATEGORIES, calculateStreak } from "@/lib/utils";
import { useSettings } from "@/components/SettingsProvider";
import { isMilestone, type StreakMilestone } from "@/components/StreakToast";

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  type: string;
  isNumeric: boolean;
  targetValue: number | null;
  unit: string | null;
  streak: number;
  completed: boolean;
  value?: number | null;
  logs: { date: string; completed: boolean }[];
}

// ── Sonidos ───────────────────────────────────────────────────────────────────

function playCheckSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

// Pequeño "glug" suave al beber un vaso
function playGlugSound() {
  try {
    const ctx = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

function playTimerAlert() {
  try {
    const ctx = new AudioContext();
    [440, 523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.16;
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.start(t); osc.stop(t + 0.32);
    });
    const bellStart = ctx.currentTime + 0.55;
    [{ r: 1.00, g: 0.30, d: 2.8 }, { r: 2.76, g: 0.14, d: 1.6 }, { r: 5.40, g: 0.06, d: 0.9 }].forEach(({ r, g, d }) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = 880 * r;
      gain.gain.setValueAtTime(0, bellStart);
      gain.gain.linearRampToValueAtTime(g, bellStart + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, bellStart + d);
      osc.start(bellStart); osc.stop(bellStart + d + 0.1);
    });
  } catch {}
}

function fmtTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ── Ícono de vaso SVG (minimalista, trapecio) ─────────────────────────────────
function GlassIcon({ size = 13, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 12 16" fill="none"
      stroke={color} strokeWidth="1.4" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M1.5 1 H10.5 L9 15 H3 Z" />
    </svg>
  );
}

// ── Botón de vaso individual ──────────────────────────────────────────────────
function WaterGlass({ drunk, onClick }: { drunk: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "2rem",
        height: "2.6rem",
        border: `1px solid ${drunk ? "var(--text)" : "var(--border)"}`,
        borderRadius: "2px 2px 5px 5px",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s",
        flexShrink: 0,
      }}
    >
      {/* fill de agua */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: drunk ? "100%" : "0%",
        background: "var(--muted)",
        opacity: 0.35,
        transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)",
      }} />
      {/* checkmark */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: drunk ? 1 : 0,
        transition: "opacity 0.2s",
        zIndex: 1,
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text)" }}>✓</span>
      </div>
    </button>
  );
}

// Timer state machine
type TimerState = "idle" | "running" | "paused" | "finished";

// ── Componente principal ──────────────────────────────────────────────────────
export default function HabitCheckCard({
  habit,
  date,
  onUpdate,
  onMilestone,
}: {
  habit: Habit;
  date: string;
  onUpdate: () => void;
  onMilestone?: (m: StreakMilestone) => void;
}) {
  const { settings } = useSettings();
  const [loading, setLoading]   = useState(false);
  const [pulse, setPulse]       = useState(false);
  const [numValue, setNumValue] = useState<string>(String(habit.value ?? ""));
  const cat = CATEGORIES.find((c) => c.value === habit.category);

  // ── Detección de hábito de agua ───────────────────────────────────────────
  const isWaterHabit = /agua|water|vaso/i.test(habit.name);

  // ── Estado del panel de agua ──────────────────────────────────────────────
  const [waterOpen,    setWaterOpen]    = useState(false);
  const [waterInput,   setWaterInput]   = useState("");
  const [waterTarget,  setWaterTarget]  = useState(0);     // total vasos configurado
  const [drunkSet,     setDrunkSet]     = useState<Set<number>>(new Set());

  // ── Estado del temporizador ───────────────────────────────────────────────
  const [timerOpen,  setTimerOpen]  = useState(false);
  const [inputMins,  setInputMins]  = useState("");
  const [totalSecs,  setTotalSecs]  = useState(0);
  const [secsLeft,   setSecsLeft]   = useState(0);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const toggleRef = useRef<() => void>(() => {});

  // Cuenta regresiva
  useEffect(() => {
    if (timerState !== "running") return;
    const id = setInterval(() => setSecsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [timerState]);

  useEffect(() => {
    if (timerState === "running" && secsLeft === 0) {
      setTimerState("finished");
      playTimerAlert();
      if (!habit.completed) toggleRef.current();
      setTimeout(() => { setTimerState("idle"); setTimerOpen(false); }, 4000);
    }
  }, [secsLeft, timerState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-completar cuando todos los vasos están bebidos
  useEffect(() => {
    if (waterTarget > 0 && drunkSet.size === waterTarget && !habit.completed) {
      toggleRef.current();
    }
  }, [drunkSet, waterTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────

  async function toggle() {
    setLoading(true);
    const nowCompleted = !habit.completed;
    await fetch(`/api/habits/${habit.id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, completed: nowCompleted }),
    });
    if (nowCompleted) {
      if (settings.soundEnabled) playCheckSound();
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
      const updatedLogs = [
        ...habit.logs.filter((l) => l.date !== date),
        { date, completed: true },
      ];
      const newStreak = calculateStreak(updatedLogs);
      if (isMilestone(newStreak) && onMilestone)
        onMilestone({ habitName: habit.name, streak: newStreak });
    }
    onUpdate();
    setLoading(false);
  }

  toggleRef.current = toggle;

  async function saveNumeric() {
    setLoading(true);
    const v = parseFloat(numValue);
    const completed = !isNaN(v) && habit.targetValue ? v >= habit.targetValue : false;
    await fetch(`/api/habits/${habit.id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, completed, value: isNaN(v) ? null : v }),
    });
    if (completed && settings.soundEnabled) playCheckSound();
    onUpdate();
    setLoading(false);
  }

  function confirmWater() {
    const n = parseInt(waterInput);
    if (!n || n < 1 || n > 20) return;
    setWaterTarget(n);
    setDrunkSet(new Set());
  }

  function toggleGlass(i: number) {
    if (settings.soundEnabled) playGlugSound();
    setDrunkSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function resetWater() {
    setWaterTarget(0);
    setWaterInput("");
    setDrunkSet(new Set());
  }

  // Timer
  function startTimer() {
    const mins = parseFloat(inputMins);
    if (!mins || mins <= 0) return;
    const secs = Math.round(mins * 60);
    setTotalSecs(secs); setSecsLeft(secs);
    setTimerState("running");
  }
  function pauseTimer()  { setTimerState("paused"); }
  function resumeTimer() { setTimerState("running"); }
  function cancelTimer() { setTimerState("idle"); setSecsLeft(0); setTotalSecs(0); }

  const timerProgress  = totalSecs > 0 ? (totalSecs - secsLeft) / totalSecs : 0;
  const isTimerActive  = timerState === "running" || timerState === "paused";
  const waterDrunk     = drunkSet.size;
  const waterPct       = waterTarget > 0 ? waterDrunk / waterTarget : 0;

  const monoTiny = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.6rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
  };

  return (
    <div
      className="rounded-xl border transition-all overflow-hidden"
      style={{
        background: habit.completed ? "var(--surface2)" : "var(--surface)",
        borderColor: habit.completed
          ? "var(--muted)"
          : timerOpen || waterOpen
          ? "var(--muted)"
          : "var(--border)",
        opacity: loading ? 0.5 : 1,
        transform: pulse ? "scale(1.015)" : "scale(1)",
        transition: "transform 0.25s cubic-bezier(.34,1.56,.64,1), background 0.2s, border-color 0.2s, opacity 0.2s",
      }}
    >
      {/* ── Fila principal ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-3.5">
        {/* check */}
        <button
          onClick={habit.isNumeric ? undefined : toggle}
          disabled={loading}
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: habit.completed ? "var(--text)" : "transparent",
            border: `1px solid ${habit.completed ? "var(--text)" : "var(--border)"}`,
            fontFamily: "var(--font-mono)", fontSize: "0.6rem",
            color: habit.completed ? "var(--background)" : "transparent",
            transform: pulse ? "scale(1.2)" : "scale(1)",
            transition: "transform 0.25s cubic-bezier(.34,1.56,.64,1), background 0.2s, border-color 0.2s",
          }}
        >✓</button>

        {/* icon + name + category */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--border)", width: "0.8rem", flexShrink: 0 }}>
              {habit.icon}
            </span>
            <span style={{
              fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "0.82rem",
              letterSpacing: "0.01em", color: habit.completed ? "var(--muted)" : "var(--text)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              textDecorationLine: habit.completed ? "line-through" : "none",
              textDecorationColor: "var(--border)", transition: "color 0.2s",
            }}>
              {habit.name}
            </span>
            {habit.streak > 0 && (
              <span className="shrink-0 px-1.5 py-0.5 rounded" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.06em", color: "var(--muted)", background: "var(--surface2)" }}>
                {habit.streak}d
              </span>
            )}
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--border)", display: "block", marginTop: "0.15rem" }}>
            {cat?.label}
          </span>
        </div>

        {/* numeric */}
        {habit.isNumeric && (
          <div className="flex items-center gap-2 shrink-0">
            <input type="number" value={numValue} onChange={(e) => setNumValue(e.target.value)}
              className="w-14 text-center rounded-lg px-2 py-1 border outline-none"
              style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 300 }}
              placeholder="0" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--muted)" }}>
              {habit.unit ?? ""}{habit.targetValue ? ` / ${habit.targetValue}` : ""}
            </span>
            <button onClick={saveNumeric} disabled={loading}
              className="rounded-lg border px-2.5 py-1"
              style={{ borderColor: "var(--border)", color: "var(--text)", background: "transparent", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em" }}>
              OK
            </button>
          </div>
        )}

        {/* ── Botón de acción derecho ─────────────────────────────────── */}
        {!habit.isNumeric && (
          <>
            {isWaterHabit ? (
              /* Vaso de agua */
              <button
                onClick={() => setWaterOpen((v) => !v)}
                title="Registro de agua"
                style={{
                  flexShrink: 0, background: "transparent", border: "none",
                  padding: "0.2rem", cursor: "pointer",
                  color: waterOpen || waterTarget > 0 ? "var(--muted)" : "var(--border)",
                  transition: "color 0.2s", display: "flex", alignItems: "center",
                }}
              >
                {waterTarget > 0 ? (
                  /* Mostrar progreso cuando hay vasos configurados */
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: waterDrunk === waterTarget ? "var(--text)" : "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                    {waterDrunk}/{waterTarget}
                  </span>
                ) : (
                  <GlassIcon size={12} color="currentColor" />
                )}
              </button>
            ) : (
              /* Temporizador */
              <button
                onClick={() => { if (timerState === "running") return; setTimerOpen((v) => !v); }}
                title={timerOpen ? "Cerrar temporizador" : "Abrir temporizador"}
                style={{
                  flexShrink: 0, background: "transparent", border: "none",
                  padding: "0.15rem 0.25rem",
                  cursor: timerState === "running" ? "default" : "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: isTimerActive ? "0.65rem" : "0.72rem",
                  color: isTimerActive
                    ? timerState === "paused" ? "var(--border)" : "var(--muted)"
                    : "var(--border)",
                  transition: "color 0.2s", lineHeight: 1, fontVariantNumeric: "tabular-nums",
                }}
              >
                {isTimerActive ? fmtTime(secsLeft) : "◷"}
              </button>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── Panel de AGUA ───────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {waterOpen && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "0.85rem 1rem", background: "var(--surface2)" }}>

          {/* Barra de progreso de agua */}
          {waterTarget > 0 && (
            <div style={{ height: "1px", background: "var(--border)", marginBottom: "0.85rem", position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, height: "100%",
                background: waterDrunk === waterTarget ? "var(--text)" : "var(--muted)",
                width: `${waterPct * 100}%`,
                transition: "width 0.35s ease",
              }} />
            </div>
          )}

          {/* ── Paso 1: elegir número de vasos ── */}
          {waterTarget === 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <GlassIcon size={13} color="var(--muted)" />
              <input
                type="number" min={1} max={20}
                value={waterInput}
                onChange={(e) => setWaterInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmWater()}
                placeholder="—"
                style={{
                  width: "3.5rem", background: "transparent",
                  border: "none", borderBottom: "1px solid var(--muted)",
                  outline: "none", fontFamily: "var(--font-mono)",
                  fontWeight: 500, fontSize: "1.1rem", color: "var(--text)",
                  textAlign: "center", padding: "0.1rem 0",
                }}
              />
              <span style={{ ...monoTiny, color: "var(--muted)" }}>vasos</span>
              <div style={{ flex: 1 }} />
              <button
                onClick={confirmWater}
                disabled={!waterInput || parseInt(waterInput) < 1}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: waterInput && parseInt(waterInput) > 0 ? "var(--text)" : "var(--border)",
                  background: "transparent",
                  border: `1px solid ${waterInput && parseInt(waterInput) > 0 ? "var(--muted)" : "var(--border)"}`,
                  borderRadius: "0.5rem", padding: "0.35rem 0.75rem",
                  cursor: waterInput && parseInt(waterInput) > 0 ? "pointer" : "default",
                  transition: "color 0.2s, border-color 0.2s",
                }}
              >Confirmar</button>
            </div>
          )}

          {/* ── Paso 2: vasos interactivos ── */}
          {waterTarget > 0 && (
            <div>
              {/* contador */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <GlassIcon size={11} color="var(--muted)" />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 300, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                  {waterDrunk}
                  <span style={{ color: "var(--border)" }}>/{waterTarget}</span>
                </span>
                {waterDrunk === waterTarget && (
                  <span style={{ ...monoTiny, color: "var(--text)", fontSize: "0.5rem" }}>
                    · completado ✓
                  </span>
                )}
                <div style={{ flex: 1 }} />
                {/* reiniciar */}
                <button onClick={resetWater} style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--border)", background: "transparent", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}>
                  reiniciar
                </button>
              </div>

              {/* grid de vasos */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {Array.from({ length: waterTarget }, (_, i) => (
                  <WaterGlass key={i} drunk={drunkSet.has(i)} onClick={() => toggleGlass(i)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── Panel de TEMPORIZADOR ───────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {timerOpen && !isWaterHabit && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "0.75rem 1rem", background: "var(--surface2)" }}>
          {isTimerActive && totalSecs > 0 && (
            <div style={{ height: "1px", background: "var(--border)", marginBottom: "0.8rem", position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, height: "100%",
                background: timerState === "paused" ? "var(--border)" : "var(--muted)",
                width: `${timerProgress * 100}%`,
                transition: timerState === "running" ? "width 1s linear" : "none",
              }} />
            </div>
          )}

          {timerState === "idle" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ ...monoTiny, color: "var(--muted)" }}>◷</span>
              <input
                type="number" min={1} max={480}
                value={inputMins}
                onChange={(e) => setInputMins(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startTimer()}
                placeholder="—"
                style={{
                  width: "3.5rem", background: "transparent",
                  border: "none", borderBottom: "1px solid var(--muted)",
                  outline: "none", fontFamily: "var(--font-mono)",
                  fontWeight: 500, fontSize: "1.1rem", color: "var(--text)",
                  textAlign: "center", padding: "0.1rem 0",
                }}
              />
              <span style={{ ...monoTiny, color: "var(--muted)" }}>min</span>
              <div style={{ flex: 1 }} />
              <button
                onClick={startTimer}
                disabled={!inputMins || parseFloat(inputMins) <= 0}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: inputMins && parseFloat(inputMins) > 0 ? "var(--text)" : "var(--border)",
                  background: "transparent",
                  border: `1px solid ${inputMins && parseFloat(inputMins) > 0 ? "var(--muted)" : "var(--border)"}`,
                  borderRadius: "0.5rem", padding: "0.35rem 0.75rem",
                  cursor: inputMins && parseFloat(inputMins) > 0 ? "pointer" : "default",
                  transition: "color 0.2s, border-color 0.2s",
                }}
              >Iniciar</button>
            </div>
          )}

          {timerState === "running" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.5rem", letterSpacing: "-0.03em", color: "var(--text)", fontVariantNumeric: "tabular-nums", flex: 1 }}>
                {fmtTime(secsLeft)}
              </span>
              <button onClick={pauseTimer} style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", background: "transparent", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.35rem 0.8rem", cursor: "pointer" }}>
                ⏸ Pausar
              </button>
              <button onClick={cancelTimer} title="Cancelar" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--border)", background: "transparent", border: "none", cursor: "pointer", padding: "0.2rem", lineHeight: 1 }}>✕</button>
            </div>
          )}

          {timerState === "paused" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.5rem", letterSpacing: "-0.03em", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                  {fmtTime(secsLeft)}
                </div>
                <div style={{ ...monoTiny, color: "var(--border)", fontSize: "0.5rem", marginTop: "0.15rem" }}>en pausa</div>
              </div>
              <button onClick={resumeTimer} style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text)", background: "transparent", border: "1px solid var(--muted)", borderRadius: "0.5rem", padding: "0.35rem 0.8rem", cursor: "pointer" }}>
                ▷ Reanudar
              </button>
              <button onClick={cancelTimer} title="Cancelar" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--border)", background: "transparent", border: "none", cursor: "pointer", padding: "0.2rem", lineHeight: 1 }}>✕</button>
            </div>
          )}

          {timerState === "finished" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text)" }}>✓</span>
              <span style={{ ...monoTiny, color: "var(--text)", flex: 1, letterSpacing: "0.18em" }}>Actividad completada</span>
              <button
                onClick={() => { setTimerState("idle"); setTimerOpen(false); }}
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text)", background: "var(--surface)", border: "1px solid var(--text)", borderRadius: "0.5rem", padding: "0.35rem 0.75rem", cursor: "pointer" }}>
                ● OK
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
