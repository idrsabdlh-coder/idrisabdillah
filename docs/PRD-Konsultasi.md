# PRD: Modul Konsultasi Pembuatan Website

Versi 2.0 (revisi) · 16 November 2026 · Status: Draf untuk ditinjau

---

## 0. Ringkasan Perubahan

| # | Perubahan | Alasan |
|---|---|---|
| 1 | **Dasbor Konsultasi tersendiri**, terpisah dari dasbor utama, dengan sisi Klien dan sisi Tim (bagian 3). | Konsultasi punya alur, pengguna, dan status sendiri. Bila digabung, menu dan hak aksesnya bercampur. |
| 2 | Kuesioner dipangkas dari **120** menjadi **80** pertanyaan (bagian 5 dan 6). | Banyak pertanyaan sama yang muncul di beberapa bagian. |
| 3 | Aturan baru: **satu makna = satu ID pertanyaan**. Jawaban yang sudah ada tidak ditanyakan ulang (bagian 4). | Mencegah duplikat muncul lagi saat pertanyaan baru ditambahkan. |
| 4 | Kuesioner disimpan sebagai **data berversi**, bukan ditulis langsung di kode (bagian 7). | Teks dan opsi bisa diubah tanpa merusak jawaban lama. |

**Asumsi yang saya pakai** (ubah bila keliru):

1. File PRD.md lengkap tidak terlampir, hanya teks kuesioner konsultasi. Dokumen ini ditulis sebagai **pengganti utuh bagian Konsultasi**. Nomor bagian bisa disesuaikan saat digabung.
2. "Dashboard tersendiri seperti konsultasi pembuatan website" saya artikan sebagai area khusus tempat **klien mengisi konsultasi bertahap** (gaya wizard yang ramah) dan **tim memproses hasilnya**. Bila hanya salah satu sisi yang dibutuhkan, hapus bagian 3.2 atau 3.3 tanpa memengaruhi bagian lain.
3. Teknologi mengikuti PRD utama. Dokumen ini tidak mengikat framework.

---

## 1. Tujuan

- Klien non-teknis dapat menyampaikan kebutuhan website tanpa istilah teknis, cukup memilih jawaban.
- Tim mendapat brief yang rapi, lengkap, dan siap dijadikan penawaran, bukan chat WhatsApp yang berserakan.
- Klien yang belum tahu mau apa tetap terbantu lewat rekomendasi jenis website.

**Di luar cakupan:** chat real-time di dalam aplikasi (diganti WhatsApp), pembayaran, penandatanganan kontrak, pembuatan website itu sendiri.

---

## 2. Peran dan Hak Akses

| Peran | Siapa | Boleh |
|---|---|---|
| **Klien** | Calon pemesan ("Kakak") | Membuat dan mengisi konsultasinya sendiri, melihat status. Tidak melihat konsultasi orang lain dan tidak melihat catatan internal. |
| **Tim** | Konsultan dan desainer | Melihat semua konsultasi terkirim, mengubah status, menulis catatan internal, ekspor. |
| **Admin** | Pemilik atau pengelola | Semua hak Tim, ditambah mengelola akun Tim dan definisi pertanyaan. |

---

## 3. Dasbor Konsultasi

Area terpisah dengan rute dan menu sendiri (contoh `/konsultasi` untuk klien, `/konsultasi/tim` untuk Tim). Tidak berbagi navigasi dengan dasbor utama.

### 3.1 Alur Singkat

```
Klien: Mulai → isi Bagian 1 → (tautan pribadi dibuat) → wizard per bagian
       → Ringkasan → Setuju data → Kirim
Tim:   Kotak masuk → Detail brief → Hubungi via WhatsApp → Penawaran → Disetujui / Ditutup
```

### 3.2 Sisi Klien

| Halaman | Isi |
|---|---|
| **Beranda Konsultasi** | Daftar konsultasi milik klien, progres (misalnya "Bagian 3 dari 6"), tombol Lanjutkan, tombol Tambah konsultasi untuk jenis website lain. |
| **Wizard** | Satu bagian per layar, bar progres, tombol Kembali dan Lanjut, status "Tersimpan". Hanya menampilkan pertanyaan yang relevan. Mobile-first. |
| **Ringkasan** | Semua jawaban per bagian, tombol Ubah per bagian, rekomendasi bila memilih "Belum tahu", kotak persetujuan data, tombol Kirim. |
| **Status** | Status terkini, riwayat singkat, preferensi kontak yang tercatat, dan jadwal bila tim sudah menentukan. |

### 3.3 Sisi Tim

| Halaman | Isi |
|---|---|
| **Kotak masuk** | Daftar konsultasi terkirim. Cari nama atau nomor WhatsApp. Filter status, jenis, anggaran, batas waktu. Urut terbaru atau batas waktu terdekat. |
| **Detail brief** | Jawaban per bagian dengan teks pertanyaannya, rekomendasi sistem, penanda **"butuh bantuan"** pada jawaban seperti "Belum yakin", "Minta rekomendasi", "Butuh bantuan menyusun". Catatan internal. Tombol WhatsApp cepat. |
| **Pipeline** | Tampilan kolom per status. Pindah status dengan satu aksi. |
| **Statistik** | Konsultasi masuk per periode, per jenis, rasio Disetujui, rata-rata waktu respons pertama. |
| **Ekspor** | Brief ke PDF, daftar ke CSV. |

### 3.4 Status Konsultasi

| Status | Arti | Diubah oleh |
|---|---|---|
| Draf | Klien masih mengisi | Sistem |
| Terkirim | Klien menekan Kirim | Klien |
| Ditinjau | Tim sedang membaca brief | Tim |
| Dihubungi | Tim sudah menghubungi klien | Tim |
| Penawaran | Penawaran sudah dikirim | Tim |
| Disetujui | Klien setuju, siap dikerjakan | Tim |
| Ditutup | Batal atau tidak ada respons | Tim |

Transisi hanya maju satu langkah atau ke Ditutup. Pembukaan kembali Ditutup hanya oleh Admin. Setiap perubahan dicatat (siapa, kapan, dari-ke).

### 3.5 Kebutuhan Fungsional

Prioritas: **M** = Must, **S** = Should, **C** = Could (urutan pembangunan, bukan pemangkasan).

| ID | P | Kebutuhan |
|---|---|---|
| FR-KON-01 | M | Klien mulai dengan mengisi nama dan WhatsApp (1.1 dan 1.2). Sistem membuat konsultasi Draf dan **tautan pribadi** untuk kembali kapan saja tanpa kata sandi. |
| FR-KON-02 | M | Wizard bertahap: satu bagian per layar, bar progres, tombol Kembali dan Lanjut. |
| FR-KON-03 | M | Simpan otomatis setiap jawaban. Tutup tab lalu buka tautan pribadi, klien kembali ke bagian terakhir. Indikator "Tersimpan" terlihat. |
| FR-KON-04 | M | Percabangan: hanya pertanyaan relevan yang tampil (aturan di bagian 4 dan kolom "tampil jika" di bagian 5). |
| FR-KON-05 | M | Jalur "Belum tahu, bantu saya memilih" dengan rekomendasi jenis website (bagian 4.4). |
| FR-KON-06 | M | Halaman Ringkasan, validasi wajib (*), persetujuan data (8.3), lalu Kirim. Setelah Kirim, status menjadi Terkirim. |
| FR-KON-07 | M | Klien melihat status dan riwayat konsultasinya. |
| FR-KON-08 | M | Kotak masuk Tim dengan cari, filter, dan urutan. |
| FR-KON-09 | M | Detail brief dengan penanda "butuh bantuan" dan catatan internal (tidak terlihat klien). |
| FR-KON-10 | M | Ubah status dengan log perubahan. |
| FR-KON-11 | M | Tombol WhatsApp cepat (tautan `wa.me` dengan pesan pembuka yang sudah terisi nama klien). |
| FR-KON-12 | M | Definisi pertanyaan tersimpan sebagai data berversi. Konsultasi menyimpan versi yang dipakainya (bagian 7). |
| FR-KON-13 | S | Tambah konsultasi untuk jenis website lain (dari 8.1). Data Bagian 1 disalin, tidak ditanyakan lagi. |
| FR-KON-14 | S | Ekspor brief PDF dan daftar CSV. |
| FR-KON-15 | S | Statistik ringkas di dasbor Tim. |
| FR-KON-16 | S | Notifikasi ke Tim saat ada konsultasi Terkirim, dan pengingat bila belum direspons lebih dari batas waktu (bawaan 24 jam). |
| FR-KON-17 | S | Klien boleh mengubah jawaban setelah Terkirim sampai status Dihubungi. Tim melihat tanda "diubah setelah dikirim". |
| FR-KON-18 | C | Pengingat WhatsApp ke klien untuk Draf yang belum selesai setelah 24 jam. |
| FR-KON-19 | C | Antarmuka Admin untuk mengedit teks, opsi, dan urutan pertanyaan. |
| FR-KON-20 | C | Unggah gambar referensi pada 4.8 (selain tautan). |
| FR-KON-21 | C | Perkiraan kisaran biaya otomatis dari jawaban. |

---

## 4. Aturan Kuesioner

### 4.1 Satu Makna, Satu ID

Setiap pertanyaan punya ID unik (contoh `4.4`). Jawaban disimpan per ID. Bila dua jalur (misalnya undangan dan company profile) butuh informasi yang sama, keduanya memakai **ID yang sama** dan hanya ditanya sekali. Pertanyaan baru wajib dicek ke daftar ID yang ada sebelum ditambahkan.

### 4.2 Percabangan

- **Jenis website (2.1)** menentukan bagian 3A sampai 3F yang tampil. Satu konsultasi, satu jenis.
- **Undangan pernikahan** menyembunyikan 4.1, 4.2, 4.3, 4.6, 4.7, 5.4, dan 5.5. Opsi "Profesional dan korporat" (4.4) dan "Sesuai logo" (4.5) juga disembunyikan.
- Pertanyaan bertanda *tampil jika* hanya muncul bila syaratnya terpenuhi. Bila syarat tidak lagi terpenuhi, jawabannya disembunyikan tetapi tidak dihapus, supaya tidak hilang bila klien berubah pikiran.
- Opsi fitur yang sudah dipilih di daftar halaman (3B.3, 3C.3) disembunyikan dari 5.4.

### 4.3 Validasi

- Nomor WhatsApp: format Indonesia (`08…` atau `+62…`), dinormalisasi ke `62…`.
- Pertanyaan wajib (*) ditolak kosong dengan pesan yang jelas dan menunjuk letaknya.
- Tanggal acara dan batas waktu tidak boleh di masa lalu.
- Pilihan "Lainnya" membuka kolom isian teks.

### 4.4 Rekomendasi Jenis Website (jalur "Belum tahu")

Jalur ini menampilkan 3F.1, 3F.2, 4.1, 4.2, dan 5.5 lebih dulu. Sistem mengevaluasi aturan berikut **berurutan**, aturan pertama yang cocok menang:

| Urutan | Syarat | Rekomendasi |
|---|---|---|
| 1 | 4.2 memuat "Orang tua murid" | Website sekolah/lembaga |
| 2 | 4.1 memuat "Memberi informasi acara atau mengundang" dan 3F.2 = "Satu acara" | Undangan pernikahan digital, atau Landing page bila bukan pernikahan |
| 3 | 4.1 memuat "Menjual produk" | Katalog produk UMKM atau toko online |
| 4 | 3F.1 = "Ya, pembayaran atau pendaftaran" atau 4.1 memuat "Mengumpulkan pendaftar atau mengelola data" | Landing page, portofolio, atau sistem khusus |
| 5 | 4.2 memuat "Calon mitra bisnis" dan 4.1 memuat "Terlihat lebih profesional dan terpercaya" | Company profile |
| 6 | Selain itu | Landing page |

Klien selalu bisa menolak rekomendasi dan memilih sendiri. Setelah jenis ditetapkan, 4.1, 4.2, dan 5.5 **tidak ditanya lagi**.

---

## 5. Daftar Pertanyaan (Versi Ringkas)

Singkatan tipe: **JS** jawaban singkat · **PG** pilihan ganda · **KC** kotak centang · **PR** paragraf · **TG** tanggal. Tanda `*` = wajib.

### Bagian 1: Tentang Kakak

Halo Kak! 👋 Sebelum kami mulai merancang website, kami ingin tahu kebutuhan, konsep, dan fitur yang Kakak inginkan. Tidak perlu paham istilah teknis. Cukup pilih jawaban yang paling sesuai. Kalau belum yakin, pilih "Belum yakin" dan kami bantu rekomendasikan.

- **1.1** Nama lengkap Kakak * (JS)
- **1.2** Nomor WhatsApp aktif * (JS)
- **1.3** Kakak mewakili siapa? * (PG): Pribadi; Usaha/UMKM; Perusahaan; Sekolah/lembaga; Komunitas/organisasi
- **1.4** Cara dihubungi yang nyaman (KC): WhatsApp; Telepon; Email; Video call
- **1.5** Waktu terbaik untuk dihubungi (PG): Pagi; Siang; Sore; Malam; Bebas

### Bagian 2: Jenis Website

- **2.1** Website seperti apa yang Kakak butuhkan? * (PG, bercabang): Undangan pernikahan digital; Company profile; Website sekolah/lembaga; Katalog produk UMKM atau toko online; Landing page, portofolio, atau sistem khusus; Belum tahu, bantu saya memilih
- **2.2** Apakah Kakak sudah punya website sebelumnya? (PG): Belum pernah; Ada, ingin dibuat ulang; Ada, ingin ditambah fitur
- **2.3** Alamat website yang sudah ada (JS). *Tampil jika 2.2 bukan "Belum pernah".*

### Bagian 3A: Undangan Pernikahan Digital

Fitur standar yang **sudah termasuk** dan tidak perlu dipilih: halaman pembuka dengan tombol "Buka Undangan", foto dan nama kedua mempelai, informasi tanggal dan waktu, lokasi acara dengan tombol navigasi Google Maps.

- **3A.1** Nama lengkap calon mempelai pria * (JS)
- **3A.2** Nama lengkap calon mempelai wanita * (JS)
- **3A.3** Nama panggilan kedua mempelai (JS)
- **3A.4** Nama orang tua kedua mempelai (PR)
- **3A.5** Tanggal acara pernikahan * (TG). Isi tanggal acara utama.
- **3A.6** Daftar acara dan lokasinya (PR). Tulis tiap acara (akad, resepsi, dan lainnya): nama acara, tanggal, jam, nama tempat, alamat atau tautan Google Maps. Satu acara pun tidak apa-apa.
- **3A.7** Fitur tambahan yang diinginkan (KC): Hitung mundur; Cerita perjalanan pasangan; Galeri foto; Musik latar; Konfirmasi kehadiran (RSVP); Kolom ucapan dan doa; Tombol bagikan; Simpan ke kalender; Amplop digital (rekening/QRIS); Dress code; Siaran langsung; QR check-in tamu; Lainnya
- **3A.8** Soal musik latar (PG): Saya sudah punya lagu; Tolong bantu memilih. *Tampil jika 3A.7 memuat "Musik latar".*
- **3A.9** Isi cerita perjalanan (PG): Sudah lengkap; Baru sebagian; Belum ada dan butuh bantuan menyusun. *Tampil jika 3A.7 memuat "Cerita perjalanan pasangan".*
- **3A.10** Jumlah foto di galeri (PG): 3–5 foto; 6–10 foto; Lebih dari 10 foto; Belum ditentukan. *Tampil jika 3A.7 memuat "Galeri foto".*
- **3A.11** Cara tamu mengonfirmasi kehadiran (PG): Melalui Google Forms; Melalui WhatsApp; Langsung di website (data tersimpan rapi); Minta rekomendasi. *Tampil jika 3A.7 memuat "Konfirmasi kehadiran (RSVP)".*
- **3A.12** Bagaimana undangan akan dibagikan? (PG): Satu tautan untuk semua tamu; Tautan dengan nama tamu berbeda-beda; Belum yakin, butuh rekomendasi
- **3A.13** Perkiraan jumlah tamu (PG): Kurang dari 100; 100–300; Lebih dari 300

### Bagian 3B: Company Profile

- **3B.1** Nama perusahaan dan nama merek * (JS)
- **3B.2** Bidang usaha (PG): Jasa; Perdagangan; Konstruksi; Teknologi; Manufaktur; Pendidikan; Kesehatan; Lainnya
- **3B.3** Halaman yang dibutuhkan (KC): Beranda; Tentang kami; Visi dan misi; Layanan/produk; Portofolio/proyek; Klien dan mitra; Tim; Berita/blog; Karier; Sertifikat dan legalitas; Kontak
- **3B.4** Layanan atau produk utama. Tuliskan 3–10 butir (PR)
- **3B.5** Bahan yang sudah Kakak miliki (KC): Company profile cetak atau PDF; Daftar proyek atau studi kasus; Logo klien dan mitra yang boleh ditampilkan; Sertifikat dan legalitas; Foto tim
- **3B.6** Fitur khusus (KC): Formulir permintaan penawaran; Portal klien (login); Lainnya

### Bagian 3C: Website Sekolah / Lembaga

- **3C.1** Nama sekolah atau lembaga, dan NPSN jika ada * (JS)
- **3C.2** Jenjang (PG): PAUD/TK; SD/MI; SMP/MTs; SMA/MA; SMK; Pesantren; Kursus/lembaga
- **3C.3** Halaman yang dibutuhkan (KC): Profil; Visi dan misi; Sambutan kepala sekolah; Guru dan staf; Fasilitas; Ekstrakurikuler; Prestasi; Berita; Pengumuman; Galeri; Kalender akademik; Pendaftaran siswa baru (PPDB); Alumni; Unduhan; Kontak
- **3C.4** Bentuk pendaftaran siswa baru (PG): Ya, lengkap dengan unggah berkas; Ya, formulir sederhana; Belum yakin. *Tampil jika 3C.3 memuat "Pendaftaran siswa baru (PPDB)".*
- **3C.5** Tautan atau sistem lain yang perlu terhubung (KC): E-learning; Rapor/akademik; Media sosial sekolah; Kanal YouTube; Tidak ada
- **3C.6** Dokumen yang perlu diunduh (KC): Brosur; Formulir; Kurikulum; Tata tertib; Laporan; Lainnya. *Tampil jika 3C.3 memuat "Unduhan".*

### Bagian 3D: Katalog UMKM / Toko Online

- **3D.1** Nama usaha * (JS)
- **3D.2** Kategori usaha (PG): Kuliner; Fashion; Kerajinan; Pertanian; Jasa; Kecantikan; Elektronik; Lainnya
- **3D.3** Perkiraan jumlah produk (PG): Kurang dari 10; 10–50; 50–200; Lebih dari 200
- **3D.4** Apakah produk punya varian (ukuran, warna, rasa)? (PG): Ya; Tidak; Sebagian
- **3D.5** Apakah harga ditampilkan di website? (PG): Ya; Tidak, pelanggan hubungi dulu; Sebagian
- **3D.6** Bagaimana pelanggan memesan? (PG): Pesan lewat WhatsApp; Keranjang belanja dengan pembayaran online; Diarahkan ke marketplace; Kombinasi
- **3D.7** Metode pembayaran online (KC): Transfer bank; QRIS; E-wallet; Kartu; Bayar di tempat. *Tampil jika 3D.6 = "Keranjang belanja…" atau "Kombinasi".*
- **3D.8** Wilayah pengiriman (PG): Satu kota; Dalam provinsi; Seluruh Indonesia; Luar negeri. *Tampil jika 3D.6 bukan "Diarahkan ke marketplace".*
- **3D.9** Apakah ongkos kirim dihitung otomatis? (PG): Ya; Tidak; Belum yakin. *Tampil jika 3D.6 = "Keranjang belanja…" atau "Kombinasi".*
- **3D.10** Marketplace yang dipakai (KC): Shopee; Tokopedia; TikTok Shop; Lazada; Tidak ada. *Tampil jika 3D.6 = "Diarahkan ke marketplace" atau "Kombinasi".*
- **3D.11** Fitur tambahan toko (KC): Promo/voucher; Ulasan pelanggan; Stok tersedia/habis; Filter produk; Pre-order; Program reseller

### Bagian 3E: Landing Page, Portofolio, Sistem Khusus

- **3E.1** Jenis kebutuhan * (PG): Landing page promosi; Portofolio pribadi; Website komunitas atau event; Sistem informasi (misalnya manajemen kos atau inventaris); Dasbor data/IoT; Lainnya
- **3E.2** Satu aksi terpenting yang diharapkan dari pengunjung (JS). Contoh: daftar, beli, hubungi. *Tampil jika 3E.1 = Landing page, Portofolio, atau Website komunitas/event.*
- **3E.3** Siapa saja yang akan memakai sistem, dan bagaimana cara kerja saat ini? (PR). Contoh pengguna: admin, petugas, pelanggan. *Tampil jika 3E.1 = Sistem informasi, Dasbor data/IoT, atau Lainnya.*
- **3E.4** Data apa yang perlu disimpan? (PR). *Tampil jika sama dengan 3E.3.*
- **3E.5** Apakah pengguna perlu login? (PG): Ya; Tidak; Belum yakin. *Tampil jika sama dengan 3E.3.*
- **3E.6** Apakah perlu laporan atau ekspor data? (KC): PDF; Excel; Grafik; Tidak perlu. *Tampil jika sama dengan 3E.3.*
- **3E.7** Apakah perlu terhubung ke aplikasi atau perangkat lain? (PR). Contoh: WhatsApp, pembayaran, sensor. *Tampil jika sama dengan 3E.3.*
- **3E.8** Apakah ada sistem lama yang datanya perlu dipindahkan? (PG): Ya; Tidak. *Tampil jika sama dengan 3E.3.*
- **3E.9** Perkiraan jumlah pengguna (PG): Kurang dari 10; 10–100; 100–1000; Lebih dari 1000. *Tampil jika sama dengan 3E.3.*

### Bagian 3F: Bantu Saya Memilih

Bagian ini hanya menambah dua pertanyaan baru. Tujuan, calon pengunjung, dan frekuensi perubahan memakai 4.1, 4.2, dan 5.5 (lihat bagian 4.4).

- **3F.1** Apakah ada transaksi atau data yang harus diproses? (PG): Tidak; Pesan lewat WhatsApp saja; Ya, pembayaran atau pendaftaran
- **3F.2** Berapa lama website akan dipakai? (PG): Satu acara; Beberapa bulan; Jangka panjang

### Bagian 4: Tujuan dan Desain

Pertanyaan di bagian ini dipakai **semua jenis website**. Untuk undangan pernikahan hanya 4.4, 4.5, dan 4.8 yang tampil.

- **4.1** Tujuan utama website (KC): Memperkenalkan usaha atau lembaga; Menjual produk; Mengumpulkan pendaftar atau mengelola data; Memberi informasi acara atau mengundang; Terlihat lebih profesional dan terpercaya; Lainnya
- **4.2** Siapa yang paling sering membuka website? (KC): Pelanggan umum; Orang tua murid; Calon mitra bisnis; Pelamar kerja; Tamu atau keluarga; Pengguna internal; Umum
- **4.3** Bahasa website (PG): Indonesia; Inggris; Dua bahasa
- **4.4** Gaya desain (PG): Minimalis dan modern; Profesional dan korporat; Elegan (untuk undangan ditampilkan "Elegan dan romantis"); Mewah dan klasik; Natural dan sederhana; Ceria dan penuh warna; Tradisional atau bernuansa adat; Lainnya
- **4.5** Warna utama (KC): Putih/krem; Gold/emas; Hijau; Biru; Pink; Cokelat; Merah; Hitam; Pastel; Sesuai logo; Bebas, sesuaikan desain; Lainnya
- **4.6** Suasana yang ingin terasa (KC): Hangat; Tenang; Energik; Terpercaya; Modern; Kokoh; Inovatif; Ramah; Mewah; Futuristik
- **4.7** Logo dan identitas merek (PG): Sudah ada (logo, warna, huruf), siap pakai; Ada tapi perlu dirapikan; Belum ada, perlu dibuatkan
- **4.8** Contoh yang disukai dan hal yang TIDAK disukai (PR). Tulis tautan contoh website atau undangan, bagian yang disukai, dan hal yang tidak Kakak sukai.

### Bagian 5: Konten dan Fitur

- **5.1** Siapa yang menyiapkan teks dan informasi? * (PG): Saya sediakan semua; Saya beri data utama dan butuh bantuan menyusun; Butuh bantuan untuk sebagian besar
- **5.2** Kondisi foto dan video (PG): Sudah siap; Ada tapi belum dipilih; Belum ada, butuh foto stok; Perlu sesi foto
- **5.3** Kapan semua bahan bisa Kakak kirim? (TG)
- **5.4** Fitur umum yang diinginkan (KC): Tombol chat WhatsApp; Peta lokasi; Formulir kontak; Galeri foto; Berita atau artikel; Musik latar; Tombol bagikan; Mode gelap; Unduh dokumen PDF; Pencarian; Muncul di pencarian Google (SEO); Statistik pengunjung
- **5.5** Seberapa sering isi website akan berubah? (PG): Sekali jadi; Sesekali; Sering

### Bagian 6: Domain dan Publikasi

- **6.1** Alamat website (PG): Saya sudah punya domain (tulis namanya); Saya ingin dibuatkan alamat khusus, misalnya namaanda.com atau namaanda.id (tulis nama yang diinginkan); Tautan standar sudah cukup; Belum yakin
- **6.2** Kebutuhan tambahan (KC): Saya sudah punya hosting; Saya ingin email dengan nama domain sendiri, misalnya info@namaanda.com

### Bagian 7: Anggaran, Waktu, dan Perawatan

- **7.1** Perkiraan anggaran * (PG): Di bawah Rp500 ribu; Rp500 ribu–1,5 juta; Rp1,5–5 juta; Rp5–15 juta; Di atas Rp15 juta; Belum tahu, minta rekomendasi
- **7.2** Batas waktu website harus selesai (TG)
- **7.3** Seberapa fleksibel jadwalnya? (PG): Harus tepat waktu; Agak fleksibel; Sangat fleksibel
- **7.4** Setelah selesai, siapa yang mengubah isi dan merawat website? (PG): Saya kelola sendiri lewat halaman admin yang mudah; Kami yang merawat (berlangganan); Belum yakin
- **7.5** Berapa orang pengelola yang perlu akun? (PG): 1; 2–3; Lebih dari 3. *Tampil jika 7.4 = "Saya kelola sendiri…".*
- **7.6** Siapa yang menyetujui desain di pihak Kakak? (PG): Saya sendiri; Tim kecil; Melalui rapat atau komite. *Tampil jika 1.3 bukan "Pribadi".*
- **7.7** Hal terpenting bagi Kakak (KC): Tampilan indah; Mudah dipakai; Informasi lengkap; Mudah dibagikan; Cepat selesai; Harga terjangkau; Desain unik; Fitur lengkap

### Bagian 8: Penutup

- **8.1** Apakah Kakak butuh jenis website lain selain yang dipilih tadi? (KC): Undangan pernikahan; Company profile; Website sekolah; Katalog atau toko online; Landing page atau sistem khusus; Tidak ada. *Tiap jenis yang dipilih membuat konsultasi Draf baru (FR-KON-13).*
- **8.2** Fitur, ide tambahan, atau hal lain yang perlu kami ketahui sebelum proses desain dan pengembangan dimulai (PR)
- **8.3** Persetujuan data * (KC): Saya setuju data pada formulir ini digunakan untuk keperluan konsultasi dan pembuatan website.

---

## 6. Peta Penggabungan (Lama → Baru)

Untuk menelusuri ke mana pertanyaan lama pergi. Bila ada yang dibuang padahal masih dibutuhkan, cari di sini.

| Pertanyaan lama | Keputusan | Sekarang |
|---|---|---|
| Kota atau domisili (1) | Dibuang | Tidak memengaruhi cakupan. Lokasi acara dan toko ada di pertanyaan lain. |
| Undangan: Gaya desain, Warna utama, Contoh undangan | Digabung dengan Bagian 4 | 4.4, 4.5, 4.8 |
| Undangan: Siapa menyiapkan teks | Digabung dengan Bagian 5 | 5.1 |
| Undangan: Apakah lebih dari satu kegiatan; Jika beberapa acara; Lokasi acara; Tautan Google Maps; Lokasi akad dan resepsi berbeda | Digabung jadi satu | 3A.6 |
| Undangan: Fitur "Foto dan nama mempelai", "Informasi tanggal dan waktu", "Lokasi acara", "Navigasi Google Maps", "Halaman pembuka" | Jadi fitur standar | Catatan di 3A |
| Undangan: Apakah perlu musik latar | Digabung dengan opsi kotak centang | 3A.7 dan 3A.8 |
| Undangan: Apakah ingin cerita perjalanan | Dibuang (sudah ada di kotak centang) | 3A.7 dan 3A.9 |
| Undangan: Sudah punya foto prewedding | Digabung dengan Bagian 5 | 5.2 |
| Undangan: Berapa foto di galeri | Dipertahankan bersyarat | 3A.10 |
| Undangan: Apakah ingin RSVP; Jika ya, bagaimana | Digabung | 3A.7 dan 3A.11 |
| Undangan: Apakah ingin kolom ucapan dan doa | Dibuang (sudah ada di kotak centang) | 3A.7 |
| Undangan: Media pembagian undangan | Dibuang | Tombol bagikan sudah ada di 3A.7. Media tidak memengaruhi pembuatan. |
| Undangan: Fitur atau ide tambahan | Digabung | 8.2 |
| Company profile: Tahun berdiri dan jumlah karyawan; Jumlah kantor atau cabang | Dibuang | Dikumpulkan saat pengumpulan bahan, bukan konsultasi. |
| Company profile: Company profile cetak/PDF; Proyek atau studi kasus; Logo klien | Digabung | 3B.5 |
| Company profile: Fitur "Unduh PDF", "Peta cabang", "Chat WhatsApp" | Digabung dengan fitur umum | 5.4 |
| Company profile: Fitur "Dua bahasa" | Digabung | 4.3 |
| Company profile: Fitur "Lowongan kerja", "Blog dengan kategori" | Dibuang (sudah ada sebagai halaman) | 3B.3 (Karier, Berita/blog) |
| Company profile: Kesan yang ingin muncul | Digabung | 4.6 |
| Company profile: Pedoman merek; Bagian 4: Apakah punya logo | Digabung | 4.7 |
| Company profile: Siapa pengambil keputusan; Sekolah: Siapa yang menyetujui desain | Digabung | 7.6 |
| Sekolah: Status dan akreditasi | Dibuang | Dikumpulkan saat pengumpulan bahan. |
| Sekolah: Apakah butuh PPDB online | Digabung dengan halaman PPDB | 3C.3 dan 3C.4 |
| Sekolah: Siapa yang mengelola isi; Katalog: Siapa yang memperbarui produk; Bagian 5: Ingin mengubah isi sendiri; Bagian 7: Siapa yang merawat | Digabung jadi satu | 7.4 |
| Sekolah: Berapa orang pengelola | Dipertahankan bersyarat | 7.5 |
| Sekolah: Seberapa sering berita diperbarui; Bantu memilih: Seberapa sering isi berubah | Digabung | 5.5 |
| Sekolah: Data guru dan staf | Dibuang | Tercakup di 5.1 dan 5.2. |
| Sekolah: Dokumen yang perlu diunduh | Dipertahankan bersyarat | 3C.6 |
| Katalog: Nama usaha dan jenis produk; Kategori usaha | Digabung | 3D.1 dan 3D.2 |
| Katalog: Kondisi foto produk | Digabung | 5.2 |
| Katalog: Apakah punya toko fisik | Digabung dengan fitur umum | 5.4 (Peta lokasi) |
| Katalog: Fitur "Katalog PDF" | Digabung | 5.4 (Unduh dokumen PDF) |
| Bantu memilih: Apa yang ingin dicapai | Digabung | 4.1 |
| Bantu memilih: Siapa yang ingin dijangkau | Digabung | 4.2 |
| Bagian 4: Pengunjung dari HP atau komputer | Dibuang | Semua halaman otomatis mobile-first dan responsif. |
| Bagian 4: Contoh yang disukai; Hal yang TIDAK disukai | Digabung | 4.8 |
| Bagian 4: Suasana yang ingin terasa | Dipertahankan | 4.6 |
| Bagian 5: Perkiraan jumlah halaman | Dibuang | Diturunkan dari daftar halaman (3B.3, 3C.3). |
| Bagian 5: Fitur (musik, mode gelap, dan lainnya); Apakah ingin muncul di Google; Ingin melihat jumlah pengunjung | Digabung | 5.4 |
| Bagian 6: Alamat khusus; Nama alamat; Sudah punya domain atau hosting | Digabung | 6.1 dan 6.2 |
| Bagian 6: Email domain sendiri | Dipertahankan sebagai opsi | 6.2 |
| Bagian 7: Batas waktu; Seberapa fleksibel | Dipertahankan | 7.2 dan 7.3 |

---

## 7. Model Data (Ringkas)

| Tabel | Kolom utama | Catatan |
|---|---|---|
| `konsultasi` | `id`, `kode`, `nama`, `wa`, `jenis`, `status`, `versi_form`, `token_hash`, `induk_id`, `dibuat_pada`, `dikirim_pada`, `diperbarui_pada` | `induk_id` menghubungkan konsultasi turunan dari 8.1. Token hanya disimpan sebagai hash. |
| `jawaban` | `konsultasi_id`, `pertanyaan_id`, `nilai` (JSON), `diperbarui_pada` | **UNIQUE** (`konsultasi_id`, `pertanyaan_id`): satu ID, satu jawaban. |
| `form_versi` | `versi`, `definisi` (JSON), `aktif`, `dibuat_pada` | Definisi tiap pertanyaan: `id`, `tipe`, `wajib`, `opsi`, `tampil_jika`. |
| `status_log` | `konsultasi_id`, `dari`, `ke`, `oleh`, `waktu` | Hanya tambah, tidak diubah. |
| `catatan` | `konsultasi_id`, `penulis_id`, `isi`, `waktu` | Internal, tidak pernah dikirim ke sisi klien. |
| `pengguna_tim` | `id`, `nama`, `email`, `peran` | Peran: Tim atau Admin. |

Jawaban tersimpan **sebagai ID dan nilai**, bukan teks pertanyaan, sehingga mengubah redaksi pertanyaan tidak merusak data lama. Tim melihat teks sesuai `versi_form` yang dipakai konsultasi itu.

---

## 8. Kebutuhan Non-Fungsional

- **Mobile-first.** Klien umumnya membuka dari HP. Seluruh wizard harus nyaman dipakai di layar sempit.
- **Keamanan akses.** Token tautan pribadi acak dan panjang, disimpan sebagai hash, dibatasi lajunya. Mengubah satu karakter token menghasilkan 404, bukan data orang lain. Seluruh lalu lintas lewat HTTPS.
- **Privasi.** Nama dan nomor WhatsApp adalah data pribadi. Persetujuan eksplisit di 8.3 wajib sebelum Kirim. Klien dapat meminta data dihapus. Draf yang tidak dikirim dihapus otomatis setelah masa simpan (bawaan 30 hari, lihat K-2).
- **Anti-spam.** Pembatasan jumlah konsultasi baru per alamat IP per jam dan lapisan anti-bot ringan pada langkah Mulai.
- **Bahasa dan nada.** Bahasa Indonesia, menyapa "Kakak", tanpa istilah teknis. Setiap opsi yang ragu ("Belum yakin", "Minta rekomendasi") selalu tersedia.
- **Aksesibilitas.** Setiap isian punya label terlihat, kontras cukup, dan bisa dioperasikan lewat keyboard.
- **Ketahanan.** Bila simpan otomatis gagal, tampilkan peringatan jelas dan simpan di sisi perangkat sampai koneksi pulih. Klien tidak boleh kehilangan jawaban tanpa tahu.

---

## 9. Kriteria Penerimaan

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| KP-01 | Klien memilih "Undangan pernikahan digital" | 4.1, 4.2, 4.3, 4.6, 4.7, 5.4, dan 5.5 tidak tampil. 4.4, 4.5, 4.8, 5.1 sampai 5.3 tampil. |
| KP-02 | Klien menyelesaikan satu jalur penuh | Tidak ada dua pertanyaan bermakna sama dalam satu alur (diperiksa terhadap bagian 6). |
| KP-03 | Klien menutup tab di tengah wizard lalu membuka tautan pribadi | Kembali ke bagian terakhir dengan semua jawaban utuh. |
| KP-04 | Klien memilih "Belum tahu" dan menjawab 3F.1, 3F.2, 4.1, 4.2, 5.5 | Rekomendasi muncul sesuai tabel 4.4. Setelah jenis dipilih, 4.1, 4.2, dan 5.5 tidak ditanya lagi. |
| KP-05 | Klien menekan Kirim tanpa mencentang 8.3 atau dengan pertanyaan wajib kosong | Ditolak, pesan menunjuk pertanyaan yang kurang. |
| KP-06 | Nomor WhatsApp "12345" diisi di 1.2 | Ditolak dengan pesan format. "0812…" dan "+62812…" diterima dan disimpan sebagai `62812…`. |
| KP-07 | Klien memilih 3D.6 "Pesan lewat WhatsApp" | 3D.7, 3D.9, dan 3D.10 tidak tampil. |
| KP-08 | Klien mengganti jawaban 3A.7 sehingga "RSVP" tidak lagi dicentang, lalu mencentangnya lagi | 3A.11 kembali dengan jawaban sebelumnya. |
| KP-09 | Klien memilih 8.1 "Company profile" | Terbentuk konsultasi Draf baru dengan Bagian 1 sudah terisi. |
| KP-10 | Tim memfilter status "Terkirim" dan jenis "Company profile", lalu memindahkan satu konsultasi ke "Ditinjau" | Daftar terfilter benar. `status_log` mencatat dari, ke, oleh, waktu. |
| KP-11 | Tim membuka detail brief | Jawaban "Belum yakin" dan "Minta rekomendasi" diberi penanda "butuh bantuan". |
| KP-12 | Klien membuka sisi klien | Catatan internal tidak pernah tampil, baik di halaman maupun di respons API. |
| KP-13 | Token tautan diubah satu karakter | Respons 404. |
| KP-14 | Admin mengubah redaksi satu pertanyaan (versi form baru) | Konsultasi lama tetap menampilkan redaksi lamanya. Konsultasi baru memakai redaksi baru. |

---

## 10. Keputusan Terbuka

Pakai nilai bawaan sampai diputuskan, dan catat di log.

| ID | Pertanyaan | Bawaan |
|---|---|---|
| K-1 | Cara klien kembali ke konsultasinya | Tautan pribadi (tanpa kata sandi). Alternatif: akun dengan OTP WhatsApp atau email. |
| K-2 | Masa simpan Draf yang tidak dikirim | 30 hari, lalu dihapus. |
| K-3 | Klien mengubah jawaban setelah Terkirim | Boleh sampai status Dihubungi (FR-KON-17). |
| K-4 | Fitur standar undangan (3A) | Empat fitur dasar ikut paket dan tidak ditanyakan. |
| K-5 | Kanal notifikasi ke Tim | Email. WhatsApp otomatis ditunda karena butuh layanan berbayar. |
| K-6 | Batas waktu pengingat respons Tim | 24 jam. |
| K-7 | Pembatasan konsultasi baru per IP | 5 per jam. |
