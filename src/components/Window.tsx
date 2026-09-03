"use client";

import { ReactNode, useEffect, useState } from "react";
import { useDesktop } from "@/context/DesktopContext";

type WindowProps = {
  name: string;
  widthClass?: string;
  children: ReactNode;
};

export default function Window({ name, widthClass = "w-[36rem]", children }: WindowProps) {
  const { isOpen, positions } = useDesktop();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!isOpen(name)) return null;

  const pos = positions[name] ?? { x: 0, y: 0 };

  // MOBILE: full-screen ala buka app di iPhone
  if (!isDesktop) {
    return (
      <div className="fixed inset-0 z-40 bg-white text-neutral-800 flex flex-col animate-[mobileWindowIn_0.25s_ease-out]">
        {children}
      </div>
    );
  }

  // DESKTOP: window mengambang ala macOS, bisa di-drag
  return (
    <div
      className="fixed z-40 top-1/2 left-1/2"
      style={{
        transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
      }}
    >
      <div
        className={`relative ${widthClass} max-w-[92vw] max-h-[80vh] rounded-2xl bg-white text-neutral-800
                    border border-black/10 shadow-2xl overflow-hidden flex flex-col
                    animate-[windowIn_0.2s_ease-out]`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
