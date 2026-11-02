"use client";

import { ReactNode, useEffect, useRef, useState, createContext, useContext } from "react";
import { useDesktop } from "@/context/DesktopContext";

// ─── CloseInterceptor context ─────────────────────────────────────────────────
// Lets WindowTitlebar trigger animated close instead of instant unmount.

type CloseCtx = { requestClose: (name: string) => void };
const CloseContext = createContext<CloseCtx>({ requestClose: () => {} });

export function useWindowClose() {
  return useContext(CloseContext);
}

function CloseInterceptor({
  name,
  onClose,
  children,
}: {
  name: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const value: CloseCtx = {
    requestClose: (n: string) => {
      if (n === name) onClose();
    },
  };
  return <CloseContext.Provider value={value}>{children}</CloseContext.Provider>;
}

// ─── Window ───────────────────────────────────────────────────────────────────

type WindowProps = {
  name: string;
  widthClass?: string;
  children: ReactNode;
};

export default function Window({ name, widthClass = "w-[36rem]", children }: WindowProps) {
  const { isOpen, closeWindow, positions, activeWindow, setActiveWindow } = useDesktop();
  const [isDesktop, setIsDesktop] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Reset isClosing when window is re-opened
  useEffect(() => {
    if (isOpen(name)) {
      setIsClosing(false);
    }
  }, [isOpen, name]);

  // Not open and not in closing animation → render nothing
  if (!isOpen(name) && !isClosing) return null;

  const pos = positions[name] ?? { x: 0, y: 0 };
  const isActive = activeWindow === name;

  function handleMouseDown() {
    setActiveWindow(name);
  }

  // MOBILE: full-screen ala buka app di iPhone
  if (!isDesktop) {
    return (
      <div
        className="fixed inset-0 z-40 flex flex-col animate-[mobileWindowIn_0.25s_ease-out] theme-transition"
        style={{
          backgroundColor: "var(--window-bg)",
          color: "var(--window-text)",
        }}
      >
        {children}
      </div>
    );
  }

  // DESKTOP: window mengambang ala macOS, bisa di-drag
  return (
    <div
      className="fixed top-1/2 left-1/2"
      style={{
        transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
        zIndex: isActive ? 50 : 40,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`relative ${widthClass} max-w-[92vw] max-h-[80vh] rounded-2xl
                    overflow-hidden flex flex-col theme-transition
                    ${isClosing
                      ? "animate-[windowOut_0.18s_ease-in_forwards]"
                      : "animate-[windowIn_0.22s_cubic-bezier(0.34,1.56,0.64,1)_both]"
                    }`}
        style={{
          backgroundColor: "var(--window-bg)",
          color: "var(--window-text)",
          border: "1px solid var(--window-border)",
          boxShadow: isActive ? "var(--window-shadow-active)" : "var(--window-shadow-inactive)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <CloseInterceptor
          name={name}
          onClose={() => {
            setIsClosing(true);
            closeTimer.current = setTimeout(() => {
              closeWindow(name);
              setIsClosing(false);
            }, 180);
          }}
        >
          {children}
        </CloseInterceptor>
      </div>
    </div>
  );
}
