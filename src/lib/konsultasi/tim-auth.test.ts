import { describe, it, expect } from "vitest";
import {
  buatTokenSesi,
  hashKataSandi,
  verifikasiKataSandi,
  verifikasiTokenSesi,
} from "./tim-auth";

describe("kata sandi admin (scrypt)", () => {
  it("hash cocok dengan kata sandi asli dan menolak yang salah", () => {
    const hash = hashKataSandi("rahasia-kuat-123");
    expect(verifikasiKataSandi("rahasia-kuat-123", hash)).toBe(true);
    expect(verifikasiKataSandi("salah", hash)).toBe(false);
    expect(verifikasiKataSandi("rahasia-kuat-123", "format-rusak")).toBe(false);
  });
});

describe("cookie sesi Tim (HMAC-SHA256)", () => {
  const secret = "kunci-rahasia-pengujian-123456";

  it("token valid terbaca dan token yang diubah ditolak", () => {
    const t = buatTokenSesi(secret, 1000);
    const sesi = verifikasiTokenSesi(t, secret, 1100);
    expect(sesi?.peran).toBe("Admin");

    const diubah = t.slice(0, -1) + (t.endsWith("a") ? "b" : "a");
    expect(verifikasiTokenSesi(diubah, secret, 1100)).toBeNull();
  });

  it("token kedaluwarsa ditolak", () => {
    const t = buatTokenSesi(secret, 1000);
    expect(verifikasiTokenSesi(t, secret, 1000 + 60 * 60 * 24 * 8)).toBeNull();
  });
});
