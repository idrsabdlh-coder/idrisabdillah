"use client";

import { useEffect, useState, useRef } from "react";

const FULL_NAME = "IDRIS ABDILLAH";

export default function Opening() {
  const [gone, setGone] = useState(false);
  const [displayedName, setDisplayedName] = useState("");
  const [counter, setCounter] = useState(0);
  const counterRef = useRef(0);
  const nameRef = useRef("");

  useEffect(() => {
    const html = document.documentElement;
    const home = document.getElementById("app-root");
    const isDev = process.env.NODE_ENV === "development";

    // Pengunjung lama di production: script di <head> sudah menandai "done" (CSS sudah menyembunyikan
    // overlay), tinggal melepasnya dari DOM. Di mode development (localhost), opening selalu dijalankan.
    if (!isDev && html.dataset.opening === "done") {
      const raf = requestAnimationFrame(() => setGone(true));
      return () => cancelAnimationFrame(raf);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Kunci scroll + home tidak bisa difokus
    html.style.overflow = "hidden";
    home?.setAttribute("inert", "");

    let exiting = false;
    let finished = false;
    let animationFrameId: number;
    const timers: number[] = [];

    const finish = () => {
      if (finished) return;
      finished = true;
      html.style.overflow = "";
      home?.removeAttribute("inert");
      if (!isDev) {
        try {
          sessionStorage.setItem("opening-seen", "1");
        } catch {}
      }
      html.dataset.opening = "done";
      setGone(true);
    };

    const exit = () => {
      if (exiting) return;
      exiting = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(animationFrameId);
      setDisplayedName(FULL_NAME);
      setCounter(100);
      html.dataset.opening = "exiting";
      // Durasi transisi sapuan tirai bertingkat (tiered wipe)
      timers.push(window.setTimeout(finish, reduce ? 250 : 900));
    };

    if (reduce) {
      timers.push(
        window.setTimeout(() => {
          setDisplayedName(FULL_NAME);
          setCounter(100);
          exit();
        }, 400)
      );
    } else {
      // Pengetikan nama huruf per huruf dari awal sampai akhir, sinkron dengan counter 000 -> 100
      // Total waktu pengalaman sekitar 7 detik (5.4 dtk ejaan + 0.7 dtk apresiasi nama utuh + 0.9 dtk sapuan tirai)
      const startTime = performance.now();
      const typingDuration = 5400;

      const updateTyping = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / typingDuration, 1);

        // Hitung jumlah huruf yang dieja
        const charCount = Math.min(
          Math.floor(progress * (FULL_NAME.length + 1)),
          FULL_NAME.length
        );
        const currentChars = FULL_NAME.slice(0, charCount);
        if (currentChars !== nameRef.current) {
          nameRef.current = currentChars;
          setDisplayedName(currentChars);
        }

        // Hitung nilai counter 000 -> 100
        const currentCounter = Math.floor(progress * 100);
        if (currentCounter !== counterRef.current) {
          counterRef.current = currentCounter;
          setCounter(currentCounter);
        }

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(updateTyping);
        } else {
          setDisplayedName(FULL_NAME);
          nameRef.current = FULL_NAME;
          setCounter(100);
          counterRef.current = 100;
          // Tahan sejenak setelah nama lengkap dieja sebelum tirai menyapu (~0.7 detik)
          timers.push(window.setTimeout(exit, 700));
        }
      };

      animationFrameId = requestAnimationFrame(updateTyping);
    }

    // Interaktivitas: tap / klik / tombol apa pun langsung membuka seketika
    window.addEventListener("pointerdown", exit);
    window.addEventListener("keydown", exit);

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointerdown", exit);
      window.removeEventListener("keydown", exit);
      html.style.overflow = "";
      home?.removeAttribute("inert");
    };
  }, []);

  if (gone) return null;

  const formattedCounter = String(counter).padStart(3, "0");

  return (
    <aside
      className="opening"
      role="status"
      aria-label="Idris Abdillah - Junior Software Engineer"
    >
      <span className="opening-sr">
        Idris Abdillah - Junior Software Engineer ({formattedCounter}%)
      </span>

      {/* Tiered Reveal Curtains (Inspirasi Video 2: Sapuan Tirai Bertingkat) */}
      <div className="opening-curtain-wrap" aria-hidden="true">
        <div className="opening-curtain-col col-1" />
        <div className="opening-curtain-col col-2" />
        <div className="opening-curtain-col col-3" />
        <div className="opening-curtain-col col-4" />
        <div className="opening-curtain-col col-5" />
      </div>

      {/* Stage Konten Utama */}
      <div className="opening-stage">
        {/* Label Atas Kecil */}
        <p className="opening-eyebrow" aria-hidden="true">
          PORTFOLIO // 2026
        </p>

        {/* Tipografi Nama Utama: Dieja dari Awal Hingga Terakhir */}
        <h1 className="opening-title" aria-hidden="true">
          <span className="opening-title-text">{displayedName}</span>
          <span className="opening-cursor" />
        </h1>

        {/* Hairline Divider & Live Progress Bar */}
        <div className="opening-hairline-track" aria-hidden="true">
          <div
            className="opening-hairline-fill"
            style={{ width: `${counter}%` }}
          />
        </div>

        {/* Centered Role & 3-Digit Counter */}
        <div className="opening-meta-center" aria-hidden="true">
          <p className="opening-meta-role">
            Junior Software Engineer
          </p>
          <div className="opening-counter-badge">
            <span className="opening-counter-dot" />
            <span className="opening-meta-counter">{formattedCounter}</span>
          </div>
        </div>
      </div>

      {/* Petunjuk Aksi Bersih di Bagian Bawah */}
      <p className="opening-prompt" aria-hidden="true">
        Ketuk untuk lewati
      </p>
    </aside>
  );
}