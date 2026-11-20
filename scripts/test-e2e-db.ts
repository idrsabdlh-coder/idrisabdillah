import fs from "node:fs";
import path from "node:path";
import {
  buatKonsultasiBaru,
  ambilKonsultasiDariToken,
  simpanJawabanKonsultasi,
} from "../src/lib/konsultasi/db/konsultasi-repo";
import {
  daftarKonsultasiTim,
  ambilDetailBriefTim,
  tambahCatatanTim,
  ubahStatusTim,
} from "../src/lib/konsultasi/db/tim-repo";
import { cekDanCatatLaju } from "../src/lib/konsultasi/db/rate-limit";
import { getPool } from "../src/lib/konsultasi/db/index";

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
  const pool = getPool();

  console.log("1. Menguji rate limit...");
  const ip = "test:" + Date.now();
  const r1 = await cekDanCatatLaju(pool, ip, 2, 60000);
  if (!r1.diizinkan) throw new Error("Rate limit 1 harus diizinkan");
  const r2 = await cekDanCatatLaju(pool, ip, 2, 60000);
  if (!r2.diizinkan) throw new Error("Rate limit 2 harus diizinkan");
  const r3 = await cekDanCatatLaju(pool, ip, 2, 60000);
  if (r3.diizinkan) throw new Error("Rate limit 3 harus ditolak (maks 2)");
  console.log("   ✅ Rate limit berhasil diuji.");

  console.log("2. Membuat konsultasi Draf baru...");
  const nama = "Budi Hartono";
  const wa = "6281234567890";
  const { token, kode, id } = await buatKonsultasiBaru(pool, { nama, wa });
  console.log(`   ✅ Konsultasi dibuat: ID=${id}, Kode=${kode}, Token=${token.slice(0, 8)}...`);

  console.log("3. Mengambil konsultasi via token valid...");
  const data = await ambilKonsultasiDariToken(pool, token);
  if (!data) throw new Error("Konsultasi tidak ditemukan dengan token valid");
  if (data.konsultasi.nama !== nama) throw new Error("Nama tidak cocok");
  if ("token_hash" in (data.konsultasi as unknown as Record<string, unknown>) || "catatan" in (data as unknown as Record<string, unknown>)) {
    throw new Error("Kebocoran rahasia! token_hash atau catatan ada di respons klien!");
  }
  console.log("   ✅ Respons aman: tidak ada token_hash atau catatan klien.");

  console.log("4. Menguji token salah (KP-13)...");
  const tokenSalah = token.slice(0, -1) + (token.slice(-1) === "a" ? "b" : "a");
  const dataSalah = await ambilKonsultasiDariToken(pool, tokenSalah);
  if (dataSalah !== null) throw new Error("Token salah seharusnya menghasilkan null (404)");
  console.log("   ✅ Token salah berhasil menghasilkan 404 (null).");

  console.log("5. Simpan jawaban (auto-save)...");
  const p21 = data.definisi.pertanyaan.find((p) => p.id === "2.1");
  const simpan = await simpanJawabanKonsultasi(
    pool,
    token,
    "2.1",
    p21?.opsi?.[1]?.nilai ?? "company-profile",
  );
  if (!simpan.ok) throw new Error("Gagal simpan jawaban: " + JSON.stringify(simpan));
  console.log("   ✅ Auto-save berhasil.");

  console.log("6. Dasbor Tim: tambah catatan internal...");
  const cat = await tambahCatatanTim(pool, id, "Klien tertarik dengan paket company profile.");
  if (!cat.ok) throw new Error("Gagal tambah catatan: " + cat.pesan);
  console.log("   ✅ Catatan internal berhasil disimpan.");

  console.log("7. Dasbor Tim: ambil detail konsultasi (brief)...");
  const detail = await ambilDetailBriefTim(pool, id);
  if (!detail) throw new Error("Detail konsultasi tidak ditemukan oleh tim");
  if (detail.catatan.length === 0) throw new Error("Catatan internal tidak masuk di detail tim");
  console.log(`   ✅ Detail berhasil dimuat, ada ${detail.catatan.length} catatan internal.`);

  console.log("8. Dasbor Tim: ubah status...");
  // Dari Draf tidak bisa langsung ke Disetujui (harus validasi alur)
  const ubahGagal = await ubahStatusTim(pool, id, "Disetujui", "Admin");
  if (ubahGagal.ok) throw new Error("Seharusnya gagal transisi ilegal Draf -> Disetujui");
  console.log("   ✅ Validasi transisi status ilegal ditolak dengan benar: " + ubahGagal.pesan);

  console.log("9. Dasbor Tim: ambil daftar kotak masuk...");
  const kotak = await daftarKonsultasiTim(pool, { sertakanDraf: true });
  if (!kotak.some((k) => k.id === id)) throw new Error("Konsultasi baru tidak ada di kotak masuk tim");
  console.log(`   ✅ Kotak masuk berhasil memuat ${kotak.length} entri konsultasi.`);

  console.log("\n🎉 SEMUA PENGUJIAN DATABASE, API KLIEN, DAN DASBOR TIM BERHASIL!");
  await pool.end();
}

run().catch((e) => {
  console.error("Gagal:", e);
  process.exit(1);
});
