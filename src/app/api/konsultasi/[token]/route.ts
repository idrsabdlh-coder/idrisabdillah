import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { getPool } from "@/lib/konsultasi/db";
import {
  ambilKonsultasiDariToken,
  ringkasanTampil,
  simpanJawabanKonsultasi,
  tetapkanJenisKonsultasi,
} from "@/lib/konsultasi/db/konsultasi-repo";
import type { Jenis } from "@/lib/konsultasi/types";

type RouteCtx = { params: Promise<{ token: string }> };

/**
 * GET /api/konsultasi/[token]: Baca konsultasi lewat token (TODO 7.2, KP-12, KP-13).
 * Mengembalikan 404 bila token salah. Tidak pernah memuat `catatan` maupun `token_hash`.
 */
export async function GET(_req: NextRequest, ctx: RouteCtx) {
  try {
    const { token } = await ctx.params;
    const pool = getPool();
    const data = await ambilKonsultasiDariToken(pool, token);
    if (!data) {
      return jsonNoStore({ error: "Konsultasi tidak ditemukan." }, 404);
    }

    return jsonNoStore({
      konsultasi: data.konsultasi,
      definisi: data.definisi,
      jawaban: data.jawaban,
      statusLog: data.statusLog,
      tampil: ringkasanTampil(data),
    });
  } catch (err) {
    const pesan = err instanceof Error ? err.message : String(err);
    return jsonNoStore({ error: `Gagal memuat konsultasi: ${pesan}` }, 500);
  }
}

/**
 * PATCH /api/konsultasi/[token]: Simpan otomatis satu jawaban atau tetapkan jenis (TODO 7.3 & 7.5).
 */
export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { token } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonNoStore({ error: "Format permintaan tidak valid." }, 400);
  }

  try {
    const pool = getPool();

    if (typeof body.tetapkanJenis === "string") {
      const res = await tetapkanJenisKonsultasi(pool, token, body.tetapkanJenis as Jenis);
      if (!res.ok) return jsonNoStore({ error: res.pesan }, res.status);
      return jsonNoStore({ ok: true, jenis: res.jenis });
    }

    const kunci = typeof body.kunci === "string" ? body.kunci.trim() : "";
    if (!kunci) {
      return jsonNoStore({ error: "Kunci pertanyaan wajib diisi." }, 422);
    }

    const res = await simpanJawabanKonsultasi(pool, token, kunci, body.nilai);
    if (!res.ok) {
      return jsonNoStore({ error: res.pesan, galat: res.galat }, res.status);
    }

    return jsonNoStore({
      ok: true,
      kunci: res.kunci,
      nilai: res.nilai,
      jenis: res.jenis,
    });
  } catch (err) {
    const pesan = err instanceof Error ? err.message : String(err);
    return jsonNoStore({ error: `Gagal menyimpan jawaban: ${pesan}` }, 500);
  }
}
