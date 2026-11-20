import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { getPool } from "@/lib/konsultasi/db";
import { buatTurunanKonsultasi } from "@/lib/konsultasi/db/konsultasi-repo";
import type { Jenis } from "@/lib/konsultasi/types";

type RouteCtx = { params: Promise<{ token: string }> };

/**
 * POST /api/konsultasi/[token]/turunan: Buat konsultasi Draf baru dari 8.1 (TODO 7.6, KP-09).
 */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { token } = await ctx.params;
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    // Boleh tanpa body
  }

  const jenis = typeof body.jenis === "string" ? (body.jenis as Jenis) : undefined;
  const pool = getPool();
  const res = await buatTurunanKonsultasi(pool, token, jenis);
  if (!res.ok) {
    return jsonNoStore({ error: res.pesan }, res.status);
  }

  return jsonNoStore(
    {
      token: res.token,
      kode: res.kode,
    },
    201,
  );
}
