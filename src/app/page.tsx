"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DesktopProvider } from "@/context/DesktopContext";
import { useTheme, ThemePhase } from "@/context/ThemeContext";
import TopBar from "@/components/TopBar";
import Dock from "@/components/Dock";
import DesktopIcons from "@/components/DesktopIcons";
import MobileHome from "@/components/MobileHome";
import AboutWindow from "@/components/windows/AboutWindow";
import ResumeWindow from "@/components/windows/ResumeWindow";
import ProjectsWindow from "@/components/windows/ProjectsWindow";
import MusicWindow from "@/components/windows/MusicWindow";
import GameWindow from "@/components/windows/GameWindow";

const PHASE_STYLES: Record<
  ThemePhase,
  { filter: string; overlay: string; tint: string }
> = {
  pagi: {
    filter: "brightness(1.05) saturate(1.1) hue-rotate(-8deg)",
    overlay:
      "linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(254, 215, 170, 0.15) 50%, rgba(15, 23, 42, 0.35) 100%)",
    tint: "rgba(245, 158, 11, 0.12)",
  },
  siang: {
    filter: "brightness(1.15) saturate(1.15) contrast(1.04)",
    overlay:
      "linear-gradient(180deg, rgba(56, 189, 248, 0.22) 0%, rgba(186, 230, 253, 0.1) 50%, rgba(15, 23, 42, 0.3) 100%)",
    tint: "rgba(14, 165, 233, 0.08)",
  },
  sore: {
    filter: "brightness(0.92) saturate(1.3) hue-rotate(-22deg)",
    overlay:
      "linear-gradient(160deg, rgba(225, 29, 72, 0.35) 0%, rgba(249, 115, 22, 0.25) 45%, rgba(15, 23, 42, 0.6) 100%)",
    tint: "rgba(244, 63, 94, 0.15)",
  },
  malam: {
    filter: "brightness(0.72) saturate(0.9) contrast(1.12) hue-rotate(12deg)",
    overlay:
      "linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(30, 27, 75, 0.45) 50%, rgba(2, 6, 23, 0.8) 100%)",
    tint: "rgba(15, 23, 42, 0.45)",
  },
};

function ParallaxWallpaper() {
  const { phase, isAmbientActive } = useTheme();
  const wrapRef = useRef<HTMLDivElement>(null);

  const [displayedPhase, setDisplayedPhase] = useState<ThemePhase>(phase);
  const [incomingPhase, setIncomingPhase] = useState<ThemePhase | null>(null);
  const [incomingOpacity, setIncomingOpacity] = useState(0);

  // Parallax handling
  useEffect(() => {
    const noHover = window.matchMedia("(hover: none)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (noHover || reducedMotion) return;

    const MAX = 12;

    function handleMouseMove(e: MouseEvent) {
      const el = wrapRef.current;
      if (!el) return;
      const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
      const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.transform = `translate(${-xRatio * MAX}px, ${-yRatio * MAX}px)`;
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Crossfade handling saat fase berubah
  useEffect(() => {
    if (phase === displayedPhase) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplayedPhase(phase);
      setIncomingPhase(null);
      setIncomingOpacity(0);
      return;
    }

    setIncomingPhase(phase);
    // Jalankan transisi opacity di frame berikutnya
    const raf = requestAnimationFrame(() => {
      setIncomingOpacity(1);
    });

    const timer = setTimeout(() => {
      setDisplayedPhase(phase);
      setIncomingPhase(null);
      setIncomingOpacity(0);
    }, 1800);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [phase, displayedPhase]);

  const activeFilter = incomingPhase && incomingOpacity === 1
    ? PHASE_STYLES[incomingPhase].filter
    : PHASE_STYLES[displayedPhase].filter;

  return (
    <div
      ref={wrapRef}
      className={`wallpaper-wrap ${isAmbientActive ? "wallpaper-ambient-active" : ""}`}
    >
      <Image
        src="/images/wallpaper2.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="120vw"
        style={{
          filter: activeFilter,
          transition: "filter 1.8s ease-in-out",
        }}
      />

      {/* Layer Overlay Utama (Base) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: PHASE_STYLES[displayedPhase].overlay,
          backgroundColor: PHASE_STYLES[displayedPhase].tint,
        }}
      />

      {/* Layer Overlay Masuk (Crossfade) */}
      {incomingPhase && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: PHASE_STYLES[incomingPhase].overlay,
            backgroundColor: PHASE_STYLES[incomingPhase].tint,
            opacity: incomingOpacity,
            transition: "opacity 1.8s ease-in-out",
          }}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <DesktopProvider>
      <main className="relative min-h-screen overflow-hidden bg-black theme-transition">
        <ParallaxWallpaper />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        <TopBar />
        <Dock />
        <DesktopIcons />
        <MobileHome />

        <AboutWindow />
        <ResumeWindow />
        <ProjectsWindow />
        <MusicWindow />
        <GameWindow />
      </main>
    </DesktopProvider>
  );
}
