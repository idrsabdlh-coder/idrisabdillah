import { describe, it, expect } from "vitest";
import { FORM_V1 } from "./form-v1";
import { ID_JENIS, idTampil, pertanyaanTampil, rujukanMaju } from "./percabangan";
import { JENIS, idDirujuk, semuaSyarat, slug } from "./syarat";
import { LABEL_JENIS } from "./types";

describe("FORM_V1 (struktur & integritas)", () => {
  it("memuat tepat 80 pertanyaan", () => {
    expect(FORM_V1.pertanyaan).toHaveLength(80);
  });

  it("semua ID pertanyaan unik", () => {
    const ids = FORM_V1.pertanyaan.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("semua ID bagian unik dan setiap pertanyaan merujuk bagian yang ada", () => {
    const bagianIds = new Set(FORM_V1.bagian.map((b) => b.id));
    expect(bagianIds.size).toBe(FORM_V1.bagian.length);
    for (const p of FORM_V1.pertanyaan) {
      expect(bagianIds.has(p.bagian)).toBe(true);
    }
  });

  it("setiap tampilJika merujuk ID pertanyaan yang ada atau @jenis, tanpa rujukan maju", () => {
    const semuaId = new Set(FORM_V1.pertanyaan.map((p) => p.id));
    for (const s of semuaSyarat(FORM_V1)) {
      for (const id of idDirujuk(s)) {
        expect(id === JENIS || semuaId.has(id)).toBe(true);
      }
    }
    expect(rujukanMaju(FORM_V1)).toEqual([]);
  });

  it("setiap opsi dengan nilai unik per pertanyaan dan opsi bantuan bertanda butuhBantuan", () => {
    for (const p of FORM_V1.pertanyaan) {
      if (!p.opsi) continue;
      const nilai = p.opsi.map((o) => o.nilai);
      expect(new Set(nilai).size).toBe(nilai.length);
    }

    const q71 = FORM_V1.pertanyaan.find((p) => p.id === "7.1")!;
    const bantuan71 = q71.opsi!.find((o) => o.label.includes("minta rekomendasi"));
    expect(bantuan71?.butuhBantuan).toBe(true);

    const q3a12 = FORM_V1.pertanyaan.find((p) => p.id === "3A.12")!;
    const bantuan3a12 = q3a12.opsi!.find((o) => o.label.includes("Belum yakin"));
    expect(bantuan3a12?.butuhBantuan).toBe(true);
  });
});

describe("FORM_V1 (skenario PRD bagian 4 & 9)", () => {
  it("KP-01: memilih undangan menyembunyikan 4.1, 4.2, 4.3, 4.6, 4.7, 5.4, 5.5 serta opsi korporat & sesuai logo", () => {
    const tampil = pertanyaanTampil(FORM_V1, {
      [ID_JENIS]: slug(LABEL_JENIS.undangan),
    });
    const ids = new Set(tampil.map((t) => t.pertanyaan.id));

    for (const tersembunyi of ["4.1", "4.2", "4.3", "4.6", "4.7", "5.4", "5.5"]) {
      expect(ids.has(tersembunyi)).toBe(false);
    }
    for (const muncul of ["4.4", "4.5", "4.8", "5.1", "5.2", "5.3"]) {
      expect(ids.has(muncul)).toBe(true);
    }

    const p44 = tampil.find((t) => t.pertanyaan.id === "4.4")!;
    expect(p44.opsi!.some((o) => o.label === "Profesional dan korporat")).toBe(false);

    const p45 = tampil.find((t) => t.pertanyaan.id === "4.5")!;
    expect(p45.opsi!.some((o) => o.label === "Sesuai logo")).toBe(false);
  });

  it("KP-07: memilih 3D.6 Pesan lewat WhatsApp menyembunyikan 3D.7, 3D.9, 3D.10", () => {
    const ids = idTampil(FORM_V1, {
      [ID_JENIS]: slug(LABEL_JENIS.katalog),
      "3D.6": slug("Pesan lewat WhatsApp"),
    });
    expect(ids.has("3D.7")).toBe(false);
    expect(ids.has("3D.8")).toBe(true);
    expect(ids.has("3D.9")).toBe(false);
    expect(ids.has("3D.10")).toBe(false);
  });

  it("KP-08: menghapus centang RSVP di 3A.7 menyembunyikan 3A.11 dan muncul kembali saat dicentang", () => {
    const awal = {
      [ID_JENIS]: slug(LABEL_JENIS.undangan),
      "3A.7": [slug("Konfirmasi kehadiran (RSVP)")],
      "3A.11": slug("Langsung di website (data tersimpan rapi)"),
    };
    expect(idTampil(FORM_V1, awal).has("3A.11")).toBe(true);

    const dicabut = { ...awal, "3A.7": [slug("Galeri foto")] };
    expect(idTampil(FORM_V1, dicabut).has("3A.11")).toBe(false);

    const dicentangLagi = { ...dicabut, "3A.7": [slug("Galeri foto"), slug("Konfirmasi kehadiran (RSVP)")] };
    expect(idTampil(FORM_V1, dicentangLagi).has("3A.11")).toBe(true);
    expect(dicentangLagi["3A.11"]).toBe(slug("Langsung di website (data tersimpan rapi)"));
  });

  it("KP-04 jalur Belum tahu: 3F.1, 3F.2, 4.1, 4.2, 5.5 masuk ke bagian 3F", () => {
    const tampil = pertanyaanTampil(FORM_V1, {
      [ID_JENIS]: slug(LABEL_JENIS.belum),
    });
    const di3F = tampil.filter((t) => t.bagian === "3F").map((t) => t.pertanyaan.id);
    expect(di3F).toEqual(["3F.1", "3F.2", "4.1", "4.2", "5.5"]);
  });

  it("4.2: opsi 5.4 yang sudah dipilih di 3B.3 disembunyikan", () => {
    const tampil = pertanyaanTampil(FORM_V1, {
      [ID_JENIS]: slug(LABEL_JENIS.company),
      "3B.3": [slug("Kontak"), slug("Berita/blog")],
    });
    const p54 = tampil.find((t) => t.pertanyaan.id === "5.4")!;
    const label54 = p54.opsi!.map((o) => o.label);
    expect(label54).not.toContain("Formulir kontak");
    expect(label54).not.toContain("Berita atau artikel");
    expect(label54).toContain("Tombol chat WhatsApp");
  });
});
