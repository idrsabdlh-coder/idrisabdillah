"use client";

import { createContext, useContext, useRef, useState, useCallback, ReactNode } from "react";

type Position = { x: number; y: number };

type DragState = {
  active: boolean;
  key: string | null;
  startX: number;
  startY: number;
};

type DesktopContextType = {
  openWindows: string[];
  toggleWindow: (name: string) => void;
  openWindow: (name: string) => void;
  closeWindow: (name: string) => void;
  isOpen: (name: string) => boolean;
  positions: Record<string, Position>;
  startDrag: (e: React.MouseEvent, key: string) => void;
  projectEntry: string;
  setProjectEntry: (key: string) => void;
};

const DesktopContext = createContext<DesktopContextType | null>(null);

const DEFAULT_POSITIONS: Record<string, Position> = {
  about: { x: -220, y: -60 },
  Resume: { x: 60, y: -40 },
  Projects: { x: 340, y: 60 },
  Music: { x: 0, y: 0 },
  Game: { x: 0, y: 0 },
};

export function DesktopProvider({ children }: { children: ReactNode }) {
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [positions, setPositions] = useState<Record<string, Position>>(DEFAULT_POSITIONS);
  const [projectEntry, setProjectEntry] = useState("tenong");
  const drag = useRef<DragState>({ active: false, key: null, startX: 0, startY: 0 });

  const openWindow = useCallback((name: string) => {
    setOpenWindows((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }, []);

  const closeWindow = useCallback((name: string) => {
    setOpenWindows((prev) => prev.filter((w) => w !== name));
  }, []);

  const toggleWindow = useCallback((name: string) => {
    setOpenWindows((prev) =>
      prev.includes(name) ? prev.filter((w) => w !== name) : [...prev, name]
    );
  }, []);

  const isOpen = useCallback((name: string) => openWindows.includes(name), [openWindows]);

  const startDrag = useCallback(
    (e: React.MouseEvent, key: string) => {
      const pos = positions[key] ?? { x: 0, y: 0 };
      drag.current = {
        active: true,
        key,
        startX: e.clientX - pos.x,
        startY: e.clientY - pos.y,
      };

      const onMouseMove = (ev: MouseEvent) => {
        if (!drag.current.active || !drag.current.key) return;
        const k = drag.current.key;
        setPositions((prev) => ({
          ...prev,
          [k]: {
            x: ev.clientX - drag.current.startX,
            y: ev.clientY - drag.current.startY,
          },
        }));
      };

      const onMouseUp = () => {
        drag.current.active = false;
        drag.current.key = null;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [positions]
  );

  return (
    <DesktopContext.Provider
      value={{
        openWindows,
        toggleWindow,
        openWindow,
        closeWindow,
        isOpen,
        positions,
        startDrag,
        projectEntry,
        setProjectEntry,
      }}
    >
      {children}
    </DesktopContext.Provider>
  );
}

export function useDesktop() {
  const ctx = useContext(DesktopContext);
  if (!ctx) throw new Error("useDesktop must be used within DesktopProvider");
  return ctx;
}
