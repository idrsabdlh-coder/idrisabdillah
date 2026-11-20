import { NextRequest } from "next/server";
import { ambilIpKlien, jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { getPool } from "@/lib/konsultasi/db";
import { buatKonsultasiBaru } from "@/lib/konsultasi/db/konsultasi-repo";
import { cekDanCatatLaju } from "@/lib/konsultasi/db/rate-limit";
import { MAKS_JS, normalisasiWhatsApp } from "@/lib/konsultasi/validasi";

const MAKS_MULAI_PER_JAM = 5;
const SATU_JAM_MS = 60 * 60 * 1000;

/**
 * POST /api/konsultasi: Mulai konsultasi baru (TODO 7.1, FR-KON-01).
 * Mengembalikan token mentah SEKALI, dengan pembatasan laju 5/jam per IP (K-7).
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonNoStore({ error: "Format permintaan tidak valid." }, 400);
  }

  // Honeypot anti-bot ringan (PRD bagian 8)
  if (typeof body.hp === "string" && body.hp.trim() !== "") {
    return jsonNoStore({ error: "Permintaan ditolak." }, 400);
  }

  const nama = typeof body.nama === "string" ? body.nama.trim() : "";
  const waRaw = typeof body.wa === "string" ? body.wa : "";

  if (!nama) {
    return jsonNoStore({ error: "Nama lengkap wajib diisi.", field: "1.1" }, 422);
  }
  if (nama.length > MAKS_JS) {
    return jsonNoStore(
      { error: `Nama maksimal ${MAKS_JS} karakter.`, field: "1.1" },
      422,
    );
  }

  const wa = normalisasiWhatsApp(waRaw);
  if (!wa) {
    return jsonNoStore(
      {
        error: "Nomor WhatsApp tidak valid. Contoh: 081234567890 atau +6281234567890.",
        field: "1.2",
      },
      422,
    );
  }

  const pool = getPool();
  const ip = ambilIpKlien(req);
  const laju = await cekDanCatatLaju(
    pool,
    `mulai:${ip}`,
    MAKS_MULAI_PER_JAM,
    SATU_JAM_MS,
  );
  if (!laju.diizinkan) {
    return jsonNoStore(
      { error: "Terlalu banyak permintaan. Coba lagi dalam 1 jam." },
      429,
    );
  }

  const hasil = await buatKonsultasiBaru(pool, { nama, wa });
  return jsonNoStore(
    {
      token: hasil.token,
      kode: hasil.kode,
    },
    201,
  );
}
