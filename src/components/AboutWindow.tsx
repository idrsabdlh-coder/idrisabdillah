"use client";

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

export default function AboutWindow() {
  return (
    <Window name="about" widthClass="w-[56rem] max-w-[92vw] h-[80vh]">
      <WindowTitlebar name="about" title="About Me">
        <div className="flex items-center gap-3 text-neutral-400">
          
            href="https://www.linkedin.com/in/idris-abdillah-54402a3b7"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
            </svg>
          </a>
          
            href="https://github.com/idrsabdlh-coder"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.94c-2.78.62-3.37-1.36-3.37-1.36-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
            </svg>
          </a>
          <a href="mailto:jafaryabdilah@gmail.com" className="hover:text-neutral-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="w-4 h-4"
            >
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </a>
        </div>
      </WindowTitlebar>

      <div className="p-6 overflow-y-auto">
        <div className="flex gap-4 items-center mb-3">
          <div className="w-32 h-32 rounded-xl overflow-hidden border border-black/10 shrink-0 relative">
            <Image src="/images/about.JPG" alt="Foto Idris Abdillah" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Idris Abdillah</h2>
            <p className="text-sm text-neutral-500">Informatics Engineering Education</p>
            <p className="text-xs text-neutral-400 mt-1">
              🎓 Universitas Muhammadiyah Surakarta &nbsp;·&nbsp; 📍 Surakarta, Indonesia
            </p>
          </div>
        </div>

        <div className="bg-neutral-100 rounded-lg p-4 text-sm text-neutral-700 leading-relaxed mb-3">
          Mahasiswa Pendidikan Teknik Informatika (Semester 7) Universitas Muhammadiyah Surakarta yang
          berfokus pada Software Development.
        </div>

        {SKILL_GROUPS.map((group) => (
          <div className="mb-3" key={group.title}>
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
    </Window>
  );
}