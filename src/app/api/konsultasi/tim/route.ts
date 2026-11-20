import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { getPool } from "@/lib/konsultasi/db";
import {
  daftarKonsultasiTim,
  statistikTim,
} from "@/lib/konsultasi/db/tim-repo";
import { ambilSesiTim } from "@/lib/konsultasi/tim-auth";

export async function GET(req: NextRequest) {
  const sesi = await ambilSesiTim();
  if (!sesi) {
    return jsonNoStore({ error: "Tidak terautentikasi." }, 401);
  }

  const sp = req.nextUrl.searchParams;
  const pool = getPool();

  const [daftar, stats] = await Promise.all([
    daftarKonsultasiTim(pool, {
      cari: sp.get("cari") ?? undefined,
      status: sp.get("status") ?? undefined,
      jenis: sp.get("jenis") ?? undefined,
      anggaran: sp.get("anggaran") ?? undefined,
      urut: sp.get("urut") === "batas_waktu" ? "batas_waktu" : "terbaru",
      sertakanDraf: sp.get("sertakanDraf") === "1",
    }),
    statistikTim(pool),
  ]);

  return jsonNoStore({ daftar, statistik: stats });
}
