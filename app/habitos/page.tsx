"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import HabitForm from "@/components/HabitForm";
import { CATEGORIES, calculateStreak } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  type: string;
  timeOfDay: string;
  frequency: string;
  isNumeric: boolean;
  targetValue: number | null;
  unit: string | null;
  isArchived: boolean;
  order: number;
  logs: { date: string; completed: boolean }[];
}

export default function HabitosPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  const dragId = useRef<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  const fetchHabits = useCallback(async () => {
    const res = await fetch(`/api/habits?archived=${showArchived}`);
    const data: Habit[] = await res.json();
    setHabits(data.sort((a, b) => a.order - b.order));
    setLoading(false);
  }, [showArchived]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  async function archive(habit: Habit) {
    await fetch(`/api/habits/${habit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...habit, isArchived: !habit.isArchived }),
    });
    fetchHabits();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este hábito y todo su historial?")) return;
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    fetchHabits();
  }

  // ── drag & drop ────────────────────────────────────────────
  function onDragStart(id: string) {
    dragId.current = id;
  }

  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    dragOverId.current = id;
    // reorder visually
    if (dragId.current === id) return;
    setHabits((prev) => {
      const from = prev.findIndex((h) => h.id === dragId.current);
      const to = prev.findIndex((h) => h.id === id);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    dragId.current = id; // update so it doesn't keep flickering
  }

  async function onDrop() {
    const ordered = habits.map((h, i) => ({ id: h.id, order: i }));
    await fetch("/api/habits/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: ordered }),
    });
    dragId.current = null;
    dragOverId.current = null;
  }

  const cat = (c: string) => CATEGORIES.find((x) => x.value === c);

  const mono = { fontFamily: "var(--font-mono)" as const };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.5rem" }}>
            Gestión
          </p>
          <h1 style={{ ...mono, fontWeight: 300, fontSize: "1.9rem", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Hábitos.
          </h1>
          <p style={{ ...mono, fontSize: "0.6rem", letterSpacing: "0.1em", color: "var(--muted)", marginTop: "0.4rem" }}>
            {habits.filter((h) => !h.isArchived).length} activo{habits.filter((h) => !h.isArchived).length !== 1 ? "s" : ""}
            {!showArchived && <span style={{ color: "var(--border)", marginLeft: "0.5rem" }}>· arrastra para ordenar</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="px-3 py-2 rounded-lg border"
            style={{ borderColor: "var(--border)", color: "var(--muted)", background: showArchived ? "var(--surface2)" : "transparent", ...mono, fontSize: "0.62rem", letterSpacing: "0.1em" }}
          >
            {showArchived ? "Activos" : "Archivados"}
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 rounded-lg border"
            style={{ borderColor: "var(--text)", color: "var(--text)", background: "transparent", ...mono, fontSize: "0.62rem", letterSpacing: "0.1em" }}
          >
            + Nuevo
          </button>
        </div>
      </div>

      {/* modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div
            className="w-full max-w-md rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p style={{ ...mono, fontWeight: 300, fontSize: "1.1rem", letterSpacing: "-0.01em", marginBottom: "1.5rem" }}>
              {editing ? "Editar hábito." : "Nuevo hábito."}
            </p>
            <HabitForm
              initial={editing ? {
                ...editing,
                description: "",
                specificDays: [],
                targetValue: editing.targetValue?.toString() ?? "",
                unit: editing.unit ?? "",
                reminderTime: "",
              } : undefined}
              onSave={() => { setShowForm(false); setEditing(null); fetchHabits(); }}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}

      {/* list */}
      {loading ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>Cargando...</p>
      ) : habits.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p style={{ ...mono, fontSize: "1.2rem", color: "var(--border)", marginBottom: "1rem" }}>▸</p>
          <p style={{ ...mono, fontWeight: 300, fontSize: "0.85rem" }}>
            {showArchived ? "No hay hábitos archivados" : "No tienes hábitos aún"}
          </p>
          {!showArchived && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 rounded-lg border"
              style={{ borderColor: "var(--border)", color: "var(--text)", background: "transparent", ...mono, fontSize: "0.62rem" }}
            >
              Crear primer hábito
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => {
            const streak = calculateStreak(habit.logs);
            const c = cat(habit.category);
            return (
              <div
                key={habit.id}
                draggable={!showArchived}
                onDragStart={() => onDragStart(habit.id)}
                onDragOver={(e) => onDragOver(e, habit.id)}
                onDrop={onDrop}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  cursor: showArchived ? "default" : "grab",
                  userSelect: "none",
                }}
              >
                {/* drag handle */}
                {!showArchived && (
                  <span style={{ ...mono, fontSize: "0.6rem", color: "var(--border)", cursor: "grab", flexShrink: 0 }}>⋮⋮</span>
                )}

                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--surface2)", color: "var(--muted)", ...mono, fontSize: "0.85rem" }}>
                  {habit.icon}
                </span>

                <div className="flex-1 min-w-0">
                  <p style={{ ...mono, fontWeight: 300, fontSize: "0.85rem", letterSpacing: "0.02em", color: "var(--text)" }}>
                    {habit.name}
                  </p>
                  <p style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.1em", color: "var(--muted)", marginTop: "0.15rem" }}>
                    {c?.label} · {habit.type === "POSITIVE" ? "Hacer" : "Evitar"}
                    {streak > 0 && <span className="ml-2" style={{ fontVariantNumeric: "tabular-nums" }}>{streak}d racha</span>}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {[
                    { label: "editar", onClick: () => { setEditing(habit); setShowForm(true); } },
                    { label: habit.isArchived ? "restaurar" : "archivar", onClick: () => archive(habit) },
                    { label: "×", onClick: () => remove(habit.id) },
                  ].map(({ label, onClick }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      className="rounded-lg border"
                      style={{
                        borderColor: "var(--border)", color: "var(--muted)", background: "transparent",
                        ...mono, fontSize: "0.58rem", letterSpacing: "0.08em", padding: "0.3rem 0.6rem",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
