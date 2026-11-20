import { describe, it, expect } from "vitest";
import {
  BAGIAN_JALUR_BELUM,
  ID_JENIS,
  idTampil,
  jenisBerlaku,
  jenisDariJawaban,
  pertanyaanTampil,
  rujukanMaju,
} from "./percabangan";
import { JENIS, adalah, slug } from "./syarat";
import { DAFTAR_JENIS, LABEL_JENIS } from "./types";
import type { DefinisiForm, Jawaban, Jenis, Opsi, Pertanyaan } from "./types";

const pilih = (...label: string[]): Opsi[] => label.map((l) => ({ nilai: slug(l), label: l }));
const nilaiJenis = (j: Jenis) => slug(LABEL_JENIS[j]);
const q = (p: Partial<Pertanyaan> & Pick<Pertanyaan, "id" | "bagian">): Pertanyaan => ({
  teks: `Pertanyaan ${p.id}`,
  tipe: "JS",
  ...p,
});

// Definisi mini. Urutan array = urutan tanya.
const def: DefinisiForm = {
  versi: 1,
  bagian: [
    { id: "1", judul: "Kontak" },
    { id: "2", judul: "Jenis" },
    { id: "3A", judul: "Undangan", tampilJika: adalah(JENIS, "undangan") },
    { id: "3B", judul: "Company", tampilJika: adalah(JENIS, "company") },
    // Bagian 3F bergantung pada JAWABAN 2.1, bukan @jenis (yang berubah setelah ditetapkan).
    { id: "3F", judul: "Bantu memilih", tampilJika: adalah(ID_JENIS, LABEL_JENIS.belum) },
    { id: "4", judul: "Tujuan" },
    { id: "5", judul: "Lain-lain" },
  ],
  pertanyaan: [
    q({ id: "1.1", bagian: "1", wajib: true }),
    q({
      id: "2.1",
      bagian: "2",
      tipe: "PG",
      wajib: true,
      opsi: DAFTAR_JENIS.map((j) => ({ nilai: nilaiJenis(j), label: LABEL_JENIS[j] })),
    }),
    q({ id: "3A.1", bagian: "3A" }),
    q({ id: "3B.1", bagian: "3B", tipe: "PG", opsi: pilih("Ya", "Tidak") }),
    q({ id: "3F.1", bagian: "3F" }),
    q({ id: "3F.2", bagian: "3F" }),
    q({
      id: "4.1",
      bagian: "4",
      tipe: "PG",
      jalurBelum: true,
      tampilJika: adalah(JENIS, "company", "katalog"),
      opsi: pilih("Kecil", "Besar"),
    }),
    q({
      id: "4.2",
      bagian: "4",
      tipe: "PG",
      jalurBelum: true,
      tampilJika: adalah(JENIS, "company", "katalog"),
      opsi: [
        { nilai: "dasar", label: "Dasar" },
        { nilai: "premium", label: "Premium", tampilJika: adalah("4.1", "Besar") },
      ],
    }),
    q({ id: "5.2", bagian: "5", tampilJika: adalah("3B.1", "Ya") }),
    q({
      id: "5.5",
      bagian: "5",
      jalurBelum: true,
      tampilJika: adalah(JENIS, "company", "katalog"),
    }),
  ],
};

const ids = (jawaban: Jawaban, jenisDitetapkan?: Jenis) =>
  pertanyaanTampil(def, jawaban, jenisDitetapkan).map((t) => t.pertanyaan.id);

describe("jenisDariJawaban", () => {
  it("setiap jenis dapat dibaca kembali dari nilai opsinya", () => {
    for (const j of DAFTAR_JENIS) {
      expect(jenisDariJawaban({ [ID_JENIS]: nilaiJenis(j) })).toBe(j);
    }
  });
  it("belum dijawab, nilai tak dikenal, array, atau nama bawaan objek: undefined", () => {
    expect(jenisDariJawaban({})).toBeUndefined();
    expect(jenisDariJawaban({ [ID_JENIS]: "ngawur" })).toBeUndefined();
    expect(jenisDariJawaban({ [ID_JENIS]: ["company"] })).toBeUndefined();
    expect(jenisDariJawaban({ [ID_JENIS]: "constructor" })).toBeUndefined();
  });
});

describe("jenisBerlaku", () => {
  it("2.1 belum dijawab: undefined", () => {
    expect(jenisBerlaku({}, "company")).toBeUndefined();
  });
  it("jenis nyata: jenisDitetapkan diabaikan", () => {
    expect(jenisBerlaku({ [ID_JENIS]: nilaiJenis("undangan") }, "company")).toBe("undangan");
  });
  it("jalur Belum: 'belum' sampai ditetapkan; 'belum' sebagai penetapan dianggap belum ditetapkan", () => {
    const j = { [ID_JENIS]: nilaiJenis("belum") };
    expect(jenisBerlaku(j)).toBe("belum");
    expect(jenisBerlaku(j, "belum")).toBe("belum");
    expect(jenisBerlaku(j, "katalog")).toBe("katalog");
  });
});

describe("pertanyaanTampil: jalur biasa", () => {
  it("2.1 belum dijawab: hanya pertanyaan tanpa syarat jenis", () => {
    expect(ids({})).toEqual(["1.1", "2.1"]);
  });
  it("undangan: hanya bagian 3A; bagian 3F dan pertanyaan jalurBelum tidak tampil", () => {
    expect(ids({ [ID_JENIS]: nilaiJenis("undangan") })).toEqual(["1.1", "2.1", "3A.1"]);
  });
  it("company: 3B, 4.1, 4.2, 5.5 di bagian aslinya", () => {
    const t = pertanyaanTampil(def, { [ID_JENIS]: nilaiJenis("company") });
    expect(t.map((x) => x.pertanyaan.id)).toEqual(["1.1", "2.1", "3B.1", "4.1", "4.2", "5.5"]);
    expect(t.find((x) => x.pertanyaan.id === "4.1")?.bagian).toBe("4");
  });
  it("pertanyaan yang bergantung pada jawaban lain muncul setelah jawaban itu ada", () => {
    const j = { [ID_JENIS]: nilaiJenis("company") };
    expect(ids(j)).not.toContain("5.2");
    expect(ids({ ...j, "3B.1": "ya" })).toContain("5.2");
    expect(ids({ ...j, "3B.1": "tidak" })).not.toContain("5.2");
  });
});

describe("pertanyaanTampil: jawaban basi tidak membuka pertanyaan lain", () => {
  it("jenis diganti ke undangan, jawaban lama company masih tersimpan", () => {
    const j = { [ID_JENIS]: nilaiJenis("undangan"), "3B.1": "ya", "4.1": "besar" };
    const hasil = ids(j);
    expect(hasil).not.toContain("3B.1");
    expect(hasil).not.toContain("5.2"); // bergantung pada 3B.1 yang tersembunyi
    expect(idTampil(def, j).has("3B.1")).toBe(false);
  });
});

describe("pertanyaanTampil: jalur 'Belum tahu'", () => {
  const belum = { [ID_JENIS]: nilaiJenis("belum") };

  it("sebelum ditetapkan: 3F.1, 3F.2, 4.1, 4.2, 5.5 semuanya di bagian 3F; tidak ada 3A/3B", () => {
    const t = pertanyaanTampil(def, belum);
    expect(t.map((x) => x.pertanyaan.id)).toEqual(["1.1", "2.1", "3F.1", "3F.2", "4.1", "4.2", "5.5"]);
    for (const id of ["3F.1", "3F.2", "4.1", "4.2", "5.5"]) {
      expect(t.find((x) => x.pertanyaan.id === id)?.bagian).toBe(BAGIAN_JALUR_BELUM);
    }
  });

  it("setelah jenis ditetapkan: bagian jenis terbuka, 4.1/4.2/5.5 tidak ditanya ulang", () => {
    const t = pertanyaanTampil(def, belum, "company");
    const id = t.map((x) => x.pertanyaan.id);
    expect(id).toEqual(["1.1", "2.1", "3B.1", "3F.1", "3F.2", "4.1", "4.2", "5.5"]);
    expect(new Set(id).size).toBe(id.length); // tidak ada duplikat
    expect(t.find((x) => x.pertanyaan.id === "4.1")?.bagian).toBe("3F");
  });

  it("jenis ditetapkan berupa undangan: bagian 3A terbuka, 4.1/4.2/5.5 tetap di 3F", () => {
    const id = ids(belum, "undangan");
    expect(id).toContain("3A.1");
    expect(id).toContain("3F.1");
  });

  it("jenisDitetapkan diabaikan bila klien memilih jenis nyata di 2.1", () => {
    const id = ids({ [ID_JENIS]: nilaiJenis("undangan") }, "company");
    expect(id).toContain("3A.1");
    expect(id).not.toContain("3B.1");
  });
});

describe("pertanyaanTampil: opsi", () => {
  const company = { [ID_JENIS]: nilaiJenis("company") };
  const opsiDari = (j: Jawaban, id: string) =>
    pertanyaanTampil(def, j).find((x) => x.pertanyaan.id === id)?.opsi?.map((o) => o.nilai);

  it("opsi bersyarat hanya muncul bila syaratnya terpenuhi", () => {
    expect(opsiDari({ ...company, "4.1": "besar" }, "4.2")).toEqual(["dasar", "premium"]);
    expect(opsiDari({ ...company, "4.1": "kecil" }, "4.2")).toEqual(["dasar"]);
    expect(opsiDari(company, "4.2")).toEqual(["dasar"]);
  });
  it("opsi tanpa syarat tetap utuh; pertanyaan non-pilihan tidak punya opsi", () => {
    expect(opsiDari(company, "4.1")).toEqual(["kecil", "besar"]);
    expect(opsiDari(company, "1.1")).toBeUndefined();
  });
});

describe("kemurnian", () => {
  it("tidak mengubah jawaban masukan", () => {
    const j = Object.freeze({
      [ID_JENIS]: nilaiJenis("company"),
      "3B.1": "ya",
    }) as Jawaban;
    expect(() => pertanyaanTampil(def, j)).not.toThrow();
  });
  it("hasil sama untuk masukan sama", () => {
    const j = { [ID_JENIS]: nilaiJenis("company") };
    expect(pertanyaanTampil(def, j)).toEqual(pertanyaanTampil(def, j));
  });
});

describe("rujukanMaju", () => {
  it("definisi yang urutannya benar: tidak ada masalah", () => {
    expect(rujukanMaju(def)).toEqual([]);
  });
  it("menangkap rujukan ke pertanyaan setelahnya, ke ID yang tidak ada, dan dari bagian", () => {
    const buruk: DefinisiForm = {
      versi: 1,
      bagian: [{ id: "1", judul: "A", tampilJika: adalah("b2", "x") }],
      pertanyaan: [
        q({ id: "a1", bagian: "1", tampilJika: adalah("b2", "x") }),
        q({ id: "b2", bagian: "1", tampilJika: adalah("tidak-ada", "x") }),
      ],
    };
    const m = rujukanMaju(buruk);
    expect(m).toHaveLength(3);
    expect(m).toContain("pertanyaan a1 merujuk b2");
    expect(m).toContain("pertanyaan b2 merujuk tidak-ada");
    expect(m).toContain("bagian 1 merujuk b2");
  });
  it("@jenis di pertanyaan yang muncul sebelum 2.1 ditandai", () => {
    const buruk: DefinisiForm = {
      versi: 1,
      bagian: [{ id: "1", judul: "A" }],
      pertanyaan: [
        q({ id: "a1", bagian: "1", tampilJika: adalah(JENIS, "company") }),
        q({ id: ID_JENIS, bagian: "1", tipe: "PG" }),
      ],
    };
    expect(rujukanMaju(buruk)).toEqual([`pertanyaan a1 merujuk ${JENIS}`]);
  });
});