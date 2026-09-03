"use client";

import { useDesktop } from "@/context/DesktopContext";
import { PROJECTS } from "@/lib/data";
import { ICONS } from "@/lib/icons";

export default function DesktopIcons() {
  const { openWindows, closeWindow, openWindow, toggleWindow, setProjectEntry, projectEntry } = useDesktop();
  const keys = Object.keys(PROJECTS);

  function handleProjectClick(key: string) {
    if (openWindows.includes("Projects") && projectEntry === key) {
      closeWindow("Projects");
    } else {
      openWindow("Projects");
      setProjectEntry(key);
    }
  }

  return (
    <div className="hidden md:grid fixed top-20 left-6 z-30 grid-cols-2 gap-x-6 gap-y-8">
      {keys.map((key, idx) => {
        const p = PROJECTS[key];
        return (
          <button
            key={key}
            onClick={() => handleProjectClick(key)}
            className="flex flex-col items-center gap-1.5 w-20 group"
            style={idx % 2 === 1 ? { marginTop: "1.5rem" } : undefined}
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg bg-neutral-800/60 backdrop-blur flex items-center justify-center group-hover:scale-105 transition-transform">
              {p.iconImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.iconImg} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d={ICONS[p.icon]} />
                </svg>
              )}
            </div>
            <span className="text-xs text-white/90 drop-shadow text-center leading-tight">{p.title}</span>
          </button>
        );
      })}

      <button onClick={() => toggleWindow("Music")} className="flex flex-col items-center gap-1.5 w-20 group">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-red-400 via-red-500 to-red-600 flex items-center justify-center shadow-lg ring-1 ring-black/5 group-hover:scale-105 transition-transform overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8 drop-shadow-sm">
            <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <span className="text-xs text-white/90 drop-shadow text-center leading-tight">Music</span>
      </button>
    </div>
  );
}