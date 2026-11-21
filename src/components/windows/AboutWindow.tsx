"use client";

import { useState } from "react";
import Image from "next/image";
import Window from "@/components/Window";
import WindowTitlebar from "@/components/WindowTitlebar";

const SKILL_GROUPS: { title: string; skills: [string, string | null][] }[] = [
  {
    title: "Bahasa & Framework",
    skills: [
      ["PHP", "php"],
      ["Laravel", "laravel"],
      ["MySQL", "mysql"],
      ["Python", "python"],
      ["JavaScript", "javascript"],
      ["Next.js", "nextdotjs"],
      ["Tailwind CSS", "tailwindcss"],
      ["HTML5", "html5"],
      ["CSS3", "css"],
    ],
  },
  {
    title: "Development & Tools",
    skills: [
      ["GitHub", "github"],
      ["VS Code", "visualstudiocode"],
      ["Vite", "vite"],
      ["Figma", "figma"],
      ["Vercel", "vercel"],
    ],
  },
  {
    title: "IoT & Embedded Systems",
    skills: [
      ["ESP32", "espressif"],
      ["Blynk IoT Cloud", null],
      ["Sensor Ultrasonik", null],
      ["Sensor Turbidity", null],
    ],
  },
  {
    title: "Multimedia & Game",
    skills: [
      ["Blender", "blender"],
      ["Unity", "unity"],
      ["Godot Engine", "godotengine"],
      ["Construct 2 & 3", null],
    ],
  },
];

const TABS = ["Profil", "Keahlian"] as const;
type Tab = (typeof TABS)[number];

export default function AboutWindow() {
  const [tab, setTab] = useState<Tab>("Profil");

  return (
    <Window name="about" widthClass="w-[44rem] lg:w-[48rem]">
      <div
        data-theme="light"
        className="h-full md:h-auto md:max-h-[82vh] flex flex-col bg-[var(--window-bg)] text-[var(--window-text)]"
      >
        <WindowTitlebar name="about" title="About Me" />

        <div className="flex gap-2 px-6 pt-4 shrink-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {tab === "Profil" && (
            <>
              <div className="flex gap-4 items-center mb-3">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-black/10 shrink-0 relative">
                  <Image src="/images/about.JPG" alt="Foto Idris Abdillah" fill className="object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Idris Abdillah</h2>
                  <p className="text-sm text-neutral-500 font-medium">Junior Software Engineer</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    🎓 S1 Pendidikan Teknik Informatika (Semester 7) · UMS
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline">&nbsp;·&nbsp;</span>
                    📍 Surakarta, Indonesia
                  </p>
                </div>
              </div>

              <div className="text-sm text-neutral-600 leading-relaxed space-y-2 mt-4 pt-4 border-t border-neutral-200/80">
                <p>
                  Mahasiswa tingkat akhir Pendidikan Teknik Informatika (Semester 7) Universitas Muhammadiyah Surakarta yang
                  berfokus pada Software Engineering dan pengembangan aplikasi web.
                </p>
                <p>
                  Berpengalaman membangun aplikasi dari perancangan arsitektur basis data relasional, logika backend (Laravel dan PHP Native),
                  hingga antarmuka pengguna interaktif yang responsif. Telah menyelesaikan beragam proyek nyata meliputi sistem manajemen transaksi titip jual UMKM (Tenong App),
                  platform sewa kamar kos (KostinAja), portal profil sekolah dan PPDB online, katalog e-commerce (Kedai Kopi Mu),
                  hingga integrasi sistem otomasi IoT (Smart Water Tank ESP32).
                </p>
              </div>
            </>
          )}

          {tab === "Keahlian" &&
            SKILL_GROUPS.map((group) => (
              <div className="mb-4" key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map(([skill, icon]) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 text-xs bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1"
                    >
                      {icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`https://cdn.simpleicons.org/${icon}`} alt="" className="w-3.5 h-3.5" />
                      )}
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </Window>
  );
}