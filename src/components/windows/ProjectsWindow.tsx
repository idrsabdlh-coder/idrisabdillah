"use client";

import Window from "@/components/Window";
import WindowTitlebar from "@/components/WindowTitlebar";
import { useDesktop } from "@/context/DesktopContext";
import { PROJECTS } from "@/lib/data";
import { ICONS } from "@/lib/icons";

export default function ProjectsWindow() {
  const { projectEntry, setProjectEntry } = useDesktop();
  const project = PROJECTS[projectEntry];
  const keys = Object.keys(PROJECTS);

  return (
    <Window name="Projects" widthClass="w-[56rem]">
      <div className="h-[78vh] flex flex-col">
        <WindowTitlebar
          name="Projects"
          breadcrumb={
            <div className="text-sm text-neutral-500">
              <span className="hidden sm:inline">User</span>
              <span className="hidden sm:inline mx-1 text-neutral-300">/</span>
              <span>Projects</span>
              <span className="mx-1 text-neutral-300">/</span>
              <span className="text-neutral-800 font-medium">{project.title}</span>
            </div>
          }
        />

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Sidebar list proyek — desktop only */}
          <div className="hidden md:block w-56 border-r border-black/10 overflow-y-auto shrink-0 py-4 px-3">
            <p className="text-xs font-medium text-neutral-400 px-2 mb-1.5">Projects</p>
            {keys.map((key) => {
              const p = PROJECTS[key];
              const active = projectEntry === key;
              return (
                <button
                  key={key}
                  onClick={() => setProjectEntry(key)}
                  className={`w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg transition-colors ${
                    active ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <div className="w-6 h-6 rounded-md overflow-hidden bg-neutral-200 shrink-0 flex items-center justify-center">
                    {p.iconImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.iconImg} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-neutral-400">
                        <path d={ICONS[p.icon]} />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm truncate">{p.title}</span>
                </button>
              );
            })}
          </div>

          {/* Selector proyek — mobile only, chip horizontal yang bisa discroll */}
          <div className="md:hidden shrink-0 border-b border-black/10 py-3 px-4 overflow-x-auto">
            <div className="flex items-center gap-2 w-max">
              {keys.map((key) => {
                const p = PROJECTS[key];
                const active = projectEntry === key;
                return (
                  <button
                    key={key}
                    onClick={() => setProjectEntry(key)}
                    className={`flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                      active
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-600 border-neutral-200"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-neutral-200 shrink-0 flex items-center justify-center">
                      {p.iconImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.iconImg} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3 h-3 text-neutral-400">
                          <path d={ICONS[p.icon]} />
                        </svg>
                      )}
                    </div>
                    <span className="whitespace-nowrap">{p.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail proyek */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pb-10">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold">{project.title}</h3>
                {project.visit && (
                    <a
                    href={project.visit}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <span>{project.visitLabel || "Visit"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <path d="M15 3h6v6" />
                      <path d="M10 14 21 3" />
                    </svg>
                  </a>
                )}
              </div>

              <p className="text-sm text-neutral-500 leading-relaxed mt-3">{project.desc}</p>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Category</p>
                  <p className="text-sm text-neutral-700">{project.category}</p>
                </div>
                {project.client && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Client</p>
                    <p className="text-sm text-neutral-700">{project.client}</p>
                  </div>
                )}
              </div>

              {project.hero && (
                <div className="mt-6 rounded-xl overflow-hidden bg-neutral-100 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.hero} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-black/5">
                <p className="text-sm font-semibold text-neutral-800 mb-2">Challenges</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{project.challenges.text}</p>
                {project.challenges.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {project.challenges.images.map((img) => (
                      <div key={img} className="rounded-xl overflow-hidden bg-neutral-100 aspect-[4/3]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-black/5">
                <p className="text-sm font-semibold text-neutral-800 mb-2">Final thoughts</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{project.finalThoughts.text}</p>
                {project.finalThoughts.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {project.finalThoughts.images.map((img) => (
                      <div key={img} className="rounded-xl overflow-hidden bg-neutral-100 aspect-[4/3]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}