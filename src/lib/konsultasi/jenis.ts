export type ModulId = "company" | "wedding" | "school" | "umkm" | "custom";

export type JenisWebsite = {
  key: string;
  label: string;
  desc: string;
  modul: ModulId;
};

export const JENIS_WEBSITE: JenisWebsite[] = [
  { key: "company", label: "Company Profile", desc: "Perkenalan usaha atau perusahaan yang tampil profesional.", modul: "company" },
  { key: "undangan", label: "Undangan Pernikahan", desc: "Undangan digital yang mudah dibagikan lewat WhatsApp.", modul: "wedding" },
  { key: "sekolah", label: "Website Sekolah", desc: "Profil, berita, galeri, dan pendaftaran siswa baru.", modul: "school" },
  { key: "katalog", label: "Katalog UMKM", desc: "Etalase produk dengan tombol pesan lewat WhatsApp.", modul: "umkm" },
  { key: "toko", label: "Toko Online", desc: "Keranjang belanja dan pembayaran online.", modul: "umkm" },
  { key: "landing", label: "Landing Page", desc: "Satu halaman untuk promosi atau acara.", modul: "custom" },
  { key: "sistem", label: "Sistem / Aplikasi Khusus", desc: "Sistem yang disesuaikan dengan alur kerja Kakak.", modul: "custom" },
];