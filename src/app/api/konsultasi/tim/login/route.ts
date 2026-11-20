import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { ambilIpKlien, jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { getPool } from "@/lib/konsultasi/db";
import { cekDanCatatLaju } from "@/lib/konsultasi/db/rate-limit";
import {
  buatTokenSesi,
  NAMA_COOKIE_TIM,
  verifikasiKataSandi,
} from "@/lib/konsultasi/tim-auth";

const MAKS_LOGIN_PER_15_MENIT = 10;
const LIMA_BELAS_MENIT_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const hashEnv = process.env.ADMIN_PASSWORD_HASH ?? "";
  const secret = process.env.SESSION_SECRET ?? "";
  if (!hashEnv || !secret) {
    return jsonNoStore(
      { error: "Konfigurasi autentikasi admin belum lengkap di server." },
      500,
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonNoStore({ error: "Format permintaan tidak valid." }, 400);
  }

  const pool = getPool();
  const ip = ambilIpKlien(req);
  const laju = await cekDanCatatLaju(
    pool,
    `tim-login:${ip}`,
    MAKS_LOGIN_PER_15_MENIT,
    LIMA_BELAS_MENIT_MS,
  );
  if (!laju.diizinkan) {
    return jsonNoStore(
      { error: "Terlalu banyak percobaan masuk. Coba lagi 15 menit lagi." },
      429,
    );
  }

  const sandi = typeof body.sandi === "string" ? body.sandi : "";
  if (!sandi || !verifikasiKataSandi(sandi, hashEnv)) {
    return jsonNoStore({ error: "Kata sandi salah." }, 401);
  }

  const token = buatTokenSesi(secret);
  const cookieStore = await cookies();
  cookieStore.set(NAMA_COOKIE_TIM, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return jsonNoStore({ ok: true });
}
