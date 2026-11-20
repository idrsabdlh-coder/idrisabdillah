import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** 32 byte = 256 bit acak, dikodekan base64url menjadi tepat 43 karakter. */
const BYTE_TOKEN = 32;
const POLA_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const POLA_HASH = /^[0-9a-f]{64}$/;

/** Token berbentuk benar. Dipakai untuk menolak masukan sampah sebelum menyentuh database. */
export function bentukTokenValid(t: unknown): t is string {
  return typeof t === "string" && POLA_TOKEN.test(t);
}

/**
 * Hash yang disimpan di database (kolom `token_hash`, 64 karakter hex huruf kecil).
 * SHA-256 sudah cukup karena token acak 256 bit; hash lambat (bcrypt, argon2) tidak perlu.
 * Yang di-hash adalah STRING token, bukan hasil dekode byte-nya, sehingga dua string
 * berbeda (termasuk beda satu karakter di ujung) selalu berbeda hash-nya.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Token baru. `token` dikembalikan ke klien SEKALI; yang disimpan hanya `hash`. */
export function buatToken(): { token: string; hash: string } {
  const token = randomBytes(BYTE_TOKEN).toString("base64url");
  return { token, hash: hashToken(token) };
}

/**
 * Membandingkan token masukan dengan hash tersimpan, waktu tetap. Masukan bertipe unknown
 * karena berasal dari URL. Token apa pun yang salah, termasuk yang bentuknya tidak benar,
 * menghasilkan false.
 */
export function cocokToken(masukan: unknown, hashTersimpan: string): boolean {
  if (!bentukTokenValid(masukan) || !POLA_HASH.test(hashTersimpan)) return false;
  return timingSafeEqual(
    Buffer.from(hashToken(masukan), "hex"),
    Buffer.from(hashTersimpan, "hex"),
  );
}