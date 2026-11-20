import { JENIS, cocok, idDirujuk, slug } from "./syarat";
import { DAFTAR_JENIS, LABEL_JENIS } from "./types";
import type {
  BagianId,
  DefinisiForm,
  Jawaban,
  Jenis,
  Konteks,
  Opsi,
  Pertanyaan,
  Syarat,
} from "./types";

/** ID pertanyaan pemilihan jenis website. */
export const ID_JENIS = "2.1";
/** Bagian tempat pertanyaan `jalurBelum` ditanyakan bila klien memilih "Belum tahu". */
export const BAGIAN_JALUR_BELUM: BagianId = "3F";

const JENIS_DARI_NILAI = new Map<string, Jenis>(
  DAFTAR_JENIS.map((j): [string, Jenis] => [slug(LABEL_JENIS[j]), j]),
);

/** Jenis dari jawaban 2.1. Undefined bila belum dijawab atau nilainya tidak dikenal. */
export function jenisDariJawaban(jawaban: Jawaban): Jenis | undefined {
  const v = jawaban[ID_JENIS];
  return typeof v === "string" ? JENIS_DARI_NILAI.get(v) : undefined;
}

/**
 * Jenis yang berlaku untuk syarat `@jenis`:
 * - 2.1 belum dijawab: undefined
 * - 2.1 jenis nyata: jenis itu (`jenisDitetapkan` diabaikan)
 * - 2.1 "belum": `jenisDitetapkan` bila sudah ada (hasil rekomendasi atau pilihan sendiri), selain itu "belum"
 */
export function jenisBerlaku(jawaban: Jawaban, jenisDitetapkan?: Jenis): Jenis | undefined {
  const pilihan = jenisDariJawaban(jawaban);
  if (pilihan !== "belum") return pilihan;
  return jenisDitetapkan && jenisDitetapkan !== "belum" ? jenisDitetapkan : "belum";
}

export interface PertanyaanTampil {
  pertanyaan: Pertanyaan;
  /** Bagian tempat pertanyaan ditanyakan; bisa "3F" untuk pertanyaan `jalurBelum`. UI harus mengelompokkan menurut ini. */
  bagian: BagianId;
  /** Opsi yang boleh dipilih, sudah disaring `tampilJika` opsi. Tidak ada bila bukan pertanyaan pilihan. */
  opsi?: Opsi[];
}

/**
 * Daftar pertanyaan yang tampil, berurutan seperti di definisi. Fungsi murni.
 *
 * Pertanyaan dievaluasi berurutan dan hanya jawaban dari pertanyaan yang TAMPIL yang dipakai
 * untuk mengevaluasi pertanyaan berikutnya. Jadi jawaban basi dari pertanyaan yang sudah
 * tersembunyi (misal setelah klien mengganti jenis website) tidak membuka pertanyaan lain.
 */
export function pertanyaanTampil(
  def: DefinisiForm,
  jawaban: Jawaban,
  jenisDitetapkan?: Jenis,
): PertanyaanTampil[] {
  const jalurBelum = jenisDariJawaban(jawaban) === "belum";
  const bagianPerId = new Map(def.bagian.map((b) => [b.id, b] as const));
  const terlihat: Jawaban = {}; // hanya jawaban pertanyaan yang tampil, diisi bertahap
  // `ctx.jawaban` menunjuk `terlihat`, jadi ikut terisi seiring perulangan.
  const ctx: Konteks = { jenis: jenisBerlaku(jawaban, jenisDitetapkan), jawaban: terlihat };
  const hasil: PertanyaanTampil[] = [];

  for (const p of def.pertanyaan) {
    const dijalurBelum = jalurBelum && p.jalurBelum === true;
    const bagianId = dijalurBelum ? BAGIAN_JALUR_BELUM : p.bagian;

    const syaratBagian = bagianPerId.get(bagianId)?.tampilJika;
    if (syaratBagian && !cocok(syaratBagian, ctx)) continue;
    // Di jalur "Belum tahu", syarat pertanyaan sendiri tidak berlaku (jenis belum ditetapkan).
    if (!dijalurBelum && p.tampilJika && !cocok(p.tampilJika, ctx)) continue;

    hasil.push({
      pertanyaan: p,
      bagian: bagianId,
      ...(p.opsi ? { opsi: p.opsi.filter((o) => !o.tampilJika || cocok(o.tampilJika, ctx)) } : {}),
    });

    const v = jawaban[p.id];
    if (v !== undefined) terlihat[p.id] = v;
  }
  return hasil;
}

/** Himpunan ID yang tampil. Dipakai API untuk menolak jawaban bagi ID yang tidak tampil (7.3). */
export function idTampil(def: DefinisiForm, jawaban: Jawaban, jenisDitetapkan?: Jenis): Set<string> {
  return new Set(pertanyaanTampil(def, jawaban, jenisDitetapkan).map((t) => t.pertanyaan.id));
}

/**
 * Mencari syarat yang merujuk pertanyaan yang tidak ada atau yang BELUM muncul di urutan.
 * Rujukan seperti itu membuat pertanyaan tersembunyi diam-diam. `@jenis` dianggap merujuk 2.1.
 * Hasil kosong berarti definisi aman. Dipakai tes 6.6.
 */
export function rujukanMaju(def: DefinisiForm): string[] {
  const urutan = new Map(def.pertanyaan.map((p, i) => [p.id, i] as const));
  const masalah: string[] = [];

  const periksa = (asal: string, s: Syarat | undefined, batas: number) => {
    if (!s) return;
    for (const id of idDirujuk(s)) {
      const i = urutan.get(id === JENIS ? ID_JENIS : id);
      if (i === undefined || i >= batas) masalah.push(`${asal} merujuk ${id}`);
    }
  };

  def.pertanyaan.forEach((p, i) => {
    periksa(`pertanyaan ${p.id}`, p.tampilJika, i);
    for (const o of p.opsi ?? []) periksa(`opsi ${p.id}/${o.nilai}`, o.tampilJika, i);
  });
  for (const b of def.bagian) {
    const awal = def.pertanyaan.findIndex((p) => p.bagian === b.id);
    if (awal >= 0) periksa(`bagian ${b.id}`, b.tampilJika, awal);
  }
  return masalah;
}