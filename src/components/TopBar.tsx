"use client";

import { useEffect, useState } from "react";

const SOCIALS = [
  {
    href: "https://www.linkedin.com/in/idris-abdillah-54402a3b7",
    label: "LinkedIn",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z",
  },
  {
    href: "https://github.com/idrsabdlh-coder",
    label: "GitHub",
    path: "M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.23.72-.51v-1.98c-2.93.64-3.55-1.25-3.55-1.25-.48-1.22-1.17-1.55-1.17-1.55-.96-.65.07-.64.07-.64 1.06.07 1.62 1.09 1.62 1.09.94 1.61 2.46 1.14 3.06.87.1-.68.37-1.14.67-1.4-2.34-.27-4.8-1.17-4.8-5.22 0-1.15.41-2.09 1.09-2.83-.11-.27-.47-1.35.1-2.81 0 0 .89-.29 2.9 1.08a10 10 0 0 1 5.28 0c2.01-1.37 2.9-1.08 2.9-1.08.57 1.46.21 2.54.1 2.81.68.74 1.09 1.68 1.09 2.83 0 4.06-2.47 4.95-4.82 5.21.38.33.72.98.72 1.98v2.93c0 .28.19.62.73.51A10.5 10.5 0 0 0 12 1.5Z",
  },
  {
    href: "https://www.instagram.com/idrsabdllh?igsi=eGlwc2U0Nmx0cXFv&utm_source=qr",
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.16.46.35 1.26.4 2.43.07 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.25.07-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.24-1.97.4-2.43A4.9 4.9 0 0 1 3.82 2.95 4.9 4.9 0 0 1 5.6 1.8c.46-.16 1.26-.35 2.43-.4C9.28 1.33 9.68 1.33 12 1.33m0 1.8c-3.15 0-3.52 0-4.76.07-1.03.05-1.6.22-1.97.36-.5.19-.85.43-1.22.8-.37.37-.6.72-.8 1.22-.14.37-.3.94-.36 1.97-.07 1.24-.07 1.6-.07 4.76s0 3.52.07 4.76c.05 1.03.22 1.6.36 1.97.19.5.43.85.8 1.22.37.37.72.6 1.22.8.37.14.94.3 1.97.36 1.24.07 1.6.07 4.76.07s3.52 0 4.76-.07c1.03-.05 1.6-.22 1.97-.36.5-.2.85-.43 1.22-.8.37-.37.6-.72.8-1.22.14-.37.3-.94.36-1.97.07-1.24.07-1.6.07-4.76s0-3.52-.07-4.76c-.05-1.03-.22-1.6-.36-1.97a3.1 3.1 0 0 0-.8-1.22 3.1 3.1 0 0 0-1.22-.8c-.37-.14-.94-.3-1.97-.36-1.24-.07-1.6-.07-4.76-.07Zm0 4.6a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8Zm0 1.8a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm5.6-1.98a1.26 1.26 0 1 1-2.52 0 1.26 1.26 0 0 1 2.52 0Z",
  },
];

export default function TopBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-30 hidden md:flex items-center justify-between px-6 py-3 text-sm text-white/90">
      <span className="font-medium">Idris Abdillah</span>

      <div className="flex items-center gap-4">
        {SOCIALS.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener" className="hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d={s.path} />
            </svg>
          </a>
        ))}

        <span className="w-px h-4 bg-white/20" />

        {/* Render tanggal/jam hanya setelah mount, biar gak mismatch SSR vs client */}
        {now && (
          <>
            <span>
              {now.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span>{now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
          </>
        )}
      </div>
    </header>
  );
}
