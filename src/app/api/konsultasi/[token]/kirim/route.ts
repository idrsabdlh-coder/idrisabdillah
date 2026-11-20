import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { getPool } from "@/lib/konsultasi/db";
import { kirimKonsultasi } from "@/lib/konsultasi/db/konsultasi-repo";

type RouteCtx = { params: Promise<{ token: string }> };

/**
 * POST /api/konsultasi/[token]/kirim: Kirim konsultasi Draf menjadi Terkirim (TODO 7.4, KP-05).
 */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { token } = await ctx.params;
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    // Izinkan body kosong bila setuju dikirim false secara default
  }

  const setuju = body.setuju === true;
  const pool = getPool();
  const res = await kirimKonsultasi(pool, token, setuju);
  if (!res.ok) {
    return jsonNoStore({ error: res.pesan, galat: res.galat }, res.status);
  }

  return jsonNoStore({ ok: true, status: "Terkirim" });
}
