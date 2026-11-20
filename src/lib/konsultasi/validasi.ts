import { pertanyaanTampil } from "./percabangan";
import type { PertanyaanTampil } from "./percabangan";
import { terisi } from "./syarat";
import type { BagianId, DefinisiForm, Jawaban, JawabanNilai, Jenis } from "./types";

/** Batas panjang jawaban (ASUMSI, cocokkan dengan PRD 4.3). */
export const MAKS_JS = 300;
export const MAKS_PR = 5000;

export type KodeGalat =
  | "wajib"
  | "tidak_tampil"
  | "tipe"
  | "pilihan"
  | "tanggal"
  | "masa_lalu"
  | "whatsapp"
  | "panjang"
  | "persetujuan";

export interface Galat {
  /** ID pertanyaan, kunci sub-isian, atau "persetujuan". */
  id: string;
  kode: KodeGalat;
  /** Pesan untuk klien. */
  pesan: string;
  /** Bagian tempat pertanyaan ditanyakan, untuk tombol Ubah di ringkasan (8.6). */
  bagian?: BagianId;
}

export type Hasil = { ok: true; nilai: JawabanNilai } | { ok: false; galat: Galat };

/**
 * Menormalkan nomor WhatsApp Indonesia ke format `62…`. Null bila tidak valid.
 * Diterima: 08…, 628…, +628…, 0062 8…, dan "+62 0812…"; spasi, tanda hubung, titik, kurung diabaikan.
 * Ditolak: nomor tanpa awalan ("812…"), telepon rumah, dan nomor luar negeri (ASUMSI).
 */
export function normalisasiWhatsApp(masukan: string): string | null {
  let s = masukan.trim().replace(/[\s().-]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (!/^\d+$/.test(s)) return null;
  if (s.startsWith("0062")) s = s.slice(2);
  else if (s.startsWith("0")) s = "62" + s.slice(1);
  if (s.startsWith("620")) s = "62" + s.slice(3);
  return /^628\d{8,11}$/.test(s) ? s : null;
}

/** Tanggal kalender nyata berformat YYYY-MM-DD. */
export function tanggalValid(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

/**
 * Tanggal hari ini di WIB (YYYY-MM-DD). Server berjalan di UTC, jadi tanpa ini "hari ini"
 * salah antara 00.00 dan 07.00 WIB. Satu-satunya tempat `Date` dipakai; lapisan API
 * memanggil `hariIniWIB(new Date())` dan meneruskan hasilnya ke fungsi lain.
 */
export function hariIniWIB(sekarang: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(sekarang);
}

/**
 * Memeriksa satu nilai terhadap pertanyaan yang tampil. `nilai` bertipe unknown karena
 * berasal dari JSON di batas API. Nilai kosong diterima (artinya menghapus jawaban);
 * "wajib" hanya ditegakkan oleh `validasiKirim`. SIMPAN `hasil.nilai`, bukan masukan asli:
 * sudah dirapikan (trim) dan WhatsApp sudah dinormalkan.
 */
export function validasiNilai(t: PertanyaanTampil, nilai: unknown, hariIni: string): Hasil {
  const p = t.pertanyaan;
  const gagal = (kode: KodeGalat, pesan: string): Hasil => ({
    ok: false,
    galat: { id: p.id, kode, pesan, bagian: t.bagian },
  });

  if (p.tipe === "KC") {
    if (!Array.isArray(nilai) || nilai.some((x) => typeof x !== "string")) {
      return gagal("tipe", "Pilih satu atau lebih opsi.");
    }
    const daftar = nilai as string[];
    if (new Set(daftar).size !== daftar.length) return gagal("pilihan", "Ada pilihan yang ganda.");
    const boleh = new Set((t.opsi ?? []).map((o) => o.nilai));
    if (daftar.some((x) => !boleh.has(x))) return gagal("pilihan", "Ada pilihan yang tidak tersedia.");
    return { ok: true, nilai: daftar };
  }

  if (typeof nilai !== "string") return gagal("tipe", "Jawaban harus berupa teks.");
  const teks = nilai.trim();

  if (p.tipe === "PG") {
    if (teks === "") return { ok: true, nilai: "" };
    return (t.opsi ?? []).some((o) => o.nilai === teks)
      ? { ok: true, nilai: teks }
      : gagal("pilihan", "Pilihan tidak tersedia.");
  }

  if (p.tipe === "TG") {
    if (teks === "") return { ok: true, nilai: "" };
    if (!tanggalValid(teks)) return gagal("tanggal", "Tanggal tidak valid.");
    if (p.tidakMasaLalu && teks < hariIni) return gagal("masa_lalu", "Tanggal tidak boleh di masa lalu.");
    return { ok: true, nilai: teks };
  }

  // JS dan PR
  const maks = p.tipe === "PR" ? MAKS_PR : MAKS_JS;
  if (teks.length > maks) return gagal("panjang", `Maksimal ${maks} karakter.`);
  if (p.format === "whatsapp" && teks !== "") {
    const wa = normalisasiWhatsApp(teks);
    return wa
      ? { ok: true, nilai: wa }
      : gagal("whatsapp", "Nomor WhatsApp tidak valid. Contoh: 081234567890.");
  }
  return { ok: true, nilai: teks };
}

/**
 * Untuk 7.3 (simpan jawaban per kunci). `jawaban` adalah jawaban yang sudah tersimpan.
 * Kunci harus berupa ID pertanyaan yang SEDANG TAMPIL, atau `ID.sufiks` sub-isian yang
 * induknya sedang menjawab salah satu nilai `saat` (ASUMSI: `SubIsian.kunci` hanya sufiksnya,
 * misal "lainnya"). Selain itu ditolak dengan kode `tidak_tampil`.
 */
export function validasiSimpan(
  def: DefinisiForm,
  jawaban: Jawaban,
  kunci: string,
  nilai: unknown,
  hariIni: string,
  jenisDitetapkan?: Jenis,
): Hasil {
  const tampil = pertanyaanTampil(def, jawaban, jenisDitetapkan);
  const langsung = tampil.find((t) => t.pertanyaan.id === kunci);
  if (langsung) return validasiNilai(langsung, nilai, hariIni);

  const titik = kunci.lastIndexOf(".");
  const induk = titik > 0 ? tampil.find((t) => t.pertanyaan.id === kunci.slice(0, titik)) : undefined;
  const sub = induk?.pertanyaan.subIsian?.find((s) => s.kunci === kunci.slice(titik + 1));
  const gagal = (kode: KodeGalat, pesan: string): Hasil => ({
    ok: false,
    galat: { id: kunci, kode, pesan, bagian: induk?.bagian },
  });

  if (!induk || !sub) return gagal("tidak_tampil", "Pertanyaan ini tidak tersedia.");
  const dipilih = jawaban[induk.pertanyaan.id];
  const daftar = Array.isArray(dipilih) ? dipilih : dipilih === undefined ? [] : [dipilih];
  if (!daftar.some((x) => sub.saat.includes(x))) {
    return gagal("tidak_tampil", "Isian ini hanya muncul bila opsi terkait dipilih.");
  }
  if (typeof nilai !== "string") return gagal("tipe", "Jawaban harus berupa teks.");
  const teks = nilai.trim();
  if (teks.length > MAKS_JS) return gagal("panjang", `Maksimal ${MAKS_JS} karakter.`);
  return { ok: true, nilai: teks };
}

/**
 * Untuk 7.4 (Kirim). Memeriksa semua pertanyaan yang tampil: wajib terisi dan semua nilai
 * yang ada valid (termasuk tanggal yang kini sudah lewat), ditambah persetujuan 8.3.
 * Jawaban pertanyaan yang tersembunyi tidak diperiksa. Hasil kosong berarti boleh dikirim.
 */
export function validasiKirim(
  def: DefinisiForm,
  jawaban: Jawaban,
  setuju: boolean,
  hariIni: string,
  jenisDitetapkan?: Jenis,
): Galat[] {
  const galat: Galat[] = [];
  for (const t of pertanyaanTampil(def, jawaban, jenisDitetapkan)) {
    const p = t.pertanyaan;
    const v = jawaban[p.id];
    if (!terisi(v)) {
      if (p.wajib) {
        galat.push({ id: p.id, kode: "wajib", pesan: "Pertanyaan ini wajib diisi.", bagian: t.bagian });
      }
      continue;
    }
    const h = validasiNilai(t, v, hariIni);
    if (!h.ok) galat.push(h.galat);
  }
  if (!setuju) {
    galat.push({
      id: "persetujuan",
      kode: "persetujuan",
      pesan: "Anda perlu menyetujui penggunaan data sebelum mengirim.",
    });
  }
  return galat;
}