"use client";

import Window from "@/components/Window";
import WindowTitlebar from "@/components/WindowTitlebar";
import { CONSULTATION_FORM_URL } from "@/lib/links";

const SERVICES = [
  {
    title: "Company Profile",
    desc: "Website profil usaha atau organisasi yang memperkenalkan brand, layanan, dan kontak dengan tampilan rapi.",
  },
  {
    title: "Katalog Produk",
    desc: "Etalase online untuk menampilkan produk dan kategori agar mudah dijelajahi pelanggan.",
  },
];

export default function ServicesWindow() {
  return (
    <Window name="Services" widthClass="w-[32rem]">
      <div
        data-theme="light"
        className="flex flex-col h-full md:h-auto md:max-h-[80vh] bg-[var(--window-bg)] text-[var(--window-text)]"
      >
        <WindowTitlebar name="Services" title="Jasa Website" />

        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <h2 className="text-xl font-bold">Butuh website untuk usaha Anda?</h2>
          <p className="text-sm text-neutral-500 leading-relaxed mt-2">
            Saya membantu mulai dari konsultasi kebutuhan sampai website siap dipakai.
          </p>

          <div className="mt-6 space-y-3">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-900">{s.title}</p>
                <p className="text-sm text-neutral-500 leading-relaxed mt-1">{s.desc}</p>
              </div>
            ))}
          </div>

          <a
            href={CONSULTATION_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
          >
            Mulai Bangun Website Anda
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
            </svg>
          </a>
        </div>
      </div>
    </Window>
  );
}