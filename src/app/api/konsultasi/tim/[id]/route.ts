import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { getPool } from "@/lib/konsultasi/db";
import { ambilDetailBriefTim } from "@/lib/konsultasi/db/tim-repo";
import { ambilSesiTim } from "@/lib/konsultasi/tim-auth";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const sesi = await ambilSesiTim();
  if (!sesi) {
    return jsonNoStore({ error: "Tidak terautentikasi." }, 401);
  }

  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return jsonNoStore({ error: "ID tidak valid." }, 400);
  }

  const detail = await ambilDetailBriefTim(getPool(), numId);
  if (!detail) {
    return jsonNoStore({ error: "Konsultasi tidak ditemukan." }, 404);
  }

  return jsonNoStore(detail);
}
