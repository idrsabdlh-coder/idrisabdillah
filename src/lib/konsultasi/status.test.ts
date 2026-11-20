import { describe, it, expect } from "vitest";
import { bolehTransisi, buatTautanWhatsApp, transisiDiizinkan } from "./status";

describe("transisi status konsultasi (PRD 3.4)", () => {
  it("hanya boleh maju satu langkah atau ke Ditutup", () => {
    expect(transisiDiizinkan("Terkirim", "Tim")).toEqual(["Ditinjau", "Ditutup"]);
    expect(transisiDiizinkan("Ditinjau", "Tim")).toEqual(["Dihubungi", "Ditutup"]);
    expect(bolehTransisi("Terkirim", "Penawaran", "Tim")).toBe(false);
    expect(bolehTransisi("Dihubungi", "Ditinjau", "Tim")).toBe(false);
  });

  it("pembukaan kembali dari Ditutup hanya boleh oleh Admin", () => {
    expect(bolehTransisi("Ditutup", "Ditinjau", "Tim")).toBe(false);
    expect(bolehTransisi("Ditutup", "Ditinjau", "Admin")).toBe(true);
  });

  it("Disetujui hanya bisa ke Ditutup", () => {
    expect(transisiDiizinkan("Disetujui", "Admin")).toEqual(["Ditutup"]);
  });
});

describe("buatTautanWhatsApp", () => {
  it("membuat tautan wa.me dengan nama klien ter-encode", () => {
    const url = buatTautanWhatsApp("628123456789", "Budi Santoso", "KON-1234AB");
    expect(url.startsWith("https://wa.me/628123456789?text=")).toBe(true);
    expect(decodeURIComponent(url.split("?text=")[1]!)).toContain("Budi Santoso");
    expect(decodeURIComponent(url.split("?text=")[1]!)).toContain("KON-1234AB");
  });
});
