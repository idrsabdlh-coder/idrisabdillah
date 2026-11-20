import { describe, it, expect } from "vitest";
import { ID_JENIS } from "./percabangan";
import { JENIS, adalah, slug } from "./syarat";
import {
  MAKS_JS,
  MAKS_PR,
  hariIniWIB,
  normalisasiWhatsApp,
  tanggalValid,
  validasiKirim,
  validasiSimpan,
} from "./validasi";
import type { Hasil } from "./validasi";
import { DAFTAR_JENIS, LABEL_JENIS } from "./types";
import type { DefinisiForm, Jawaban, Jenis, Opsi, Pertanyaan } from "./types";

const HARI_INI = "2026-11-17";
const pilih = (...label: string[]): Opsi[] => label.map((l) => ({ nilai: slug(l), label: l }));
const nilaiJenis = (j: Jenis) => slug(LABEL_JENIS[j]);
const q = (p: Partial<Pertanyaan> & Pick<Pertanyaan, "id" | "bagian">): Pertanyaan => ({
  teks: `Pertanyaan ${p.id}`,
  tipe: "JS",
  ...p,
});

const def: DefinisiForm = {
  versi: 1,
  bagian: [
    { id: "1", judul: "Kontak" },
    { id: "2", judul: "Jenis" },
    { id: "3A", judul: "Undangan", tampilJika: adalah(JENIS, "undangan") },
    { id: "4", judul: "Lain-lain" },
  ],
  pertanyaan: [
    q({ id: "1.1", bagian: "1", wajib: true }),
    q({ id: "1.2", bagian: "1", wajib: true, format: "whatsapp" }),
    q({
      id: "2.1",
      bagian: "2",
      tipe: "PG",
      wajib: true,
      opsi: DAFTAR_JENIS.map((j) => ({ nilai: nilaiJenis(j), label: LABEL_JENIS[j] })),
    }),
    q({ id: "3A.1", bagian: "3A", tipe: "TG", wajib: true, tidakMasaLalu: true }),
    q({ id: "3A.2", bagian: "3A", tipe: "KC", opsi: pilih("Musik", "Foto", "Video") }),
    q({
      id: "3A.3",
      bagian: "3A",
      tipe: "PG",
      opsi: pilih("Akad", "Resepsi", "Lainnya"),
      subIsian: [{ kunci: "lainnya", label: "Sebutkan", saat: ["lainnya"] }],
    }),
    q({ id: "4.1", bagian: "4", tipe: "PR" }),
    q({ id: "4.2", bagian: "4", tipe: "TG" }), // tanggal bebas, boleh masa lalu
    q({
      id: "4.3",
      bagian: "4",
      tipe: "PG",
      opsi: [
        { nilai: "dasar", label: "Dasar" },
        { nilai: "premium", label: "Premium", tampilJika: adalah(ID_JENIS, LABEL_JENIS.undangan) },
      ],
    }),
  ],
};

const undangan: Jawaban = { [ID_JENIS]: nilaiJenis("undangan") };
const company: Jawaban = { [ID_JENIS]: nilaiJenis("company") };
const simpan = (kunci: string, nilai: unknown, jawaban: Jawaban = undangan) =>
  validasiSimpan(def, jawaban, kunci, nilai, HARI_INI);
const kode = (r: Hasil) => (r.ok ? "ok" : r.galat.kode);

describe("normalisasiWhatsApp", () => {
  it.each([
    ["081234567890", "6281234567890"],
    ["+62 812-3456-7890", "6281234567890"],
    ["(0812) 3456 7890", "6281234567890"],
    ["6281234567890", "6281234567890"],
    ["62081234567890", "6281234567890"],
    ["006281234567890", "6281234567890"],
    ["  0812.3456.7890 ", "6281234567890"],
  ])("%s menjadi %s", (masukan, hasil) => {
    expect(normalisasiWhatsApp(masukan)).toBe(hasil);
  });

  it.each([
    "",
    "abc",
    "12345",
    "081234", // terlalu pendek
    "0812345678901234567", // terlalu panjang
    "8123456789", // tanpa awalan
    "02112345678", // telepon rumah
    "+14155552671", // luar negeri
    "0812-abcd-1234",
    "62+81234567890",
  ])("menolak %j", (masukan) => {
    expect(normalisasiWhatsApp(masukan)).toBeNull();
  });
});

describe("tanggalValid", () => {
  it("menerima tanggal nyata, termasuk 29 Februari kabisat", () => {
    expect(tanggalValid("2026-02-28")).toBe(true);
    expect(tanggalValid("2028-02-29")).toBe(true);
  });
  it("menolak tanggal yang tidak ada atau formatnya salah", () => {
    for (const s of ["2026-02-29", "2026-02-30", "2026-13-01", "26-01-01", "2026-1-1", "", "besok"]) {
      expect(tanggalValid(s)).toBe(false);
    }
  });
});

describe("hariIniWIB", () => {
  it("memakai zona WIB, bukan UTC", () => {
    expect(hariIniWIB(new Date("2026-11-16T20:00:00Z"))).toBe("2026-11-17"); // 03.00 WIB
    expect(hariIniWIB(new Date("2026-11-17T16:59:59Z"))).toBe("2026-11-17"); // 23.59 WIB
    expect(hariIniWIB(new Date("2026-11-17T17:00:00Z"))).toBe("2026-11-18"); // 00.00 WIB
  });
});

describe("validasiSimpan: kunci", () => {
  it("ID tidak dikenal ditolak", () => {
    expect(kode(simpan("9.9", "x"))).toBe("tidak_tampil");
    expect(kode(simpan("__proto__", "x"))).toBe("tidak_tampil");
  });
  it("ID yang ada tetapi tidak sedang tampil ditolak", () => {
    expect(kode(simpan("3A.1", "2026-12-01", company))).toBe("tidak_tampil");
    expect(kode(simpan("3A.1", "2026-12-01", {}))).toBe("tidak_tampil");
  });
  it("ID yang sedang tampil diterima", () => {
    expect(kode(simpan("3A.1", "2026-12-01"))).toBe("ok");
  });
});

describe("validasiSimpan: teks (JS dan PR)", () => {
  it("dirapikan dengan trim", () => {
    expect(simpan("1.1", "  Budi  ")).toEqual({ ok: true, nilai: "Budi" });
  });
  it("batas panjang", () => {
    expect(kode(simpan("1.1", "a".repeat(MAKS_JS)))).toBe("ok");
    expect(kode(simpan("1.1", "a".repeat(MAKS_JS + 1)))).toBe("panjang");
    expect(kode(simpan("4.1", "a".repeat(MAKS_PR)))).toBe("ok");
    expect(kode(simpan("4.1", "a".repeat(MAKS_PR + 1)))).toBe("panjang");
  });
  it("bukan string ditolak", () => {
    for (const v of [123, null, undefined, ["a"], { a: 1 }, true]) {
      expect(kode(simpan("1.1", v))).toBe("tipe");
    }
  });
  it("nilai kosong diterima (menghapus jawaban)", () => {
    expect(simpan("1.1", "   ")).toEqual({ ok: true, nilai: "" });
  });
});

describe("validasiSimpan: WhatsApp", () => {
  it("dinormalkan ke 62… dan nilai yang dikembalikan yang harus disimpan", () => {
    expect(simpan("1.2", "0812-3456-7890")).toEqual({ ok: true, nilai: "6281234567890" });
  });
  it("tidak valid ditolak; kosong diterima", () => {
    expect(kode(simpan("1.2", "12345"))).toBe("whatsapp");
    expect(simpan("1.2", "")).toEqual({ ok: true, nilai: "" });
  });
});

describe("validasiSimpan: pilihan ganda (PG)", () => {
  it("nilai yang ada di definisi diterima", () => {
    expect(simpan("2.1", nilaiJenis("katalog"))).toEqual({ ok: true, nilai: nilaiJenis("katalog") });
  });
  it("nilai yang tidak ada ditolak, label bukan nilai", () => {
    expect(kode(simpan("2.1", "ngawur"))).toBe("pilihan");
    expect(kode(simpan("2.1", LABEL_JENIS.katalog))).toBe("pilihan");
  });
  it("array ditolak sebagai tipe", () => {
    expect(kode(simpan("2.1", ["company"]))).toBe("tipe");
  });
  it("opsi yang disembunyikan syaratnya tidak boleh dipilih", () => {
    expect(kode(simpan("4.3", "premium", undangan))).toBe("ok");
    expect(kode(simpan("4.3", "premium", company))).toBe("pilihan");
    expect(kode(simpan("4.3", "dasar", company))).toBe("ok");
  });
});

describe("validasiSimpan: kotak centang (KC)", () => {
  it("daftar valid diterima, termasuk kosong", () => {
    expect(simpan("3A.2", ["musik", "foto"])).toEqual({ ok: true, nilai: ["musik", "foto"] });
    expect(simpan("3A.2", [])).toEqual({ ok: true, nilai: [] });
  });
  it("ganda, tidak dikenal, atau bukan array ditolak", () => {
    expect(kode(simpan("3A.2", ["musik", "musik"]))).toBe("pilihan");
    expect(kode(simpan("3A.2", ["musik", "xx"]))).toBe("pilihan");
    expect(kode(simpan("3A.2", "musik"))).toBe("tipe");
    expect(kode(simpan("3A.2", [1]))).toBe("tipe");
  });
});

describe("validasiSimpan: tanggal (TG)", () => {
  it("hari ini dan masa depan diterima", () => {
    expect(kode(simpan("3A.1", HARI_INI))).toBe("ok");
    expect(kode(simpan("3A.1", "2027-01-01"))).toBe("ok");
  });
  it("kemarin ditolak bila tidakMasaLalu", () => {
    expect(kode(simpan("3A.1", "2026-11-16"))).toBe("masa_lalu");
  });
  it("tanggal masa lalu boleh bila pertanyaan tidak menandainya", () => {
    expect(kode(simpan("4.2", "2020-01-01"))).toBe("ok");
  });
  it("format salah atau tanggal fiktif ditolak", () => {
    expect(kode(simpan("3A.1", "17-11-2026"))).toBe("tanggal");
    expect(kode(simpan("3A.1", "2026-02-30"))).toBe("tanggal");
  });
  it("kosong diterima", () => {
    expect(simpan("3A.1", "")).toEqual({ ok: true, nilai: "" });
  });
});

describe("validasiSimpan: sub-isian", () => {
  const lainnya: Jawaban = { ...undangan, "3A.3": "lainnya" };
  it("diterima bila induk memilih nilai yang memicu", () => {
    expect(simpan("3A.3.lainnya", "  Konser ", lainnya)).toEqual({ ok: true, nilai: "Konser" });
  });
  it("ditolak bila induk memilih nilai lain atau belum dijawab", () => {
    expect(kode(simpan("3A.3.lainnya", "x", { ...undangan, "3A.3": "akad" }))).toBe("tidak_tampil");
    expect(kode(simpan("3A.3.lainnya", "x", undangan))).toBe("tidak_tampil");
  });
  it("ditolak bila sufiks tidak dikenal atau induk tidak tampil", () => {
    expect(kode(simpan("3A.3.xyz", "x", lainnya))).toBe("tidak_tampil");
    expect(kode(simpan("3A.3.lainnya", "x", { ...company, "3A.3": "lainnya" }))).toBe("tidak_tampil");
  });
  it("tipe dan panjang diperiksa", () => {
    expect(kode(simpan("3A.3.lainnya", 5, lainnya))).toBe("tipe");
    expect(kode(simpan("3A.3.lainnya", "a".repeat(MAKS_JS + 1), lainnya))).toBe("panjang");
  });
});

describe("validasiKirim", () => {
  const lengkap: Jawaban = {
    "1.1": "Budi",
    "1.2": "6281234567890",
    ...undangan,
    "3A.1": "2026-12-01",
  };
  const kirim = (j: Jawaban, setuju = true) => validasiKirim(def, j, setuju, HARI_INI);

  it("jawaban lengkap dan setuju: tidak ada galat", () => {
    expect(kirim(lengkap)).toEqual([]);
  });
  it("tidak setuju: hanya galat persetujuan", () => {
    const g = kirim(lengkap, false);
    expect(g.map((x) => x.kode)).toEqual(["persetujuan"]);
    expect(g[0].id).toBe("persetujuan");
  });
  it("wajib kosong dilaporkan per ID dengan bagiannya", () => {
    const g = kirim({});
    expect(g.map((x) => x.id)).toEqual(["1.1", "1.2", "2.1"]);
    expect(g.every((x) => x.kode === "wajib")).toBe(true);
    expect(g[0].bagian).toBe("1");
  });
  it("hanya spasi dianggap belum diisi", () => {
    expect(kirim({ ...lengkap, "1.1": "   " }).map((x) => x.id)).toEqual(["1.1"]);
  });
  it("wajib pada pertanyaan tersembunyi tidak dituntut", () => {
    const g = kirim({ "1.1": "Budi", "1.2": "6281234567890", ...company });
    expect(g).toEqual([]);
  });
  it("jawaban basi di pertanyaan tersembunyi tidak divalidasi", () => {
    const g = kirim({ "1.1": "Budi", "1.2": "6281234567890", ...company, "3A.1": "1999-01-01" });
    expect(g).toEqual([]);
  });
  it("tanggal yang tersimpan lalu kini sudah lewat ditolak saat Kirim", () => {
    const g = kirim({ ...lengkap, "3A.1": "2026-11-16" });
    expect(g.map((x) => [x.id, x.kode, x.bagian])).toEqual([["3A.1", "masa_lalu", "3A"]]);
  });
  it("nilai tidak valid yang tersimpan ikut dilaporkan", () => {
    const g = kirim({ ...lengkap, "3A.2": ["xx"] });
    expect(g.map((x) => [x.id, x.kode])).toEqual([["3A.2", "pilihan"]]);
  });
});

describe("kemurnian", () => {
  it("tidak mengubah jawaban masukan", () => {
    const j = Object.freeze({ ...undangan, "3A.3": "lainnya" }) as Jawaban;
    expect(() => validasiSimpan(def, j, "3A.3.lainnya", "x", HARI_INI)).not.toThrow();
    expect(() => validasiKirim(def, j, true, HARI_INI)).not.toThrow();
  });
});