"use client";
import { useEffect, useState } from "react";

const PARTICLES = ["○", "●", "◆", "◇", "▲", "△", "✦", "✧"];

interface Particle {
  id: number;
  char: string;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export default function ConfettiEffect({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    const list: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      char: PARTICLES[i % PARTICLES.length],
      x: 5 + Math.random() * 90,
      delay: Math.random() * 0.6,
      duration: 1.4 + Math.random() * 0.8,
      size: 0.55 + Math.random() * 0.45,
    }));
    setParticles(list);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(t);
  }, [active]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            bottom: "0",
            fontFamily: "var(--font-mono)",
            fontSize: `${p.size}rem`,
            color: "var(--muted)",
            animation: `telosFloat ${p.duration}s ${p.delay}s ease-out forwards`,
          }}
        >
          {p.char}
        </span>
      ))}
      <style>{`
        @keyframes telosFloat {
          0%   { transform: translateY(0)   opacity: 0; }
          10%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: translateY(-90vh) rotate(40deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
