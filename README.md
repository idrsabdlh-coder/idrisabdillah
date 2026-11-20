# idrisabdillah.vercel.app

Portfolio pribadi Idris Abdillah dengan konsep **simulasi desktop OS** (mirip macOS), jalur layanan **jasa pembuatan website**, dan sistem **Dasbor Konsultasi Interaktif** (Rilis 2).

- Live: https://idrisabdillah.vercel.app
- Repository: https://github.com/idrsabdlh-coder/idrisabdillah

---

## Fitur

### 1. Portfolio & Simulasi Desktop
- **Desktop (≥ `md:`)**: wallpaper parallax, top bar dengan tanggal & jam, Dock dengan efek magnifikasi & indikator window aktif, ikon desktop, dan jendela melayang (macOS floating window) yang bisa di-drag.
- **Mobile (< `md:`)**: antarmuka home screen ala iOS dengan status bar, jam/tanggal, gesture swipe, dan grid aplikasi.
- **Jendela Aplikasi**:
  - `About Me`: Profil profesional, universitas, keahlian, dan teknologi.
  - `Resume`: Ringkasan pendidikan, keahlian teknis, dan riwayat pengalaman.
  - `Projects`: 7 portofolio proyek lengkap dengan tantangan, hasil akhir, dan tombol "Visit".
  - `Music`: Pemutar musik bergaya pemutar portabel.
  - `Game`: Game interaktif ringan.
  - `Jasa Website` (`Services`): Pilihan jenis website (Company Profile, Katalog UMKM, Undangan Digital, Sekolah/Khusus) dan tombol CTA.
- **Dukungan Aksesibilitas**: Tema terang/gelap, dukungan `prefers-reduced-motion`, kontras warna tinggi, dan navigasi ramah keyboard.

### 2. Dasbor Konsultasi Klien (`/konsultasi`)
- **Pengganti Google Form**: Kuesioner interaktif 80 pertanyaan modular dengan logika percabangan otomatis (katalog, company profile, sekolah, undangan, sistem khusus).
- **Akses Fleksibel Tanpa Akun**: Menggunakan token rahasia per sesi (tautan pribadi), aman disimpan lokal di browser.
- **Auto-Save & Offline Resilient**: Jawaban otomatis tersimpan berkala ke database, dilengkapi cadangan lokal di browser.
- **Rekomendasi Cerdas**: Rekomendasi otomatis jenis website untuk klien yang memilih jalur "Belum tahu".
- **Multi-Device Responsive**:
  - **Desktop**: Tampil konsisten dalam jendela simulasi macOS dengan wallpaper dan window controls.
  - **Mobile**: Tampil responsif layar penuh ala aplikasi native ponsel.

### 3. Dasbor Tim / Admin (`/konsultasi/tim`)
- **Autentikasi Aman**: Login Admin berbasis hash kata sandi dan cookie bertanda tangan (`httpOnly`, `SameSite`, `Secure`).
- **Kotak Masuk & Manajemen Status**: Pencarian nama/nomor WA, filter anggaran, filter status alur (`Draf`, `Terkirim`, `Dihubungi`, `Disetujui`, `Selesai`, `Ditutup`).
- **Detail Brief Lengkap**: Tampilan jawaban kuesioner rapi per bagian, penanda kebutuhan khusus/bantuan, dan tombol WhatsApp cepat (`wa.me`) dengan template salam pembuka personal.
- **Catatan Internal**: Catatan privat tim yang tidak pernah bocor ke sisi klien.
- **Ekspor Data**: Ekspor rekap CSV dan cetak PDF langsung dari browser (`Ctrl+P` / print stylesheet).

---

## Tech Stack

| Aspek | Detail |
|---|---|
| Framework | Next.js 16.3.4 (App Router, Turbopack) |
| UI & Reaktivitas | React 19.2.8 |
| Styling | Tailwind CSS v4 + `src/app/globals.css` |
| Database | MySQL (driver `mysql2` dengan pool koneksi) |
| Testing | Vitest 3 (`npm test`) |
| Bahasa | TypeScript 5 |
| Hosting & Deploy | Vercel (Front-end & Serverless Route Handlers) |

---

## Struktur Folder

```
src/
  app/
    layout.tsx                      # Root layout & inisialisasi tema
    page.tsx                        # Root portfolio & wallpaper parallax
    globals.css                     # Gaya tema, variabel macOS window, animasi
    konsultasi/                     # Halaman klien /konsultasi & /konsultasi/[token]
    konsultasi/tim/                 # Dasbor Tim /konsultasi/tim & detail /konsultasi/tim/[id]
    api/konsultasi/                 # Route Handler API Klien & Tim
  components/
    Dock.tsx, TopBar.tsx            # Komponen desktop macOS
    DesktopIcons.tsx, Window.tsx    # Ikon desktop & kontainer jendela interaktif
    MobileHome.tsx                  # Antarmuka mobile iOS
    windows/                        # Jendela portfolio (About, Resume, Projects, Services, dll)
    konsultasi/                     # Komponen konsultasi (Wizard, TimDashboard, TimDetailBrief, dll)
  context/
    DesktopContext.tsx, ThemeContext.tsx
  lib/
    data.ts, icons.ts, links.ts     # Data statis & konstanta link CTA
    konsultasi/                     # Logika bisnis: percabangan, validasi, rekomendasi, repositori DB
scripts/
  migrate.mjs                       # Skrip migrasi database MySQL
  test-e2e-db.ts                    # Skrip pengujian end-to-end database lokal
docs/
  Product Requirements Document (PRD).md
  PRD-Konsultasi.md
```

---

## Variabel Lingkungan (.env.local)

Salin konfigurasi dari `.env.example` ke `.env.local`:

```ini
DATABASE_HOST="127.0.0.1"
DATABASE_PORT="3306"
DATABASE_USER="root"
DATABASE_PASSWORD="your-password"
DATABASE_NAME="idris_konsultasi"
DATABASE_SSL="false"

# Autentikasi Dasbor Tim
TIM_PASSWORD_HASH="sha256-hash-kata-sandi-admin"
TIM_COOKIE_SECRET="kunci-rahasia-cookie-minimal-32-karakter"

# Keamanan & Cron
CRON_SECRET="kunci-rahasia-cron-job"
```

---

## Menjalankan Proyek & Database

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Migrasi Skema Database
Pastikan MySQL sudah berjalan, lalu eksekusi migrasi:
```bash
node scripts/migrate.mjs
```

### 3. Menjalankan Server Development
```bash
npm run dev
# Buka http://localhost:3000 di browser
```

### 4. Menjalankan Pengujian & Audit Kode
```bash
npm test          # Menjalankan 145 unit test (Vitest)
npm run lint      # Memeriksa standar kode ESLint
npm run build     # Menjalankan kompilasi produksi Next.js
```

---

## Prosedur Operasional

### Mengalihkan / Mengembalikan CTA ke Google Form Cadangan
Jika ingin sementara mengarahkan tombol CTA kembali ke Google Form cadangan:
1. Buka `src/lib/links.ts`
2. Ubah `CONSULTATION_URL`:
   ```ts
   export const CONSULTATION_URL = CONSULTATION_FORM_URL;
   ```

### Prosedur Penghapusan Data Klien (Permintaan Klien)
Bila ada klien yang meminta datanya dihapus permanen:
1. Cari ID konsultasi klien melalui Dasbor Tim (`/konsultasi/tim`).
2. Masuk ke terminal database MySQL:
   ```sql
   DELETE FROM konsultasi WHERE id = <ID_KLIEN>;
   ```
   *(Tabel `jawaban`, `catatan`, dan `status_log` akan terhapus otomatis berkat relasi `ON DELETE CASCADE`)*.
