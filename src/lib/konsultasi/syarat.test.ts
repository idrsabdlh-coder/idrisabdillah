import { describe, it, expect } from "vitest";
import {
  JENIS,
  adalah,
  memuat,
  bukan,
  semua,
  salahSatu,
  tidak,
  cocok,
  slug,
  terisi,
  idDirujuk,
  semuaSyarat,
} from "./syarat";
import type { DefinisiForm, Jenis, Konteks } from "./types";

const buat = (jawaban: Konteks["jawaban"] = {}, jenis?: Jenis): Konteks => ({
  jawaban,
  jenis,
});

describe("slug", () => {
  it("huruf kecil, spasi jadi tanda hubung", () => {
    expect(slug("Undangan Pernikahan")).toBe("undangan-pernikahan");
  });
  it("membuang diakritik dan simbol, merapikan tanda hubung", () => {
    expect(slug("  Café & Bar!! ")).toBe("cafe-bar");
  });
  it("label hanya simbol menghasilkan string kosong (harus ditangkap tes 6.6)", () => {
    expect(slug("???")).toBe("");
  });
});

describe("terisi", () => {
  it("undefined, string kosong/spasi, dan array kosong dianggap belum terisi", () => {
    expect(terisi(undefined)).toBe(false);
    expect(terisi("")).toBe(false);
    expect(terisi("   ")).toBe(false);
    expect(terisi([])).toBe(false);
  });
  it("string dan array berisi dianggap terisi", () => {
    expect(terisi("a")).toBe(true);
    expect(terisi(["a"])).toBe(true);
  });
});

describe("adalah", () => {
  it("cocok pada pilihan tunggal, argumen otomatis di-slug", () => {
    const c = buat({ q1: "undangan-pernikahan" });
    expect(cocok(adalah("q1", "Undangan Pernikahan"), c)).toBe(true);
    expect(cocok(adalah("q1", "Company Profile"), c)).toBe(false);
  });
  it("beberapa nilai: cocok bila salah satunya sama", () => {
    const c = buat({ q1: "katalog" });
    expect(cocok(adalah("q1", "Company Profile", "Katalog"), c)).toBe(true);
  });
  it("pilihan ganda: cocok bila ada irisan", () => {
    const c = buat({ q1: ["a", "b"] });
    expect(cocok(adalah("q1", "B", "C"), c)).toBe(true);
    expect(cocok(adalah("q1", "C"), c)).toBe(false);
  });
  it("belum dijawab: salah", () => {
    expect(cocok(adalah("q1", "A"), buat())).toBe(false);
    expect(cocok(adalah("q1", "A"), buat({ q1: "" }))).toBe(false);
  });
  it("tanpa nilai tidak pernah cocok", () => {
    expect(cocok(adalah("q1"), buat({ q1: "a" }))).toBe(false);
  });
});

describe("memuat", () => {
  it("cocok bila array memuat nilai", () => {
    const c = buat({ q1: ["a", "b"] });
    expect(cocok(memuat("q1", "B"), c)).toBe(true);
    expect(cocok(memuat("q1", "C"), c)).toBe(false);
  });
  it("pada nilai tunggal berperilaku seperti sama dengan", () => {
    expect(cocok(memuat("q1", "A"), buat({ q1: "a" }))).toBe(true);
  });
  it("belum dijawab: salah", () => {
    expect(cocok(memuat("q1", "A"), buat())).toBe(false);
  });
});

describe("bukan", () => {
  it("benar bila nilai terjawab dan tidak termasuk daftar", () => {
    expect(cocok(bukan("q1", "A"), buat({ q1: "b" }))).toBe(true);
    expect(cocok(bukan("q1", "A"), buat({ q1: "a" }))).toBe(false);
  });
  it("pilihan ganda: salah bila ada satu saja yang termasuk daftar", () => {
    expect(cocok(bukan("q1", "A"), buat({ q1: ["b", "a"] }))).toBe(false);
    expect(cocok(bukan("q1", "A"), buat({ q1: ["b", "c"] }))).toBe(true);
  });
  it("KUNCI PERILAKU: belum dijawab = salah, berbeda dengan tidak(adalah(...))", () => {
    const kosong = buat();
    expect(cocok(bukan("q1", "A"), kosong)).toBe(false);
    expect(cocok(tidak(adalah("q1", "A")), kosong)).toBe(true);
  });
});

describe("@jenis", () => {
  it("dibaca dari ctx.jenis, bukan dari jawaban", () => {
    const c = buat({ "2.1": "katalog-produk-umkm" }, "company");
    expect(cocok(adalah(JENIS, "company"), c)).toBe(true);
    expect(cocok(adalah(JENIS, "katalog"), c)).toBe(false);
  });
  it("beberapa jenis sekaligus", () => {
    expect(cocok(adalah(JENIS, "company", "sekolah"), buat({}, "sekolah"))).toBe(true);
  });
  it("'belum' hanya cocok dengan 'belum', tidak dengan jenis nyata", () => {
    expect(cocok(adalah(JENIS, "company"), buat({}, "belum"))).toBe(false);
    expect(cocok(adalah(JENIS, "belum"), buat({}, "belum"))).toBe(true);
  });
  it("jenis belum ditetapkan (2.1 belum dijawab): semua syarat jenis salah, termasuk 'belum'", () => {
    expect(cocok(adalah(JENIS, "katalog"), buat())).toBe(false);
    expect(cocok(adalah(JENIS, "belum"), buat())).toBe(false);
  });
});

describe("komposisi", () => {
  const c = buat({ q1: "a", q2: "x" });
  it("semua: seluruhnya harus cocok", () => {
    expect(cocok(semua(adalah("q1", "A"), adalah("q2", "X")), c)).toBe(true);
    expect(cocok(semua(adalah("q1", "A"), adalah("q2", "Y")), c)).toBe(false);
  });
  it("salahSatu: cukup satu cocok", () => {
    expect(cocok(salahSatu(adalah("q1", "Z"), adalah("q2", "X")), c)).toBe(true);
    expect(cocok(salahSatu(adalah("q1", "Z"), adalah("q2", "Y")), c)).toBe(false);
  });
  it("tidak membalik hasil", () => {
    expect(cocok(tidak(adalah("q1", "A")), c)).toBe(false);
    expect(cocok(tidak(adalah("q1", "Z")), c)).toBe(true);
  });
  it("bersarang", () => {
    const s = semua(adalah("q1", "A"), salahSatu(adalah("q2", "Y"), tidak(adalah("q2", "Z"))));
    expect(cocok(s, c)).toBe(true);
  });
  it("kasus tepi: semua() kosong benar, salahSatu() kosong salah", () => {
    expect(cocok(semua(), c)).toBe(true);
    expect(cocok(salahSatu(), c)).toBe(false);
  });
});

describe("kemurnian", () => {
  it("tidak mengubah konteks (dibekukan, mutasi akan melempar galat)", () => {
    const c = Object.freeze({
      jenis: "katalog",
      jawaban: Object.freeze({ q1: Object.freeze(["a", "b"]) }),
    }) as unknown as Konteks;
    expect(() => cocok(semua(memuat("q1", "A"), adalah(JENIS, "katalog")), c)).not.toThrow();
  });
});

describe("idDirujuk", () => {
  it("mengumpulkan semua ID dari pohon syarat", () => {
    const s = semua(
      adalah("q1", "A"),
      salahSatu(memuat("q2", "B"), tidak(bukan("q3", "C"))),
      adalah(JENIS, "katalog"),
    );
    expect(idDirujuk(s).sort()).toEqual([JENIS, "q1", "q2", "q3"]);
  });
  it("syarat daun mengembalikan satu ID", () => {
    expect(idDirujuk(adalah("q9", "A"))).toEqual(["q9"]);
  });
});

describe("semuaSyarat", () => {
  const def: DefinisiForm = {
    versi: 1,
    bagian: [
      { id: "1", judul: "Bagian satu" },
      { id: "3A", judul: "Bagian 3A", tampilJika: adalah(JENIS, "undangan") },
    ],
    pertanyaan: [
      {
        id: "p1",
        bagian: "1",
        teks: "Pertanyaan satu",
        tipe: "PG",
        opsi: [
          { nilai: "a", label: "A", tampilJika: adalah("p0", "x") },
          { nilai: "b", label: "B" },
        ],
      },
      { id: "p2", bagian: "3A", teks: "Pertanyaan dua", tipe: "JS", tampilJika: memuat("p1", "a") },
    ],
  };

  it("mengumpulkan syarat dari bagian, pertanyaan, DAN opsi", () => {
    expect(semuaSyarat(def)).toHaveLength(3);
  });
  it("ID yang dirujuk termasuk yang ada di opsi", () => {
    const ids = semuaSyarat(def).flatMap(idDirujuk).sort();
    expect(ids).toEqual([JENIS, "p0", "p1"]);
  });
});