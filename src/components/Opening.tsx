"use client";

import { useEffect, useState } from "react";

const WORDS = ["IDRIS", "ABDILLAH"];

export default function Opening() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const home = document.getElementById("app-root");

    // Pengunjung lama: script di <head> sudah menandai "done" (CSS sudah menyembunyikan
    // overlay), tinggal melepasnya dari DOM.
    if (html.dataset.opening === "done") {
      const raf = requestAnimationFrame(() => setGone(true));
      return () => cancelAnimationFrame(raf);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Kunci scroll + home tidak bisa difokus
    html.style.overflow = "hidden";
    home?.setAttribute("inert", "");

    let exiting = false;
    let finished = false;
    const timers: number[] = [];

    const finish = () => {
      if (finished) return;
      finished = true;
      html.style.overflow = "";
      home?.removeAttribute("inert");
      try {
        sessionStorage.setItem("opening-seen", "1");
      } catch {}
      html.dataset.opening = "done";
      setGone(true); // overlay dilepas dari DOM
    };

    const exit = () => {
      if (exiting) return;
      exiting = true;
      timers.forEach(clearTimeout);
      html.dataset.opening = "exiting"; // memicu animasi masuk menu bar & dock
      timers.push(window.setTimeout(finish, reduce ? 400 : 800));
    };

    // Otomatis keluar setelah huruf selesai + tahan ~0,8 dtk
    timers.push(window.setTimeout(exit, reduce ? 800 : 2300));

    // Skip: klik, tap, atau tombol apa pun
    window.addEventListener("pointerdown", exit);
    window.addEventListener("keydown", exit);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("pointerdown", exit);
      window.removeEventListener("keydown", exit);
      html.style.overflow = "";
      home?.removeAttribute("inert");
    };
  }, []);

  if (gone) return null;

  let i = 0;
  return (
    <aside className="opening" role="status" aria-label="Idris Abdillah Portfolio">
      <span className="opening-sr">Idris Abdillah - Portfolio</span>

      {/* Ambient Celestial Aura */}
      <div className="opening-aura" aria-hidden="true" />

      {/* Minimalist Glassmorphic Emblem */}
      <div className="opening-emblem-wrap" aria-hidden="true">
        <div className="w-14 h-14 rounded-2xl border border-white/20 bg-gradient-to-b from-white/10 to-white/[0.02] backdrop-blur-xl shadow-[0_0_35px_rgba(56,189,248,0.25)] flex items-center justify-center">
          <svg
            className="w-7 h-7 text-white"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="2"
              width="32"
              height="32"
              rx="9"
              stroke="url(#emblem-stroke)"
              strokeWidth="1.5"
            />
            <path
              d="M12 11V25M12 11H9M12 25H9M12 11H15M12 25H15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 11L18 25M24 11L30 25M19.5 20.5H28.5"
              stroke="url(#emblem-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="emblem-stroke"
                x1="0"
                y1="0"
                x2="36"
                y2="36"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="rgba(255,255,255,0.7)" />
                <stop offset="0.5" stopColor="rgba(56,189,248,0.85)" />
                <stop offset="1" stopColor="rgba(255,255,255,0.15)" />
              </linearGradient>
              <linearGradient
                id="emblem-accent"
                x1="18"
                y1="11"
                x2="30"
                y2="25"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Typography: Staggered Letters with Metallic Glow */}
      <div className="opening-name" aria-hidden="true">
        {WORDS.map((word) => (
          <span className="opening-word" key={word}>
            {word.split("").map((ch) => (
              <span
                className="opening-letter"
                style={{ ["--i" as string]: i++ }}
                key={i}
              >
                {ch}
              </span>
            ))}
          </span>
        ))}
      </div>

      {/* Hairline Divider */}
      <div className="opening-divider" aria-hidden="true" />

      {/* Subtitle / Role */}
      <div className="opening-subtitle" aria-hidden="true">
        Creative Developer & Designer
      </div>

      {/* Luminous System Boot Progress Bar */}
      <div className="opening-progress-track" aria-hidden="true">
        <div className="opening-progress-bar" />
      </div>

      {/* Tactile Skip Prompt */}
      <div className="opening-skip" aria-hidden="true">
        <span className="opening-skip-dot" />
        <span>Sentuh atau klik untuk lewati</span>
      </div>
    </aside>
  );
}