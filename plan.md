Implementation Plan — Portfolio Animation & Interactivity
1. Hasil Inspeksi Stack
Aspek	Detail
Framework	Next.js 16.3.4 (App Router — src/app/)
React	19.2.8
Styling	Tailwind CSS v4 + globals.css (custom classes)
TypeScript	v5
Deploy	Vercel (tidak disentuh: next.config.ts, tidak ada vercel.json)
Dependency animasi	Tidak ada (belum ada Framer Motion / GSAP)
Temuan kunci tentang kode yang ada
Dock.tsx — Magnifikasi sudah ada via CSS --dock-scale + JS mousemove. Kurang: indikator dot window terbuka, animasi bounce saat klik, dan tooltip sudah ada tapi belum ada mekanisme delay untuk tidak flicker.
TopBar.tsx — Clock sudah real-time. Kurang: animasi masuk (intro stagger), transisi hover link sosial lebih halus.
DesktopContext.tsx — Sudah ada openWindows[] + drag system. Kurang: activeWindow (z-index focus), setActiveWindow.
Window.tsx — Ada animate-[windowIn] saat buka, tapi animasi tutup tidak ada; tidak ada z-index aktif.
DesktopIcons.tsx — Ada group-hover:scale-105 dasar. Kurang: glow efek, stagger intro, dan animasi yang menghormati motion prefs.
globals.css — Ada @keyframes windowIn, tooltip, dock-link. Kurang: semua keyframe baru, parallax, intro, micro-interactions.
page.tsx — Wallpaper menggunakan next/image dengan fill. Perlu wrapper div untuk efek parallax translate.
2. File yang Akan Disentuh

IMPORTANT

Tidak ada file baru yang dihapus. Tidak ada dependency baru yang ditambah (semua efek dicapai dengan CSS + React hooks murni).

File	Perubahan
src/app/globals.css	Tambah keyframes baru: windowOut, dockBounce, introFadeUp, introFadeIn; parallax CSS vars; reduced-motion overrides; micro-interaction styles
src/context/DesktopContext.tsx	Tambah activeWindow: string | null + setActiveWindow() ke context
src/app/page.tsx	Bungkus wallpaper <Image> dalam div parallax; tambah useParallax hook inline
src/components/Dock.tsx	Tambah: indikator dot (openWindows), bounce class saat klik, gunakan setActiveWindow
src/components/Window.tsx	Tambah: animasi tutup (windowOut), z-index berdasarkan activeWindow, shadow aktif vs nonaktif, onMouseDown → setActiveWindow
src/components/DesktopIcons.tsx	Tambah: stagger intro (CSS custom property --delay), glow hover, animasi prefers-reduced-motion
src/components/TopBar.tsx	Tambah: intro fade-down, transisi hover link sosial, tampilkan detik (tick real-time tanpa kedip)

NOTE

WindowTitlebar.tsx, MobileHome.tsx, semua file windows/, lib/data.ts, lib/icons.ts tidak disentuh.

3. Pendekatan Per Efek
Efek 1 — Dock (Magnifikasi + Tooltip + Bounce + Dot)
Magnifikasi: sudah berjalan — tidak diubah logika, hanya memperhalus transition (tambah cubic-bezier lebih smooth).
Tooltip: sudah ada — tambah translate-y kecil agar muncul dari bawah dengan easing, cegah pointer-events.
Bounce klik: tambah class .dock-bounce via useState timeout (100ms). Keyframe: translateY(0) → -8px → 0.
Indikator dot: render <span> kecil bulat di bawah ikon jika nama window ada di openWindows[]. Pure Tailwind.
Semua dalam Dock.tsx + globals.css. Tidak ada library baru.
Efek 2 — Window (Open/Close + Drag + Z-index)
Animasi buka: sudah ada windowIn. Perhalus: tambah scale(0.94) + opacity: 0 → scale(1) + opacity: 1 dengan spring cubic-bezier(0.34, 1.56, 0.64, 1).
Animasi tutup: tambah state isClosing. Saat close diklik → set isClosing=true → tunggu 200ms → panggil closeWindow(). Keyframe windowOut: kebalikan windowIn.
Z-index aktif: activeWindow di context. Window.tsx baca: jika name === activeWindow → z-50 shadow-2xl, lainnya → z-40 shadow-lg.
onMouseDown pada wrapper Window → setActiveWindow(name).
Drag: tidak diubah (sudah berfungsi lewat WindowTitlebar).
Efek 3 — Intro (Stagger Menu Bar + Dock + Desktop Icons)
Gunakan @keyframes introFadeUp dan @keyframes introFadeDown.
TopBar: class animate-[introFadeDown_0.5s_ease-out].
Dock: class animate-[introFadeUp_0.6s_0.2s_ease-out_both].
DesktopIcons: tiap ikon dapat --stagger-delay via inline style, animasi introFadeUp dengan delay berbeda (0.3s, 0.4s, 0.5s...).
Tidak ada layar loading — animasi langsung berjalan saat komponen mount.
prefers-reduced-motion: semua keyframe ini di-override dengan animation: none.
Efek 4 — Wallpaper Parallax
Di page.tsx: tambah useRef + useEffect untuk mousemove di window.
Update CSS custom property --px dan --py (range −12px ke +12px) pada wrapper div wallpaper.
CSS: transform: translate(calc(var(--px, 0) * 1px), calc(var(--py, 0) * 1px)) dengan transition: transform 0.1s ease-out.
Deteksi touch: cek window.matchMedia('(hover: none)') — jika true, tidak pasang listener.
Wallpaper dibuat sedikit lebih besar (scale(1.05)) agar tidak ada tepi putih saat bergeser.
Efek 5 — Micro-interactions
Desktop icons hover: ganti group-hover:scale-105 → group-hover:-translate-y-1.5 group-hover:scale-105 + group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]. Transition hanya pada transform + filter.
TopBar link sosial: tambah transition-transform hover:scale-110 hover:text-white (tidak ada transform pada opacity, sudah ada).
Jam real-time: sudah tidak kedip (client-only via useState(null) + mount). Tambah tabular-nums class untuk angka tidak shift layout.
Efek 6 — Aksesibilitas (prefers-reduced-motion)
Di globals.css, tambah blok:
css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
Khusus parallax: prefers-reduced-motion → skip mousemove listener sepenuhnya.
Ini menggantikan/memperluas rule yang sudah ada (.dock-link override).
4. Risiko & Mitigasi
Risiko	Mitigasi
Animasi tutup window (isClosing) menyebabkan content hilang sebelum fade	Gunakan visibility: hidden saat isClosing selesai, bukan display: none langsung
Parallax menyebabkan LCP shift	Wallpaper tetap dalam posisi, hanya transform yang bergerak (GPU composited layer)
activeWindow menyebabkan re-render semua window	Gunakan useCallback + memo pada setActiveWindow
Intro stagger menambah paint cost	Animasi hanya opacity + transform — tidak trigger layout
Bounce dock bertumbukan dengan magnify scale	Bounce menggunakan translateY (sumbu Y), magnify menggunakan scale — tidak konflik; digabung via CSS multi-transform
5. Urutan Pengerjaan
✅ Step 0 — Buat plan (sekarang)
Step 1 — globals.css: Tambah semua keyframe + reduced-motion overrides
Step 2 — DesktopContext.tsx: Tambah activeWindow + setActiveWindow
Step 3 — Window.tsx: Animasi tutup + z-index aktif
Step 4 — Dock.tsx: Dot indikator + bounce klik
Step 5 — page.tsx: Parallax wallpaper
Step 6 — DesktopIcons.tsx: Stagger intro + glow hover
Step 7 — TopBar.tsx: Intro fade-down + tabular-nums
Step 8 — npm run build + verifikasi
6. Dependency Baru

IMPORTANT

Tidak ada dependency baru yang akan ditambahkan. Semua efek dicapai 100% dengan:

CSS Animations & Transitions (transform, opacity — GPU-composited)
React useState, useRef, useEffect, useCallback
Tailwind CSS v4 utility classes

Jika di kemudian hari efek physics spring yang lebih kompleks diperlukan, baru akan diminta persetujuan untuk motion (Framer Motion). Bundle-nya ~50kB gzip — saat ini tidak diperlukan.

Menunggu persetujuan Anda sebelum mulai menulis kode.