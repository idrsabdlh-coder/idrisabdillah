"use client";

import { useEffect, useRef, useState } from "react";
import Window from "@/components/Window";
import { useDesktop } from "@/context/DesktopContext";
import { SONGS } from "@/lib/data";

function formatTime(t: number) {
  if (!t || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function MusicWindow() {
  const { isOpen, closeWindow, positions, startDrag } = useDesktop();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [view, setView] = useState<"list" | "nowplaying">("list");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const current = SONGS[currentIndex];
  const open = isOpen("Music");
  const pos = positions.Music ?? { x: 0, y: 0 };

  // Kalau window ditutup sementara lagu masih main, hentikan
  useEffect(() => {
    if (!open && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [open]);

  function playSong(index: number) {
    setCurrentIndex(index);
    setView("nowplaying");
    // beri waktu render ulang src baru sebelum play
    requestAnimationFrame(() => {
      audioRef.current?.play();
      setIsPlaying(true);
    });
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  function next() {
    const nextIndex = (currentIndex + 1) % SONGS.length;
    setCurrentIndex(nextIndex);
    requestAnimationFrame(() => {
      if (isPlaying) audioRef.current?.play();
    });
  }

  function prev() {
    const prevIndex = (currentIndex - 1 + SONGS.length) % SONGS.length;
    setCurrentIndex(prevIndex);
    requestAnimationFrame(() => {
      if (isPlaying) audioRef.current?.play();
    });
  }

  function stopAndClose() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    closeWindow("Music");
  }

  if (!open) return null;

  return (
    <div
      className="fixed z-40 top-1/2 left-1/2 select-none"
      style={{ transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)` }}
    >
      <div className="relative w-[300px]">
        <div className="bg-white rounded-[28px] shadow-2xl border border-black/10 p-4 pb-6">
          {/* Titlebar */}
          <div
            onMouseDown={(e) => startDrag(e, "Music")}
            className="flex items-center justify-between mb-2 cursor-move"
          >
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                stopAndClose();
              }}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400"
              aria-label="Tutup"
            />
            <span className="text-[10px] text-neutral-400">Music</span>
            <span className="w-3 h-3" />
          </div>

          {/* Screen */}
          <div className="rounded-lg overflow-hidden border-2 border-neutral-300 bg-blue-50">
            <div className="bg-gradient-to-b from-neutral-700 to-neutral-900 text-white text-xs px-3 py-1.5 flex items-center justify-between">
              <button
                onClick={() => view === "nowplaying" && setView("list")}
                className="w-4 flex items-center"
              >
                {view === "nowplaying" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                )}
              </button>
              <span className="font-medium">{view === "list" ? "Music" : "Now Playing"}</span>
              <span className="text-[10px]">🔋</span>
            </div>

            {view === "list" && (
              <div className="h-44 overflow-y-auto bg-white">
                {SONGS.map((song, i) => (
                  <button
                    key={song.title}
                    onClick={() => playSong(i)}
                    className={`w-full text-left px-3 py-2 text-xs border-b border-neutral-100 flex items-center justify-between ${
                      i === currentIndex
                        ? "bg-blue-500 text-white hover:bg-blue-500"
                        : "text-neutral-800 hover:bg-blue-100"
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-[10px] opacity-70 truncate">{song.artist}</p>
                    </div>
                    {i === currentIndex && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            {view === "nowplaying" && (
              <div className="h-44 flex flex-col items-center justify-center px-4 bg-white">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-3 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-neutral-800 text-center truncate w-full">{current.title}</p>
                <p className="text-xs text-neutral-500 text-center truncate w-full">{current.artist}</p>

                <div className="w-full mt-3">
                  <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            )}

            <audio
              ref={audioRef}
              src={current.src}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onEnded={next}
            />
          </div>

          {/* iPod-style click wheel */}
          <div className="relative w-48 h-48 mx-auto mt-5">
            <div className="absolute inset-0 rounded-full bg-neutral-200 shadow-inner" />
            <button onClick={() => setView("list")} className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-neutral-500 tracking-wide">
              MENU
            </button>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
              </svg>
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M16 6h2v12h-2zM5 6v12l8.5-6z" />
              </svg>
            </button>
            <button onClick={togglePlay} className="absolute bottom-2 left-1/2 -translate-x-1/2 text-neutral-500">
              {!isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => (view === "list" ? playSong(currentIndex) : togglePlay())}
              className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white shadow-md hover:bg-neutral-50 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}