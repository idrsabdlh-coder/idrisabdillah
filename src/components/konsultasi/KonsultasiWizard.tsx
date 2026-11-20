"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PertanyaanField from "./PertanyaanField";
import { STATUS_BOLEH_EDIT_KLIEN } from "@/lib/konsultasi/api-helpers";
import {
  ambilBagianTerakhir,
  ambilCadanganJawaban,
  hapusCadanganJawaban,
  simpanBagianTerakhir,
  simpanCadanganJawaban,
  simpanItemLokal,
} from "@/lib/konsultasi/client-storage";
import { jenisDariJawaban, pertanyaanTampil } from "@/lib/konsultasi/percabangan";
import type { PertanyaanTampil } from "@/lib/konsultasi/percabangan";
import { rekomendasikan } from "@/lib/konsultasi/rekomendasi";
import { slug } from "@/lib/konsultasi/syarat";
import { LABEL_JENIS } from "@/lib/konsultasi/types";
import type {
  BagianId,
  DefinisiForm,
  Jawaban,
  JawabanNilai,
  Jenis,
} from "@/lib/konsultasi/types";
import type { Galat } from "@/lib/konsultasi/validasi";

interface KonsultasiData {
  id: number;
  kode: string;
  nama: string;
  wa: string;
  jenis: Jenis | null;
  status: string;
  versiForm: number;
  diubahSetelahDikirim: boolean;
  dibuatPada: string;
  dikirimPada: string | null;
}

interface StatusLogItem {
  dari: string;
  ke: string;
  oleh: string;
  waktu: string;
}

type ModeTampilan = "wizard" | "rekomendasi" | "ringkasan" | "status";
type StatusSimpan = "idle" | "saving" | "saved" | "error";

const JENIS_NYATA: Exclude<Jenis, "belum">[] = [
  "undangan",
  "company",
  "sekolah",
  "katalog",
  "khusus",
];

const MAP_81_KE_JENIS: Record<string, Exclude<Jenis, "belum">> = {
  [slug("Undangan pernikahan")]: "undangan",
  [slug("Company profile")]: "company",
  [slug("Website sekolah")]: "sekolah",
  [slug("Katalog atau toko online")]: "katalog",
  [slug("Landing page atau sistem khusus")]: "khusus",
};

export default function KonsultasiWizard({ token }: { token: string }) {
  const router = useRouter();
  const [memuat, setMemuat] = useState(true);
  const [tidakDitemukan, setTidakDitemukan] = useState(false);
  const [konsultasi, setKonsultasi] = useState<KonsultasiData | null>(null);
  const [definisi, setDefinisi] = useState<DefinisiForm | null>(null);
  const [jawaban, setJawaban] = useState<Jawaban>({});
  const [statusLog, setStatusLog] = useState<StatusLogItem[]>([]);
  const [mode, setMode] = useState<ModeTampilan>("wizard");
  const [bagianAktif, setBagianAktif] = useState<BagianId>("1");
  const [statusSimpan, setStatusSimpan] = useState<StatusSimpan>("idle");
  const [pesanSimpan, setPesanSimpan] = useState<string | null>(null);
  const [setuju, setSetuju] = useState(false);
  const [galatKirim, setGalatKirim] = useState<Galat[]>([]);
  const [pesanUmum, setPesanUmum] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [membuatTurunan, setMembuatTurunan] = useState(false);

  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let aktif = true;
    const timers = timersRef.current;

    fetch(`/api/konsultasi/${token}`, { cache: "no-store" })
      .then(async (res) => {
        if (!aktif) return;
        if (res.status === 404) {
          setTidakDitemukan(true);
          setMemuat(false);
          return;
        }
        const data = (await res.json()) as {
          konsultasi: KonsultasiData;
          definisi: DefinisiForm;
          jawaban: Jawaban;
          statusLog: StatusLogItem[];
        };

        const cadangan = ambilCadanganJawaban(token);
        const gabungan: Jawaban = { ...data.jawaban, ...cadangan };

        setKonsultasi(data.konsultasi);
        setDefinisi(data.definisi);
        setJawaban(gabungan);
        setStatusLog(data.statusLog ?? []);

        simpanItemLokal({
          token,
          kode: data.konsultasi.kode,
          nama: data.konsultasi.nama,
          dibuatPada: data.konsultasi.dibuatPada,
        });

        if (data.konsultasi.status !== "Draf") {
          setMode("status");
        } else {
          const terakhir = ambilBagianTerakhir(token) as BagianId | null;
          if (terakhir) setBagianAktif(terakhir);
        }

        // Sinkronkan cadangan offline jika ada
        for (const [k, v] of Object.entries(cadangan)) {
          fetch(`/api/konsultasi/${token}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kunci: k, nilai: v }),
          })
            .then((r) => {
              if (r.ok) hapusCadanganJawaban(token, k);
            })
            .catch(() => {});
        }

        setMemuat(false);
      })
      .catch(() => {
        if (aktif) {
          setPesanUmum("Gagal memuat data konsultasi. Periksa koneksi internet Kakak.");
          setMemuat(false);
        }
      });

    return () => {
      aktif = false;
      for (const t of Object.values(timers)) clearTimeout(t);
    };
  }, [token]);

  const jenisDitetapkan = konsultasi?.jenis ?? undefined;
  const tampilList = useMemo(() => {
    if (!definisi) return [];
    return pertanyaanTampil(definisi, jawaban, jenisDitetapkan);
  }, [definisi, jawaban, jenisDitetapkan]);

  const kelompokBagian = useMemo(() => {
    if (!definisi) return [];
    const bagianMap = new Map(definisi.bagian.map((b) => [b.id, b] as const));
    const map = new Map<BagianId, PertanyaanTampil[]>();
    for (const t of tampilList) {
      const arr = map.get(t.bagian) ?? [];
      arr.push(t);
      map.set(t.bagian, arr);
    }
    return Array.from(map.entries()).map(([id, items]) => ({
      id,
      meta: bagianMap.get(id)!,
      items,
    }));
  }, [definisi, tampilList]);

  const indexBagian = useMemo(() => {
    const idx = kelompokBagian.findIndex((b) => b.id === bagianAktif);
    return idx >= 0 ? idx : 0;
  }, [kelompokBagian, bagianAktif]);

  const bagianSekarang = kelompokBagian[indexBagian];

  useEffect(() => {
    if (mode === "wizard" && bagianSekarang) {
      simpanBagianTerakhir(token, bagianSekarang.id);
    }
  }, [mode, bagianSekarang, token]);

  const simpanKeServer = useCallback(
    async (kunci: string, nilai: JawabanNilai) => {
      setStatusSimpan("saving");
      setPesanSimpan(null);
      try {
        const res = await fetch(`/api/konsultasi/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kunci, nilai }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          jenis?: Jenis | null;
          nilai?: JawabanNilai;
        };

        if (!res.ok) {
          setStatusSimpan("error");
          setPesanSimpan(data.error ?? "Gagal menyimpan jawaban.");
          return;
        }

        hapusCadanganJawaban(token, kunci);
        if (data.nilai !== undefined) {
          setJawaban((prev) => ({ ...prev, [kunci]: data.nilai! }));
        }
        if (data.jenis !== undefined) {
          setKonsultasi((prev) => (prev ? { ...prev, jenis: data.jenis ?? null } : prev));
        }
        setStatusSimpan("saved");
      } catch {
        simpanCadanganJawaban(token, kunci, nilai);
        setStatusSimpan("error");
        setPesanSimpan(
          "Simpan otomatis gagal karena koneksi terputus. Jawaban diamankan sementara di perangkat ini.",
        );
      }
    },
    [token],
  );

  function handleJawabanChange(kunci: string, nilai: JawabanNilai) {
    setJawaban((prev) => ({ ...prev, [kunci]: nilai }));
    setGalatKirim((prev) => prev.filter((g) => g.id !== kunci));

    if (kunci === "8.3") {
      setSetuju(Array.isArray(nilai) && nilai.length > 0);
    }

    const qId = kunci.includes(".") ? kunci.split(".").slice(0, 2).join(".") : kunci;
    const p = tampilList.find((t) => t.pertanyaan.id === qId)?.pertanyaan;
    const langsung = !kunci.includes(".lainnya") && !kunci.includes(".domain") && (p?.tipe === "PG" || p?.tipe === "KC");

    if (timersRef.current[kunci]) clearTimeout(timersRef.current[kunci]);
    if (langsung) {
      void simpanKeServer(kunci, nilai);
    } else {
      setStatusSimpan("saving");
      timersRef.current[kunci] = setTimeout(() => {
        void simpanKeServer(kunci, nilai);
      }, 450);
    }
  }

  async function pilihJenisDariRekomendasi(jenis: Exclude<Jenis, "belum">) {
    setMengirim(true);
    setPesanUmum(null);
    try {
      const res = await fetch(`/api/konsultasi/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tetapkanJenis: jenis }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setPesanUmum(d.error ?? "Gagal menetapkan jenis website.");
        return;
      }
      setKonsultasi((prev) => (prev ? { ...prev, jenis } : prev));
      setMode("wizard");
      setBagianAktif("4");
    } catch {
      setPesanUmum("Koneksi bermasalah saat menyimpan pilihan jenis website.");
    } finally {
      setMengirim(false);
    }
  }

  function handleLanjut() {
    if (!bagianSekarang) return;
    if (
      bagianSekarang.id === "3F" &&
      jenisDariJawaban(jawaban) === "belum" &&
      (!konsultasi?.jenis || konsultasi.jenis === "belum")
    ) {
      setMode("rekomendasi");
      return;
    }

    if (indexBagian < kelompokBagian.length - 1) {
      setBagianAktif(kelompokBagian[indexBagian + 1]!.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setMode("ringkasan");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleKembali() {
    if (indexBagian > 0) {
      setBagianAktif(kelompokBagian[indexBagian - 1]!.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleKirim() {
    setMengirim(true);
    setGalatKirim([]);
    setPesanUmum(null);
    const persetujuan = setuju || (Array.isArray(jawaban["8.3"]) && jawaban["8.3"].length > 0);
    try {
      const res = await fetch(`/api/konsultasi/${token}/kirim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setuju: persetujuan }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        galat?: Galat[];
      };

      if (!res.ok) {
        setGalatKirim(data.galat ?? []);
        setPesanUmum(data.error ?? "Masih ada isian yang perlu dilengkapi.");
        return;
      }

      setKonsultasi((prev) =>
        prev
          ? { ...prev, status: "Terkirim", dikirimPada: new Date().toISOString() }
          : prev,
      );
      setStatusLog((prev) => [
        ...prev,
        { dari: "Draf", ke: "Terkirim", oleh: "Klien", waktu: new Date().toISOString() },
      ]);
      setMode("status");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setPesanUmum("Koneksi terputus saat mengirim. Coba lagi.");
    } finally {
      setMengirim(false);
    }
  }

  async function handleTambahTurunan(jenis?: Exclude<Jenis, "belum">) {
    setMembuatTurunan(true);
    setPesanUmum(null);
    try {
      const res = await fetch(`/api/konsultasi/${token}/turunan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jenis ? { jenis } : {}),
      });
      const data = (await res.json()) as { token?: string; kode?: string; error?: string };
      if (!res.ok || !data.token || !data.kode) {
        setPesanUmum(data.error ?? "Gagal membuat konsultasi baru.");
        return;
      }
      simpanItemLokal({
        token: data.token,
        kode: data.kode,
        nama: konsultasi?.nama ?? "Konsultasi",
        dibuatPada: new Date().toISOString(),
      });
      router.push(`/konsultasi/${data.token}`);
    } catch {
      setPesanUmum("Koneksi bermasalah saat membuat konsultasi baru.");
    } finally {
      setMembuatTurunan(false);
    }
  }

  if (memuat) {
    return (
      <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        Memuat konsultasi…
      </div>
    );
  }

  if (tidakDitemukan || !konsultasi || !definisi) {
    return (
      <div
        className="rounded-2xl border p-6 space-y-3 text-center"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
      >
        <h1 className="text-lg font-semibold" style={{ color: "var(--text-strong)" }}>
          Tautan Tidak Ditemukan
        </h1>
        <p className="text-sm" style={{ color: "var(--text-body)" }}>
          Periksa kembali tautan pribadi Kakak atau mulai konsultasi baru.
        </p>
        <Link
          href="/konsultasi"
          className="inline-block px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700"
        >
          Ke Halaman Mulai
        </Link>
      </div>
    );
  }

  const bolehEdit = STATUS_BOLEH_EDIT_KLIEN.has(konsultasi.status);
  const rek = rekomendasikan(jawaban);

  const turunanDari81 = (Array.isArray(jawaban["8.1"]) ? jawaban["8.1"] : [])
    .map((v) => MAP_81_KE_JENIS[v])
    .filter((j): j is Exclude<Jenis, "belum"> => Boolean(j));

  const formatJawabanRingkas = (t: PertanyaanTampil): string => {
    const v = jawaban[t.pertanyaan.id];
    if (v === undefined || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0)) {
      return "-";
    }
    if (t.opsi && Array.isArray(v)) {
      return v
        .map((kode) => t.opsi!.find((o) => o.nilai === kode)?.label ?? kode)
        .join(", ");
    }
    if (t.opsi && typeof v === "string") {
      return t.opsi.find((o) => o.nilai === v)?.label ?? v;
    }
    return String(v);
  };

  return (
    <div className="space-y-6">
      {/* Header status & progres */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-mono opacity-65">
            {konsultasi.kode} · Status: {konsultasi.status}
          </p>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-strong)" }}>
            Halo, {konsultasi.nama}
          </h1>
        </div>
        <div className="text-xs" aria-live="polite">
          {statusSimpan === "saving" && (
            <span style={{ color: "var(--text-muted)" }}>Menyimpan…</span>
          )}
          {statusSimpan === "saved" && (
            <span className="text-emerald-500 font-medium">Tersimpan</span>
          )}
          {statusSimpan === "error" && (
            <span className="text-red-500 font-medium">Gagal menyimpan</span>
          )}
        </div>
      </div>

      {pesanSimpan && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400"
        >
          {pesanSimpan}
        </div>
      )}

      {pesanUmum && (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-400"
        >
          {pesanUmum}
        </div>
      )}

      {/* Mode Wizard */}
      {mode === "wizard" && bagianSekarang && (
        <section className="space-y-5">
          {/* Bar progres */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
              <span>
                Bagian {indexBagian + 1} dari {kelompokBagian.length}
              </span>
              <span>
                {Math.round(((indexBagian + 1) / kelompokBagian.length) * 100)}%
              </span>
            </div>
            <div
              className="h-2 w-full rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--surface)" }}
            >
              <div
                className="h-full bg-sky-600 transition-all"
                style={{
                  width: `${((indexBagian + 1) / kelompokBagian.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-strong)" }}>
              {bagianSekarang.meta.judul}
            </h2>
            {bagianSekarang.meta.deskripsi && (
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
                {bagianSekarang.meta.deskripsi}
              </p>
            )}
          </div>

          <div className="space-y-3.5">
            {bagianSekarang.items.map((t) => (
              <PertanyaanField
                key={t.pertanyaan.id}
                pertanyaan={t.pertanyaan}
                opsi={t.opsi}
                jawaban={jawaban}
                jenisBerlaku={konsultasi.jenis ?? undefined}
                galat={galatKirim.find((g) => g.id === t.pertanyaan.id)?.pesan}
                onChange={handleJawabanChange}
                disabled={!bolehEdit}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleKembali}
              disabled={indexBagian === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] rounded-xl border text-sm font-medium disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              style={{ borderColor: "var(--surface-border)", color: "var(--text-strong)" }}
            >
              Kembali
            </button>

            <div className="flex items-center gap-2">
              {konsultasi.status !== "Draf" && (
                <button
                  type="button"
                  onClick={() => setMode("status")}
                  className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] rounded-xl border text-sm font-medium"
                  style={{ borderColor: "var(--surface-border)", color: "var(--text-body)" }}
                >
                  Ke Status
                </button>
              )}
              <button
                type="button"
                onClick={handleLanjut}
                className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {indexBagian === kelompokBagian.length - 1 ? "Lihat Ringkasan" : "Lanjut"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Mode Rekomendasi (jalur "Belum tahu") */}
      {mode === "rekomendasi" && (
        <section
          className="rounded-2xl border p-5 space-y-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
        >
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase text-sky-500">Rekomendasi Sistem</p>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-strong)" }}>
              {LABEL_JENIS[rek.jenis]}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
              {rek.alasan}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={mengirim}
              onClick={() => void pilihJenisDariRekomendasi(rek.jenis as Exclude<Jenis, "belum">)}
              className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-60"
            >
              Pakai Rekomendasi Ini
            </button>
            {rek.alternatif && (
              <button
                type="button"
                disabled={mengirim}
                onClick={() =>
                  void pilihJenisDariRekomendasi(rek.alternatif as Exclude<Jenis, "belum">)
                }
                className="px-4 py-2.5 rounded-xl border text-sm font-medium"
                style={{ borderColor: "var(--surface-border)", color: "var(--text-strong)" }}
              >
                Pilih Alternatif: {LABEL_JENIS[rek.alternatif]}
              </button>
            )}
          </div>

          <div className="pt-3 border-t space-y-2" style={{ borderColor: "var(--surface-border)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Atau pilih sendiri jenis website yang Kakak inginkan:
            </p>
            <div className="grid gap-2">
              {JENIS_NYATA.map((j) => (
                <button
                  key={j}
                  type="button"
                  disabled={mengirim}
                  onClick={() => void pilihJenisDariRekomendasi(j)}
                  className="text-left px-3.5 py-2 rounded-lg border text-sm hover:border-sky-500 transition-colors"
                  style={{ borderColor: "var(--surface-border)", color: "var(--text-body)" }}
                >
                  {LABEL_JENIS[j]}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mode Ringkasan (8.6) */}
      {mode === "ringkasan" && (
        <section className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-strong)" }}>
              Ringkasan Konsultasi
            </h2>
            <p className="text-xs" style={{ color: "var(--text-body)" }}>
              Periksa kembali jawaban Kakak sebelum dikirim ke tim kami.
            </p>
          </div>

          {galatKirim.length > 0 && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 space-y-2"
            >
              <p className="text-sm font-semibold text-red-400">
                Ada {galatKirim.length} isian yang perlu dilengkapi:
              </p>
              <ul className="space-y-1 text-xs text-red-300">
                {galatKirim.map((g) => (
                  <li key={g.id} className="flex items-center justify-between gap-2">
                    <span>
                      <strong>{g.id}</strong>: {g.pesan}
                    </span>
                    {g.bagian && (
                      <button
                        type="button"
                        onClick={() => {
                          setBagianAktif(g.bagian!);
                          setMode("wizard");
                        }}
                        className="underline text-sky-400 shrink-0"
                      >
                        Lengkapi
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            {kelompokBagian.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border p-4 space-y-3"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--surface-border)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
                    {b.meta.judul}
                  </h3>
                  {bolehEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setBagianAktif(b.id);
                        setMode("wizard");
                      }}
                      className="text-xs text-sky-500 hover:underline"
                    >
                      Ubah
                    </button>
                  )}
                </div>
                <dl className="space-y-2 text-xs">
                  {b.items.map((t) => (
                    <div key={t.pertanyaan.id}>
                      <dt style={{ color: "var(--text-muted)" }}>
                        {t.pertanyaan.id} · {t.pertanyaan.teks}
                      </dt>
                      <dd className="font-medium mt-0.5" style={{ color: "var(--text-strong)" }}>
                        {formatJawabanRingkas(t)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {konsultasi.status === "Draf" && (
            <div
              className="rounded-xl border p-4 space-y-4"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--surface-border)",
              }}
            >
              <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={setuju || (Array.isArray(jawaban["8.3"]) && jawaban["8.3"].length > 0)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSetuju(checked);
                    const val = checked
                      ? [
                          slug(
                            "Saya setuju data pada formulir ini digunakan untuk keperluan konsultasi dan pembuatan website.",
                          ),
                        ]
                      : [];
                    handleJawabanChange("8.3", val);
                  }}
                  className="mt-1 accent-sky-600"
                />
                <span style={{ color: "var(--text-body)" }}>
                  Saya setuju data pada formulir ini digunakan untuk keperluan konsultasi dan
                  pembuatan website.
                </span>
              </label>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setMode("wizard")}
                  className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] rounded-xl border text-sm font-medium"
                  style={{ borderColor: "var(--surface-border)", color: "var(--text-strong)" }}
                >
                  Kembali ke Kuesioner
                </button>
                <button
                  type="button"
                  disabled={mengirim}
                  onClick={() => void handleKirim()}
                  className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-60"
                >
                  {mengirim ? "Mengirim…" : "Kirim Konsultasi"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Mode Status & Tambah Konsultasi (8.7 & 8.8) */}
      {mode === "status" && (
        <section className="space-y-5">
          <div
            className="rounded-2xl border p-5 space-y-3"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-sky-500">{konsultasi.kode}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-600/20 text-sky-400">
                {konsultasi.status}
              </span>
            </div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-strong)" }}>
              Konsultasi Terkirim
            </h2>
            <p className="text-sm" style={{ color: "var(--text-body)" }}>
              Terima kasih, Kak {konsultasi.nama}! Tim kami akan meninjau brief Kakak dan
              menghubungi melalui WhatsApp ({konsultasi.wa}).
            </p>
            {konsultasi.diubahSetelahDikirim && (
              <p className="text-xs text-amber-400">
                Catatan: ada perubahan jawaban setelah konsultasi dikirim.
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {bolehEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setBagianAktif("1");
                    setMode("wizard");
                  }}
                  className="px-4 py-2 rounded-xl border text-xs font-medium"
                  style={{ borderColor: "var(--surface-border)", color: "var(--text-strong)" }}
                >
                  Ubah Jawaban
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode("ringkasan")}
                className="px-4 py-2 rounded-xl border text-xs font-medium"
                style={{ borderColor: "var(--surface-border)", color: "var(--text-body)" }}
              >
                Lihat Ringkasan Brief
              </button>
            </div>
          </div>

          {/* Riwayat Status */}
          <div
            className="rounded-2xl border p-5 space-y-3"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
              Riwayat Status
            </h3>
            {statusLog.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Belum ada perubahan status.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {statusLog.map((log, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span style={{ color: "var(--text-body)" }}>
                      {log.dari} → <strong>{log.ke}</strong> ({log.oleh})
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {new Date(log.waktu).toLocaleString("id-ID")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tambah Konsultasi Turunan (8.8) */}
          <div
            className="rounded-2xl border p-5 space-y-3"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
              Butuh Jenis Website Lain?
            </h3>
            <p className="text-xs" style={{ color: "var(--text-body)" }}>
              Data kontak Kakak dari Bagian 1 akan disalin otomatis tanpa perlu mengisi ulang.
            </p>
            <div className="flex flex-wrap gap-2">
              {turunanDari81.map((j) => (
                <button
                  key={j}
                  type="button"
                  disabled={membuatTurunan}
                  onClick={() => void handleTambahTurunan(j)}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 disabled:opacity-60"
                >
                  + Buat {LABEL_JENIS[j]}
                </button>
              ))}
              <button
                type="button"
                disabled={membuatTurunan}
                onClick={() => void handleTambahTurunan()}
                className="px-3.5 py-2 rounded-xl border text-xs font-medium disabled:opacity-60"
                style={{ borderColor: "var(--surface-border)", color: "var(--text-strong)" }}
              >
                {membuatTurunan ? "Membuat…" : "+ Tambah Konsultasi Baru"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
