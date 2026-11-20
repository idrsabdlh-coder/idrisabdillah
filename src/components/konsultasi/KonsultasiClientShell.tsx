"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const PROYEK_SHOWCASE = [
  {
    nama: "Kedai Kopi Mu",
    kategori: "Katalog & Pemesanan F&B",
    gambar: "/images/projects/kedaikopimu/hero.jpeg",
  },
  {
    nama: "Khasya Home",
    kategori: "Custom Boutique & Katalog",
    gambar: "/images/projects/khasya/hero.jpeg",
  },
  {
    nama: "Website Sekolah",
    kategori: "Profil Sekolah & Lembaga",
    gambar: "/images/projects/webses/hero.jpeg",
  },
  {
    nama: "KostinAja",
    kategori: "Manajemen & Sewa Kos",
    gambar: "/images/projects/kostinaja/hero.jpeg",
  },
];

export default function KonsultasiClientShell({ children }: { children: ReactNode }) {
  const [now, setNow] = useState<Date | null>(null);
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const timeStr = now
    ? now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const dateStr = now
    ? now.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })
    : "";

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-neutral-950 font-sans">
      {/* ─── DESKTOP VIEW (macOS Window Simulation with Project Showcase Background) ─ */}
      <div className="hidden md:flex flex-col h-screen relative overflow-hidden select-none">
        {/* Layer 1: Base Wallpaper */}
        <div className="absolute inset-0 -z-30 overflow-hidden">
          <Image
            src="/images/wallpaper2.jpg"
            alt=""
            fill
            priority
            className="object-cover brightness-[0.65] contrast-[1.1]"
            sizes="100vw"
          />
        </div>

        {/* Layer 2: Real Project Photos Showcase Collage in Background */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none p-8 flex flex-col justify-between">
          {/* Top row project cards */}
          <div className="flex justify-between items-start gap-8 opacity-40 hover:opacity-70 transition-opacity">
            {/* Top Left: Kedai Kopi Mu */}
            <div className="w-72 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/40 backdrop-blur-md">
              <div className="relative h-40 w-full">
                <Image
                  src={PROYEK_SHOWCASE[0].gambar}
                  alt={PROYEK_SHOWCASE[0].nama}
                  fill
                  className="object-cover"
                  sizes="288px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/80 text-white inline-block mb-1">
                    Portofolio
                  </span>
                  <p className="text-xs font-bold leading-tight">{PROYEK_SHOWCASE[0].nama}</p>
                  <p className="text-[10px] text-white/80">{PROYEK_SHOWCASE[0].kategori}</p>
                </div>
              </div>
            </div>

            {/* Top Right: Khasya Home */}
            <div className="w-72 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/40 backdrop-blur-md">
              <div className="relative h-40 w-full">
                <Image
                  src={PROYEK_SHOWCASE[1].gambar}
                  alt={PROYEK_SHOWCASE[1].nama}
                  fill
                  className="object-cover"
                  sizes="288px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/80 text-white inline-block mb-1">
                    Portofolio
                  </span>
                  <p className="text-xs font-bold leading-tight">{PROYEK_SHOWCASE[1].nama}</p>
                  <p className="text-[10px] text-white/80">{PROYEK_SHOWCASE[1].kategori}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row project cards */}
          <div className="flex justify-between items-end gap-8 opacity-40 hover:opacity-70 transition-opacity">
            {/* Bottom Left: Website Sekolah */}
            <div className="w-72 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/40 backdrop-blur-md">
              <div className="relative h-40 w-full">
                <Image
                  src={PROYEK_SHOWCASE[2].gambar}
                  alt={PROYEK_SHOWCASE[2].nama}
                  fill
                  className="object-cover"
                  sizes="288px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/80 text-white inline-block mb-1">
                    Portofolio
                  </span>
                  <p className="text-xs font-bold leading-tight">{PROYEK_SHOWCASE[2].nama}</p>
                  <p className="text-[10px] text-white/80">{PROYEK_SHOWCASE[2].kategori}</p>
                </div>
              </div>
            </div>

            {/* Bottom Right: KostinAja */}
            <div className="w-72 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/40 backdrop-blur-md">
              <div className="relative h-40 w-full">
                <Image
                  src={PROYEK_SHOWCASE[3].gambar}
                  alt={PROYEK_SHOWCASE[3].nama}
                  fill
                  className="object-cover"
                  sizes="288px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/80 text-white inline-block mb-1">
                    Portofolio
                  </span>
                  <p className="text-xs font-bold leading-tight">{PROYEK_SHOWCASE[3].nama}</p>
                  <p className="text-[10px] text-white/80">{PROYEK_SHOWCASE[3].kategori}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 3: Dark Vignette Overlay for Crisp Contrast */}
        <div className="absolute inset-0 -z-10 bg-neutral-950/65 backdrop-blur-[2px] pointer-events-none" />

        {/* macOS Top Menu Bar */}
        <header className="h-9 px-6 bg-black/50 backdrop-blur-md border-b border-white/15 text-white flex items-center justify-between text-xs shrink-0 z-30">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white/95 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
              Idris Abdillah
            </span>
            <span className="text-white/30">•</span>
            <span className="text-white/80">Konsultasi Pembuatan Website</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 text-xs font-medium transition-all"
            >
              <span>←</span>
              <span>Kembali ke Portfolio</span>
            </Link>
            <div className="flex items-center gap-2 text-white/85 tabular-nums text-xs font-medium">
              <span>{dateStr}</span>
              <span>{timeStr}</span>
            </div>
          </div>
        </header>

        {/* macOS Floating Window Container */}
        <main className="flex-1 min-h-0 flex items-center justify-center p-6 lg:p-8 z-20">
          <div
            data-theme="light"
            className={`w-full transition-all duration-300 ease-out rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/25 bg-white text-neutral-900 ${
              maximized
                ? "h-[94vh] max-w-[96vw]"
                : "h-[84vh] max-w-4xl lg:max-w-5xl"
            }`}
          >
            {/* Window Titlebar */}
            <div className="h-11 px-4 bg-neutral-100/90 border-b border-neutral-200/80 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 block shadow-xs transition-colors"
                  title="Tutup (Kembali ke Portfolio)"
                  aria-label="Tutup dan kembali ke portfolio"
                />
                <button
                  type="button"
                  onClick={() => setMaximized(false)}
                  className="w-3.5 h-3.5 rounded-full bg-yellow-500 hover:bg-yellow-600 block shadow-xs transition-colors"
                  title="Ukuran Standar"
                  aria-label="Kembalikan ukuran jendela standar"
                />
                <button
                  type="button"
                  onClick={() => setMaximized(!maximized)}
                  className="w-3.5 h-3.5 rounded-full bg-green-500 hover:bg-green-600 block shadow-xs transition-colors"
                  title="Toggle Maksimalkan"
                  aria-label="Maksimalkan atau pulihkan ukuran jendela"
                />
              </div>

              <div className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-neutral-500">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Konsultasi Website: Kuesioner & Brief Kebutuhan</span>
              </div>

              <div className="text-[11px] text-neutral-500 font-medium">
                Idris Abdillah
              </div>
            </div>

            {/* Window Content Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 lg:p-10 select-text">
              {/* Contoh Karya Website Banner for Desktop & Tablet */}
              <div className="mb-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                    <h2 className="text-sm font-bold text-neutral-900">
                      Contoh Karya Website:
                    </h2>
                    <span className="text-xs text-neutral-500">
                      (Inspirasi untuk proyek website Kakak)
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium">4 Proyek Portofolio</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PROYEK_SHOWCASE.map((p) => (
                    <div
                      key={p.nama}
                      className="group rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-xs hover:shadow-md hover:border-sky-300 transition-all"
                    >
                      <div className="relative h-24 w-full overflow-hidden bg-neutral-100">
                        <Image
                          src={p.gambar}
                          alt={p.nama}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 1024px) 240px, 200px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-neutral-900 truncate">{p.nama}</p>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">{p.kategori}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {children}
            </div>
          </div>
        </main>
      </div>

      {/* ─── MOBILE VIEW (Native App Style with Project Inspiration Strip) ─── */}
      <div data-theme="light" className="md:hidden flex flex-col min-h-screen bg-white text-neutral-900 select-text">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-30 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
          >
            <span>←</span>
            <span>Portfolio</span>
          </Link>
          <span className="text-sm font-bold text-neutral-900 truncate">
            Konsultasi Website
          </span>
          <span className="w-8" />
        </header>

        {/* Mobile Content */}
        <main className="flex-1 px-4 py-5 overflow-y-auto">
          {/* Real Project Inspiration Strip for Mobile */}
          <div className="mb-5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Contoh Karya Website:
              </p>
              <span className="text-[10px] text-neutral-500 font-medium">Geser untuk melihat</span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {PROYEK_SHOWCASE.map((p) => (
                <div
                  key={p.nama}
                  className="shrink-0 w-36 rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-xs"
                >
                  <div className="relative h-20 w-full">
                    <Image
                      src={p.gambar}
                      alt={p.nama}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-neutral-900 truncate">{p.nama}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{p.kategori}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
