"use client";
import { useState } from "react";
import { CATEGORIES, TIME_OF_DAY, FREQUENCY, COLORS, ICONS, DAY_NAMES } from "@/lib/utils";

interface HabitData {
  id?: string;
  name: string;
  description: string;
  category: string;
  type: string;
  timeOfDay: string;
  frequency: string;
  specificDays: number[];
  isNumeric: boolean;
  targetValue: string;
  unit: string;
  color: string;
  icon: string;
  reminderTime: string;
}

const defaults: HabitData = {
  name: "",
  description: "",
  category: "SALUD",
  type: "POSITIVE",
  timeOfDay: "ANYTIME",
  frequency: "DAILY",
  specificDays: [],
  isNumeric: false,
  targetValue: "",
  unit: "",
  color: "#888888",
  icon: "○",
  reminderTime: "",
};

const INTERVAL_UNITS = [
  { value: "dias", label: "días" },
  { value: "semanas", label: "semanas" },
  { value: "meses", label: "meses" },
  { value: "años", label: "años" },
];

function parseIntervalFromSpecificDays(freq: string, raw: number[]): { every: number; unit: string } {
  if (freq !== "INTERVAL") return { every: 1, unit: "dias" };
  try {
    const parsed = JSON.parse((raw as unknown as string) ?? "{}");
    return { every: parsed.every ?? 1, unit: parsed.unit ?? "dias" };
  } catch {
    return { every: 1, unit: "dias" };
  }
}

export default function HabitForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<HabitData> & { id?: string };
  onSave: () => void;
  onCancel: () => void;
}) {
  const parsedInterval = parseIntervalFromSpecificDays(
    initial?.frequency ?? "DAILY",
    initial?.specificDays ?? []
  );

  const [form, setForm] = useState<HabitData>({
    ...defaults,
    ...initial,
    specificDays: initial?.frequency === "INTERVAL" ? [] : (initial?.specificDays ?? []),
  });
  const [intervalEvery, setIntervalEvery] = useState(parsedInterval.every);
  const [intervalUnit, setIntervalUnit] = useState(parsedInterval.unit);
  const [saving, setSaving] = useState(false);

  function set(key: keyof HabitData, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleDay(day: number) {
    const days = form.specificDays.includes(day)
      ? form.specificDays.filter((d) => d !== day)
      : [...form.specificDays, day];
    set("specificDays", days);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    const payload = {
      ...form,
      specificDays:
        form.frequency === "CUSTOM"
          ? JSON.stringify(form.specificDays)
          : form.frequency === "INTERVAL"
          ? JSON.stringify({ every: intervalEvery, unit: intervalUnit })
          : null,
      targetValue: form.isNumeric && form.targetValue ? parseFloat(form.targetValue) : null,
    };

    const url = form.id ? `/api/habits/${form.id}` : "/api/habits";
    const method = form.id ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    onSave();
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* nombre + ícono */}
      <div className="flex gap-3">
        <div className="w-14">
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted)" }}>Ícono</label>
          <select
            value={form.icon}
            onChange={(e) => set("icon", e.target.value)}
            className="w-full h-10 rounded-lg border text-center text-lg"
            style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted)" }}>Nombre *</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ej: Meditar 10 minutos"
            className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
            style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>
      </div>

      {/* descripción */}
      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted)" }}>Descripción (opcional)</label>
        <input
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Notas o contexto del hábito"
          className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
          style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
        />
      </div>

      {/* tipo + categoría */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted)" }}>Tipo</label>
          <div className="flex gap-2">
            {[{ v: "POSITIVE", l: "Hacer" }, { v: "NEGATIVE", l: "Evitar" }].map(({ v, l }) => (
              <button
                key={v}
                type="button"
                onClick={() => set("type", v)}
                className="flex-1 py-1.5 rounded-lg text-xs border transition-colors"
                style={{
                  background: form.type === v ? "var(--surface2)" : "transparent",
                  borderColor: form.type === v ? "var(--text)" : "var(--border)",
                  color: form.type === v ? "var(--text)" : "var(--muted)",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted)" }}>Categoría</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full h-9 rounded-lg border px-2 text-sm"
            style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* frecuencia + momento del día */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted)" }}>Frecuencia</label>
          <select
            value={form.frequency}
            onChange={(e) => set("frequency", e.target.value)}
            className="w-full h-9 rounded-lg border px-2 text-sm"
            style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            {FREQUENCY.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted)" }}>Momento del día</label>
          <select
            value={form.timeOfDay}
            onChange={(e) => set("timeOfDay", e.target.value)}
            className="w-full h-9 rounded-lg border px-2 text-sm"
            style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            {TIME_OF_DAY.map((t) => (
              <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* días específicos */}
      {form.frequency === "CUSTOM" && (
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted)" }}>Días específicos</label>
          <div className="flex gap-1.5">
            {DAY_NAMES.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                style={{
                  background: form.specificDays.includes(i) ? "var(--surface2)" : "transparent",
                  borderColor: form.specificDays.includes(i) ? "var(--text)" : "var(--border)",
                  color: form.specificDays.includes(i) ? "var(--text)" : "var(--muted)",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* frecuencia personalizada */}
      {form.frequency === "INTERVAL" && (
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--surface2)", borderColor: "var(--border)" }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.85rem" }}>
            Intervalo
          </p>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.06em", color: "var(--muted)", flexShrink: 0 }}>
              Cada
            </span>

            {/* número 1-10 */}
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setIntervalEvery(n)}
                  className="w-7 h-7 rounded-lg border text-xs transition-colors"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: intervalEvery === n ? "var(--surface)" : "transparent",
                    borderColor: intervalEvery === n ? "var(--text)" : "var(--border)",
                    color: intervalEvery === n ? "var(--text)" : "var(--muted)",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* unidad */}
            <div className="flex gap-1.5 flex-wrap">
              {INTERVAL_UNITS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIntervalUnit(value)}
                  className="px-2.5 h-7 rounded-lg border text-xs transition-colors"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.04em",
                    background: intervalUnit === value ? "var(--surface)" : "transparent",
                    borderColor: intervalUnit === value ? "var(--text)" : "var(--border)",
                    color: intervalUnit === value ? "var(--text)" : "var(--muted)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em", color: "var(--border)", marginTop: "0.75rem" }}>
            Se registrará cada {intervalEvery} {INTERVAL_UNITS.find(u => u.value === intervalUnit)?.label}
          </p>
        </div>
      )}

      {/* hábito numérico */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isNumeric}
            onChange={(e) => set("isNumeric", e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Meta numérica (ej: 8 vasos, 20 páginas)</span>
        </label>
        {form.isNumeric && (
          <div className="flex gap-3 mt-2">
            <input
              type="number"
              value={form.targetValue}
              onChange={(e) => set("targetValue", e.target.value)}
              placeholder="Meta"
              className="w-24 h-9 rounded-lg border px-3 text-sm"
              style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
            />
            <input
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
              placeholder="Unidad (vasos, páginas...)"
              className="flex-1 h-9 rounded-lg border px-3 text-sm"
              style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
        )}
      </div>

      {/* color */}
      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted)" }}>Tono</label>
        <div className="flex gap-1.5 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("color", c)}
              className="w-6 h-6 rounded-sm border transition-all"
              style={{
                background: c,
                borderColor: form.color === c ? "var(--text)" : "var(--border)",
                outline: form.color === c ? "2px solid var(--muted)" : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
      </div>

      {/* recordatorio */}
      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted)" }}>Recordatorio (opcional)</label>
        <input
          type="time"
          value={form.reminderTime}
          onChange={(e) => set("reminderTime", e.target.value)}
          className="h-9 rounded-lg border px-3 text-sm"
          style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
        />
      </div>

      {/* botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
          style={{ borderColor: "var(--text)", color: "var(--text)", background: "transparent" }}
        >
          {saving ? "Guardando..." : form.id ? "Guardar cambios" : "Crear hábito"}
        </button>
      </div>
    </form>
  );
}
