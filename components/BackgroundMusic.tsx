"use client";
import { useEffect, useRef, useState } from "react";

// ── Escala pentatónica en La menor ────────────────────────────────────────────
// A C D E G — frecuencias (Hz) en varios registros, sesgadas al registro medio
const NOTES = [
  130.81, 146.83, 164.81, 196.00,                   // C3 D3 E3 G3
  220.00, 261.63, 293.66, 329.63, 392.00,            // A3 C4 D4 E4 G4
  440.00, 523.25, 587.33, 659.25,                    // A4 C5 D5 E5
  783.99, 880.00,                                    // G5 A5
];
const WEIGHTS = [1, 1, 1, 1, 2, 3, 4, 3, 2, 3, 4, 3, 2, 1, 1];

function pickNote(): number {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WEIGHTS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return NOTES[i];
  }
  return NOTES[7];
}

// ── Reverb algorítmico ────────────────────────────────────────────────────────
// Genera un buffer de ruido con decaimiento exponencial como impulso de convolución
function buildReverb(ctx: AudioContext): ConvolverNode {
  const rate     = ctx.sampleRate;
  const duration = 5.5;     // cola de reverb: 5.5 segundos
  const decay    = 2.8;
  const buf      = ctx.createBuffer(2, rate * duration, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, decay);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

// ── Tono de campana real ───────────────────────────────────────────────────────
// Las campanadas reales tienen parciales INARMÓNICOS (no múltiplos enteros).
// Ratios de Helmholtz para campanas metálicas: 1 · 2.76 · 5.40 · 8.93
// Cada parcial decae a diferente velocidad (los agudos más rápido).
function playBell(
  ctx: AudioContext,
  reverb: ConvolverNode,
  dryMix: GainNode,
  freq: number,
  velocity = 0.18
) {
  const now      = ctx.currentTime;
  const partials = [
    { ratio: 1.00,  rel: 4.5,  gain: 1.00 },
    { ratio: 2.76,  rel: 2.8,  gain: 0.55 },
    { ratio: 5.40,  rel: 1.8,  gain: 0.28 },
    { ratio: 8.93,  rel: 1.1,  gain: 0.12 },
    { ratio: 13.34, rel: 0.7,  gain: 0.05 },
  ];

  partials.forEach(({ ratio, rel, gain }) => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;

    // Ataque ultra rápido, decaimiento natural
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(velocity * gain, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + rel);

    osc.connect(g);
    g.connect(reverb);    // señal wet
    g.connect(dryMix);   // toque de señal dry
    osc.start(now);
    osc.stop(now + rel + 0.2);
  });
}

// ── Pad de dron (cuerdas/pad ambient) ────────────────────────────────────────
// Crea un colchón de tonos base A2–A3 con vibrato lentísimo
function buildDrone(
  ctx: AudioContext,
  reverb: ConvolverNode,
  master: GainNode
): OscillatorNode[] {
  const drones = [
    { freq: 55.00,  gain: 0.045 },  // A1 — earth tone
    { freq: 110.00, gain: 0.060 },  // A2 — base
    { freq: 164.81, gain: 0.035 },  // E3 — quinta perfecta
    { freq: 220.00, gain: 0.030 },  // A3 — octava
    { freq: 261.63, gain: 0.015 },  // C4 — tercera menor (color sombrío)
  ];

  return drones.map(({ freq, gain }) => {
    const osc  = ctx.createOscillator();
    const g    = ctx.createGain();
    const lfo  = ctx.createOscillator();  // vibrato muy lento
    const lfog = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    // Micro-desafinación aleatoria para calidez (+/- 3 cents)
    osc.detune.value = (Math.random() - 0.5) * 6;

    // LFO de amplitud: 0.04–0.12 Hz (ciclo de 8–25s)
    lfo.type = "sine";
    lfo.frequency.value = 0.04 + Math.random() * 0.08;
    lfog.gain.value = gain * 0.25;
    lfo.connect(lfog);
    lfog.connect(g.gain);

    g.gain.value = gain;

    osc.connect(g);
    g.connect(reverb);
    g.connect(master);

    lfo.start();
    osc.start();

    return osc;
  });
}

// ── Planificador de notas generativo ─────────────────────────────────────────
// Crea dos flujos: uno frecuente, uno esporádico. Ocasionalmente toca
// un patrón de 2-3 notas seguidas (como los "dings" de Monument Valley).
function scheduleStream(
  ctx: AudioContext,
  reverb: ConvolverNode,
  dryMix: GainNode,
  runningRef: React.MutableRefObject<boolean>,
  timersRef: React.MutableRefObject<ReturnType<typeof setTimeout>[]>,
  minGap: number,
  maxGap: number
) {
  if (!runningRef.current) return;

  const gap = minGap + Math.random() * (maxGap - minGap);
  const t   = setTimeout(() => {
    if (!runningRef.current) return;

    const freq     = pickNote();
    const velocity = 0.10 + Math.random() * 0.12;

    // 20% chance de patrón (2-3 notas seguidas a ritmo libre)
    if (Math.random() < 0.20) {
      const count    = 2 + Math.floor(Math.random() * 2);   // 2 o 3 notas
      const interval = 350 + Math.random() * 500;           // 350–850ms entre notas

      for (let i = 0; i < count; i++) {
        const pt = setTimeout(() => {
          if (!runningRef.current) return;
          // Notas del patrón: raíz + nota vecina de la escala
          const patFreq = i === 0 ? freq : pickNote();
          playBell(ctx, reverb, dryMix, patFreq, velocity * 0.85);
        }, i * interval);
        timersRef.current.push(pt);
      }
    } else {
      // Nota sola
      playBell(ctx, reverb, dryMix, freq, velocity);
    }

    scheduleStream(ctx, reverb, dryMix, runningRef, timersRef, minGap, maxGap);
  }, gap * 1000);

  timersRef.current.push(t);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BackgroundMusic() {
  const ctxRef      = useRef<AudioContext | null>(null);
  const masterRef   = useRef<GainNode | null>(null);
  const dronesRef   = useRef<OscillatorNode[]>([]);
  const runningRef  = useRef(true);
  const timersRef   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedRef  = useRef(false);

  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("telos-music-muted") === "1";
  });

  function getStoredVolume(): number {
    if (typeof window === "undefined") return 0.75;
    return parseFloat(localStorage.getItem("telos-music-volume") ?? "0.75");
  }

  // Volumen = fracción almacenada × 0.9 (headroom para no saturar)
  function targetGain(): number {
    return muted ? 0.001 : getStoredVolume() * 0.9;
  }

  function start() {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();

      // ── Reverb ──
      const reverb     = buildReverb(ctx);
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.72;
      reverb.connect(reverbGain);

      // ── Señal seca (muy sutil) ──
      const dryMix = ctx.createGain();
      dryMix.gain.value = 0.06;

      // ── Master con fade-in ──
      const master = ctx.createGain();
      masterRef.current = master;
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(
        targetGain(),
        ctx.currentTime + 5   // fade-in de 5 segundos
      );

      reverbGain.connect(master);
      dryMix.connect(master);
      master.connect(ctx.destination);

      // ── Dron ──
      dronesRef.current = buildDrone(ctx, reverb, master);

      // ── Melodía generativa — dos flujos ──
      // Flujo 1: notas frecuentes (cada 3–7s)
      scheduleStream(ctx, reverb, dryMix, runningRef, timersRef, 3, 7);

      // Flujo 2: notas esporádicas (cada 8–18s), empieza con delay
      const t2 = setTimeout(
        () => scheduleStream(ctx, reverb, dryMix, runningRef, timersRef, 8, 18),
        5000
      );
      timersRef.current.push(t2);

    } catch {
      // Si el navegador bloquea: silencio sin error
    }
  }

  useEffect(() => {
    runningRef.current = true;

    // Arrancar música después del splash (~5s)
    const boot = setTimeout(start, 5200);
    timersRef.current.push(boot);

    // iOS Safari: reanudar AudioContext en primer toque
    const resume = () => {
      ctxRef.current?.resume();
      if (!startedRef.current) start();
    };
    document.addEventListener("touchstart", resume, { once: true });
    document.addEventListener("click",      resume, { once: true });

    // Cambio de volumen desde Mi Perfil
    const onVolumeChange = (e: Event) => {
      const vol = (e as CustomEvent<{ volume: number }>).detail.volume;
      if (!masterRef.current || !ctxRef.current) return;
      if (muted) return;
      const now = masterRef.current.context.currentTime;
      masterRef.current.gain.cancelScheduledValues(now);
      masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, now);
      masterRef.current.gain.linearRampToValueAtTime(vol * 0.9, now + 0.2);
    };
    window.addEventListener("telos-volume-change", onVolumeChange);

    return () => {
      runningRef.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      document.removeEventListener("touchstart", resume);
      document.removeEventListener("click",      resume);
      window.removeEventListener("telos-volume-change", onVolumeChange);

      dronesRef.current.forEach((osc) => {
        try { osc.stop(); } catch {}
      });

      if (masterRef.current && ctxRef.current) {
        const now = ctxRef.current.currentTime;
        masterRef.current.gain.cancelScheduledValues(now);
        masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, now);
        masterRef.current.gain.linearRampToValueAtTime(0.001, now + 1.5);
        setTimeout(() => ctxRef.current?.close(), 2000);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mute / unmute
  useEffect(() => {
    localStorage.setItem("telos-music-muted", muted ? "1" : "0");
    if (!masterRef.current || !ctxRef.current) return;
    const now = ctxRef.current.currentTime;
    masterRef.current.gain.cancelScheduledValues(now);
    masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, now);
    masterRef.current.gain.linearRampToValueAtTime(
      muted ? 0.001 : getStoredVolume() * 0.9,
      now + 1.2
    );
  }, [muted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      onClick={() => setMuted((v) => !v)}
      title={muted ? "Activar música ambient" : "Silenciar música"}
      style={{
        position: "fixed",
        bottom: "1.6rem",
        right: "1.6rem",
        zIndex: 9000,
        width: "2.2rem",
        height: "2.2rem",
        borderRadius: "50%",
        border: `1px solid var(--border)`,
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        color: muted ? "var(--border)" : "var(--muted)",
        transition: "color 0.4s, border-color 0.4s",
        flexShrink: 0,
      }}
    >
      {muted ? "○" : "◉"}
    </button>
  );
}
