import { describe, it, expect } from "vitest";
import { bentukTokenValid, buatToken, cocokToken, hashToken } from "./token";

describe("hashToken", () => {
  it("SHA-256 hex huruf kecil, cocok dengan vektor uji baku", () => {
    expect(hashToken("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
  it("deterministik", () => {
    expect(hashToken("x")).toBe(hashToken("x"));
  });
});

describe("buatToken", () => {
  it("token 43 karakter base64url, hash 64 hex, hash cocok dengan token", () => {
    const { token, hash } = buatToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(hashToken(token));
    expect(hash).not.toContain(token);
  });
  it("acak: 1000 token tidak ada yang kembar", () => {
    const set = new Set(Array.from({ length: 1000 }, () => buatToken().token));
    expect(set.size).toBe(1000);
  });
});

describe("cocokToken", () => {
  it("token yang benar cocok", () => {
    const { token, hash } = buatToken();
    expect(cocokToken(token, hash)).toBe(true);
  });

  it("KP-13: token diubah satu karakter di posisi mana pun tidak cocok", () => {
    const { token, hash } = buatToken();
    for (let i = 0; i < token.length; i++) {
      const ganti = token[i] === "A" ? "B" : "A";
      const rusak = token.slice(0, i) + ganti + token.slice(i + 1);
      expect(cocokToken(rusak, hash)).toBe(false);
    }
  });

  it("token milik konsultasi lain tidak cocok", () => {
    const a = buatToken();
    const b = buatToken();
    expect(cocokToken(a.token, b.hash)).toBe(false);
  });

  it("panjang salah, kosong, spasi di sekeliling, atau karakter di luar alfabet", () => {
    const { token, hash } = buatToken();
    for (const t of [
      "",
      token.slice(1),
      token + "A",
      ` ${token}`,
      `${token}\n`,
      token.slice(0, 42) + "+",
      token.slice(0, 42) + "=",
      token.slice(0, 42) + "é",
    ]) {
      expect(cocokToken(t, hash)).toBe(false);
    }
  });

  it("bukan string ditolak tanpa melempar galat", () => {
    const { hash } = buatToken();
    for (const t of [undefined, null, 123, ["a"], { a: 1 }, true]) {
      expect(cocokToken(t, hash)).toBe(false);
    }
  });

  it("hash tersimpan yang rusak membuat hasil false, bukan galat", () => {
    const { token } = buatToken();
    for (const h of ["", "abc", "Z".repeat(64), hashToken(token).toUpperCase()]) {
      expect(() => cocokToken(token, h)).not.toThrow();
      expect(cocokToken(token, h)).toBe(false);
    }
  });

  it("token yang sama dengan hash-nya sendiri tidak cocok (hash bukan token)", () => {
    const { hash } = buatToken();
    expect(cocokToken(hash, hash)).toBe(false);
  });
});

describe("bentukTokenValid", () => {
  it("hanya menerima string 43 karakter base64url", () => {
    expect(bentukTokenValid(buatToken().token)).toBe(true);
    expect(bentukTokenValid("pendek")).toBe(false);
    expect(bentukTokenValid(null)).toBe(false);
  });
});