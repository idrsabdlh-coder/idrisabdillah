import { adalah, cocok, memuat, salahSatu, semua } from "./syarat";
import type { Jawaban, Jenis, Syarat } from "./types";

export interface Rekomendasi {
  jenis: Jenis;
  alasan: string;
  /** Jenis alternatif bila aturan cocok untuk lebih dari satu kemungkinan. */
  alternatif?: Jenis;
  /** Nomor aturan yang cocok (1 sampai 6), sesuai tabel PRD 4.4. */
  aturan: number;
}

interface Aturan {
  syarat: Syarat;
  jenis: Jenis;
  alasan: string;
  alternatif?: Jenis;
}

/** Dievaluasi berurutan, aturan pertama yang cocok menang (PRD 4.4). */
export const ATURAN_REKOMENDASI: Aturan[] = [
  {
    syarat: memuat("4.2", "Orang tua murid"),
    jenis: "sekolah",
    alasan: "Pengunjung utamanya orang tua murid.",
  },
  {
    syarat: semua(
      memuat("4.1", "Memberi informasi acara atau mengundang"),
      adalah("3F.2", "Satu acara"),
    ),
    jenis: "undangan",
    alternatif: "khusus",
    alasan:
      "Tujuannya mengundang ke satu acara. Kalau acaranya bukan pernikahan, landing page lebih cocok.",
  },
  {
    syarat: memuat("4.1", "Menjual produk"),
    jenis: "katalog",
    alasan: "Tujuan utamanya menjual produk.",
  },
  {
    syarat: salahSatu(
      adalah("3F.1", "Ya, pembayaran atau pendaftaran"),
      memuat("4.1", "Mengumpulkan pendaftar atau mengelola data"),
    ),
    jenis: "khusus",
    alasan: "Ada pendaftaran, pembayaran, atau data yang perlu dikelola.",
  },
  {
    syarat: semua(
      memuat("4.2", "Calon mitra bisnis"),
      memuat("4.1", "Terlihat lebih profesional dan terpercaya"),
    ),
    jenis: "company",
    alasan: "Ingin tampil profesional di depan calon mitra bisnis.",
  },
];

const BAWAAN: Aturan = {
  syarat: { semua: [] },
  jenis: "khusus",
  alasan: "Landing page sederhana cocok sebagai titik awal.",
};

/** Menghasilkan rekomendasi dari jawaban 3F.1, 3F.2, 4.1, dan 4.2. Fungsi murni. */
export function rekomendasikan(jawaban: Jawaban): Rekomendasi {
  const ctx = { jenis: "belum" as Jenis, jawaban };
  const idx = ATURAN_REKOMENDASI.findIndex((a) => cocok(a.syarat, ctx));
  const a = (idx >= 0 ? ATURAN_REKOMENDASI[idx] : undefined) ?? BAWAAN;
  const hasil: Rekomendasi = {
    jenis: a.jenis,
    alasan: a.alasan,
    aturan: idx >= 0 ? idx + 1 : ATURAN_REKOMENDASI.length + 1,
  };
  if (a.alternatif) hasil.alternatif = a.alternatif;
  return hasil;
}
