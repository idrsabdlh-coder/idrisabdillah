export type Project = {
  title: string;
  category: string;
  client: string;
  desc: string;
  icon: string;
  iconImg: string;
  visit: string;
  visitLabel: string;
  hero: string;
  challenges: { text: string; images: string[] };
  finalThoughts: { text: string; images: string[] };
};

export const PROJECTS: Record<string, Project> = {
  tenong: {
    title: "Tenong App",
    category: "UMKM / Retail Titip Jual (F&B)",
    client: "Fajar Snack",
    desc: "Sistem manajemen transaksi harian untuk kemitraan titip jual UMKM yang membantu proses pencatatan transaksi, rekonsiliasi penjualan, pengelolaan piutang, serta analisis performa produk.",
    icon: "invoice",
    iconImg: "/images/projects/tenong/icon.jpeg",
    visit: "https://github.com/idrsabdlh-coder/tenong-app",
    visitLabel: "GitHub",
    hero: "/images/projects/tenong/hero.jpeg",
    challenges: {
      text: "Tantangan utama adalah menjaga konsistensi data antara jumlah titipan, barang terjual, dan sisa barang pada banyak produk sekaligus. Selain itu, diperlukan mekanisme pencatatan piutang yang bersifat permanen agar setiap perubahan transaksi tetap dapat ditelusuri.",
      images: ["/images/projects/tenong/challenge-1.jpeg", "/images/projects/tenong/challenge-2.jpeg"],
    },
    finalThoughts: {
      text: "Tenong.id berhasil mengubah proses pencatatan transaksi menjadi sistem digital yang lebih terstruktur dengan fitur rekonsiliasi otomatis, pengelolaan piutang, analitik produk, dan reporting.",
      images: [
        "/images/projects/tenong/final1.jpeg",
        "/images/projects/tenong/final2.jpeg",
        "/images/projects/tenong/final4.jpeg",
      ],
    },
  },
  kostinaja: {
    title: "KostinAja",
    category: "Proptech / Pencarian Hunian",
    client: "Personal Project",
    desc: "Platform pencarian kos berbasis PHP Native dan MySQL yang membantu pengguna menemukan kos berdasarkan kebutuhan serta menyediakan sistem administrasi untuk pengelolaan data kos.",
    icon: "building",
    iconImg: "/images/projects/kostinaja/icon.jpeg",
    visit: "https://github.com/idrsabdlh-coder/kostinaja",
    visitLabel: "GitHub",
    hero: "/images/projects/kostinaja/hero.jpeg",
    challenges: {
      text: "Karena dikembangkan tanpa framework, tantangan utama adalah mengatur autentikasi, session, dan role user/admin secara manual.",
      images: ["/images/projects/kostinaja/challenge-1.jpeg", "/images/projects/kostinaja/challenge-2.jpeg"],
    },
    finalThoughts: {
      text: "KostinAja menjadi pengalaman dalam membangun aplikasi web secara full-cycle tanpa framework, dari autentikasi hingga panel admin CRUD.",
      images: [
        "/images/projects/kostinaja/final1.jpeg",
        "/images/projects/kostinaja/final2.jpeg",
        "/images/projects/kostinaja/final3.jpeg",
      ],
    },
  },
  smartwater: {
    title: "Smart Water Tank",
    category: "Technology / Internet of Things",
    client: "Studio Prism",
    desc: "Sistem pengelolaan air berbasis Internet of Things (IoT) untuk memantau ketinggian dan kejernihan air secara real-time serta mengotomatisasi proses pengisian tangki.",
    icon: "droplet",
    iconImg: "/images/projects/smartwater/icon.jpeg",
    visit: "https://wokwi.com/projects/469139987388021761",
    visitLabel: "Wokwi",
    hero: "/images/projects/smartwater/hero.jpeg",
    challenges: {
      text: "Tantangan utama terletak pada sinkronisasi pembacaan sensor dengan logika kontrol pompa.",
      images: ["/images/projects/smartwater/challenge-1.jpeg", "/images/projects/smartwater/challenge-2.jpeg"],
    },
    finalThoughts: {
      text: "Smart Water Tank berhasil mengintegrasikan hardware, sensor, sistem otomasi, dan IoT Cloud menjadi sebuah sistem monitoring air real-time.",
      images: [
        "/images/projects/smartwater/final-1.jpeg",
        "/images/projects/smartwater/final-2.jpeg",
        "/images/projects/smartwater/final-3.jpeg",
      ],
    },
  },
  webdev: {
    title: "Website Sekolah",
    category: "Education / School Management",
    client: "Company Profile Berbasis Laravel",
    desc: "Website company profile sekolah berbasis Laravel yang menyediakan informasi sekolah sekaligus sistem pengelolaan konten dan PPDB online melalui panel administrasi.",
    icon: "code",
    iconImg: "/images/projects/webses/icon.jpeg",
    visit: "https://github.com/idrsabdlh-coder/website-sekolah",
    visitLabel: "GitHub",
    hero: "/images/projects/webses/hero.jpeg",
    challenges: {
      text: "Tantangan pengembangan meliputi perancangan struktur database yang fleksibel dan konfigurasi storage agar gambar dapat ditampilkan dengan baik.",
      images: ["/images/projects/webses/challenge-1.jpeg", "/images/projects/webses/challenge-2.jpeg"],
    },
    finalThoughts: {
      text: "Website sekolah berhasil mengintegrasikan company profile, content management, dan PPDB online dalam satu platform.",
      images: [
        "/images/projects/webses/final-1.jpeg",
        "/images/projects/webses/final-2.jpeg",
        "/images/projects/webses/final-3.jpeg",
      ],
    },
  },
  khasya: {
    title: "Khasya Home",
    category: "Fashion / Tailoring Shop",
    client: "Khasya Home",
    desc: "Website company profile dan katalog produk untuk Khasya Home yang memperkenalkan brand dan produk fashion serta memudahkan pelanggan menghubungi toko.",
    icon: "building",
    iconImg: "/images/projects/khasya/icon.jpeg",
    visit: "https://khasya-home.vercel.app/",
    visitLabel: "vercel",
    hero: "/images/projects/khasya/hero.jpeg",
    challenges: {
      text: "Tantangan utama adalah menyusun berbagai jenis produk ke dalam tampilan katalog yang rapi, konsisten, dan mudah dinavigasi.",
      images: ["/images/projects/khasya/challenge-1.jpeg", "/images/projects/khasya/challenge-2.jpeg"],
    },
    finalThoughts: {
      text: "Khasya Home menghasilkan website company profile dan katalog digital yang menggabungkan brand, produk, kategori, lokasi, dan kontak dalam satu platform.",
      images: ["/images/projects/khasya/final1.jpeg", "/images/projects/khasya/final2.jpeg"],
    },
  },
  belajarweb: {
    title: "Pembelajaran Berbasis Website",
    category: "Education / E-Learning",
    client: "Personal / Academic Project",
    desc: "Website pembelajaran HTML & CSS untuk membantu pengguna memahami dasar-dasar pengembangan website melalui materi terstruktur, contoh kode, dan latihan.",
    icon: "code",
    iconImg: "/images/projects/belajarweb/icon.jpeg",
    visit: "https://belajarweb.vercel.app/",
    visitLabel: "vercel",
    hero: "/images/projects/belajarweb/hero.jpeg",
    challenges: {
      text: "Tantangan utama adalah menyajikan materi HTML dan CSS yang teknis menjadi lebih sederhana dan mudah dipahami pemula.",
      images: ["/images/projects/belajarweb/challenge-1.jpeg", "/images/projects/belajarweb/challenge-2.jpeg"],
    },
    finalThoughts: {
      text: "Proyek ini menghasilkan website pembelajaran digital yang menyajikan materi dasar HTML dan CSS secara terstruktur.",
      images: [
        "/images/projects/belajarweb/final-1.jpeg",
        "/images/projects/belajarweb/final-2.jpeg",
        "/images/projects/belajarweb/final-3.jpeg",
      ],
    },
  },
};

export const SONGS = [
  { title: "Cincin", artist: "Hindia", src: "/music/Hindia - Cincin.mp3" },
  { title: "Everything U Are", artist: "Hindia", src: "/music/Hindia - everything u are.mp3" },
  { title: ".Feast", artist: "Tarot", src: "/music/Tarot - .Feast.mp3" },
];