"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DetailBriefTim } from "@/lib/konsultasi/db/tim-repo";
import { pertanyaanTampil, type PertanyaanTampil } from "@/lib/konsultasi/percabangan";
import {
  buatTautanWhatsApp,
  transisiDiizinkan,
  type StatusKonsultasi,
} from "@/lib/konsultasi/status";
import { LABEL_JENIS, type BagianId } from "@/lib/konsultasi/types";

export default function TimDetailBrief({ id }: { id: number }) {
  const [detail, setDetail] = useState<DetailBriefTim | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [catatanBaru, setCatatanBaru] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  const muatDetail = useCallback(async () => {
    setMemuat(true);
    setGalat(null);
    try {
      const res = await fetch(`/api/konsultasi/tim/${id}`, { cache: "no-store" });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setGalat(d.error ?? "Gagal memuat detail brief.");
        return;
      }
      setDetail((await res.json()) as DetailBriefTim);
    } catch {
      setGalat("Koneksi bermasalah.");
    } finally {
      setMemuat(false);
    }
  }, [id]);

  useEffect(() => {
    const t = setTimeout(() => {
      void muatDetail();
    }, 0);
    return () => clearTimeout(t);
  }, [muatDetail]);

  const kelompokBagian = useMemo(() => {
    if (!detail) return [];
    const tampil = pertanyaanTampil(
      detail.definisi,
      detail.jawaban,
      detail.konsultasi.jenis ?? undefined,
    );
    const bagianMap = new Map(detail.definisi.bagian.map((b) => [b.id, b] as const));
    const map = new Map<BagianId, PertanyaanTampil[]>();
    for (const t of tampil) {
      const arr = map.get(t.bagian) ?? [];
      arr.push(t);
      map.set(t.bagian, arr);
    }
    return Array.from(map.entries()).map(([bId, items]) => ({
      id: bId,
      meta: bagianMap.get(bId)!,
      items,
    }));
  }, [detail]);

  async function handleUbahStatus(ke: StatusKonsultasi) {
    setMenyimpan(true);
    setGalat(null);
    try {
      const res = await fetch(`/api/konsultasi/tim/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ke }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setGalat(d.error ?? "Gagal mengubah status.");
        return;
      }
      await muatDetail();
    } finally {
      setMenyimpan(false);
    }
  }

  async function handleTambahCatatan(e: React.FormEvent) {
    e.preventDefault();
    if (!catatanBaru.trim()) return;
    setMenyimpan(true);
    try {
      const res = await fetch(`/api/konsultasi/tim/${id}/catatan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isi: catatanBaru }),
      });
      if (res.ok) {
        setCatatanBaru("");
        await muatDetail();
      }
    } finally {
      setMenyimpan(false);
    }
  }

  if (memuat) {
    return (
      <p className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        Memuat detail brief…
      </p>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-400">{galat ?? "Brief tidak ditemukan."}</p>
        <Link href="/konsultasi/tim" className="text-xs text-sky-500 hover:underline">
          ← Kembali ke Kotak Masuk
        </Link>
      </div>
    );
  }

  const { konsultasi, jawaban, butuhBantuanIds, rekomendasi, statusLog, catatan } = detail;
  const bantuanSet = new Set(butuhBantuanIds);
  const transisi = transisiDiizinkan(konsultasi.status, "Admin");
  const waUrl = buatTautanWhatsApp(konsultasi.wa, konsultasi.nama, konsultasi.kode);

  const formatNilai = (t: PertanyaanTampil): string => {
    const v = jawaban[t.pertanyaan.id];
    if (v === undefined || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0)) {
      return "-";
    }
    if (t.opsi && Array.isArray(v)) {
      return v.map((k) => t.opsi!.find((o) => o.nilai === k)?.label ?? k).join(", ");
    }
    if (t.opsi && typeof v === "string") {
      return t.opsi.find((o) => o.nilai === v)?.label ?? v;
    }
    return String(v);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href="/konsultasi/tim" className="text-xs text-sky-500 hover:underline">
          ← Kembali ke Kotak Masuk
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
          >
            WhatsApp Cepat
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg border text-xs font-medium"
            style={{ borderColor: "var(--surface-border)", color: "var(--text-strong)" }}
          >
            Cetak / PDF
          </button>
        </div>
      </div>

      {/* Ringkasan Header Brief */}
      <section
        className="rounded-2xl border p-5 space-y-3"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono text-sky-500">
            {konsultasi.kode} · Form v{konsultasi.versiForm}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-600/20 text-sky-400">
            {konsultasi.status}
          </span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-strong)" }}>
          {konsultasi.nama}
        </h1>
        <p className="text-xs" style={{ color: "var(--text-body)" }}>
          WhatsApp: {konsultasi.wa} · Jenis:{" "}
          <strong>{konsultasi.jenis ? LABEL_JENIS[konsultasi.jenis] : "Belum ditetapkan"}</strong>
        </p>
        {konsultasi.diubahSetelahDikirim && (
          <p className="text-xs font-medium text-amber-400">
            Perhatian: Klien mengubah jawaban setelah konsultasi dikirim.
          </p>
        )}

        {transisi.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Ubah status:
            </span>
            {transisi.map((st) => (
              <button
                key={st}
                type="button"
                disabled={menyimpan}
                onClick={() => void handleUbahStatus(st)}
                className="px-3 py-1 rounded-lg border text-xs font-medium hover:border-sky-500 disabled:opacity-50"
                style={{ borderColor: "var(--surface-border)", color: "var(--text-strong)" }}
              >
                → {st}
              </button>
            ))}
          </div>
        )}
      </section>

      {galat && (
        <p role="alert" className="text-xs text-red-400">
          {galat}
        </p>
      )}

      {rekomendasi && (
        <section
          className="rounded-xl border p-4 space-y-1"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
        >
          <p className="text-xs font-mono uppercase text-sky-500">Rekomendasi Sistem</p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
            {LABEL_JENIS[rekomendasi.jenis]}
          </p>
          <p className="text-xs" style={{ color: "var(--text-body)" }}>
            {rekomendasi.alasan}
          </p>
        </section>
      )}

      {/* Jawaban per Bagian sesuai versi_form */}
      <section className="space-y-4">
        {kelompokBagian.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border p-4 space-y-3"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
              {b.meta.judul}
            </h2>
            <dl className="space-y-2.5 text-xs">
              {b.items.map((t) => {
                const perluBantuan = bantuanSet.has(t.pertanyaan.id);
                return (
                  <div
                    key={t.pertanyaan.id}
                    className={perluBantuan ? "rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5" : ""}
                  >
                    <dt className="flex items-center justify-between gap-2" style={{ color: "var(--text-muted)" }}>
                      <span>
                        {t.pertanyaan.id} · {t.pertanyaan.teks}
                      </span>
                      {perluBantuan && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 shrink-0">
                          Butuh bantuan
                        </span>
                      )}
                    </dt>
                    <dd className="font-medium mt-0.5" style={{ color: "var(--text-strong)" }}>
                      {formatNilai(t)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </section>

      {/* Catatan Internal (tidak pernah tampil di sisi klien, rujukan KP-12) */}
      <section
        className="rounded-2xl border p-5 space-y-4 print:hidden"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
          Catatan Internal Tim
        </h2>

        <form onSubmit={handleTambahCatatan} className="space-y-2">
          <textarea
            rows={3}
            value={catatanBaru}
            onChange={(e) => setCatatanBaru(e.target.value)}
            placeholder="Tulis catatan internal (tidak terlihat oleh klien)…"
            className="w-full rounded-lg border px-3 py-2 text-xs"
            style={{
              backgroundColor: "var(--window-bg)",
              borderColor: "var(--surface-border)",
              color: "var(--window-text)",
            }}
          />
          <button
            type="submit"
            disabled={menyimpan || !catatanBaru.trim()}
            className="px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 disabled:opacity-50"
          >
            Simpan Catatan
          </button>
        </form>

        {catatan.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Belum ada catatan.
          </p>
        ) : (
          <ul className="space-y-2">
            {catatan.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border p-3 text-xs space-y-1"
                style={{
                  backgroundColor: "var(--window-bg)",
                  borderColor: "var(--surface-border)",
                }}
              >
                <p style={{ color: "var(--text-strong)" }}>{c.isi}</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(c.waktu).toLocaleString("id-ID")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Riwayat Status */}
      <section
        className="rounded-2xl border p-5 space-y-3"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
          Jejak Perubahan Status
        </h2>
        {statusLog.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Belum ada riwayat perubahan status.
          </p>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {statusLog.map((l, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span style={{ color: "var(--text-body)" }}>
                  {l.dari} → <strong>{l.ke}</strong> ({l.oleh})
                </span>
                <span style={{ color: "var(--text-muted)" }}>
                  {new Date(l.waktu).toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
