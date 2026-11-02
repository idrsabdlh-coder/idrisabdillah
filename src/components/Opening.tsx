"use client";

import { useEffect, useState } from "react";

const WORDS = ["IDRIS", "ABDILLAH"];

export default function Opening() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const home = document.getElementById("app-root");

    // Pengunjung lama: script di <head> sudah menandai "done"
    if (html.dataset.opening === "done") {
      setGone(true);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Kunci scroll + home tidak bisa difokus
    html.style.overflow = "hidden";
    home?.setAttribute("inert", "");

    let exiting = false;
    let finished = false;
    const timers: number[] = [];

    const finish = () => {
      if (finished) return;
      finished = true;
      html.style.overflow = "";
      home?.removeAttribute("inert");
      try {
        sessionStorage.setItem("opening-seen", "1");
      } catch {}
      html.dataset.opening = "done";
      setGone(true); // overlay dilepas dari DOM
    };

    const exit = () => {
      if (exiting) return;
      exiting = true;
      timers.forEach(clearTimeout);
      html.dataset.opening = "exiting"; // memicu animasi masuk menu bar & dock
      timers.push(window.setTimeout(finish, reduce ? 400 : 800));
    };

    // Otomatis keluar setelah huruf selesai + tahan ~0,8 dtk
    timers.push(window.setTimeout(exit, reduce ? 800 : 2300));

    // Skip: klik, tap, atau tombol apa pun
    window.addEventListener("pointerdown", exit);
    window.addEventListener("keydown", exit);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("pointerdown", exit);
      window.removeEventListener("keydown", exit);
      html.style.overflow = "";
      home?.removeAttribute("inert");
    };
  }, []);

  if (gone) return null;

  let i = 0;
  return (
    <div className="opening" role="status">
      <span className="opening-sr">Idris Abdillah</span>
      <div className="opening-name" aria-hidden="true">
        {WORDS.map((word) => (
          <span className="opening-word" key={word}>
            {word.split("").map((ch) => (
              <span
                className="opening-letter"
                style={{ ["--i" as string]: i++ }}
                key={i}
              >
                {ch}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}