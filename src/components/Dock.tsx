"use client";

import { useEffect, useRef } from "react";
import { useDesktop } from "@/context/DesktopContext";

export default function Dock() {
  const { toggleWindow, openWindow, setProjectEntry } = useDesktop();
  const dockRef = useRef(null);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const items = Array.from(dock.querySelectorAll(".dock-link"));
    const range = 150;
    const maxScale = 1.4;

    function reset() {
      items.forEach((item) => item.style.removeProperty("--dock-scale"));
    }

    function handleMouseMove(e) {
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const distance = Math.abs(e.clientX - centerX);
        const falloff = Math.max(0, 1 - distance / range);
        item.style.setProperty("--dock-scale", (1 + (maxScale - 1) * falloff).toFixed(2));
      });
    }

    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", reset);

    return () => {
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <ul
        ref={dockRef}
        id="dock"
        className="flex items-end gap-6 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg"
      >
        <li className="dock-item group relative">
          <span className="tooltip">About Me</span>
          <button
            onClick={() => toggleWindow("about")}
            className="dock-link w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white overflow-hidden"
          >
            <img src="/images/profile.jpg" alt="" className="w-full h-full object-cover" />
            <span className="sr-only">About Me</span>
          </button>
        </li>

        <li className="dock-item group relative">
          <span className="tooltip">Resume</span>
          <button
            onClick={() => toggleWindow("Resume")}
            className="dock-link w-14 h-14 rounded-2xl overflow-hidden flex flex-col shadow-sm"
          >
            <div className="h-[35%] bg-gradient-to-b from-amber-300 to-amber-400" />
            <div className="flex-1 bg-white flex flex-col justify-center gap-1.5 px-2.5">
              <div className="h-[2px] bg-neutral-300 rounded-full" />
              <div className="h-[2px] bg-neutral-300 rounded-full w-3/4" />
              <div className="h-[2px] bg-neutral-300 rounded-full w-1/2" />
            </div>
            <span className="sr-only">Resume</span>
          </button>
        </li>

        <li className="dock-item group relative">
          <span className="tooltip">Projects</span>
          <button
            onClick={() => {
              openWindow("Projects");
              setProjectEntry("tenong");
            }}
            className="dock-link w-14 h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden"
          >
            <svg viewBox="0 0 100 100" className="w-10 h-10">
              <ellipse cx="50" cy="24" rx="12" ry="26" fill="#FDCB2E" transform="rotate(0 50 50)" />
              <ellipse cx="50" cy="24" rx="12" ry="26" fill="#F6821F" transform="rotate(60 50 50)" />
              <ellipse cx="50" cy="24" rx="12" ry="26" fill="#EF4444" transform="rotate(120 50 50)" />
              <ellipse cx="50" cy="24" rx="12" ry="26" fill="#A855F7" transform="rotate(180 50 50)" />
              <ellipse cx="50" cy="24" rx="12" ry="26" fill="#3B82F6" transform="rotate(240 50 50)" />
              <ellipse cx="50" cy="24" rx="12" ry="26" fill="#10B981" transform="rotate(300 50 50)" />
              <circle cx="50" cy="50" r="13" fill="white" />
            </svg>
            <span className="sr-only">Projects</span>
          </button>
        </li>

        <li className="dock-item group relative">
          <span className="tooltip">Game</span>
          <button
            onClick={() => toggleWindow("Game")}
            className="dock-link w-14 h-14 rounded-2xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <rect x="2" y="6" width="20" height="12" rx="6" />
              <path d="M6 12h4M8 10v4" />
              <circle cx="15" cy="10.5" r="1" fill="white" />
              <circle cx="18" cy="13.5" r="1" fill="white" />
            </svg>
            <span className="sr-only">Game</span>
          </button>
        </li>

        <li className="w-px h-10 bg-white/20 self-center mx-1" aria-hidden="true" />

        <li className="dock-item group relative">
          <span className="tooltip">Instagram</span>
          <a href="https://www.instagram.com/idrsabdllh?igsi=eGlwc2U0Nmx0cXFv&utm_source=qr" target="_blank" rel="noopener" style={{ background: "linear-gradient(135deg, #fbbf24, #ec4899, #7c3aed)" }} className="dock-link block w-14 h-14 rounded-xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.16.46.35 1.26.4 2.43.07 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.25.07-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.24-1.97.4-2.43A4.9 4.9 0 0 1 3.82 2.95 4.9 4.9 0 0 1 5.6 1.8c.46-.16 1.26-.35 2.43-.4C9.28 1.33 9.68 1.33 12 1.33m0 1.8c-3.15 0-3.52 0-4.76.07-1.03.05-1.6.22-1.97.36-.5.19-.85.43-1.22.8-.37.37-.6.72-.8 1.22-.14.37-.3.94-.36 1.97-.07 1.24-.07 1.6-.07 4.76s0 3.52.07 4.76c.05 1.03.22 1.6.36 1.97.19.5.43.85.8 1.22.37.37.72.6 1.22.8.37.14.94.3 1.97.36 1.24.07 1.6.07 4.76.07s3.52 0 4.76-.07c1.03-.05 1.6-.22 1.97-.36.5-.2.85-.43 1.22-.8.37-.37.6-.72.8-1.22.14-.37.3-.94.36-1.97.07-1.24.07-1.6.07-4.76s0-3.52-.07-4.76c-.05-1.03-.22-1.6-.36-1.97a3.1 3.1 0 0 0-.8-1.22 3.1 3.1 0 0 0-1.22-.8c-.37-.14-.94-.3-1.97-.36-1.24-.07-1.6-.07-4.76-.07Zm0 4.6a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8Zm0 1.8a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm5.6-1.98a1.26 1.26 0 1 1-2.52 0 1.26 1.26 0 0 1 2.52 0Z" />
            </svg>
            <span className="sr-only">Instagram</span>
          </a>
        </li>

        <li className="dock-item group relative">
          <span className="tooltip">GitHub</span>
          <a href="https://github.com/idrsabdlh-coder" target="_blank" rel="noopener" className="dock-link block w-14 h-14 rounded-xl bg-[#181717] flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.23.72-.51v-1.98c-2.93.64-3.55-1.25-3.55-1.25-.48-1.22-1.17-1.55-1.17-1.55-.96-.65.07-.64.07-.64 1.06.07 1.62 1.09 1.62 1.09.94 1.61 2.46 1.14 3.06.87.1-.68.37-1.14.67-1.4-2.34-.27-4.8-1.17-4.8-5.22 0-1.15.41-2.09 1.09-2.83-.11-.27-.47-1.35.1-2.81 0 0 .89-.29 2.9 1.08a10 10 0 0 1 5.28 0c2.01-1.37 2.9-1.08 2.9-1.08.57 1.46.21 2.54.1 2.81.68.74 1.09 1.68 1.09 2.83 0 4.06-2.47 4.95-4.82 5.21.38.33.72.98.72 1.98v2.93c0 .28.19.62.73.51A10.5 10.5 0 0 0 12 1.5Z" />
            </svg>
            <span className="sr-only">GitHub</span>
          </a>
        </li>

        <li className="dock-item group relative">
          <span className="tooltip">LinkedIn</span>
          <a href="https://www.linkedin.com/in/idris-abdillah-54402a3b7" target="_blank" rel="noopener" style={{ background: "#0A66C2" }} className="dock-link block w-14 h-14 rounded-xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z" />
            </svg>
            <span className="sr-only">LinkedIn</span>
          </a>
        </li>

        <li className="dock-item group relative">
          <span className="tooltip">Contact</span>
          <a href="mailto:jafaryabdilah@gmail.com" style={{ background: "linear-gradient(160deg, #60a5fa, #2563eb)" }} className="dock-link block w-14 h-14 rounded-xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <span className="sr-only">Contact</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
