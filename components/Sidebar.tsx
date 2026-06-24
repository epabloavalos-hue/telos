"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* toggle button — always visible */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "fixed",
          top: "1.2rem",
          left: collapsed ? "0.75rem" : "13.5rem",
          zIndex: 200,
          width: "1.5rem",
          height: "1.5rem",
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          transition: "left 0.25s ease",
        }}
        title={collapsed ? "Mostrar barra" : "Ocultar barra"}
      >
        {collapsed ? "▸" : "◂"}
      </button>

      <aside
        className="shrink-0 flex flex-col py-10 px-4 border-r overflow-hidden"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          width: collapsed ? "0" : "13rem",
          padding: collapsed ? "0" : undefined,
          transition: "width 0.25s ease",
        }}
      >
        {/* brand */}
        <div className="px-3 mb-10" style={{ whiteSpace: "nowrap" }}>
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
        <nav className="flex flex-col gap-0.5 flex-1" style={{ whiteSpace: "nowrap" }}>
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
        <div className="mt-auto pt-6 border-t" style={{ borderColor: "var(--border)", whiteSpace: "nowrap" }}>
          <Link
            href="/perfil"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
            style={{
              background: path === "/perfil" ? "var(--surface2)" : "transparent",
              color: path === "/perfil" ? "var(--text)" : "var(--muted)",
            }}
          >
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
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 400, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis" }}>
                {settings.userName}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.1em", color: "var(--border)", marginTop: "0.1rem" }}>
                Perfil
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
