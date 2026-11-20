/** Urutan status resmi konsultasi (PRD bagian 3.4). */
export const URUTAN_STATUS = [
  "Draf",
  "Terkirim",
  "Ditinjau",
  "Dihubungi",
  "Penawaran",
  "Disetujui",
  "Ditutup",
] as const;

export type StatusKonsultasi = (typeof URUTAN_STATUS)[number];

const ALUR_MAJU: readonly StatusKonsultasi[] = [
  "Draf",
  "Terkirim",
  "Ditinjau",
  "Dihubungi",
  "Penawaran",
  "Disetujui",
];

/**
 * Mengembalikan daftar status tujuan yang sah dari `dari`.
 * Aturan PRD 3.4:
 * - Hanya boleh maju satu langkah pada alur utama, atau langsung ke `Ditutup`.
 * - Pembukaan kembali dari `Ditutup` hanya boleh dilakukan oleh `Admin` (ke `Ditinjau`).
 */
export function transisiDiizinkan(
  dari: StatusKonsultasi,
  peran: "Tim" | "Admin",
): StatusKonsultasi[] {
  if (dari === "Ditutup") {
    return peran === "Admin" ? ["Ditinjau"] : [];
  }
  if (dari === "Disetujui") {
    return ["Ditutup"];
  }
  const idx = ALUR_MAJU.indexOf(dari);
  if (idx < 0) return [];
  const berikut = ALUR_MAJU[idx + 1];
  return berikut ? [berikut, "Ditutup"] : ["Ditutup"];
}

export function bolehTransisi(
  dari: StatusKonsultasi,
  ke: StatusKonsultasi,
  peran: "Tim" | "Admin",
): boolean {
  return transisiDiizinkan(dari, peran).includes(ke);
}

/** Membuat tautan WhatsApp `wa.me` dengan pesan pembuka berisi nama klien (FR-KON-11). */
export function buatTautanWhatsApp(wa: string, nama: string, kode: string): string {
  const nomor = wa.replace(/\D/g, "");
  const pesan = `Halo Kak ${nama}, kami dari tim Idris Abdillah ingin menindaklanjuti konsultasi website Kakak (${kode}).`;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}
