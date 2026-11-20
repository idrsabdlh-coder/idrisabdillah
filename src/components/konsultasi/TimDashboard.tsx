"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ItemKotakMasuk, StatistikTim } from "@/lib/konsultasi/db/tim-repo";
import {
  transisiDiizinkan,
  URUTAN_STATUS,
  type StatusKonsultasi,
} from "@/lib/konsultasi/status";
import { DAFTAR_JENIS, LABEL_JENIS } from "@/lib/konsultasi/types";

interface Props {
  sudahLoginAwal: boolean;
}

const ANGGARAN_OPSI = [
  "di-bawah-rp500-ribu",
  "rp500-ribu-1-5-juta",
  "rp1-5-5-juta",
  "rp5-15-juta",
  "di-atas-rp15-juta",
  "belum-tahu-minta-rekomendasi",
];

export default function TimDashboard({ sudahLoginAwal }: Props) {
  const [sudahLogin, setSudahLogin] = useState(sudahLoginAwal);
  const [sandi, setSandi] = useState("");
  const [galatLogin, setGalatLogin] = useState<string | null>(null);
  const [memuatLogin, setMemuatLogin] = useState(false);

  const [tab, setTab] = useState<"inbox" | "pipeline">("inbox");
  const [daftar, setDaftar] = useState<ItemKotakMasuk[]>([]);
  const [statistik, setStatistik] = useState<StatistikTim | null>(null);
  const [memuatData, setMemuatData] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);

  const [cari, setCari] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");
  const [anggaranFilter, setAnggaranFilter] = useState("");
  const [urut, setUrut] = useState<"terbaru" | "batas_waktu">("terbaru");

  const muatData = useCallback(async () => {
    setMemuatData(true);
    setPesan(null);
    try {
      const params = new URLSearchParams();
      if (cari.trim()) params.set("cari", cari.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (jenisFilter) params.set("jenis", jenisFilter);
      if (anggaranFilter) params.set("anggaran", anggaranFilter);
      if (urut) params.set("urut", urut);

      const res = await fetch(`/api/konsultasi/tim?${params.toString()}`, {
        cache: "no-store",
      });
      if (res.status === 401) {
        setSudahLogin(false);
        return;
      }
      const data = (await res.json()) as {
        daftar?: ItemKotakMasuk[];
        statistik?: StatistikTim;
        error?: string;
      };
      if (!res.ok) {
        setPesan(data.error ?? "Gagal memuat kotak masuk.");
        return;
      }
      setDaftar(data.daftar ?? []);
      setStatistik(data.statistik ?? null);
    } catch {
      setPesan("Koneksi bermasalah saat memuat data Tim.");
    } finally {
      setMemuatData(false);
    }
  }, [cari, statusFilter, jenisFilter, anggaranFilter, urut]);

  useEffect(() => {
    if (!sudahLogin) return;
    const t = setTimeout(() => {
      void muatData();
    }, 150);
    return () => clearTimeout(t);
  }, [sudahLogin, muatData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setGalatLogin(null);
    setMemuatLogin(true);
    try {
      const res = await fetch("/api/konsultasi/tim/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sandi }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setGalatLogin(data.error ?? "Gagal masuk.");
        return;
      }
      setSandi("");
      setSudahLogin(true);
    } catch {
      setGalatLogin("Koneksi bermasalah.");
    } finally {
      setMemuatLogin(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/konsultasi/tim/logout", { method: "POST" });
    setSudahLogin(false);
    setDaftar([]);
  }

  async function pindahStatus(id: number, ke: StatusKonsultasi) {
    const res = await fetch(`/api/konsultasi/tim/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ke }),
    });
    if (res.ok) {
      void muatData();
    } else {
      const d = (await res.json()) as { error?: string };
      setPesan(d.error ?? "Gagal mengubah status.");
    }
  }

  if (!sudahLogin) {
    return (
      <section className="max-w-sm mx-auto py-8 space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-bold" style={{ color: "var(--text-strong)" }}>
            Masuk Dasbor Tim
          </h1>
          <p className="text-xs" style={{ color: "var(--text-body)" }}>
            Masukkan kata sandi Admin untuk mengakses brief konsultasi klien.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border p-5 space-y-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
        >
          <div className="space-y-1.5">
            <label
              htmlFor="tim-sandi"
              className="block text-sm font-medium"
              style={{ color: "var(--text-strong)" }}
            >
              Kata Sandi Admin
            </label>
            <input
              id="tim-sandi"
              type="password"
              required
              value={sandi}
              onChange={(e) => setSandi(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              style={{
                backgroundColor: "var(--window-bg)",
                borderColor: "var(--surface-border)",
                color: "var(--window-text)",
              }}
            />
          </div>

          {galatLogin && (
            <p role="alert" className="text-xs text-red-500 font-medium">
              {galatLogin}
            </p>
          )}

          <button
            type="submit"
            disabled={memuatLogin}
            className="w-full inline-flex items-center justify-center py-2.5 min-h-[44px] rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {memuatLogin ? "Memeriksa…" : "Masuk"}
          </button>
        </form>
      </section>
    );
  }

  const eksporParams = new URLSearchParams();
  if (cari.trim()) eksporParams.set("cari", cari.trim());
  if (statusFilter) eksporParams.set("status", statusFilter);
  if (jenisFilter) eksporParams.set("jenis", jenisFilter);
  if (anggaranFilter) eksporParams.set("anggaran", anggaranFilter);
  eksporParams.set("urut", urut);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-strong)" }}>
            Dasbor Tim Konsultasi
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Kelola brief masuk, status pipeline, dan catatan internal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/konsultasi/tim/ekspor?${eksporParams.toString()}`}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:opacity-85"
            style={{ borderColor: "var(--surface-border)", color: "var(--text-strong)" }}
          >
            Ekspor CSV
          </a>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium text-red-400 border-red-500/30 hover:bg-red-500/10"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Statistik Ringkas (9.9) */}
      {statistik && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className="rounded-xl border p-3.5"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
          >
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Total Masuk
            </p>
            <p className="text-xl font-bold" style={{ color: "var(--text-strong)" }}>
              {statistik.totalMasuk}
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              7h: {statistik.masuk7Hari} · 30h: {statistik.masuk30Hari}
            </p>
          </div>
          <div
            className="rounded-xl border p-3.5"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
          >
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Rasio Disetujui
            </p>
            <p className="text-xl font-bold" style={{ color: "var(--text-strong)" }}>
              {statistik.rasioDisetujuiPersen}%
            </p>
          </div>
          <div
            className="rounded-xl border p-3.5"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
          >
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Rata-rata Respons
            </p>
            <p className="text-xl font-bold" style={{ color: "var(--text-strong)" }}>
              {statistik.rataRataResponsJam !== null
                ? `${statistik.rataRataResponsJam} jam`
                : "-"}
            </p>
          </div>
          <div
            className="rounded-xl border p-3.5"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
          >
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Per Jenis Terbanyak
            </p>
            <p className="text-xs font-semibold mt-1 truncate" style={{ color: "var(--text-strong)" }}>
              {Object.entries(statistik.perJenis)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ") || "-"}
            </p>
          </div>
        </section>
      )}

      {/* Tab & Filter */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("inbox")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
              tab === "inbox" ? "bg-sky-600 text-white" : "border"
            }`}
            style={
              tab === "inbox"
                ? undefined
                : { borderColor: "var(--surface-border)", color: "var(--text-body)" }
            }
          >
            Kotak Masuk
          </button>
          <button
            type="button"
            onClick={() => setTab("pipeline")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
              tab === "pipeline" ? "bg-sky-600 text-white" : "border"
            }`}
            style={
              tab === "pipeline"
                ? undefined
                : { borderColor: "var(--surface-border)", color: "var(--text-body)" }
            }
          >
            Pipeline
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama, WA, kode…"
            className="sm:col-span-2 rounded-lg border px-3 py-1.5 text-xs"
            style={{
              backgroundColor: "var(--window-bg)",
              borderColor: "var(--surface-border)",
              color: "var(--window-text)",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status"
            className="rounded-lg border px-2.5 py-1.5 text-xs"
            style={{
              backgroundColor: "var(--window-bg)",
              borderColor: "var(--surface-border)",
              color: "var(--window-text)",
            }}
          >
            <option value="">Semua status</option>
            {URUTAN_STATUS.filter((s) => s !== "Draf").map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            aria-label="Filter jenis website"
            className="rounded-lg border px-2.5 py-1.5 text-xs"
            style={{
              backgroundColor: "var(--window-bg)",
              borderColor: "var(--surface-border)",
              color: "var(--window-text)",
            }}
          >
            <option value="">Semua jenis</option>
            {DAFTAR_JENIS.filter((j) => j !== "belum").map((j) => (
              <option key={j} value={j}>
                {LABEL_JENIS[j]}
              </option>
            ))}
          </select>
          <select
            value={urut}
            onChange={(e) => setUrut(e.target.value as "terbaru" | "batas_waktu")}
            aria-label="Urutkan"
            className="rounded-lg border px-2.5 py-1.5 text-xs"
            style={{
              backgroundColor: "var(--window-bg)",
              borderColor: "var(--surface-border)",
              color: "var(--window-text)",
            }}
          >
            <option value="terbaru">Urut: Terbaru</option>
            <option value="batas_waktu">Urut: Batas Waktu Terdekat</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={anggaranFilter}
            onChange={(e) => setAnggaranFilter(e.target.value)}
            aria-label="Filter anggaran"
            className="rounded-lg border px-2.5 py-1.5 text-xs"
            style={{
              backgroundColor: "var(--window-bg)",
              borderColor: "var(--surface-border)",
              color: "var(--window-text)",
            }}
          >
            <option value="">Semua anggaran</option>
            {ANGGARAN_OPSI.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pesan && (
        <p role="alert" className="text-xs text-red-400">
          {pesan}
        </p>
      )}

      {memuatData ? (
        <p className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>
          Memuat daftar konsultasi…
        </p>
      ) : tab === "inbox" ? (
        daftar.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
            Belum ada konsultasi yang cocok.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {daftar.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--surface-border)",
                }}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-sky-500">{item.kode}</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-600/20 text-sky-400">
                      {item.status}
                    </span>
                    {item.diubahSetelahDikirim && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/20 text-amber-400">
                        Diubah setelah dikirim
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
                    {item.nama}{" "}
                    <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                      ({item.wa})
                    </span>
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {item.jenis ? LABEL_JENIS[item.jenis] : "Belum ditetapkan"}
                    {item.batasWaktu ? ` · Batas waktu: ${item.batasWaktu}` : ""}
                  </p>
                </div>

                <Link
                  href={`/konsultasi/tim/${item.id}`}
                  className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 shrink-0"
                >
                  Buka Brief
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        /* Tampilan Pipeline (9.7) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {URUTAN_STATUS.filter((s) => s !== "Draf").map((kolom) => {
            const kartu = daftar.filter((d) => d.status === kolom);
            return (
              <div
                key={kolom}
                className="rounded-xl border p-3 space-y-2.5"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--surface-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-strong)" }}>
                    {kolom}
                  </h2>
                  <span className="text-xs font-mono opacity-60">{kartu.length}</span>
                </div>
                <div className="space-y-2">
                  {kartu.map((k) => {
                    const opsiTujuan = transisiDiizinkan(k.status, "Admin");
                    const maju = opsiTujuan[0];
                    return (
                      <div
                        key={k.id}
                        className="rounded-lg border p-2.5 space-y-2"
                        style={{
                          backgroundColor: "var(--window-bg)",
                          borderColor: "var(--surface-border)",
                        }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/konsultasi/tim/${k.id}`}
                            className="text-xs font-semibold hover:underline"
                            style={{ color: "var(--text-strong)" }}
                          >
                            {k.nama}
                          </Link>
                          <span className="text-[10px] font-mono opacity-60">{k.kode}</span>
                        </div>
                        {maju && (
                          <button
                            type="button"
                            onClick={() => void pindahStatus(k.id, maju)}
                            className="w-full py-1 rounded border text-[11px] font-medium hover:border-sky-500"
                            style={{
                              borderColor: "var(--surface-border)",
                              color: "var(--text-body)",
                            }}
                          >
                            Pindah ke {maju} →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
