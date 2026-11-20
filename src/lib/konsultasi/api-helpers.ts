import { randomBytes } from "node:crypto";

/** Status konsultasi di mana klien masih boleh mengubah jawaban (FR-KON-17, K-3). */
export const STATUS_BOLEH_EDIT_KLIEN = new Set(["Draf", "Terkirim", "Ditinjau"]);

/** Header wajib pada seluruh respons API klien (TODO 7.7). */
export const HEADERS_NO_STORE = {
  "Cache-Control": "no-store",
} as const;

/** Mengembalikan Response JSON dengan `Cache-Control: no-store`. */
export function jsonNoStore(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: HEADERS_NO_STORE,
  });
}

/** Mengambil alamat IP klien untuk pembatasan laju (tidak dicatat ke log). */
export function ambilIpKlien(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const pertama = xff.split(",")[0]?.trim();
    if (pertama) return pertama;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

/** Membuat kode konsultasi ringkas, contoh: KON-4F9A1C. */
export function buatKodeKonsultasi(): string {
  return `KON-${randomBytes(3).toString("hex").toUpperCase()}`;
}
