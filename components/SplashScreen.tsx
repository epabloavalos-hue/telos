"use client";
import { useEffect, useState } from "react";

// ── Sonido de meditación ──────────────────────────────────────────────────────
// Cuenco tibetano sintético usando Web Audio API
// Frecuencias seleccionadas:
//   108 Hz  — resonancia corporal profunda (432 / 4), valor sagrado en muchas tradiciones
//   432 Hz  — afinación de Verdi, armónica con frecuencias naturales
//   436 Hz  — 4 Hz de diferencia con 432 → crea latido en rango Theta (4-8 Hz),
//              asociado a relajación profunda y meditación
//   864 Hz  — 2º armónico de 432, añade brillo cálido
//  1296 Hz  — 3er armónico, shimmer suave de cuenco
function playBowlSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const totalDuration = 6.5;

    // Intentar reanudar contexto suspendido (iOS Safari)
    if (ctx.state === "suspended") ctx.resume();

    // ── Nodo de reverb artificial (delay en bucle) ──
    const reverbDelay = ctx.createDelay(0.4);
    const reverbFeedback = ctx.createGain();
    const reverbOut = ctx.createGain();
    reverbDelay.delayTime.value = 0.22;
    reverbFeedback.gain.value = 0.38;
    reverbOut.gain.value = 0.28;
    reverbDelay.connect(reverbFeedback);
    reverbFeedback.connect(reverbDelay);
    reverbDelay.connect(reverbOut);

    // ── Filtro de calidez (low-shelf boost) ──
    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowshelf";
    warmth.frequency.value = 300;
    warmth.gain.value = 4;

    // ── Máster ──
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, now);
    master.gain.exponentialRampToValueAtTime(0.55, now + 1.1);   // fade-in suave
    master.gain.setValueAtTime(0.55, now + 4.2);                  // hold
    master.gain.exponentialRampToValueAtTime(0.001, now + totalDuration); // fade-out

    reverbOut.connect(warmth);
    warmth.connect(master);
    master.connect(ctx.destination);

    // ── Capas de osciladores ──
    const layers: { freq: number; gain: number; delay?: number }[] = [
      { freq: 108,  gain: 0.22 },          // resonancia grave del cuerpo
      { freq: 432,  gain: 0.38 },          // fundamental — 432 Hz
      { freq: 436,  gain: 0.14 },          // batimiento Theta (4 Hz con 432)
      { freq: 864,  gain: 0.16, delay: 0.15 },  // 2º armónico, llega ligeramente después
      { freq: 1296, gain: 0.06, delay: 0.3  },  // 3er armónico, shimmer suave
    ];

    layers.forEach(({ freq, gain, delay = 0 }) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Vibrato muy leve (orgánico)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 3.5 + Math.random() * 1.5; // 3.5-5 Hz
      lfoGain.gain.value = freq * 0.0015;              // ±0.15% de desviación
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      g.gain.setValueAtTime(gain, now + delay);

      osc.connect(g);
      g.connect(reverbDelay);
      g.connect(master);   // señal directa también

      lfo.start(now + delay);
      osc.start(now + delay);
      osc.stop(now + totalDuration + 0.5);
      lfo.stop(now + totalDuration + 0.5);
    });

  } catch {
    // Si el navegador bloquea audio, la splash sigue funcionando en silencio
  }
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function SplashScreen() {
  const [fading, setFading] = useState(false);
  const [done, setDone]     = useState(false);

  useEffect(() => {
    playBowlSound();
    const t1 = setTimeout(() => setFading(true), 3900); // 2 segundos más de hold
    const t2 = setTimeout(() => setDone(true),   5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (done) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#0a0a0e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        opacity: fading ? 0 : 1,
        transition: "opacity 1.0s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      {/* logo */}
      <div style={{ position: "relative", animation: "telosLogoIn 1s cubic-bezier(0.16,1,0.3,1) both" }}>

        {/* anillo exterior pulsante */}
        <div style={{
          position: "absolute",
          inset: "-10px",
          borderRadius: "50%",
          border: "1px solid #1a1a28",
          animation: "telosRingIn 1.4s 0.2s ease both",
          opacity: 0,
        }} />

        {/* segundo anillo, más amplio y más sutil */}
        <div style={{
          position: "absolute",
          inset: "-22px",
          borderRadius: "50%",
          border: "1px solid #12121a",
          animation: "telosRingIn 1.8s 0.5s ease both",
          opacity: 0,
        }} />

        {/* SVG logo */}
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ display: "block" }}>
          <circle cx="48" cy="48" r="46" fill="#000000" />
          <circle cx="48" cy="48" r="46" fill="none" stroke="#1e1e2c" strokeWidth="1" />

          {/* triángulo blanco */}
          <polygon
            points="48,19 72,67 24,67"
            fill="#e8e8f0"
            style={{ animation: "telosTriIn 0.6s 0.5s cubic-bezier(0.16,1,0.3,1) both", opacity: 0 }}
          />
          {/* stroke interior sutil */}
          <polygon
            points="48,19 72,67 24,67"
            fill="none"
            stroke="#0a0a0e"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{ animation: "telosTriIn 0.6s 0.5s cubic-bezier(0.16,1,0.3,1) both", opacity: 0 }}
          />
        </svg>
      </div>

      {/* nombre + tagline */}
      <div
        style={{
          textAlign: "center",
          animation: "telosTextIn 0.65s 0.85s ease both",
          opacity: 0,
        }}
      >
        <p style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 300,
          fontSize: "1.6rem",
          letterSpacing: "0.52em",
          color: "#e8e8f0",
          textTransform: "uppercase",
          marginBottom: "0.65rem",
          paddingLeft: "0.52em",
        }}>
          TELOS
        </p>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.48rem",
          letterSpacing: "0.22em",
          color: "#2e2e3e",
          textTransform: "uppercase",
        }}>
          el propósito que mueve todo
        </p>
      </div>

      {/* línea de progreso */}
      <div
        style={{
          position: "absolute",
          bottom: "3rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "3rem",
          height: "1px",
          background: "#12121a",
          overflow: "hidden",
          animation: "telosTextIn 0.4s 1.1s ease both",
          opacity: 0,
        }}
      >
        <div style={{
          position: "absolute",
          left: 0, top: 0, height: "100%",
          background: "#2a2a3a",
          animation: "telosLineSwipe 3.2s 1.2s ease forwards",
          width: "0%",
        }} />
      </div>

      <style>{`
        @keyframes telosLogoIn {
          from { transform: scale(0.72); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes telosRingIn {
          from { transform: scale(0.82); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes telosTriIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes telosTextIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes telosLineSwipe {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
