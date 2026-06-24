"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSettings } from "@/components/SettingsProvider";
import { TIMEZONES, getRegions, getCurrentTimeInTZ } from "@/lib/timezones";

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

export default function PerfilPage() {
  const { settings, refresh } = useSettings();

  const [userName, setUserName] = useState(settings.userName);
  const [language, setLanguage] = useState(settings.language);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [musicVolume, setMusicVolume] = useState(0.75);
  const [tzSearch, setTzSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(settings.photoPath);
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // sync when settings load
  useEffect(() => {
    setUserName(settings.userName);
    setLanguage(settings.language);
    setTimezone(settings.timezone);
    setSoundEnabled(settings.soundEnabled);
    setPreviewUrl(settings.photoPath);
  }, [settings]);

  // leer volumen de localStorage solo en cliente (evita hydration mismatch)
  useEffect(() => {
    const stored = localStorage.getItem("telos-music-volume");
    if (stored !== null) setMusicVolume(parseFloat(stored));
  }, []);

  // live clock para las zonas horarias — solo cliente
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  function handleVolumeChange(vol: number) {
    setMusicVolume(vol);
    localStorage.setItem("telos-music-volume", String(vol));
    window.dispatchEvent(new CustomEvent("telos-volume-change", { detail: { volume: vol } }));
  }

  const regions = getRegions();
  const filtered = TIMEZONES.filter(
    (t) =>
      t.city.toLowerCase().includes(tzSearch.toLowerCase()) ||
      t.country.toLowerCase().includes(tzSearch.toLowerCase()) ||
      t.region.toLowerCase().includes(tzSearch.toLowerCase())
  );

  async function saveProfile() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, language, timezone, soundEnabled }),
    });
    await refresh();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);

    // preview inmediato
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/profile/photo", { method: "POST", body: fd });
    const data = await res.json();
    if (data.photoPath) setPreviewUrl(data.photoPath);
    await refresh();
    setUploadingPhoto(false);
  }

  const monoSm = { fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "var(--muted)" };
  const card = { background: "var(--surface)", borderColor: "var(--border)" };

  return (
    <div className="max-w-xl mx-auto">
      {/* header */}
      <div className="mb-10">
        <p style={{ ...monoSm, marginBottom: "0.5rem" }}>Cuenta</p>
        <h1 style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: "1.9rem", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Mi Perfil.
        </h1>
      </div>

      {/* ── FOTO DE PERFIL ─────────────────────── */}
      <div className="rounded-2xl border p-6 mb-4" style={card}>
        <p style={monoSm} className="mb-5">Foto de perfil</p>

        <div className="flex items-center gap-6">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto}
            className="shrink-0 rounded-full overflow-hidden flex items-center justify-center relative group"
            style={{ width: "4.5rem", height: "4.5rem", background: "var(--surface2)", border: "1px solid var(--border)" }}
          >
            {previewUrl ? (
              <Image src={previewUrl} alt="avatar" fill className="object-cover" unoptimized />
            ) : (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 300, color: "var(--muted)" }}>
                {userName.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.12em", color: "#fff" }}>
                {uploadingPhoto ? "..." : "CAMBIAR"}
              </span>
            </div>
          </button>

          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "0.82rem", color: "var(--text)", marginBottom: "0.25rem" }}>
              {previewUrl ? "Foto cargada" : "Sin foto de perfil"}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", color: "var(--muted)" }}>
              JPG o PNG · máx 5 MB
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-2 rounded-lg border px-3 py-1"
              style={{ borderColor: "var(--border)", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", background: "transparent" }}
            >
              Seleccionar archivo
            </button>
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
      </div>

      {/* ── NOMBRE ───────────────────────────── */}
      <div className="rounded-2xl border p-6 mb-4" style={card}>
        <p style={monoSm} className="mb-4">Nombre</p>
        <input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 outline-none"
          style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)", fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "0.9rem" }}
          placeholder="Tu nombre"
        />
      </div>

      {/* ── IDIOMA ───────────────────────────── */}
      <div className="rounded-2xl border p-6 mb-4" style={card}>
        <p style={monoSm} className="mb-4">Idioma</p>
        <div className="flex gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              onClick={() => setLanguage(l.value)}
              className="flex-1 py-2.5 rounded-xl border transition-colors"
              style={{
                background: language === l.value ? "var(--surface2)" : "transparent",
                borderColor: language === l.value ? "var(--text)" : "var(--border)",
                color: language === l.value ? "var(--text)" : "var(--muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                letterSpacing: "0.1em",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SONIDO ───────────────────────────── */}
      <div className="rounded-2xl border p-6 mb-4" style={card}>
        <p style={monoSm} className="mb-1">Sonido al completar</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.1em", color: "var(--border)", marginBottom: "1rem" }}>
          Tono suave al marcar un hábito como completado
        </p>
        <button
          onClick={() => setSoundEnabled((v) => !v)}
          className="flex items-center gap-3"
          type="button"
        >
          <div
            className="relative rounded-full transition-colors"
            style={{
              width: "2.4rem", height: "1.3rem",
              background: soundEnabled ? "var(--muted)" : "var(--surface2)",
              border: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <div style={{
              position: "absolute", top: "0.15rem",
              left: soundEnabled ? "1.15rem" : "0.15rem",
              width: "0.9rem", height: "0.9rem",
              borderRadius: "50%",
              background: soundEnabled ? "var(--text)" : "var(--border)",
              transition: "left 0.2s ease",
            }} />
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.06em", color: soundEnabled ? "var(--text)" : "var(--muted)" }}>
            {soundEnabled ? "Activado" : "Desactivado"}
          </span>
        </button>
      </div>

      {/* ── MÚSICA AMBIENT ───────────────────── */}
      <div className="rounded-2xl border p-6 mb-4" style={card}>
        <p style={monoSm} className="mb-1">Música ambient</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.1em", color: "var(--border)", marginBottom: "1.4rem" }}>
          Volumen de la música generativa de fondo
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          {/* icono mínimo */}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: musicVolume === 0 ? "var(--border)" : "var(--muted)", flexShrink: 0 }}>
            ○
          </span>

          {/* slider */}
          <div style={{ flex: 1, position: "relative" }}>
            {/* track de fondo */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: 0, right: 0,
              height: "1px",
              background: "var(--border)",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }} />
            {/* track de relleno */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${musicVolume * 100}%`,
              height: "1px",
              background: "var(--muted)",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              transition: "width 0.05s linear",
            }} />
            <input
              type="range"
              min={0} max={100}
              value={Math.round(musicVolume * 100)}
              onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
              style={{
                width: "100%",
                appearance: "none",
                WebkitAppearance: "none",
                background: "transparent",
                cursor: "pointer",
                height: "1.6rem",
                margin: 0,
                position: "relative",
                zIndex: 1,
              }}
            />
          </div>

          {/* icono lleno */}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: musicVolume > 0 ? "var(--muted)" : "var(--border)", flexShrink: 0 }}>
            ◉
          </span>

          {/* valor numérico */}
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.04em",
            color: "var(--muted)",
            minWidth: "2.2rem",
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
            flexShrink: 0,
          }}>
            {Math.round(musicVolume * 100)}%
          </span>
        </div>

        {/* estilos del thumb nativo */}
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px; height: 14px;
            border-radius: 50%;
            background: var(--text);
            border: none;
            cursor: pointer;
            box-shadow: none;
          }
          input[type=range]::-moz-range-thumb {
            width: 14px; height: 14px;
            border-radius: 50%;
            background: var(--text);
            border: none;
            cursor: pointer;
          }
          input[type=range]:focus { outline: none; }
        `}</style>
      </div>

      {/* ── ZONA HORARIA ─────────────────────── */}
      <div className="rounded-2xl border p-6 mb-6" style={card}>
        <div className="flex items-start justify-between mb-1">
          <p style={monoSm}>Zona horaria</p>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.06em", color: "var(--muted)" }}>
            {mounted ? getCurrentTimeInTZ(timezone) : "--:--"} — {TIMEZONES.find((t) => t.tz === timezone)?.city ?? timezone}
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.1em", color: "var(--border)", marginBottom: "1.2rem" }}>
          Ajusta el tiempo al lugar donde estés viajando
        </p>

        {/* buscador */}
        <input
          value={tzSearch}
          onChange={(e) => setTzSearch(e.target.value)}
          placeholder="Buscar ciudad o país..."
          className="w-full rounded-xl border px-4 py-2 outline-none mb-3"
          style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.06em" }}
        />

        {/* lista de ciudades */}
        <div
          className="overflow-y-auto rounded-xl border"
          style={{ maxHeight: "16rem", borderColor: "var(--border)" }}
        >
          {(tzSearch
            ? [{ region: "Resultados", cities: filtered }]
            : regions.map((r) => ({ region: r, cities: TIMEZONES.filter((t) => t.region === r) }))
          ).map(({ region, cities }) => (
            <div key={region}>
              <div
                className="px-4 py-1.5 sticky top-0"
                style={{ background: "var(--surface)", borderBottom: `1px solid var(--border)` }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--border)" }}>
                  {region}
                </span>
              </div>
              {cities.map((t) => {
                const active = timezone === t.tz && TIMEZONES.find((x) => x.tz === t.tz && x.city === t.city);
                const isSelected = timezone === t.tz && t.city === (TIMEZONES.find((x) => x.tz === timezone)?.city);
                return (
                  <button
                    key={`${t.city}-${t.tz}`}
                    onClick={() => setTimezone(t.tz)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
                    style={{
                      background: isSelected ? "var(--surface2)" : "transparent",
                      borderBottom: `1px solid var(--border)`,
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: isSelected ? 400 : 300, fontSize: "0.8rem", color: isSelected ? "var(--text)" : "var(--muted)" }}>
                        {t.city}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.08em", color: "var(--border)", marginLeft: "0.5rem" }}>
                        {t.country}
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.04em", color: isSelected ? "var(--text)" : "var(--border)", fontVariantNumeric: "tabular-nums" }}>
                      {mounted ? getCurrentTimeInTZ(t.tz) : "--:--"}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── GUARDAR ──────────────────────────── */}
      <button
        onClick={saveProfile}
        disabled={saving}
        className="w-full py-3 rounded-2xl border transition-colors"
        style={{
          borderColor: saved ? "var(--text)" : "var(--border)",
          color: saved ? "var(--text)" : "var(--muted)",
          background: "transparent",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {saving ? "Guardando..." : saved ? "✓  Guardado" : "Guardar cambios"}
      </button>
    </div>
  );
}
