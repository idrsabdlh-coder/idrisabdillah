-- Skema Modul Konsultasi untuk MySQL 8+ / MariaDB (Rujukan: docs/PRD-Konsultasi.md bagian 7, TODO 6.5 & 7.1)
-- Jalankan pada instance dev dan production yang terpisah.

CREATE TABLE IF NOT EXISTS form_versi (
  versi INT PRIMARY KEY,
  definisi JSON NOT NULL,
  aktif BOOLEAN NOT NULL DEFAULT FALSE,
  dibuat_pada DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS konsultasi (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(32) NOT NULL UNIQUE,
  nama VARCHAR(255) NOT NULL,
  wa VARCHAR(32) NOT NULL,
  jenis VARCHAR(32) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Draf',
  versi_form INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  induk_id BIGINT NULL,
  diubah_setelah_dikirim BOOLEAN NOT NULL DEFAULT FALSE,
  dibuat_pada DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  dikirim_pada DATETIME(3) NULL,
  diperbarui_pada DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_konsultasi_status (status),
  INDEX idx_konsultasi_dibuat_pada (dibuat_pada),
  CONSTRAINT fk_konsultasi_versi FOREIGN KEY (versi_form) REFERENCES form_versi(versi),
  CONSTRAINT fk_konsultasi_induk FOREIGN KEY (induk_id) REFERENCES konsultasi(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jawaban (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  konsultasi_id BIGINT NOT NULL,
  pertanyaan_id VARCHAR(32) NOT NULL,
  nilai JSON NOT NULL,
  diperbarui_pada DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_jawaban_konsultasi_pertanyaan (konsultasi_id, pertanyaan_id),
  CONSTRAINT fk_jawaban_konsultasi FOREIGN KEY (konsultasi_id) REFERENCES konsultasi(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS status_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  konsultasi_id BIGINT NOT NULL,
  dari VARCHAR(32) NOT NULL,
  ke VARCHAR(32) NOT NULL,
  oleh VARCHAR(120) NOT NULL,
  waktu DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_status_log_konsultasi (konsultasi_id, waktu),
  CONSTRAINT fk_status_log_konsultasi FOREIGN KEY (konsultasi_id) REFERENCES konsultasi(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pengguna_tim (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  peran ENUM('Tim', 'Admin') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catatan (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  konsultasi_id BIGINT NOT NULL,
  penulis_id BIGINT NULL,
  isi TEXT NOT NULL,
  waktu DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_catatan_konsultasi (konsultasi_id, waktu),
  CONSTRAINT fk_catatan_konsultasi FOREIGN KEY (konsultasi_id) REFERENCES konsultasi(id) ON DELETE CASCADE,
  CONSTRAINT fk_catatan_penulis FOREIGN KEY (penulis_id) REFERENCES pengguna_tim(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Penghitung pembatasan laju bersama (lintas instance serverless, rujukan TODO 7.1 & 9.1)
CREATE TABLE IF NOT EXISTS rate_limit (
  kunci VARCHAR(128) PRIMARY KEY,
  hitungan INT NOT NULL,
  reset_pada DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
