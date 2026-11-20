import { NextRequest } from "next/server";
import { HEADERS_NO_STORE, jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { getPool } from "@/lib/konsultasi/db";
import { daftarKonsultasiTim } from "@/lib/konsultasi/db/tim-repo";
import { ambilSesiTim } from "@/lib/konsultasi/tim-auth";

function selCsv(val: string | null | undefined): string {
  const s = (val ?? "").replace(/\r?\n/g, " ");
  const aman = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${aman.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const sesi = await ambilSesiTim();
  if (!sesi) {
    return jsonNoStore({ error: "Tidak terautentikasi." }, 401);
  }

  const sp = req.nextUrl.searchParams;
  const pool = getPool();
  const daftar = await daftarKonsultasiTim(pool, {
    cari: sp.get("cari") ?? undefined,
    status: sp.get("status") ?? undefined,
    jenis: sp.get("jenis") ?? undefined,
    anggaran: sp.get("anggaran") ?? undefined,
    urut: sp.get("urut") === "batas_waktu" ? "batas_waktu" : "terbaru",
  });

  const header = ["Kode", "Nama", "WhatsApp", "Jenis", "Status", "Anggaran", "Batas Waktu", "Dikirim Pada"];
  const baris = daftar.map((d) =>
    [
      selCsv(d.kode),
      selCsv(d.nama),
      selCsv(d.wa),
      selCsv(d.jenis),
      selCsv(d.status),
      selCsv(d.anggaran),
      selCsv(d.batasWaktu),
      selCsv(d.dikirimPada),
    ].join(","),
  );

  const csv = "\uFEFF" + [header.join(","), ...baris].join("\r\n");
  return new Response(csv, {
    status: 200,
    headers: {
      ...HEADERS_NO_STORE,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="konsultasi-daftar.csv"',
    },
  });
}
