import mysql from "mysql2/promise";

declare global {
  var __konsultasiMysqlPool: mysql.Pool | undefined;
}

/**
 * Mengembalikan pool koneksi MySQL (lazy init).
 * Disimpan di `globalThis` saat dev agar tidak membuat pool baru setiap HMR reload.
 */
export function getPool(): mysql.Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Variabel lingkungan DATABASE_URL belum diatur di server (Vercel).");
  }

  const isRemote =
    url.includes("tidbcloud.com") ||
    url.includes("ssl=") ||
    process.env.DATABASE_SSL === "true";

  if (!globalThis.__konsultasiMysqlPool) {
    globalThis.__konsultasiMysqlPool = mysql.createPool({
      uri: url,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 5,
      idleTimeout: 60000,
      ...(isRemote ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } } : {}),
    });
  }

  return globalThis.__konsultasiMysqlPool;
}
