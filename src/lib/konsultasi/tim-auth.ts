import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

export const NAMA_COOKIE_TIM = "konsultasi_tim_sesi";
const MASA_BERLAKU_DETIK = 60 * 60 * 24 * 7; // 7 hari

export interface SesiTim {
  sub: "admin";
  peran: "Admin";
  exp: number;
}

/** Membuat hash kata sandi berformat `scrypt:<saltHex>:<hashHex>` untuk disimpan di env. */
export function hashKataSandi(kataSandi: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(kataSandi, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

/** Memverifikasi kata sandi terhadap hash di env (`ADMIN_PASSWORD_HASH`). */
export function verifikasiKataSandi(kataSandi: string, hashTersimpan: string): boolean {
  const bagian = hashTersimpan.split(/[$:]/);
  if (bagian.length !== 3 || bagian[0] !== "scrypt") return false;
  const [, salt, hexAsli] = bagian;
  if (!salt || !hexAsli || !/^[0-9a-f]+$/i.test(hexAsli)) return false;

  const bufAsli = Buffer.from(hexAsli, "hex");
  const bufUji = scryptSync(kataSandi, salt, bufAsli.length);
  return bufAsli.length === bufUji.length && timingSafeEqual(bufAsli, bufUji);
}

function tandatangani(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

/** Membuat nilai cookie sesi bertanda tangan HMAC-SHA256. */
export function buatTokenSesi(secret: string, sekarangDetik = Math.floor(Date.now() / 1000)): string {
  const payload: SesiTim = {
    sub: "admin",
    peran: "Admin",
    exp: sekarangDetik + MASA_BERLAKU_DETIK,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = tandatangani(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

/** Memverifikasi token sesi dari cookie; null bila tidak valid atau kedaluwarsa. */
export function verifikasiTokenSesi(
  token: string,
  secret: string,
  sekarangDetik = Math.floor(Date.now() / 1000),
): SesiTim | null {
  if (!secret) return null;
  const titik = token.indexOf(".");
  if (titik <= 0) return null;
  const payloadB64 = token.slice(0, titik);
  const sig = token.slice(titik + 1);
  if (!payloadB64 || !sig) return null;

  const diharapkan = tandatangani(payloadB64, secret);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(diharapkan, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as Partial<SesiTim>;
    if (
      parsed.sub !== "admin" ||
      parsed.peran !== "Admin" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= sekarangDetik
    ) {
      return null;
    }
    return parsed as SesiTim;
  } catch {
    return null;
  }
}

/** Mengambil sesi Tim dari cookie request (Next.js 16 async `cookies()`). */
export async function ambilSesiTim(): Promise<SesiTim | null> {
  const secret = process.env.SESSION_SECRET ?? "";
  if (!secret) return null;
  const cookieStore = await cookies();
  const nilai = cookieStore.get(NAMA_COOKIE_TIM)?.value;
  if (!nilai) return null;
  return verifikasiTokenSesi(nilai, secret);
}
