import { describe, it, expect } from "vitest";
import { rekomendasikan } from "./rekomendasi";
import { slug } from "./syarat";
import type { Jawaban } from "./types";

describe("rekomendasikan", () => {
  it("aturan 1: pengunjung orang tua murid -> sekolah", () => {
    const res = rekomendasikan({
      "4.2": [slug("Orang tua murid")],
    });
    expect(res.aturan).toBe(1);
    expect(res.jenis).toBe("sekolah");
    expect(res.alternatif).toBeUndefined();
    expect(res.alasan).toBeTruthy();
  });

  it("aturan 2: mengundang + satu acara -> undangan (alternatif khusus)", () => {
    const res = rekomendasikan({
      "4.1": [slug("Memberi informasi acara atau mengundang")],
      "3F.2": slug("Satu acara"),
    });
    expect(res.aturan).toBe(2);
    expect(res.jenis).toBe("undangan");
    expect(res.alternatif).toBe("khusus");
  });

  it("aturan 2 tidak cocok bila bukan satu acara, jatuh ke bawaan", () => {
    const res = rekomendasikan({
      "4.1": [slug("Memberi informasi acara atau mengundang")],
      "3F.2": slug("Banyak acara"),
    });
    expect(res.aturan).toBe(6);
    expect(res.jenis).toBe("khusus");
  });

  it("aturan 3: menjual produk -> katalog", () => {
    const res = rekomendasikan({
      "4.1": [slug("Menjual produk")],
    });
    expect(res.aturan).toBe(3);
    expect(res.jenis).toBe("katalog");
    expect(res.alternatif).toBeUndefined();
  });

  it("aturan 4 (via 3F.1): ada pembayaran atau pendaftaran -> khusus", () => {
    const res = rekomendasikan({
      "3F.1": slug("Ya, pembayaran atau pendaftaran"),
    });
    expect(res.aturan).toBe(4);
    expect(res.jenis).toBe("khusus");
  });

  it("aturan 4 (via 4.1): mengumpulkan pendaftar atau mengelola data -> khusus", () => {
    const res = rekomendasikan({
      "4.1": [slug("Mengumpulkan pendaftar atau mengelola data")],
    });
    expect(res.aturan).toBe(4);
    expect(res.jenis).toBe("khusus");
  });

  it("aturan 5: calon mitra bisnis + terlihat profesional -> company", () => {
    const res = rekomendasikan({
      "4.2": [slug("Calon mitra bisnis")],
      "4.1": [slug("Terlihat lebih profesional dan terpercaya")],
    });
    expect(res.aturan).toBe(5);
    expect(res.jenis).toBe("company");
  });

  it("aturan 6 (bawaan): jawaban kosong atau tidak cocok aturan 1-5 -> khusus", () => {
    const res = rekomendasikan({});
    expect(res.aturan).toBe(6);
    expect(res.jenis).toBe("khusus");
    expect(res.alternatif).toBeUndefined();
  });

  it("prioritas: cocok dengan dua aturan (aturan 1 dan 3), aturan pertama menang", () => {
    const res = rekomendasikan({
      "4.2": [slug("Orang tua murid")],
      "4.1": [slug("Menjual produk")],
    });
    expect(res.aturan).toBe(1);
    expect(res.jenis).toBe("sekolah");
  });

  it("prioritas: cocok aturan 3 dan 4, aturan 3 menang", () => {
    const res = rekomendasikan({
      "4.1": [slug("Menjual produk"), slug("Mengumpulkan pendaftar atau mengelola data")],
      "3F.1": slug("Ya, pembayaran atau pendaftaran"),
    });
    expect(res.aturan).toBe(3);
    expect(res.jenis).toBe("katalog");
  });

  it("bersifat murni: tidak memodifikasi objek jawaban masukan", () => {
    const jawaban: Jawaban = { "4.2": [slug("Orang tua murid")] };
    const salinan = structuredClone(jawaban);
    rekomendasikan(jawaban);
    expect(jawaban).toEqual(salinan);
  });
});
