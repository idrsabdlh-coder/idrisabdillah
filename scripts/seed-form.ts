import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { FORM_V1 } from "../src/lib/konsultasi/form-v1";

function loadEnv() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

async function run() {
  loadEnv();
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is not set");
  const isRemote =
    uri.includes("tidbcloud.com") ||
    uri.includes("ssl=") ||
    process.env.DATABASE_SSL === "true";
  const conn = await mysql.createConnection({
    uri,
    ...(isRemote ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } } : {}),
  });
  try {
    await conn.query(
      `INSERT INTO form_versi (versi, definisi, aktif) VALUES (?, ?, TRUE)
       ON DUPLICATE KEY UPDATE definisi = VALUES(definisi), aktif = TRUE`,
      [FORM_V1.versi, JSON.stringify(FORM_V1)],
    );
    console.log("form_versi seeded successfully!");
  } finally {
    await conn.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
