// Tipe data Modul Konsultasi. Rujukan: docs/PRD-Konsultasi.md bagian 4, 5, dan 7.
// Berkas ini murni TypeScript: tanpa Next.js, tanpa database, tanpa dependency.

export type Jenis =
  | "undangan"
  | "company"
  | "sekolah"
  | "katalog"
  | "khusus"
  | "belum";

export const DAFTAR_JENIS: readonly Jenis[] = [
  "undangan",
  "company",
  "sekolah",
  "katalog",
  "khusus",
  "belum",
];

export const LABEL_JENIS: Record<Jenis, string> = {
  undangan: "Undangan pernikahan digital",
  company: "Company profile",
  sekolah: "Website sekolah/lembaga",
  katalog: "Katalog produk UMKM atau toko online",
  khusus: "Landing page, portofolio, atau sistem khusus",
  belum: "Belum tahu, bantu saya memilih",
};

export type BagianId =
  | "1"
  | "2"
  | "3A"
  | "3B"
  | "3C"
  | "3D"
  | "3E"
  | "3F"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8";

/** JS jawaban singkat, PG pilihan ganda, KC kotak centang, PR paragraf, TG tanggal. */
export type Tipe = "JS" | "PG" | "KC" | "PR" | "TG";

/** Nilai satu jawaban: teks (JS, PR, TG, PG) atau daftar nilai opsi (KC). */
export type JawabanNilai = string | string[];

/**
 * Jawaban satu konsultasi, dikunci oleh ID pertanyaan.
 * Isian teks tambahan ("Lainnya", nama domain) memakai kunci `ID.sufiks`, contoh `3A.7.lainnya`.
 */
export type Jawaban = Record<string, JawabanNilai>;

/**
 * Syarat tampil. ID khusus `@jenis` merujuk ke jenis website yang berlaku
 * (hasil pilihan klien atau hasil rekomendasi), bukan ke jawaban 2.1.
 */
export type Syarat =
  | { id: string; adalah: string[] }
  | { id: string; memuat: string }
  | { id: string; bukan: string[] }
  | { semua: Syarat[] }
  | { salahSatu: Syarat[] }
  | { tidak: Syarat };

export interface Opsi {
  /** Nilai stabil yang disimpan di database. */
  nilai: string;
  label: string;
  /** Jawaban yang menandakan klien butuh bantuan tim (PRD 3.3). */
  butuhBantuan?: boolean;
  tampilJika?: Syarat;
}

/** Isian teks tambahan yang muncul bila salah satu opsi terpilih. */
export interface SubIsian {
  kunci: string;
  label: string;
  saat: string[];
}

export interface Pertanyaan {
  id: string;
  bagian: BagianId;
  teks: string;
  tipe: Tipe;
  wajib?: boolean;
  bantuan?: string;
  opsi?: Opsi[];
  subIsian?: SubIsian[];
  tampilJika?: Syarat;
  format?: "whatsapp";
  /** Bila 2.1 = "Belum tahu", pertanyaan ini ditanya di langkah 3F, bukan di bagiannya (PRD 4.4). */
  jalurBelum?: boolean;
  tidakMasaLalu?: boolean;
}

export interface Bagian {
  id: BagianId;
  judul: string;
  deskripsi?: string;
  tampilJika?: Syarat;
}

export interface DefinisiForm {
  versi: number;
  bagian: Bagian[];
  pertanyaan: Pertanyaan[];
}

export interface Konteks {
  jenis?: Jenis;
  jawaban: Jawaban;
}
