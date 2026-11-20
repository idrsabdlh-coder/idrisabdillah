import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { getPool } from "@/lib/konsultasi/db";
import { tambahCatatanTim } from "@/lib/konsultasi/db/tim-repo";
import { ambilSesiTim } from "@/lib/konsultasi/tim-auth";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: RouteCtx) {
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

  const isi = typeof body.isi === "string" ? body.isi.trim() : "";
  if (!isi) {
    return jsonNoStore({ error: "Isi catatan tidak boleh kosong." }, 422);
  }

  const res = await tambahCatatanTim(getPool(), numId, isi);
  if (!res.ok) {
    return jsonNoStore({ error: res.pesan }, res.status);
  }

  return jsonNoStore({ ok: true }, 201);
}
