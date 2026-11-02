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

export type ThemePhase = "pagi" | "siang" | "sore" | "malam";
export type ThemeMode = "auto" | ThemePhase;

export type ThemeContextType = {
  phase: ThemePhase;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isAmbientActive: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "portfolio-theme-mode";

/**
 * Menghitung fase waktu berdasarkan jam lokal pengunjung:
 * - Pagi  : 05:00 – 10:59 (300 - 659 menit)
 * - Siang : 11:00 – 15:59 (660 - 959 menit)
 * - Sore  : 16:00 – 18:29 (960 - 1109 menit)
 * - Malam : 18:30 – 04:59 (1110 - 1439 & 0 - 299 menit)
 */
export function getPhaseFromDate(date: Date = new Date()): ThemePhase {
  const mins = date.getHours() * 60 + date.getMinutes();
  if (mins >= 300 && mins < 660) return "pagi";
  if (mins >= 660 && mins < 960) return "siang";
  if (mins >= 960 && mins < 1110) return "sore";
  return "malam";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default server phase: "malam" (selaras dengan background gelap default)
  const [phase, setPhase] = useState<ThemePhase>("malam");
  const [mode, setModeState] = useState<ThemeMode>("auto");
  const [isAmbientActive, setIsAmbientActive] = useState(false);

  // Menyimpan waktu tinggal di fase yang sama (dalam detik)
  const timeInPhaseRef = useRef(0);
  const isVisibleRef = useRef(true);

  // Inisialisasi dari localStorage di client setelah mount
  useEffect(() => {
    let savedMode: ThemeMode = "auto";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (
        stored === "auto" ||
        stored === "pagi" ||
        stored === "siang" ||
        stored === "sore" ||
        stored === "malam"
      ) {
        savedMode = stored as ThemeMode;
      }
    } catch {
      // Abaikan jika localStorage tidak diizinkan oleh browser
    }

    setModeState(savedMode);
    const initialPhase = savedMode === "auto" ? getPhaseFromDate(new Date()) : savedMode;
    setPhase(initialPhase);
    document.documentElement.setAttribute("data-theme", initialPhase);
  }, []);

  // Update atribut data-theme setiap kali phase berganti
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", phase);
    // Reset waktu fase saat fase berganti
    timeInPhaseRef.current = 0;
    setIsAmbientActive(false);
  }, [phase]);

  // Fungsi pengubah mode dengan penyimpanan localStorage
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // Abaikan jika quota penuh / private mode
    }

    if (newMode === "auto") {
      setPhase(getPhaseFromDate(new Date()));
    } else {
      setPhase(newMode);
    }
  }, []);

  // Timer pengecekan tiap 60 detik (hanya berlaku jika mode === "auto")
  useEffect(() => {
    if (mode !== "auto") return;

    function checkPhase() {
      if (!isVisibleRef.current) return;
      const calculated = getPhaseFromDate(new Date());
      setPhase((prev) => (prev !== calculated ? calculated : prev));
    }

    const interval = setInterval(checkPhase, 60000);
    return () => clearInterval(interval);
  }, [mode]);

  // Timer rotasi tambahan: variasi overlay setelah > 10 menit di satu fase
  // Berhenti ketika tab tidak terlihat (visibilitychange)
  useEffect(() => {
    function handleVisibility() {
      isVisibleRef.current = !document.hidden;
    }

    document.addEventListener("visibilitychange", handleVisibility);

    // Interval tick tiap 10 detik untuk melacak durasi
    const tracker = setInterval(() => {
      if (!isVisibleRef.current) return;
      timeInPhaseRef.current += 10;
      // 10 menit = 600 detik
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
