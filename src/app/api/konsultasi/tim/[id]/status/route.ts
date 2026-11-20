import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { getPool } from "@/lib/konsultasi/db";
import { ubahStatusTim } from "@/lib/konsultasi/db/tim-repo";
import { URUTAN_STATUS, type StatusKonsultasi } from "@/lib/konsultasi/status";
import { ambilSesiTim } from "@/lib/konsultasi/tim-auth";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const sesi = await ambilSesiTim();
  if (!sesi) {
    return jsonNoStore({ error: "Tidak terautentikasi." }, 401);
  }

  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return jsonNoStore({ error: "ID tidak valid." }, 400);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonNoStore({ error: "Format permintaan tidak valid." }, 400);
  }

  const ke = typeof body.ke === "string" ? body.ke : "";
  if (!URUTAN_STATUS.includes(ke as StatusKonsultasi)) {
    return jsonNoStore({ error: "Status tujuan tidak valid." }, 422);
  }

  const res = await ubahStatusTim(
    getPool(),
    numId,
    ke as StatusKonsultasi,
    sesi.peran,
    sesi.peran,
  );
  if (!res.ok) {
    return jsonNoStore({ error: res.pesan }, res.status);
  }

  return jsonNoStore({ ok: true, dari: res.dari, ke: res.ke });
}
