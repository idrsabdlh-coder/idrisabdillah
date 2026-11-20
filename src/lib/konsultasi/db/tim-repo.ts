import type { Pool, RowDataPacket } from "mysql2/promise";
import { ambilDefinisiForm } from "./konsultasi-repo";
import { pertanyaanTampil } from "../percabangan";
import { rekomendasikan } from "../rekomendasi";
import { bolehTransisi } from "../status";
import type { StatusKonsultasi } from "../status";
import type { DefinisiForm, Jawaban, JawabanNilai, Jenis } from "../types";

export interface ItemKotakMasuk {
  id: number;
  kode: string;
  nama: string;
  wa: string;
  jenis: Jenis | null;
  status: StatusKonsultasi;
  diubahSetelahDikirim: boolean;
  anggaran: string | null;
  batasWaktu: string | null;
  dibuatPada: string;
  dikirimPada: string | null;
}

export interface FilterKotakMasuk {
  cari?: string;
  status?: string;
  jenis?: string;
  anggaran?: string;
  urut?: "terbaru" | "batas_waktu";
  sertakanDraf?: boolean;
}

export interface CatatanItem {
  id: number;
  isi: string;
  waktu: string;
}

export interface DetailBriefTim {
  konsultasi: ItemKotakMasuk & { versiForm: number; indukId: number | null };
  definisi: DefinisiForm;
  jawaban: Jawaban;
  butuhBantuanIds: string[];
  rekomendasi: ReturnType<typeof rekomendasikan> | null;
  statusLog: { dari: string; ke: string; oleh: string; waktu: string }[];
  catatan: CatatanItem[];
}

export interface StatistikTim {
  totalMasuk: number;
  masuk7Hari: number;
  masuk30Hari: number;
  perJenis: Record<string, number>;
  perStatus: Record<string, number>;
  rasioDisetujuiPersen: number;
  rataRataResponsJam: number | null;
}

function parseJsonCol<T>(val: unknown): T {
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return val as unknown as T;
    }
  }
  return val as T;
}

/** Mengambil daftar konsultasi untuk Kotak Masuk & Pipeline Tim (TODO 9.2 & 9.7). */
export async function daftarKonsultasiTim(
  pool: Pool,
  filter: FilterKotakMasuk = {},
): Promise<ItemKotakMasuk[]> {
  const where: string[] = [];
  const params: unknown[] = [];

  if (!filter.sertakanDraf && !filter.status) {
    where.push("k.status <> 'Draf'");
  }
  if (filter.status) {
    where.push("k.status = ?");
    params.push(filter.status);
  }
  if (filter.jenis) {
    where.push("k.jenis = ?");
    params.push(filter.jenis);
  }
  if (filter.cari && filter.cari.trim() !== "") {
    const q = `%${filter.cari.trim()}%`;
    where.push("(k.nama LIKE ? OR k.wa LIKE ? OR k.kode LIKE ?)");
    params.push(q, q, q);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql =
    filter.urut === "batas_waktu"
      ? "ORDER BY (batas_waktu IS NULL) ASC, batas_waktu ASC, k.dikirim_pada DESC"
      : "ORDER BY COALESCE(k.dikirim_pada, k.dibuat_pada) DESC";

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT k.id, k.kode, k.nama, k.wa, k.jenis, k.status, k.diubah_setelah_dikirim,
            k.dibuat_pada, k.dikirim_pada,
            JSON_UNQUOTE(j_ang.nilai) AS anggaran,
            JSON_UNQUOTE(j_btw.nilai) AS batas_waktu
     FROM konsultasi k
     LEFT JOIN jawaban j_ang
       ON j_ang.konsultasi_id = k.id AND j_ang.pertanyaan_id = '7.1'
     LEFT JOIN jawaban j_btw
       ON j_btw.konsultasi_id = k.id AND j_btw.pertanyaan_id = '7.2'
     ${whereSql}
     ${orderSql}`,
    params,
  );

  let hasil: ItemKotakMasuk[] = rows.map((r) => ({
    id: Number(r.id),
    kode: String(r.kode),
    nama: String(r.nama),
    wa: String(r.wa),
    jenis: (r.jenis as Jenis | null) ?? null,
    status: String(r.status) as StatusKonsultasi,
    diubahSetelahDikirim: Boolean(r.diubah_setelah_dikirim),
    anggaran: r.anggaran ? String(r.anggaran) : null,
    batasWaktu: r.batas_waktu ? String(r.batas_waktu) : null,
    dibuatPada: new Date(r.dibuat_pada as string | Date).toISOString(),
    dikirimPada: r.dikirim_pada ? new Date(r.dikirim_pada as string | Date).toISOString() : null,
  }));

  if (filter.anggaran) {
    hasil = hasil.filter((x) => x.anggaran === filter.anggaran);
  }
  return hasil;
}

/** Mengambil detail brief untuk Tim, memakai definisi sesuai `versi_form` (KP-11, KP-14). */
export async function ambilDetailBriefTim(
  pool: Pool,
  id: number,
): Promise<DetailBriefTim | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT k.id, k.kode, k.nama, k.wa, k.jenis, k.status, k.versi_form, k.induk_id,
            k.diubah_setelah_dikirim, k.dibuat_pada, k.dikirim_pada,
            JSON_UNQUOTE(j_ang.nilai) AS anggaran,
            JSON_UNQUOTE(j_btw.nilai) AS batas_waktu
     FROM konsultasi k
     LEFT JOIN jawaban j_ang
       ON j_ang.konsultasi_id = k.id AND j_ang.pertanyaan_id = '7.1'
     LEFT JOIN jawaban j_btw
       ON j_btw.konsultasi_id = k.id AND j_btw.pertanyaan_id = '7.2'
     WHERE k.id = ?
     LIMIT 1`,
    [id],
  );
  if (rows.length === 0) return null;

  const r = rows[0]!;
  const versiForm = Number(r.versi_form);
  const definisi = await ambilDefinisiForm(pool, versiForm);

  const [jawabanRows] = await pool.query<RowDataPacket[]>(
    "SELECT pertanyaan_id, nilai FROM jawaban WHERE konsultasi_id = ?",
    [id],
  );
  const jawaban: Jawaban = {};
  for (const jr of jawabanRows) {
    jawaban[String(jr.pertanyaan_id)] = parseJsonCol<JawabanNilai>(jr.nilai);
  }

  // Hitung ID pertanyaan yang memiliki opsi `butuhBantuan: true` terpilih (KP-11)
  const jenis = (r.jenis as Jenis | null) ?? null;
  const tampil = pertanyaanTampil(definisi, jawaban, jenis ?? undefined);
  const butuhBantuanIds: string[] = [];
  for (const t of tampil) {
    const val = jawaban[t.pertanyaan.id];
    if (!val || !t.opsi) continue;
    const daftar = Array.isArray(val) ? val : [val];
    const adaBantuan = t.opsi.some((o) => o.butuhBantuan && daftar.includes(o.nilai));
    if (adaBantuan) butuhBantuanIds.push(t.pertanyaan.id);
  }

  const adaJalurBelum = Boolean(jawaban["3F.1"] || jawaban["3F.2"]);
  const rekomendasi = adaJalurBelum ? rekomendasikan(jawaban) : null;

  const [logRows] = await pool.query<RowDataPacket[]>(
    "SELECT dari, ke, oleh, waktu FROM status_log WHERE konsultasi_id = ? ORDER BY waktu ASC",
    [id],
  );
  const statusLog = logRows.map((lr) => ({
    dari: String(lr.dari),
    ke: String(lr.ke),
    oleh: String(lr.oleh),
    waktu: new Date(lr.waktu as string | Date).toISOString(),
  }));

  const [catatanRows] = await pool.query<RowDataPacket[]>(
    "SELECT id, isi, waktu FROM catatan WHERE konsultasi_id = ? ORDER BY waktu DESC",
    [id],
  );
  const catatan: CatatanItem[] = catatanRows.map((cr) => ({
    id: Number(cr.id),
    isi: String(cr.isi),
    waktu: new Date(cr.waktu as string | Date).toISOString(),
  }));

  return {
    konsultasi: {
      id: Number(r.id),
      kode: String(r.kode),
      nama: String(r.nama),
      wa: String(r.wa),
      jenis,
      status: String(r.status) as StatusKonsultasi,
      versiForm,
      indukId: r.induk_id !== null ? Number(r.induk_id) : null,
      diubahSetelahDikirim: Boolean(r.diubah_setelah_dikirim),
      anggaran: r.anggaran ? String(r.anggaran) : null,
      batasWaktu: r.batas_waktu ? String(r.batas_waktu) : null,
      dibuatPada: new Date(r.dibuat_pada as string | Date).toISOString(),
      dikirimPada: r.dikirim_pada ? new Date(r.dikirim_pada as string | Date).toISOString() : null,
    },
    definisi,
    jawaban,
    butuhBantuanIds,
    rekomendasi,
    statusLog,
    catatan,
  };
}

/** Mengubah status konsultasi dengan validasi transisi & menulis `status_log` (TODO 9.4). */
export async function ubahStatusTim(
  pool: Pool,
  id: number,
  ke: StatusKonsultasi,
  peran: "Tim" | "Admin",
  oleh = "Admin",
): Promise<{ ok: true; dari: StatusKonsultasi; ke: StatusKonsultasi } | { ok: false; status: 404 | 422; pesan: string }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT status FROM konsultasi WHERE id = ? LIMIT 1",
    [id],
  );
  if (rows.length === 0) {
    return { ok: false, status: 404, pesan: "Konsultasi tidak ditemukan." };
  }

  const dari = String(rows[0]!.status) as StatusKonsultasi;
  if (!bolehTransisi(dari, ke, peran)) {
    return {
      ok: false,
      status: 422,
      pesan: `Transisi status dari "${dari}" ke "${ke}" tidak diizinkan.`,
    };
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("UPDATE konsultasi SET status = ? WHERE id = ?", [ke, id]);
    await conn.query(
      "INSERT INTO status_log (konsultasi_id, dari, ke, oleh) VALUES (?, ?, ?, ?)",
      [id, dari, ke, oleh],
    );
    await conn.commit();
    return { ok: true, dari, ke };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Menambah catatan internal Tim (TODO 9.5). */
export async function tambahCatatanTim(
  pool: Pool,
  konsultasiId: number,
  isi: string,
): Promise<{ ok: true } | { ok: false; status: 404; pesan: string }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM konsultasi WHERE id = ? LIMIT 1",
    [konsultasiId],
  );
  if (rows.length === 0) {
    return { ok: false, status: 404, pesan: "Konsultasi tidak ditemukan." };
  }
  await pool.query("INSERT INTO catatan (konsultasi_id, isi) VALUES (?, ?)", [
    konsultasiId,
    isi,
  ]);
  return { ok: true };
}

/** Statistik ringkas dasbor Tim (TODO 9.9, FR-KON-15). */
export async function statistikTim(pool: Pool): Promise<StatistikTim> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT status, jenis, dikirim_pada
     FROM konsultasi
     WHERE status <> 'Draf'`,
  );

  const sekarang = Date.now();
  const tujuhHari = 7 * 24 * 60 * 60 * 1000;
  const tigaPuluhHari = 30 * 24 * 60 * 60 * 1000;

  let masuk7Hari = 0;
  let masuk30Hari = 0;
  let disetujui = 0;
  const perJenis: Record<string, number> = {};
  const perStatus: Record<string, number> = {};

  for (const r of rows) {
    const st = String(r.status);
    const jn = r.jenis ? String(r.jenis) : "belum-ditetapkan";
    perStatus[st] = (perStatus[st] ?? 0) + 1;
    perJenis[jn] = (perJenis[jn] ?? 0) + 1;
    if (st === "Disetujui") disetujui += 1;
    if (r.dikirim_pada) {
      const t = new Date(r.dikirim_pada as string | Date).getTime();
      if (sekarang - t <= tujuhHari) masuk7Hari += 1;
      if (sekarang - t <= tigaPuluhHari) masuk30Hari += 1;
    }
  }

  const [respRows] = await pool.query<RowDataPacket[]>(
    `SELECT AVG(TIMESTAMPDIFF(MINUTE, k.dikirim_pada, l.waktu)) AS rata_menit
     FROM konsultasi k
     JOIN (
       SELECT konsultasi_id, MIN(waktu) AS waktu
       FROM status_log
       WHERE ke IN ('Ditinjau', 'Dihubungi')
       GROUP BY konsultasi_id
     ) l ON l.konsultasi_id = k.id
     WHERE k.dikirim_pada IS NOT NULL`,
  );

  const rataMenit = respRows[0]?.rata_menit;
  const rataRataResponsJam =
    rataMenit !== null && rataMenit !== undefined
      ? Math.round((Number(rataMenit) / 60) * 10) / 10
      : null;

  return {
    totalMasuk: rows.length,
    masuk7Hari,
    masuk30Hari,
    perJenis,
    perStatus,
    rasioDisetujuiPersen:
      rows.length > 0 ? Math.round((disetujui / rows.length) * 100) : 0,
    rataRataResponsJam,
  };
}
