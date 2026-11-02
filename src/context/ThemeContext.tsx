"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";

export type ThemePhase = "dark" | "light";
export type ThemeMode = "auto" | ThemePhase;

export type ThemeContextType = {
  phase: ThemePhase;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isAmbientActive: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "portfolio-theme-mode";

/** Tema sistem pengunjung: terang atau gelap. */
export function getSystemPhase(): ThemePhase {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default server: "dark" (selaras dengan background gelap default)
  const [phase, setPhase] = useState<ThemePhase>("dark");
  const [mode, setModeState] = useState<ThemeMode>("auto");
  const [isAmbientActive, setIsAmbientActive] = useState(false);

  const timeInPhaseRef = useRef(0);
  const isVisibleRef = useRef(true);

  // Inisialisasi dari localStorage di client setelah mount
  useEffect(() => {
    let savedMode: ThemeMode = "auto";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "auto" || stored === "dark" || stored === "light") {
        savedMode = stored;
      }
    } catch {
      // Abaikan jika localStorage tidak diizinkan oleh browser
    }

    setModeState(savedMode);
    const initialPhase = savedMode === "auto" ? getSystemPhase() : savedMode;
    setPhase(initialPhase);
    document.documentElement.setAttribute("data-theme", initialPhase);
  }, []);

  // Update atribut data-theme setiap kali phase berganti
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", phase);
    timeInPhaseRef.current = 0;
    setIsAmbientActive(false);
  }, [phase]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // Abaikan jika quota penuh / private mode
    }
    setPhase(newMode === "auto" ? getSystemPhase() : newMode);
  }, []);

  // Mode "auto": ikuti perubahan tema sistem secara langsung
  useEffect(() => {
    if (mode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setPhase(mq.matches ? "light" : "dark");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  // Rotasi ambient setelah > 10 menit di satu tema, berhenti saat tab tidak terlihat
  useEffect(() => {
    function handleVisibility() {
      isVisibleRef.current = !document.hidden;
    }
    document.addEventListener("visibilitychange", handleVisibility);

    const tracker = setInterval(() => {
      if (!isVisibleRef.current) return;
      timeInPhaseRef.current += 10;
      if (timeInPhaseRef.current >= 600 && !isAmbientActive) {
        setIsAmbientActive(true);
      }
    }, 10000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(tracker);
    };
  }, [isAmbientActive]);

  return (
    <ThemeContext.Provider value={{ phase, mode, setMode, isAmbientActive }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}