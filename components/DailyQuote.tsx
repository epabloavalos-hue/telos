"use client";
import { getDailyQuote } from "@/lib/utils";

export default function DailyQuote() {
  const quote = getDailyQuote();
  return (
    <p
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 300,
        fontSize: "0.68rem",
        letterSpacing: "0.04em",
        color: "var(--border)",
        lineHeight: 1.6,
        fontStyle: "italic",
        marginTop: "0.6rem",
      }}
    >
      &ldquo;{quote}&rdquo;
    </p>
  );
}
