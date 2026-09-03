"use client";

import { useDesktop } from "@/context/DesktopContext";

const SOCIALS = [
  {
    href: "https://www.linkedin.com/in/idris-abdillah-54402a3b7",
    label: "LinkedIn",
    path: "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z",
  },
  {
    href: "https://github.com/idrsabdlh-coder",
    label: "GitHub",
    path: "M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.94c-2.78.62-3.37-1.36-3.37-1.36-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z",
  },
];

export default function WindowTitlebar({
  name,
  title,
  breadcrumb,
}: {
  name: string;
  title?: string;
  breadcrumb?: React.ReactNode;
}) {
  const { closeWindow, startDrag } = useDesktop();

  return (
    <div
      onMouseDown={(e) => startDrag(e, name)}
      className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-black/10 shrink-0 cursor-move select-none"
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(name);
            }}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400"
            aria-label="Tutup"
          />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        {title && <span className="text-sm text-neutral-500 truncate">{title}</span>}
        {breadcrumb && <div className="min-w-0 truncate">{breadcrumb}</div>}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 text-neutral-400 shrink-0">
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener"
            onMouseDown={(e) => e.stopPropagation()}
            className="hover:text-neutral-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d={s.path} />
            </svg>
          </a>
        ))}
          <a
          href="mailto:jafaryabdilah@gmail.com"
          onMouseDown={(e) => e.stopPropagation()}
          className="hover:text-neutral-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
            <path d="M4 6h16v12H4z" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </a>
      </div>
    </div>
  );
}