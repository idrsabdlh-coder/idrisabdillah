"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme, ThemeMode, ThemePhase } from "@/context/ThemeContext";

const SOCIALS = [
  {
    href: "https://www.linkedin.com/in/idris-abdillah-54402a3b7",
    label: "LinkedIn",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z",
  },
  {
    href: "https://github.com/idrsabdlh-coder",
    label: "GitHub",
    path: "M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.23.72-.51v-1.98c-2.93.64-3.55-1.25-3.55-1.25-.48-1.22-1.17-1.55-1.17-1.55-.96-.65.07-.64.07-.64 1.06.07 1.62 1.09 1.62 1.09.94 1.61 2.46 1.14 3.06.87.1-.68.37-1.14.67-1.4-2.34-.27-4.8-1.17-4.8-5.22 0-1.15.41-2.09 1.09-2.83-.11-.27-.47-1.35.1-2.81 0 0 .89-.29 2.9 1.08a10 10 0 0 1 5.28 0c2.01-1.37 2.9-1.08 2.9-1.08.57 1.46.21 2.54.1 2.81.68.74 1.09 1.68 1.09 2.83 0 4.06-2.47 4.95-4.82 5.21.38.33.72.98.72 1.98v2.93c0 .28.19.62.73.51A10.5 10.5 0 0 0 12 1.5Z",
  },
  {
    href: "https://www.instagram.com/idrsabdllh?igsi=eGlwc2U0Nmx0cXFv&utm_source=qr",
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.16.46.35 1.26.4 2.43.07 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.25.07-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.24-1.97.4-2.43A4.9 4.9 0 0 1 3.82 2.95 4.9 4.9 0 0 1 5.6 1.8c.46-.16 1.26-.35 2.43-.4C9.28 1.33 9.68 1.33 12 1.33m0 1.8c-3.15 0-3.52 0-4.76.07-1.03.05-1.6.22-1.97.36-.5.19-.85.43-1.22.8-.37.37-.6.72-.8 1.22-.14.37-.3.94-.36 1.97-.07 1.24-.07 1.6-.07 4.76s0 3.52.07 4.76c.05 1.03.22 1.6.36 1.97.19.5.43.85.8 1.22.37.37.72.6 1.22.8.37.14.94.3 1.97.36 1.24.07 1.6.07 4.76.07s3.52 0 4.76-.07c1.03-.05 1.6-.22 1.97-.36.5-.2.85-.43 1.22-.8.37-.37.6-.72.8-1.22.14-.37.3-.94.36-1.97.07-1.24.07-1.6.07-4.76s0-3.52-.07-4.76c-.05-1.03-.22-1.6-.36-1.97a3.1 3.1 0 0 0-.8-1.22 3.1 3.1 0 0 0-1.22-.8c-.37-.14-.94-.3-1.97-.36-1.24-.07-1.6-.07-4.76-.07Zm0 4.6a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8Zm0 1.8a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm5.6-1.98a1.26 1.26 0 1 1-2.52 0 1.26 1.26 0 0 1 2.52 0Z",
  },
];

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: string; desc: string }[] = [
  { id: "auto", label: "Otomatis", icon: "⚡", desc: "Ikuti Jam Pengunjung" },
  { id: "pagi", label: "Pagi", icon: "🌅", desc: "05:00 – 10:59" },
  { id: "siang", label: "Siang", icon: "☀️", desc: "11:00 – 15:59" },
  { id: "sore", label: "Sore", icon: "🌇", desc: "16:00 – 18:29" },
  { id: "malam", label: "Malam", icon: "🌙", desc: "18:30 – 04:59" },
];

function getThemeSymbol(phase: ThemePhase): string {
  switch (phase) {
    case "pagi":
      return "🌅";
    case "siang":
      return "☀️";
    case "sore":
      return "🌇";
    case "malam":
      return "🌙";
  }
}

export default function TopBar() {
  const [now, setNow] = useState<Date | null>(null);
  const { phase, mode, setMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Tutup menu saat klik di luar
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header
      className="fixed top-0 inset-x-0 z-30 hidden md:flex items-center justify-between px-6 py-2.5 text-sm backdrop-blur-md theme-transition"
      style={{
        backgroundColor: "var(--topbar-bg)",
        color: "var(--topbar-text)",
        borderBottom: "1px solid var(--topbar-border)",
        animationName: "introFadeDown",
        animationDuration: "0.5s",
        animationDelay: "0s",
        animationFillMode: "both",
        animationTimingFunction: "ease-out",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold tracking-wide">Idris Abdillah</span>
      </div>

      <div className="flex items-center gap-4">
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener"
            aria-label={s.label}
            className="topbar-social"
            style={{ color: "var(--topbar-text-muted)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d={s.path} />
            </svg>
          </a>
        ))}

        <span
          className="w-px h-4 theme-transition"
          style={{ backgroundColor: "var(--topbar-border)" }}
        />

        {/* Tombol Tema (macOS Control Center style) */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Pilih Tema"
            aria-expanded={menuOpen}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium theme-transition hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: "var(--dock-bg)",
              border: "1px solid var(--topbar-border)",
              color: "var(--topbar-text)",
            }}
          >
            <span className="text-sm leading-none">{getThemeSymbol(phase)}</span>
            <span className="capitalize">{mode === "auto" ? "Otomatis" : phase}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-3 h-3 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Dropdown Popover */}
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-2xl p-1.5 backdrop-blur-2xl shadow-2xl z-50 animate-[windowIn_0.15s_ease-out] theme-transition"
              style={{
                backgroundColor: "var(--window-titlebar-bg)",
                border: "1px solid var(--window-border)",
                color: "var(--window-text)",
              }}
            >
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Pilih Fase Waktu
              </div>
              <div className="space-y-0.5">
                {THEME_OPTIONS.map((opt) => {
                  const isActive = mode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setMode(opt.id);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                      style={
                        isActive
                          ? {
                              backgroundColor: "var(--theme-accent)",
                              color: "#FFFFFF",
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{opt.icon}</span>
                        <div>
                          <div className="font-medium leading-tight">{opt.label}</div>
                          <div
                            className="text-[10px] leading-tight"
                            style={{
                              color: isActive ? "rgba(255,255,255,0.85)" : "var(--window-titlebar-text)",
                            }}
                          >
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4 text-white shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <span
          className="w-px h-4 theme-transition"
          style={{ backgroundColor: "var(--topbar-border)" }}
        />

        {/* Tanggal & Jam real-time */}
        {now && (
          <div className="flex items-center gap-3">
            <span>
              {now.toLocaleDateString("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="tabular-nums font-medium">
              {now.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
