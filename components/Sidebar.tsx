"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSettings } from "@/components/SettingsProvider";

const nav = [
  { href: "/", label: "Hoy", symbol: "○" },
  { href: "/rutinas", label: "Rutinas", symbol: "◇" },
  { href: "/habitos", label: "Hábitos", symbol: "▸" },
  { href: "/estadisticas", label: "Estadísticas", symbol: "▲" },
  { href: "/analisis", label: "Análisis", symbol: "◈" },
];

export default function Sidebar() {
  const path = usePathname();
  const { settings } = useSettings();

  return (
    <aside
      className="w-52 shrink-0 flex flex-col py-10 px-4 border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* brand */}
      <div className="px-3 mb-10">
        <span
          className="block"
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 300,
            fontSize: "1.25rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--text)",
          }}
        >
          TELOS
        </span>
        <p
          className="mt-1.5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.12em",
            color: "var(--border)",
          }}
        >
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
        </p>
      </div>

      {/* nav links */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {nav.map(({ href, label, symbol }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{
                background: active ? "var(--surface2)" : "transparent",
                color: active ? "var(--text)" : "var(--muted)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  width: "1rem",
                  textAlign: "center",
                  opacity: active ? 1 : 0.35,
                }}
              >
                {symbol}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  fontWeight: active ? 500 : 300,
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* perfil — bottom */}
      <div className="mt-auto pt-6 border-t" style={{ borderColor: "var(--border)" }}>
        <Link
          href="/perfil"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
          style={{
            background: path === "/perfil" ? "var(--surface2)" : "transparent",
            color: path === "/perfil" ? "var(--text)" : "var(--muted)",
          }}
        >
          {/* avatar */}
          <div
            className="shrink-0 rounded-full overflow-hidden flex items-center justify-center"
            style={{ width: "1.6rem", height: "1.6rem", background: "var(--surface2)", border: "1px solid var(--border)" }}
          >
            {settings.photoPath ? (
              <Image
                src={settings.photoPath}
                alt="avatar"
                width={26}
                height={26}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--muted)" }}>
                {settings.userName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 400, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {settings.userName}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.1em", color: "var(--border)", marginTop: "0.1rem" }}>
              Perfil
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
