import type { DefinisiForm, JawabanNilai, Konteks, Syarat } from "./types";

/** ID khusus yang merujuk ke jenis website yang berlaku, bukan ke jawaban 2.1. */
export const JENIS = "@jenis";

/** Nilai opsi yang stabil dan aman disimpan, dibentuk dari label. */
export function slug(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Pembangun syarat. Argumen berupa label opsi atau nilai jenis, dan otomatis di-slug
// sehingga cocok dengan `nilai` opsi yang dibuat dari label yang sama.
export const adalah = (id: string, ...nilai: string[]): Syarat => ({
  id,
  adalah: nilai.map(slug),
});
export const memuat = (id: string, nilai: string): Syarat => ({
  id,
  memuat: slug(nilai),
});
/**
 * HATI-HATI: `bukan` bernilai SALAH bila pertanyaan belum dijawab.
 * Untuk "belum dijawab atau bukan X" pakai `tidak(adalah(...))`.
 */
export const bukan = (id: string, ...nilai: string[]): Syarat => ({
  id,
  bukan: nilai.map(slug),
});
export const semua = (...s: Syarat[]): Syarat => ({ semua: s });
export const salahSatu = (...s: Syarat[]): Syarat => ({ salahSatu: s });
export const tidak = (s: Syarat): Syarat => ({ tidak: s });

export function terisi(v: JawabanNilai | undefined): v is JawabanNilai {
  if (v === undefined) return false;
  return typeof v === "string" ? v.trim() !== "" : v.length > 0;
}

function ambilNilai(id: string, ctx: Konteks): JawabanNilai | undefined {
  return id === JENIS ? ctx.jenis : ctx.jawaban[id];
}

/**
 * Mengevaluasi syarat terhadap konteks. Fungsi murni.
 * Pertanyaan yang belum dijawab membuat syarat `adalah`, `memuat`, dan `bukan` bernilai salah.
 * `semua()` kosong bernilai benar, `salahSatu()` kosong bernilai salah.
 */
export function cocok(s: Syarat, ctx: Konteks): boolean {
  if ("semua" in s) return s.semua.every((x) => cocok(x, ctx));
  if ("salahSatu" in s) return s.salahSatu.some((x) => cocok(x, ctx));
  if ("tidak" in s) return !cocok(s.tidak, ctx);

  const v = ambilNilai(s.id, ctx);
  if (!terisi(v)) return false;
  const daftar = Array.isArray(v) ? v : [v];

  if ("adalah" in s) return daftar.some((x) => s.adalah.includes(x));
  if ("memuat" in s) return daftar.includes(s.memuat);
  return daftar.every((x) => !s.bukan.includes(x));
}

/** Semua ID (termasuk "@jenis") yang dirujuk sebuah syarat. Dipakai tes 6.6. */
export function idDirujuk(s: Syarat): string[] {
  if ("semua" in s) return s.semua.flatMap(idDirujuk);
  if ("salahSatu" in s) return s.salahSatu.flatMap(idDirujuk);
  if ("tidak" in s) return idDirujuk(s.tidak);
  return [s.id];
}

/** Semua syarat di definisi form: pada bagian, pertanyaan, dan opsi. */
export function semuaSyarat(def: DefinisiForm): Syarat[] {
  return [
    ...def.bagian.flatMap((b) => (b.tampilJika ? [b.tampilJika] : [])),
    ...def.pertanyaan.flatMap((p) => [
      ...(p.tampilJika ? [p.tampilJika] : []),
      ...(p.opsi ?? []).flatMap((o) => (o.tampilJika ? [o.tampilJika] : [])),
    ]),
  ];
}