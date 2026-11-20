import type { JawabanNilai } from "./types";

export interface ItemRiwayatLokal {
  token: string;
  kode: string;
  nama: string;
  dibuatPada: string;
}

const KEY_DAFTAR = "konsultasi-daftar-v1";
const PREFIX_CADANGAN = "konsultasi-cadangan-v1:";
const PREFIX_BAGIAN = "konsultasi-bagian-v1:";

export function ambilDaftarLokal(): ItemRiwayatLokal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_DAFTAR);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ItemRiwayatLokal[]) : [];
  } catch {
    return [];
  }
}

export function simpanItemLokal(item: ItemRiwayatLokal): void {
  if (typeof window === "undefined") return;
  try {
    const daftar = ambilDaftarLokal().filter((x) => x.token !== item.token);
    daftar.unshift(item);
    localStorage.setItem(KEY_DAFTAR, JSON.stringify(daftar.slice(0, 20)));
  } catch {
    // Abaikan jika storage penuh / mode privat
  }
}

export function ambilCadanganJawaban(token: string): Record<string, JawabanNilai> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PREFIX_CADANGAN + token);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, JawabanNilai>;
  } catch {
    return {};
  }
}

export function simpanCadanganJawaban(
  token: string,
  kunci: string,
  nilai: JawabanNilai,
): void {
  if (typeof window === "undefined") return;
  try {
    const ada = ambilCadanganJawaban(token);
    ada[kunci] = nilai;
    localStorage.setItem(PREFIX_CADANGAN + token, JSON.stringify(ada));
  } catch {
    // Abaikan
  }
}

export function hapusCadanganJawaban(token: string, kunci?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!kunci) {
      localStorage.removeItem(PREFIX_CADANGAN + token);
      return;
    }
    const ada = ambilCadanganJawaban(token);
    delete ada[kunci];
    if (Object.keys(ada).length === 0) {
      localStorage.removeItem(PREFIX_CADANGAN + token);
    } else {
      localStorage.setItem(PREFIX_CADANGAN + token, JSON.stringify(ada));
    }
  } catch {
    // Abaikan
  }
}

export function ambilBagianTerakhir(token: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PREFIX_BAGIAN + token);
  } catch {
    return null;
  }
}

export function simpanBagianTerakhir(token: string, bagianId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX_BAGIAN + token, bagianId);
  } catch {
    // Abaikan
  }
}
