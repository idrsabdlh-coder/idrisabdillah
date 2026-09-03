"use client";

import Window from "@/components/Window";
import WindowTitlebar from "@/components/WindowTitlebar";

const EXPERIENCE = [
  {
    period: "Jan 2026 – Feb 2026",
    place: "Medan",
    title: "Ketua KKN (Kuliah Kerja Nyata)",
    org: "Universitas Muhammadiyah Surakarta",
    desc: "Memimpin tim mahasiswa dalam merencanakan dan melaksanakan program pengabdian masyarakat, berkoordinasi dengan masyarakat setempat dan pemangku kepentingan.",
  },
  {
    period: "Okt 2024 – Sep 2025",
    place: "Surakarta",
    title: "Anggota, Departemen 1 HMPPTI",
    org: "Himpunan Mahasiswa Pendidikan Teknik Informatika",
    desc: "Berkontribusi aktif dalam program dan kegiatan departemen, berkolaborasi dengan anggota lain dalam merencanakan dan melaksanakan program kerja secara efektif.",
  },
  {
    period: "Mar 2026 – Jun 2026",
    place: "Tim",
    title: "Smart Water Tank — Proyek IoT",
    org: "github.com/idrsabdlh-coder",
    desc: "Merancang sistem monitoring dan otomasi tandon air berbasis ESP32 dengan sensor ultrasonik dan turbiditas, terintegrasi Blynk IoT Cloud.",
  },
];

const SKILLS = [
  "Laravel", "Git / GitHub",
  "PHP", "MySQL",
  "Python", "Figma / Canva",
  "HTML", "Tailwind CSS",
  "JavaScript", "Next.js",
];

export default function ResumeWindow() {
  return (
    <Window name="Resume" widthClass="w-[56rem]">
      <div className="h-[80vh] flex flex-col">
        <WindowTitlebar name="Resume" />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Idris Abdillah</h1>
              <p className="text-neutral-500 mt-1">Software Developer</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-500 mt-4 pb-4 border-b border-black/10">
            <span><b className="text-neutral-800">Semester 7</b> Teknik Informatika</span>
            <span className="text-neutral-300">|</span>
            <span><b className="text-neutral-800">6+</b> Proyek Selesai</span>
            <span className="text-neutral-300">|</span>
            <span><b className="text-neutral-800">2+</b> Organisasi</span>
          </div>

          <p className="text-sm text-neutral-600 leading-relaxed mt-4">
            Mahasiswa Pendidikan Teknik Informatika (Semester 7) Universitas Muhammadiyah Surakarta yang
            berfokus pada Software Development. Berpengalaman mengembangkan aplikasi berbasis Laravel, PHP,
            dan Python, termasuk Tenong App, Kostinaja, serta sistem monitoring IoT Smart Water Tank
            menggunakan ESP32 dan Blynk.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-500 mt-6 pt-4 border-t border-black/10">
            <div className="flex gap-4">
              <span>jafaryabdilah@gmail.com</span>
              <span>+62 856-6985-3336</span>
            </div>
            <span>2026</span>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">Pendidikan</p>
            <div className="flex flex-wrap gap-x-2 text-sm">
              <span className="font-medium">Universitas Muhammadiyah Surakarta</span>
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-500">Pendidikan Teknik Informatika (2023 – Sekarang)</span>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">Keahlian</p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm text-neutral-600">
              {SKILLS.map((s) => (
                <p key={s}>· {s}</p>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">Pengalaman</p>
            <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-6 text-sm">
              {EXPERIENCE.map((exp) => (
                <div className="contents" key={exp.title}>
                  <div className="text-neutral-400">
                    {exp.period}
                    <br />
                    <span className="text-neutral-300">{exp.place}</span>
                  </div>
                  <div>
                    <p className="font-medium">{exp.title}</p>
                    <p className="text-neutral-400 text-xs mb-1">{exp.org}</p>
                    <p className="text-neutral-600">{exp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}