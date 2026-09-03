"use client";

import { ReactNode } from "react";
import { useDesktop } from "@/context/DesktopContext";

type WindowProps = {
  name: string;
  widthClass?: string;
  children: ReactNode;
};

export default function Window({ name, widthClass = "w-[36rem]", children }: WindowProps) {
  const { isOpen, positions, startDrag } = useDesktop();

  if (!isOpen(name)) return null;

  const pos = positions[name] ?? { x: 0, y: 0 };

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