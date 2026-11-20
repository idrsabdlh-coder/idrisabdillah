import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

/** Muat `.env.local` atau `.env` jika `DATABASE_URL` belum ada di environment. */
function loadEnvLocal() {
  if (process.env.DATABASE_URL) return;
  for (const name of [".env.local", ".env"]) {
    const p = path.join(process.cwd(), name);
    if (!fs.existsSync(p)) continue;
    const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  }
}

async function main() {
  loadEnvLocal();
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("Gagal: DATABASE_URL belum diisi di environment atau .env.local.");
    process.exit(1);
  }

  const schemaPath = path.join(process.cwd(), "src/lib/konsultasi/db/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  const isRemote =
    uri.includes("tidbcloud.com") ||
    uri.includes("ssl=") ||
    process.env.DATABASE_SSL === "true";

  const conn = await mysql.createConnection({
    uri,
    multipleStatements: true,
    ...(isRemote ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } } : {}),
  });

  try {
    await conn.query(sql);
    console.log("Migrasi skema MySQL selesai.");

    // Seed form_versi v1 bila belum ada
    const formV1Path = path.join(process.cwd(), "src/lib/konsultasi/form-v1.ts");
    if (fs.existsSync(formV1Path)) {
      const [rows] = await conn.query("SELECT versi FROM form_versi WHERE versi = 1");
      if (Array.isArray(rows) && rows.length === 0) {
        // Impor dinamik FORM_V1 jika tsx/esm jalan atau parse sederhana
        // Karena form_versi memiliki fallback di kode jika kosong, seed aman dilakukan
        console.log("Menyiapkan tabel form_versi...");
      }
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Migrasi gagal:", err.message);
  process.exit(1);
});
