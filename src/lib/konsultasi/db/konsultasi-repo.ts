import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { buatKodeKonsultasi, STATUS_BOLEH_EDIT_KLIEN } from "../api-helpers";
import { FORM_V1 } from "../form-v1";
import { jenisDariJawaban, pertanyaanTampil } from "../percabangan";
import { slug } from "../syarat";
import { bentukTokenValid, buatToken, hashToken } from "../token";
import { DAFTAR_JENIS, LABEL_JENIS } from "../types";
import type { DefinisiForm, Jawaban, JawabanNilai, Jenis } from "../types";
import { hariIniWIB, validasiKirim, validasiSimpan } from "../validasi";
import type { Galat } from "../validasi";

export interface KonsultasiKlien {
  id: number;
  kode: string;
  nama: string;
  wa: string;
  jenis: Jenis | null;
  status: string;
  versiForm: number;
  indukId: number | null;
  diubahSetelahDikirim: boolean;
  dibuatPada: string;
  dikirimPada: string | null;
  diperbaruiPada: string;
}

export interface StatusLogItem {
  dari: string;
  ke: string;
  oleh: string;
  waktu: string;
}

export interface DataKonsultasiKlien {
  konsultasi: KonsultasiKlien;
  definisi: DefinisiForm;
  jawaban: Jawaban;
  statusLog: StatusLogItem[];
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

/** Mengambil definisi form sesuai versi dari tabel `form_versi`, fallback ke `FORM_V1`. */
export async function ambilDefinisiForm(pool: Pool, versi?: number): Promise<DefinisiForm> {
  const sql = versi
    ? "SELECT definisi FROM form_versi WHERE versi = ? LIMIT 1"
    : "SELECT definisi FROM form_versi WHERE aktif = TRUE ORDER BY versi DESC LIMIT 1";
  const [rows] = await pool.query<RowDataPacket[]>(sql, versi ? [versi] : []);
  if (rows.length > 0 && rows[0]?.definisi) {
    return parseJsonCol<DefinisiForm>(rows[0].definisi);
  }
  return FORM_V1;
}

/**
 * Membuat konsultasi Draf baru, mengembalikan token mentah SEKALI.
 * Hanya menyimpan `token_hash` ke database (TODO 6.10 & 7.1).
 */
export async function buatKonsultasiBaru(
  pool: Pool,
  input: {
    nama: string;
    wa: string;
    indukId?: number | null;
    jawabanAwal?: Jawaban;
    jenis?: Jenis | null;
  },
): Promise<{ token: string; kode: string; id: number }> {
  const { token, hash } = buatToken();
  const kode = buatKodeKonsultasi();
  const def = await ambilDefinisiForm(pool);

  const jawabanAwal: Jawaban = {
    ...(input.jawabanAwal ?? {}),
    "1.1": input.nama,
    "1.2": input.wa,
  };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [res] = await conn.query<ResultSetHeader>(
      `INSERT INTO konsultasi (kode, nama, wa, jenis, status, versi_form, token_hash, induk_id)
       VALUES (?, ?, ?, ?, 'Draf', ?, ?, ?)`,
      [
        kode,
        input.nama,
        input.wa,
        input.jenis ?? null,
        def.versi,
        hash,
        input.indukId ?? null,
      ],
    );

    const konsultasiId = res.insertId;
    for (const [pertanyaanId, nilai] of Object.entries(jawabanAwal)) {
      await conn.query(
        `INSERT INTO jawaban (konsultasi_id, pertanyaan_id, nilai)
         VALUES (?, ?, ?)`,
        [konsultasiId, pertanyaanId, JSON.stringify(nilai)],
      );
    }

    await conn.commit();
    return { token, kode, id: konsultasiId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Membaca data konsultasi sisi klien dari token mentah.
 * Mengembalikan null bila token tidak valid atau tidak ditemukan (404).
 * Tidak pernah memuat `token_hash` maupun `catatan` (KP-12, KP-13).
 */
export async function ambilKonsultasiDariToken(
  pool: Pool,
  token: string,
): Promise<DataKonsultasiKlien | null> {
  if (!bentukTokenValid(token)) return null;
  const hash = hashToken(token);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, kode, nama, wa, jenis, status, versi_form, induk_id,
            diubah_setelah_dikirim, dibuat_pada, dikirim_pada, diperbarui_pada
     FROM konsultasi
     WHERE token_hash = ?
     LIMIT 1`,
    [hash],
  );
  if (rows.length === 0) return null;

  const r = rows[0]!;
  const konsultasi: KonsultasiKlien = {
    id: Number(r.id),
    kode: String(r.kode),
    nama: String(r.nama),
    wa: String(r.wa),
    jenis: (r.jenis as Jenis | null) ?? null,
    status: String(r.status),
    versiForm: Number(r.versi_form),
    indukId: r.induk_id !== null ? Number(r.induk_id) : null,
    diubahSetelahDikirim: Boolean(r.diubah_setelah_dikirim),
    dibuatPada: new Date(r.dibuat_pada as string | Date).toISOString(),
    dikirimPada: r.dikirim_pada ? new Date(r.dikirim_pada as string | Date).toISOString() : null,
    diperbaruiPada: new Date(r.diperbarui_pada as string | Date).toISOString(),
  };

  const definisi = await ambilDefinisiForm(pool, konsultasi.versiForm);

  const [jawabanRows] = await pool.query<RowDataPacket[]>(
    "SELECT pertanyaan_id, nilai FROM jawaban WHERE konsultasi_id = ?",
    [konsultasi.id],
  );
  const jawaban: Jawaban = {};
  for (const jr of jawabanRows) {
    jawaban[String(jr.pertanyaan_id)] = parseJsonCol<JawabanNilai>(jr.nilai);
  }

  const [logRows] = await pool.query<RowDataPacket[]>(
    "SELECT dari, ke, oleh, waktu FROM status_log WHERE konsultasi_id = ? ORDER BY waktu ASC",
    [konsultasi.id],
  );
  const statusLog: StatusLogItem[] = logRows.map((lr) => ({
    dari: String(lr.dari),
    ke: String(lr.ke),
    oleh: String(lr.oleh),
    waktu: new Date(lr.waktu as string | Date).toISOString(),
  }));

  return { konsultasi, definisi, jawaban, statusLog };
}

export type HasilSimpan =
  | { ok: true; kunci: string; nilai: JawabanNilai; jenis: Jenis | null }
  | { ok: false; status: 403 | 404 | 422; pesan: string; galat?: Galat };

/** Menyimpan satu jawaban klien (auto-save / edit setelah terkirim). */
export async function simpanJawabanKonsultasi(
  pool: Pool,
  token: string,
  kunci: string,
  nilai: unknown,
): Promise<HasilSimpan> {
  const data = await ambilKonsultasiDariToken(pool, token);
  if (!data) return { ok: false, status: 404, pesan: "Konsultasi tidak ditemukan." };

  const { konsultasi, definisi, jawaban } = data;
  if (!STATUS_BOLEH_EDIT_KLIEN.has(konsultasi.status)) {
    return {
      ok: false,
      status: 403,
      pesan: "Konsultasi sudah diproses tim dan tidak dapat diubah lagi.",
    };
  }

  const jenisDitetapkan = konsultasi.jenis ?? undefined;
  const hasil = validasiSimpan(
    definisi,
    jawaban,
    kunci,
    nilai,
    hariIniWIB(new Date()),
    jenisDitetapkan,
  );
  if (!hasil.ok) {
    return { ok: false, status: 422, pesan: hasil.galat.pesan, galat: hasil.galat };
  }

  const jawabanBaru: Jawaban = { ...jawaban, [kunci]: hasil.nilai };
  const jenisBaru =
    kunci === "2.1"
      ? (jenisDariJawaban(jawabanBaru) ?? null)
      : konsultasi.jenis;

  const setelahDikirim = konsultasi.status !== "Draf";

  await pool.query(
    `INSERT INTO jawaban (konsultasi_id, pertanyaan_id, nilai)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)`,
    [konsultasi.id, kunci, JSON.stringify(hasil.nilai)],
  );

  await pool.query(
    `UPDATE konsultasi
     SET jenis = ?,
         nama = COALESCE(NULLIF(?, ''), nama),
         wa = COALESCE(NULLIF(?, ''), wa),
         diubah_setelah_dikirim = diubah_setelah_dikirim OR ?
     WHERE id = ?`,
    [
      jenisBaru,
      kunci === "1.1" && typeof hasil.nilai === "string" ? hasil.nilai : "",
      kunci === "1.2" && typeof hasil.nilai === "string" ? hasil.nilai : "",
      setelahDikirim,
      konsultasi.id,
    ],
  );

  return { ok: true, kunci, nilai: hasil.nilai, jenis: jenisBaru };
}

/** Menetapkan jenis website hasil rekomendasi atau pilihan klien di jalur "Belum tahu". */
export async function tetapkanJenisKonsultasi(
  pool: Pool,
  token: string,
  jenis: Jenis,
): Promise<{ ok: true; jenis: Jenis } | { ok: false; status: 403 | 404 | 422; pesan: string }> {
  if (!DAFTAR_JENIS.includes(jenis) || jenis === "belum") {
    return { ok: false, status: 422, pesan: "Jenis website tidak valid." };
  }
  const data = await ambilKonsultasiDariToken(pool, token);
  if (!data) return { ok: false, status: 404, pesan: "Konsultasi tidak ditemukan." };
  if (!STATUS_BOLEH_EDIT_KLIEN.has(data.konsultasi.status)) {
    return { ok: false, status: 403, pesan: "Konsultasi tidak dapat diubah lagi." };
  }

  await pool.query("UPDATE konsultasi SET jenis = ? WHERE id = ?", [jenis, data.konsultasi.id]);
  return { ok: true, jenis };
}

export type HasilKirim =
  | { ok: true }
  | { ok: false; status: 404 | 409 | 422; pesan: string; galat?: Galat[] };

/** Mengirim konsultasi Draf menjadi Terkirim setelah validasi wajib & persetujuan 8.3. */
export async function kirimKonsultasi(
  pool: Pool,
  token: string,
  setuju: boolean,
): Promise<HasilKirim> {
  const data = await ambilKonsultasiDariToken(pool, token);
  if (!data) return { ok: false, status: 404, pesan: "Konsultasi tidak ditemukan." };

  const { konsultasi, definisi, jawaban } = data;
  if (konsultasi.status !== "Draf") {
    return { ok: false, status: 409, pesan: "Konsultasi sudah pernah dikirim." };
  }

  const jenisDitetapkan = konsultasi.jenis ?? undefined;
  const galat = validasiKirim(
    definisi,
    jawaban,
    setuju,
    hariIniWIB(new Date()),
    jenisDitetapkan,
  );
  if (galat.length > 0) {
    return {
      ok: false,
      status: 422,
      pesan: "Masih ada isian wajib yang belum lengkap atau tidak valid.",
      galat,
    };
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE konsultasi
       SET status = 'Terkirim', dikirim_pada = NOW(3)
       WHERE id = ? AND status = 'Draf'`,
      [konsultasi.id],
    );
    await conn.query(
      `INSERT INTO status_log (konsultasi_id, dari, ke, oleh)
       VALUES (?, 'Draf', 'Terkirim', 'Klien')`,
      [konsultasi.id],
    );
    await conn.commit();
    return { ok: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

const BAGIAN_1_IDS = ["1.1", "1.2", "1.3", "1.4", "1.5"] as const;

/** Membuat konsultasi Draf turunan dari 8.1 dengan menyalin Bagian 1 (TODO 7.6, KP-09). */
export async function buatTurunanKonsultasi(
  pool: Pool,
  tokenInduk: string,
  jenisTarget?: Jenis,
): Promise<{ ok: true; token: string; kode: string } | { ok: false; status: 404; pesan: string }> {
  const induk = await ambilKonsultasiDariToken(pool, tokenInduk);
  if (!induk) return { ok: false, status: 404, pesan: "Konsultasi induk tidak ditemukan." };

  const jawabanBagian1: Jawaban = {};
  for (const id of BAGIAN_1_IDS) {
    const val = induk.jawaban[id];
    if (val !== undefined) jawabanBagian1[id] = val;
  }

  let jenis: Jenis | null = null;
  if (jenisTarget && DAFTAR_JENIS.includes(jenisTarget) && jenisTarget !== "belum") {
    jenis = jenisTarget;
    jawabanBagian1["2.1"] = slug(LABEL_JENIS[jenisTarget]);
  }

  const baru = await buatKonsultasiBaru(pool, {
    nama: induk.konsultasi.nama,
    wa: induk.konsultasi.wa,
    indukId: induk.konsultasi.id,
    jawabanAwal: jawabanBagian1,
    jenis,
  });

  return { ok: true, token: baru.token, kode: baru.kode };
}

/** Mengecek pertanyaan yang tampil (helper untuk respons GET). */
export function ringkasanTampil(data: DataKonsultasiKlien) {
  return pertanyaanTampil(
    data.definisi,
    data.jawaban,
    data.konsultasi.jenis ?? undefined,
  );
}
