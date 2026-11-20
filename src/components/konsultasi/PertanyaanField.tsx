"use client";

import type { Jawaban, JawabanNilai, Jenis, Opsi, Pertanyaan } from "@/lib/konsultasi/types";

interface Props {
  pertanyaan: Pertanyaan;
  opsi?: Opsi[];
  jawaban: Jawaban;
  jenisBerlaku?: Jenis;
  galat?: string;
  onChange: (kunci: string, nilai: JawabanNilai) => void;
  disabled?: boolean;
}

/**
 * Merender satu pertanyaan dari definisi (JS, PG, KC, PR, TG)
 * beserta sub-isian teks ("Lainnya", nama domain) saat opsi terkait dipilih.
 */
const SARAN_LAINNYA = [
  {
    label: "💡 Minta saran tim konsultasi",
    teks: "Minta saran dan rekomendasi terbaik dari tim konsultasi",
  },
  {
    label: "✨ Sesuaikan tren industri terkini",
    teks: "Rekomendasikan fitur sesuai standar dan tren terbaik saat ini",
  },
  {
    label: "💬 Diskusi langsung via WhatsApp",
    teks: "Ingin didiskusikan langsung bersama tim via WhatsApp",
  },
];

const SARAN_DOMAIN = [
  {
    label: "💡 Minta rekomendasi ide nama dari tim",
    teks: "Belum punya nama domain, mohon dibantu carikan ide nama yang pas",
  },
  {
    label: "🌐 Ekstensi .com / .id resmi",
    teks: "Ingin domain ekstensi .com atau .id yang resmi dan kredibel",
  },
];

export default function PertanyaanField({
  pertanyaan,
  opsi,
  jawaban,
  jenisBerlaku,
  galat,
  onChange,
  disabled = false,
}: Props) {
  const nilai = jawaban[pertanyaan.id];
  const inputId = `q-${pertanyaan.id}`;
  const errId = `${inputId}-err`;

  const formatLabelOpsi = (o: Opsi): string => {
    if (pertanyaan.id === "4.4" && o.label === "Elegan" && jenisBerlaku === "undangan") {
      return "Elegan dan romantis";
    }
    return o.label;
  };

  const terpilihDaftar = Array.isArray(nilai)
    ? nilai
    : typeof nilai === "string" && nilai !== ""
      ? [nilai]
      : [];

  return (
    <div
      id={`field-${pertanyaan.id}`}
      className="rounded-xl p-4 border space-y-2.5"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: galat ? "#ef4444" : "var(--surface-border)",
      }}
    >
      <div className="space-y-1">
        <label
          htmlFor={pertanyaan.tipe === "PG" || pertanyaan.tipe === "KC" ? undefined : inputId}
          className="block text-sm font-medium leading-snug"
          style={{ color: "var(--text-strong)" }}
        >
          <span className="opacity-60 mr-1.5 text-xs font-mono">{pertanyaan.id}</span>
          {pertanyaan.teks}
          {pertanyaan.wajib && (
            <span className="text-red-500 ml-1" aria-label="wajib">
              *
            </span>
          )}
        </label>
        {pertanyaan.bantuan && (
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {pertanyaan.bantuan}
          </p>
        )}
      </div>

      {pertanyaan.tipe === "JS" && (
        <input
          id={inputId}
          type={pertanyaan.format === "whatsapp" ? "tel" : "text"}
          value={typeof nilai === "string" ? nilai : ""}
          onChange={(e) => onChange(pertanyaan.id, e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(galat)}
          aria-describedby={galat ? errId : undefined}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          style={{
            backgroundColor: "var(--window-bg)",
            borderColor: "var(--surface-border)",
            color: "var(--window-text)",
          }}
        />
      )}

      {pertanyaan.tipe === "PR" && (
        <textarea
          id={inputId}
          rows={4}
          value={typeof nilai === "string" ? nilai : ""}
          onChange={(e) => onChange(pertanyaan.id, e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(galat)}
          aria-describedby={galat ? errId : undefined}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          style={{
            backgroundColor: "var(--window-bg)",
            borderColor: "var(--surface-border)",
            color: "var(--window-text)",
          }}
        />
      )}

      {pertanyaan.tipe === "TG" && (
        <input
          id={inputId}
          type="date"
          value={typeof nilai === "string" ? nilai : ""}
          onChange={(e) => onChange(pertanyaan.id, e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(galat)}
          aria-describedby={galat ? errId : undefined}
          className="w-full sm:w-auto rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          style={{
            backgroundColor: "var(--window-bg)",
            borderColor: "var(--surface-border)",
            color: "var(--window-text)",
          }}
        />
      )}

      {pertanyaan.tipe === "PG" && opsi && (
        <fieldset className="space-y-2" aria-invalid={Boolean(galat)}>
          <legend className="sr-only">{pertanyaan.teks}</legend>
          {opsi.map((o) => {
            const optId = `${inputId}-${o.nilai}`;
            const checked = nilai === o.nilai;
            return (
              <label
                key={o.nilai}
                htmlFor={optId}
                className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 min-h-[44px] text-sm cursor-pointer transition-colors"
                style={{
                  backgroundColor: checked ? "var(--window-bg)" : "transparent",
                  borderColor: checked ? "#0284c7" : "var(--surface-border)",
                  color: "var(--text-body)",
                }}
              >
                <input
                  id={optId}
                  type="radio"
                  name={inputId}
                  value={o.nilai}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onChange(pertanyaan.id, o.nilai)}
                  className="accent-sky-600 shrink-0"
                />
                <span>{formatLabelOpsi(o)}</span>
              </label>
            );
          })}
        </fieldset>
      )}

      {pertanyaan.tipe === "KC" && opsi && (
        <fieldset className="space-y-2" aria-invalid={Boolean(galat)}>
          <legend className="sr-only">{pertanyaan.teks}</legend>
          {opsi.map((o) => {
            const optId = `${inputId}-${o.nilai}`;
            const daftar = Array.isArray(nilai) ? nilai : [];
            const checked = daftar.includes(o.nilai);
            const toggle = () => {
              const baru = checked
                ? daftar.filter((x) => x !== o.nilai)
                : [...daftar, o.nilai];
              onChange(pertanyaan.id, baru);
            };
            return (
              <label
                key={o.nilai}
                htmlFor={optId}
                className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 min-h-[44px] text-sm cursor-pointer transition-colors"
                style={{
                  backgroundColor: checked ? "var(--window-bg)" : "transparent",
                  borderColor: checked ? "#0284c7" : "var(--surface-border)",
                  color: "var(--text-body)",
                }}
              >
                <input
                  id={optId}
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={toggle}
                  className="accent-sky-600 shrink-0"
                />
                <span>{formatLabelOpsi(o)}</span>
              </label>
            );
          })}
        </fieldset>
      )}

      {pertanyaan.subIsian?.map((sub) => {
        if (!terpilihDaftar.some((x) => sub.saat.includes(x))) return null;
        const kunciSub = `${pertanyaan.id}.${sub.kunci}`;
        const subId = `q-${kunciSub}`;
        const subVal = jawaban[kunciSub];
        const daftarSaran = sub.kunci === "domain" ? SARAN_DOMAIN : SARAN_LAINNYA;

        return (
          <div key={sub.kunci} className="pt-2 pl-3 border-l-2 border-sky-500 space-y-2 bg-sky-50/40 rounded-r-xl p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <label
                htmlFor={subId}
                className="block text-xs font-semibold text-neutral-800"
              >
                {sub.label}
              </label>
              <span className="text-[11px] text-neutral-500">
                Ketik sendiri atau pilih saran tim di bawah:
              </span>
            </div>

            <textarea
              id={subId}
              rows={2}
              value={typeof subVal === "string" ? subVal : ""}
              onChange={(e) => onChange(kunciSub, e.target.value)}
              disabled={disabled}
              placeholder="Tuliskan saran, ide, atau kebutuhan khusus Anda di sini..."
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
            />

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-medium text-neutral-500">Saran tim:</span>
              {daftarSaran.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const current = typeof subVal === "string" ? subVal.trim() : "";
                    if (!current) {
                      onChange(kunciSub, s.teks);
                    } else if (!current.includes(s.teks)) {
                      onChange(kunciSub, `${current}, ${s.teks}`);
                    }
                  }}
                  className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border border-sky-200 bg-white text-sky-800 hover:bg-sky-50 hover:border-sky-300 active:scale-95 transition-all text-left font-medium shadow-xs"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {galat && (
        <p id={errId} role="alert" className="text-xs text-red-500 font-medium">
          {galat}
        </p>
      )}
    </div>
  );
}
