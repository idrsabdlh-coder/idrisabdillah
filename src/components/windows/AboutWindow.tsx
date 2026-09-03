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
      ["Python", "python"],
      ["JavaScript", "javascript"],
      ["HTML", "html5"],
      ["CSS", "css"],
      ["Laravel", "laravel"],
      ["Tailwind CSS", "tailwindcss"],
      ["Django", "django"],
      ["MySQL", "mysql"],
      ["Relational Database", null],
    ],
  },
  {
    title: "Development & Tools",
    skills: [
      ["Git", "git"],
      ["GitHub", "github"],
      ["REST API", null],
      ["VS Code", "visualstudiocode"],
      ["Vite", "vite"],
      ["Figma", "figma"],
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
  {
    title: "IoT & Embedded Systems",
    skills: [
      ["ESP32", null],
      ["Blynk IoT Cloud", null],
      ["Sensor Ultrasonik", null],
      ["Sensor Turbidity", null],
    ],
  },
];

const TABS = ["Profil", "Keahlian"] as const;
type Tab = (typeof TABS)[number];

export default function AboutWindow() {
  const [tab, setTab] = useState<Tab>("Profil");

  return (
    <Window name="about" widthClass="w-[36rem]">
      <div className="h-[80vh] flex flex-col">
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
                  <p className="text-sm text-neutral-500">Informatics Engineering Education</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    🎓 Universitas Muhammadiyah Surakarta
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline">&nbsp;·&nbsp;</span>
                    📍 Surakarta, Indonesia
                  </p>
                </div>
              </div>

              <div className="bg-neutral-100 rounded-lg p-4 text-sm text-neutral-700 leading-relaxed">
                Mahasiswa Pendidikan Teknik Informatika (Semester 7) Universitas Muhammadiyah Surakarta yang
                berfokus pada Software Development.
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