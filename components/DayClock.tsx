"use client";
import { useEffect, useState } from "react";
import { useSettings } from "@/components/SettingsProvider";

function getTimeData(tz: string) {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const h = parseInt(get("hour"));
  const m = parseInt(get("minute"));
  const s = parseInt(get("second"));

  const timeStr = [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");

  const totalSecondsLeft = (23 - h) * 3600 + (59 - m) * 60 + (59 - s);
  const hoursLeft = Math.floor(totalSecondsLeft / 3600);
  const minutesLeft = Math.floor((totalSecondsLeft % 3600) / 60);
  const urgency = 1 - totalSecondsLeft / 86400;

  return { timeStr, hoursLeft, minutesLeft, urgency };
}

export default function DayClock() {
  const { settings } = useSettings();
  const tz = settings.timezone;
  const [data, setData] = useState(() => getTimeData(tz));

  useEffect(() => {
    setData(getTimeData(tz));
    const id = setInterval(() => setData(getTimeData(tz)), 1000);
    return () => clearInterval(id);
  }, [tz]);

  const urgencyOpacity = 0.3 + data.urgency * 0.7;

  return (
    <div className="flex flex-col items-end justify-center gap-1.5 shrink-0">
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 300,
          fontSize: "1.9rem",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: "var(--text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {data.timeStr}
      </span>

      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 300,
            fontSize: "0.85rem",
            letterSpacing: "-0.01em",
            color: `rgba(232, 232, 240, ${urgencyOpacity})`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {data.hoursLeft}h {data.minutesLeft}m
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.52rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: `rgba(136, 136, 153, ${urgencyOpacity})`,
          }}
        >
          restantes
        </span>
      </div>

      <div style={{ width: "100%", height: "1px", background: "var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${data.urgency * 100}%`,
          background: `rgba(232, 232, 240, ${urgencyOpacity})`,
          transition: "width 1s linear",
        }} />
      </div>
    </div>
  );
}
