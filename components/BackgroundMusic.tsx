"use client";
import { useEffect, useRef, useState } from "react";

const NOTES = [
  130.81, 146.83, 164.81, 196.00,
  220.00, 261.63, 293.66, 329.63, 392.00,
  440.00, 523.25, 587.33, 659.25,
  783.99, 880.00,
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

function buildReverb(ctx: AudioContext): ConvolverNode {
  const rate     = ctx.sampleRate;
  const duration = 5.5;
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
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(velocity * gain, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + rel);
    osc.connect(g);
    g.connect(reverb);
    g.connect(dryMix);
    osc.start(now);
    osc.stop(now + rel + 0.2);
  });
}

function buildDrone(
  ctx: AudioContext,
  reverb: ConvolverNode,
  master: GainNode
): OscillatorNode[] {
  const drones = [
    { freq: 55.00,  gain: 0.045 },
    { freq: 110.00, gain: 0.060 },
    { freq: 164.81, gain: 0.035 },
    { freq: 220.00, gain: 0.030 },
    { freq: 261.63, gain: 0.015 },
  ];

  return drones.map(({ freq, gain }) => {
    const osc  = ctx.createOscillator();
    const g    = ctx.createGain();
    const lfo  = ctx.createOscillator();
    const lfog = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * 6;

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

    if (Math.random() < 0.20) {
      const count    = 2 + Math.floor(Math.random() * 2);
      const interval = 350 + Math.random() * 500;

      for (let i = 0; i < count; i++) {
        const pt = setTimeout(() => {
          if (!runningRef.current) return;
          const patFreq = i === 0 ? freq : pickNote();
          playBell(ctx, reverb, dryMix, patFreq, velocity * 0.85);
        }, i * interval);
        timersRef.current.push(pt);
      }
    } else {
      playBell(ctx, reverb, dryMix, freq, velocity);
    }

    scheduleStream(ctx, reverb, dryMix, runningRef, timersRef, minGap, maxGap);
  }, gap * 1000);

  timersRef.current.push(t);
}

export default function BackgroundMusic() {
  const ctxRef       = useRef<AudioContext | null>(null);
  const masterRef    = useRef<GainNode | null>(null);
  const dronesRef    = useRef<OscillatorNode[]>([]);
  const runningRef   = useRef(true);
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedRef   = useRef(false);
  const graphInitRef = useRef(false);

  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("telos-music-muted") === "1";
  });

  function getStoredVolume(): number {
    if (typeof window === "undefined") return 0.75;
    return parseFloat(localStorage.getItem("telos-music-volume") ?? "0.75");
  }

  function targetGain(): number {
    return muted ? 0.001 : getStoredVolume() * 0.9;
  }

  function initAudioGraph(ctx: AudioContext) {
    if (graphInitRef.current) return;
    graphInitRef.current = true;

    const reverb     = buildReverb(ctx);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.72;
    reverb.connect(reverbGain);

    const dryMix = ctx.createGain();
    dryMix.gain.value = 0.06;

    const master = ctx.createGain();
    masterRef.current = master;
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(targetGain(), ctx.currentTime + 5);

    reverbGain.connect(master);
    dryMix.connect(master);
    master.connect(ctx.destination);

    dronesRef.current = buildDrone(ctx, reverb, master);

    scheduleStream(ctx, reverb, dryMix, runningRef, timersRef, 3, 7);
    const t2 = setTimeout(
      () => scheduleStream(ctx, reverb, dryMix, runningRef, timersRef, 8, 18),
      5000
    );
    timersRef.current.push(t2);
  }

  function start() {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      if (ctx.state === "running") {
        initAudioGraph(ctx);
      } else {
        // iOS Safari — AudioContext suspended until user gesture
        const onStateChange = () => {
          if (ctx.state === "running") {
            ctx.removeEventListener("statechange", onStateChange);
            initAudioGraph(ctx);
          }
        };
        ctx.addEventListener("statechange", onStateChange);
        ctx.resume(); // attempt — succeeds only from gesture context
      }
    } catch {
      // silencio si el navegador bloquea
    }
  }

  useEffect(() => {
    runningRef.current = true;

    const boot = setTimeout(start, 5200);
    timersRef.current.push(boot);

    // iOS Safari: reanudar AudioContext suspendido en primer gesto
    const resume = () => {
      if (ctxRef.current?.state === "suspended") {
        ctxRef.current.resume(); // esto dispara el statechange → initAudioGraph
      }
      if (!startedRef.current) start();
    };
    document.addEventListener("touchstart", resume, { once: true });
    document.addEventListener("click",      resume, { once: true });

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
