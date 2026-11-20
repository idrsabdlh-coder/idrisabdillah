import type { Pool, RowDataPacket } from "mysql2/promise";

export interface HasilLaju {
  diizinkan: boolean;
  sisa: number;
}

/**
 * Pembatasan laju bersama berbasis tabel `rate_limit` di MySQL (TODO 7.1 & 9.1).
 * Aman dipakai lintas instance serverless tanpa Redis.
 */
export async function cekDanCatatLaju(
  pool: Pool,
  kunci: string,
  maks: number,
  jendelaMs: number,
): Promise<HasilLaju> {
  const resetPada = new Date(Date.now() + jendelaMs);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO rate_limit (kunci, hitungan, reset_pada)
       VALUES (?, 1, ?)
       ON DUPLICATE KEY UPDATE
         hitungan = IF(reset_pada <= NOW(3), 1, hitungan + 1),
         reset_pada = IF(reset_pada <= NOW(3), VALUES(reset_pada), reset_pada)`,
      [kunci, resetPada],
    );
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT hitungan FROM rate_limit WHERE kunci = ?",
      [kunci],
    );
    await conn.commit();

    const hitungan = Number(rows[0]?.hitungan ?? 1);
    return {
      diizinkan: hitungan <= maks,
      sisa: Math.max(0, maks - hitungan),
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
