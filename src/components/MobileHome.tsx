"use client";

import { useRef, useState } from "react";
import { useDesktop } from "@/context/DesktopContext";
import { PROJECTS } from "@/lib/data";
import { ICONS } from "@/lib/icons";

type MobileApp = {
  key: string;
  title: string;
  kind: "about" | "project" | "music";
  iconImg?: string;
  icon?: string;
  emoji?: string;
  color?: string;
};

export default function MobileHome() {
  const { openWindow, setProjectEntry } = useDesktop();

  const mobileApps: MobileApp[] = [
    { key: "about", title: "About Me", kind: "about", color: "bg-blue-500", emoji: "👤" },
    ...Object.keys(PROJECTS).map((k) => ({
      key: k,
      title: PROJECTS[k].title,
      kind: "project" as const,
      iconImg: PROJECTS[k].iconImg,
      icon: PROJECTS[k].icon,
    })),
    {
      key: "Music",
      title: "Music",
      kind: "music",
      color: "bg-gradient-to-b from-[#FF6B7A] via-[#FC3C55] to-[#D8102E]",
    },
  ];

  const perPage = 8;
  const [currentPage, setCurrentPage] = useState(0);
  const touchStartX = useRef(0);

  const pages: MobileApp[][] = [];
  for (let i = 0; i < mobileApps.length; i += perPage) {
    pages.push(mobileApps.slice(i, i + perPage));
  }

  function openApp(app: MobileApp) {
    if (app.kind === "about") {
      openWindow("about");
    } else if (app.kind === "project") {
      openWindow("Projects");
      setProjectEntry(app.key);
    } else if (app.kind === "music") {
      openWindow("Music");
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50 && currentPage > 0) setCurrentPage((p) => p - 1);
    if (diff < -50 && currentPage < pages.length - 1) setCurrentPage((p) => p + 1);
  }

  return (
    <div className="block md:hidden fixed inset-0 z-20 overflow-hidden">
      {/* Status bar ala iOS */}
      <div className="pt-3 px-6 flex items-center justify-between text-white text-sm font-semibold">
        <span />
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M2 22h2v-2H2v2zm4 0h2v-6H6v6zm4 0h2v-10h-2v10zm4 0h2v-14h-2v14zm4 0h2V4h-2v18z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.24 4.24 0 0 0-6 0zm-4-4l2 2a7.07 7.07 0 0 1 10 0l2-2a10 10 0 0 0-14 0z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-6 h-4">
            <rect x="1" y="6" width="19" height="12" rx="2" />
            <rect x="22" y="9" width="1.5" height="6" />
          </svg>
        </div>
      </div>

      {/* App grid dengan swipe antar halaman */}
      <div
        className="mt-8 h-[calc(100%-180px)] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            width: `${pages.length * 100}%`,
            transform: `translateX(-${currentPage * (100 / pages.length)}%)`,
          }}
        >
          {pages.map((page, pIdx) => (
            <div
              key={pIdx}
              className="grid grid-cols-4 gap-x-4 gap-y-6 px-6 content-start"
              style={{ width: `${100 / pages.length}%` }}
            >
              {page.map((app) => (
                <button key={app.key} onClick={() => openApp(app)} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-14 h-14 rounded-2xl shadow-md flex items-center justify-center overflow-hidden relative ${
                      app.color || "bg-neutral-800"
                    }`}
                  >
                    {app.iconImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={app.iconImg} alt={app.title} className="w-full h-full object-cover" />
                    ) : app.emoji ? (
                      <span className="text-2xl">{app.emoji}</span>
                    ) : app.kind === "music" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="absolute w-7 h-7">
                        <path
                          d="M9 17.5V6.2c0-.45.3-.83.73-.93l9-2.1c.6-.14 1.17.32 1.17.94v11.4"
                          fill="none"
                          stroke="white"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <ellipse cx="6.5" cy="17.5" rx="2.5" ry="2" fill="white" />
                        <ellipse cx="17.5" cy="15.4" rx="2.5" ry="2" fill="white" />
                      </svg>
                    ) : app.icon ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                        <path d={ICONS[app.icon]} />
                      </svg>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-white drop-shadow text-center leading-tight">{app.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicator halaman */}
      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${currentPage === i ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}

      {/* Dock bawah (4 app favorit) */}
      <div className="absolute bottom-0 inset-x-0 pb-6 pt-3 px-5 bg-white/10 backdrop-blur-xl rounded-t-3xl">
        <div className="flex justify-around">
          <a href="mailto:jafaryabdilah@gmail.com" className="w-14 h-14 rounded-2xl bg-blue-500 shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" className="w-6 h-6">
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </a>
          <a href="https://github.com/idrsabdlh-coder" target="_blank" className="w-14 h-14 rounded-2xl bg-neutral-900 shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.94c-2.78.62-3.37-1.36-3.37-1.36-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/idris-abdillah-54402a3b7" target="_blank" className="w-14 h-14 rounded-2xl bg-blue-600 shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
            </svg>
          </a>
          <button
            onClick={() => openWindow("Music")}
            className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#FF6B7A] via-[#FC3C55] to-[#D8102E] shadow-md flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M9 17.5V6.2c0-.45.3-.83.73-.93l9-2.1c.6-.14 1.17.32 1.17.94v11.4" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="6.5" cy="17.5" rx="2.5" ry="2" fill="white" />
              <ellipse cx="17.5" cy="15.4" rx="2.5" ry="2" fill="white" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}