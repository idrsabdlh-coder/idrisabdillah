"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ambilDaftarLokal,
  simpanItemLokal,
  type ItemRiwayatLokal,
} from "@/lib/konsultasi/client-storage";

interface InfoRingkas {
  token: string;
  kode: string;
  nama: string;
  status?: string;
  jenis?: string | null;
}

export default function KonsultasiMulai() {
  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");
  const [hp, setHp] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [baru, setBaru] = useState<{ token: string; kode: string } | null>(null);
  const [tersalin, setTersalin] = useState(false);
  const [daftar, setDaftar] = useState<InfoRingkas[]>([]);

  useEffect(() => {
    let aktif = true;
    const lokal: ItemRiwayatLokal[] = ambilDaftarLokal();
    if (lokal.length === 0) return;

    Promise.all(
      lokal.map(async (item): Promise<InfoRingkas> => {
        try {
          const res = await fetch(`/api/konsultasi/${item.token}`, { cache: "no-store" });
          if (!res.ok) return { token: item.token, kode: item.kode, nama: item.nama };
          const d = (await res.json()) as {
            konsultasi?: { status?: string; jenis?: string | null; nama?: string; kode?: string };
          };
          return {
            token: item.token,
            kode: d.konsultasi?.kode ?? item.kode,
            nama: d.konsultasi?.nama ?? item.nama,
            status: d.konsultasi?.status,
            jenis: d.konsultasi?.jenis,
          };
        } catch {
          return { token: item.token, kode: item.kode, nama: item.nama };
        }
      }),
    ).then((hasil) => {
      if (aktif) setDaftar(hasil);
    });

    return () => {
      aktif = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGalat(null);
    setMemuat(true);

    try {
      const res = await fetch("/api/konsultasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, wa, hp }),
      });
      let data: { token?: string; kode?: string; error?: string } = {};
      try {
        data = (await res.json()) as { token?: string; kode?: string; error?: string };
      } catch {
        // Respons bukan JSON (misal halaman 500 dari penyedia hosting)
      }

      if (!res.ok || !data.token || !data.kode) {
        setGalat(
          data.error ??
            `Gagal terhubung ke server (Status ${res.status}). Pastikan konfigurasi database di Vercel sudah terpasang.`,
        );
        return;
      }

      simpanItemLokal({
        token: data.token,
        kode: data.kode,
        nama: nama.trim(),
        dibuatPada: new Date().toISOString(),
      });
      setBaru({ token: data.token, kode: data.kode });
    } catch {
      setGalat("Koneksi bermasalah. Coba beberapa saat lagi.");
    } finally {
      setMemuat(false);
    }
  }

  const tautanPribadi =
    baru && typeof window !== "undefined"
      ? `${window.location.origin}/konsultasi/${baru.token}`
      : baru
        ? `/konsultasi/${baru.token}`
        : "";

  async function salinTautan() {
    if (!tautanPribadi) return;
    try {
      await navigator.clipboard.writeText(tautanPribadi);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      setTersalin(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-strong)" }}>
          Mulai Konsultasi Website
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
          Halo Kak! Isi nama dan nomor WhatsApp aktif untuk memulai. Tidak perlu kata sandi, sistem
          akan membuatkan tautan pribadi agar Kakak bisa melanjutkan kapan saja.
        </p>
      </section>

      {baru ? (
        <section
          className="rounded-2xl border p-5 space-y-4"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--surface-border)",
          }}
          aria-live="polite"
        >
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-sky-500">
              Kode: {baru.kode}
            </p>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-strong)" }}>
              Tautan Pribadi Siap
            </h2>
            <p className="text-sm font-medium text-amber-500">
              Simpan tautan ini untuk melanjutkan atau mengecek status konsultasi Kakak nanti.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={tautanPribadi}
              aria-label="Tautan pribadi konsultasi"
              className="flex-1 rounded-lg border px-3 py-2 text-xs font-mono"
              style={{
                backgroundColor: "var(--window-bg)",
                borderColor: "var(--surface-border)",
                color: "var(--window-text)",
              }}
            />
            <button
              type="button"
              onClick={salinTautan}
              className="inline-flex items-center justify-center px-4 py-2 min-h-[44px] rounded-lg border text-sm font-medium hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              style={{
                borderColor: "var(--surface-border)",
                color: "var(--text-strong)",
              }}
            >
              {tersalin ? "Tersalin!" : "Salin Tautan"}
            </button>
          </div>

          <div className="pt-1">
            <Link
              href={`/konsultasi/${baru.token}`}
              className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Lanjutkan ke Kuesioner
            </Link>
          </div>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-5 space-y-4"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--surface-border)",
          }}
        >
          {/* Honeypot anti-bot */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="hp-field">Website</label>
            <input
              id="hp-field"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="mulai-nama"
              className="block text-sm font-medium"
              style={{ color: "var(--text-strong)" }}
            >
              Nama lengkap Kakak <span className="text-red-500">*</span>
            </label>
            <input
              id="mulai-nama"
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              style={{
                backgroundColor: "var(--window-bg)",
                borderColor: "var(--surface-border)",
                color: "var(--window-text)",
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="mulai-wa"
              className="block text-sm font-medium"
              style={{ color: "var(--text-strong)" }}
            >
              Nomor WhatsApp aktif <span className="text-red-500">*</span>
            </label>
            <input
              id="mulai-wa"
              type="tel"
              required
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              style={{
                backgroundColor: "var(--window-bg)",
                borderColor: "var(--surface-border)",
                color: "var(--window-text)",
              }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Format Indonesia (08… atau +628…).
            </p>
          </div>

          {galat && (
            <p role="alert" className="text-sm text-red-500 font-medium">
              {galat}
            </p>
          )}

          <button
            type="submit"
            disabled={memuat}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {memuat ? "Membuat tautan…" : "Mulai Konsultasi"}
          </button>
        </form>
      )}

      {daftar.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-strong)" }}>
            Konsultasi di Perangkat Ini
          </h2>
          <ul className="space-y-2.5">
            {daftar.map((item) => (
              <li
                key={item.token}
                className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--surface-border)",
                }}
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
                    {item.nama}{" "}
                    <span className="text-xs font-mono opacity-60">({item.kode})</span>
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Status: {item.status ?? "Tersimpan lokal"}
                    {item.jenis ? ` · ${item.jenis}` : ""}
                  </p>
                </div>
                <Link
                  href={`/konsultasi/${item.token}`}
                  className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg border text-xs font-medium hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  style={{
                    borderColor: "var(--surface-border)",
                    color: "var(--text-strong)",
                  }}
                >
                  {item.status === "Draf" || !item.status ? "Lanjutkan" : "Lihat Status"}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
