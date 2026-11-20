"use client";

import Window from "@/components/Window";
import WindowTitlebar from "@/components/WindowTitlebar";
import { CONSULTATION_URL } from "@/lib/links";

const SERVICES = [
  {
    title: "Company Profile",
    badge: "Populer",
    desc: "Website profil usaha atau bisnis untuk memperkenalkan brand, layanan, portofolio, dan kontak dengan tampilan modern.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    title: "Katalog Produk & UMKM",
    badge: "Rekomendasi",
    desc: "Etalase online untuk menampilkan produk, daftar harga, dan kategori agar pelanggan bisa pesan langsung via WhatsApp.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-500">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    title: "Undangan Digital",
    badge: "Elegan",
    desc: "Undangan pernikahan digital interaktif dengan RSVP tamu, hitung mundur acara, galeri foto/video, dan navigasi peta.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-rose-500">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    title: "Website Sekolah & Khusus",
    badge: "Kustom",
    desc: "Website resmi sekolah, yayasan, landing page kampanye khusus, hingga aplikasi web dinamis sesuai kebutuhan Anda.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-500">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
];

export default function ServicesWindow() {
  return (
    <Window name="Services" widthClass="w-[48rem]">
      <div
        data-theme="light"
        className="flex flex-col h-full md:h-auto md:max-h-[82vh] bg-[var(--window-bg)] text-[var(--window-text)]"
      >
        <WindowTitlebar name="Services" title="Jasa Website" />

        <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              Layanan Pembuatan & Konsultasi Website
            </span>
            <h2 className="text-2xl font-bold mt-3 tracking-tight text-neutral-900">
              Bangun Website Profesional Sesuai Kebutuhan Anda
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed mt-2">
              Mulai dari konsultasi konsep, penentuan fitur, desain antarmuka responsif (desktop & mobile), hingga website online dan siap digunakan pelanggan.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="group relative rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4.5 hover:bg-white hover:border-neutral-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-white shadow-xs border border-neutral-200/60 group-hover:scale-105 transition-transform">
                      {s.icon}
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/50">
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-neutral-900">{s.title}</p>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-1.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 pt-5 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-neutral-900">Sudah punya gambaran atau masih bingung?</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Isi kuesioner singkat untuk dapat rekomendasi jenis website & konsultasi langsung.
              </p>
            </div>

            <a
              href={CONSULTATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-98 transition-all"
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
      </div>
    </Window>
  );
}
