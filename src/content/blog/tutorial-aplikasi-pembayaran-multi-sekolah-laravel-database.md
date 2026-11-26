---
title: "Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Analisis Kebutuhan dan Perancangan Basis Data MySQL (Bagian 1)"
description: "Panduan praktisi rekayasa sistem mengenai analisis arsitektur multi-tenant, pemodelan proses bisnis keuangan yayasan, dan perancangan skema basis data MySQL relasional untuk sistem pembayaran multi-sekolah."
pubDate: 2026-11-23
updatedDate: 2026-11-23
category: "Rekayasa Sistem"
tags:
  - Laravel
  - MySQL
  - Multi-Tenancy
  - Database Design
  - Sistem Informasi
  - Tutorial Berseri
featured: true
draft: false
cover: "/images/articles/aplikasi-pembayaran-multi-sekolah-laravel.svg"
coverAlt: "Arsitektur multi-tenant basis data relasional MySQL untuk aplikasi pembayaran multi-sekolah satu yayasan menggunakan Laravel"
seoTitle: "Aplikasi Pembayaran Multi-Sekolah Laravel: Desain Database MySQL (Bagian 1) — MAS-AGUS"
seoDescription: "Tutorial berseri rekayasa sistem Laravel: analisis proses bisnis SPP yayasan, arsitektur multi-tenant, dan perancangan DDL basis data MySQL relasional."
focusKeyword: "Aplikasi Pembayaran Multi-Sekolah Laravel"
lang: "id"
translationSlug: "multi-school-payment-system-laravel-database-architecture-part-1"
---

> **Dokumentasi Rekayasa Perangkat Lunak & Tutorial Berseri (Model 1)**  
> **Penulis:** Agus Sifaunajah (MAS-AGUS)  
> **Topik Bahasan:** Analisis Kebutuhan Sistem Kasir Yayasan, Pola Multi-Tenancy Single-Database, Desain Skema MySQL Relasional, dan Integritas Finansial.

---

## 1. Pendahuluan: Kompleksitas Keuangan pada Yayasan Pendidikan Terpadu

Dalam ekosistem pendidikan swasta di Indonesia—khususnya lembaga yayasan yang menaungi berbagai tingkatan satuan pendidikan mulai dari Kelompok Bermain (KB/TK), Madrasah Ibtidaiyah/SD, MTs/SMP, hingga MA/SMA/SMK—pengelolaan kas dan penagihan biaya pendidikan kerap menjadi salah satu titik friksi operasional yang paling rentan.

Selama pengalaman saya mendampingi digitalisasi tata kelola sistem informasi pada berbagai yayasan pendidikan dan institusi daerah, saya sering menemukan pola tata kelola keuangan yang terfragmentasi:
1. **Pemisahan Sistem yang Berujung Kerapuhan (*Siloed Systems*)**: Setiap unit sekolah mengoperasikan pembukuan kasir secara terpisah. Ada unit yang masih mencatat iuran SPP menggunakan buku kas manual, ada yang mengandalkan lembar sebar (*spreadsheet*) yang rentan terhapus, dan ada pula yang membeli aplikasi lepasan (*stand-alone*) tanpa interkoneksi.
2. **Ketiadaan Rekapitulasi Likuiditas Real-Time**: Ketika pengurus atau bendahara umum yayasan membutuhkan laporan arus kas terkonsolidasi untuk mengambil keputusan strategis (misalnya alokasi subsidi silang atau rencana pembangunan gedung bersama), petugas administrasi harus menghabiskan waktu berhari-hari untuk merekonsiliasi data dari masing-masing unit sekolah secara manual.
3. **Ketidaksamaan Pos Tarif dan Kebijakan Keringanan**: Setiap jenjang pendidikan memiliki pos biaya yang berbeda secara fundamental. Unit TK memiliki pos uang makan dan kegiatan kreatif; unit SMP memiliki pos laboratorium dan ekstrakurikuler; sementara unit SMK memiliki pos uji kompetensi kejuruan. Di sisi lain, sebuah yayasan sering kali memberlakukan kebijakan keringanan terpusat (seperti potongan SPP bagi siswa bersaudara kandung atau beasiswa yatim piatu).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             STRUKTUR KONSOLIDASI KEUANGAN YAYASAN TERPADU                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                          PENGURUS / YAYASAN PUSAT                           │
│              (Monitoring Kas Global & Kebijakan Tarif Terpadu)              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  UNIT KB / TK    │          │  UNIT SD / MI    │          │ UNIT SMP & SMA   │
│ • SPP Bulanan    │          │ • SPP & Tabungan │          │ • SPP & Praktikum│
│ • Kasir Mandiri  │          │ • Kasir Mandiri  │          │ • Kasir Mandiri  │
│ • Rekening Kas A │          │ • Rekening Kas B │          │ • Rekening Kas C │
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

Untuk menyelesaikan problematika struktural tersebut, pendekatan paling rasional adalah membangun **Aplikasi Pembayaran Multi-Sekolah Terpusat (*Multi-Tenant School Payment System*)**. 

Melalui seri tutorial komprehensif ini, saya akan memandu Anda langkah demi langkah—mulai dari nol (*scratch*) hingga tahap produksi—membangun aplikasi sistem pembayaran multi-sekolah menggunakan kerangka kerja **Laravel** mutakhir. Dan sebagaimana disiplin rekayasa sistem yang sehat, fondasi dari setiap perangkat lunak finansial yang tangguh selalu bermula dari **perancangan basis data yang presisi**.

---

## 2. Pemilihan Arsitektur Multi-Tenancy: Mengapa Single-Database?

Sebelum menuliskan perintah SQL, seorang arsitek sistem harus memutuskan pendekatan arsitektur *multi-tenancy* yang paling efisien:

| Pola Arsitektur | Mekanisme Penyimpanan | Kelebihan | Kelemahan & Biaya |
| :--- | :--- | :--- | :--- |
| **Multi-Database** | Setiap sekolah memiliki 1 basis data MySQL terpisah | Isolasi data fisik absolut antar-sekolah | Biaya server/RAM tinggi; kueri konsolidasi yayasan sangat kompleks (*cross-database joins*); *overhead* migrasi tinggi. |
| **Multi-Schema** | Satu database, skema tabel terpisah per sekolah | Isolasi logis cukup baik | Manajemen izin kompleks; tidak didukung secara optimal di semua *storage engine* MySQL standar. |
| **Single-Database (Shared Schema)** | **Satu database bersama dengan kolom diskriminator `school_id`** | **Biaya infrastruktur sangat hemat; kueri rekapitulasi keuangan yayasan instan; pemeliharaan skema terpusat.** | **Menuntut disiplin pengembang (*Global Scope* / *Row-Level Filtering*) agar data antar-sekolah tidak bocor.** |

### Keputusan Arsitektur Kita
Untuk skenario yayasan pendidikan yang menaungi 3 hingga 15 unit sekolah dengan total 1.000 hingga 15.000 siswa, pendekatan **Single-Database (Shared Schema)** adalah pilihan paling realistis dan berkinerja tinggi. 

Di masa depan (pada Bagian 2 tutorial ini), kita akan memanfaatkan fitur **Eloquent Global Scope** pada [Transformasi Framework Laravel Modern](/blog/transformasi-dan-perkembangan-fitur-laravel-framework) untuk secara otomatis menyuntikkan klausa `WHERE school_id = ?` pada setiap kueri pembacaan dan penulisan, menggaransi bahwa kasir sekolah A tidak akan pernah melihat data penagihan sekolah B tanpa mengorbankan kemampuan yayasan melihat seluruh agregasi data secara *real-time*.

---

## 3. Kamus Data dan Entitas Utama (*Core Entities*)

Sistem pembayaran ini dibangun di atas 10 entitas relasional utama yang saling mengunci:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PETA RELASI ENTITAS (ENTITY-RELATIONSHIP MAP)               │
├─────────────────────────────────────────────────────────────────────────────┤
│  [foundations] 1:N ──> [schools] 1:N ──> [academic_years]                   │
│                           │                                                 │
│                           ├── 1:N ──> [classes]                             │
│                           ├── 1:N ──> [students] 1:N ──> [student_classes]  │
│                           ├── 1:N ──> [payment_types]                       │
│                           │                 │                               │
│                           │                1:N                              │
│                           │                 ▼                               │
│                           ├── 1:N ──> [payment_rates]                       │
│                           │                 │                               │
│                           │                1:N                              │
│                           │                 ▼                               │
│                           ├── 1:N ──> [bills (tagihan)]                     │
│                           │                 ▲                               │
│                           │                N:1                              │
│                           └── 1:N ──> [payment_transactions] 1:N ───────────┘
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **`foundations`**: Menyimpan identitas legal lembaga yayasan penaung.
2. **`schools`**: Menyimpan unit-unit sekolah (TK, SD, SMP, SMA) lengkap dengan rekening bank kasir masing-masing.
3. **`academic_years`**: Mengatur tahun ajaran kalender pendidikan (misal 2026/2027) beserta penanda tahun aktif.
4. **`classes`**: Rombongan belajar (rombbel/kelas) yang terikat pada unit sekolah dan tahun ajaran tertentu.
5. **`students`**: Master data siswa (NIS, NISN, nama lengkap, kontak wali, status keaktifan).
6. **`student_classes`**: Tabel riwayat mutasi / kenaikan kelas siswa antar-tahun ajaran (mengakomodasi kenaikan kelas tanpa mengubah riwayat pembayaran lama).
7. **`payment_types`**: Master jenis pembayaran (SPP Bulanan, Uang Gedung/DSP, Uang Seragam, Buku, Biaya Ujian).
8. **`payment_rates`**: Matriks tarif biaya. Setiap pos biaya dapat memiliki tarif standar per kelas, atau tarif khusus (*exception*) per siswa untuk mengakomodasi program beasiswa atau keringanan finansial.
9. **`bills` (Tagihan Siswa)**: Rekaman kewajiban bayar yang digenerasi oleh sistem per siswa per periode/pos biaya.
10. **`payment_transactions` & `payment_transaction_details`**: Rekaman bukti setoran kasir nyata, mencatat nomor kuitansi unik, metode pembayaran (tunai/transfer bank/gateway), tanggal transaksi, dan pegawai yang melayani.

---

## 4. Skrip DDL MySQL Lengkap (Production Ready)

Berikut adalah skrip Data Definition Language (DDL) MySQL lengkap yang siap Anda eksekusi. Perhatikan bahwa seluruh atribut finansial menggunakan tipe data `DECIMAL(12, 2)` guna mencegah galat pembulatan desimal yang fatal pada tipe data `FLOAT` atau `DOUBLE`:

```sql
-- =============================================================================
-- BASIS DATA APLIKASI PEMBAYARAN MULTI-SEKOLAH (YAYASAN TERPADU)
-- Storage Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Disusun oleh: Agus Sifaunajah (MAS-AGUS)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `db_pembayaran_yayasan`
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `db_pembayaran_yayasan`;

-- 1. Tabel Master Yayasan
CREATE TABLE `foundations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `legal_number` VARCHAR(100) NULL COMMENT 'Nomor SK Kemenkumham / Izin Operasional',
    `address` TEXT NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 2. Tabel Unit Sekolah (Tenants)
CREATE TABLE `schools` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `foundation_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(20) NOT NULL COMMENT 'Kode unik unit, misal: SMP-IT, SMA-01',
    `name` VARCHAR(150) NOT NULL,
    `education_level` ENUM('KB', 'TK', 'SD', 'MI', 'SMP', 'MTS', 'SMA', 'MA', 'SMK') NOT NULL,
    `npsn` VARCHAR(20) NULL,
    `bank_name` VARCHAR(50) NULL COMMENT 'Bank penampung kas unit',
    `bank_account_number` VARCHAR(50) NULL,
    `bank_account_holder` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_school_code` (`code`),
    CONSTRAINT `fk_schools_foundation` 
        FOREIGN KEY (`foundation_id`) REFERENCES `foundations` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. Tabel Tahun Ajaran
CREATE TABLE `academic_years` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(50) NOT NULL COMMENT 'Contoh: 2026/2027 Ganjil',
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_academic_active` (`school_id`, `is_active`),
    CONSTRAINT `fk_academic_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. Tabel Rombongan Belajar (Kelas)
CREATE TABLE `classes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `academic_year_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(50) NOT NULL COMMENT 'Contoh: VII-A, X-RPL-1',
    `grade_level` TINYINT UNSIGNED NOT NULL COMMENT 'Tingkat angka: 1 s.d 12',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_class_search` (`school_id`, `academic_year_id`),
    CONSTRAINT `fk_classes_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_classes_academic` 
        FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Tabel Siswa
CREATE TABLE `students` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `nis` VARCHAR(30) NOT NULL COMMENT 'Nomor Induk Siswa lokal unit',
    `nisn` VARCHAR(30) NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `gender` ENUM('L', 'P') NOT NULL,
    `parent_name` VARCHAR(150) NOT NULL,
    `parent_phone` VARCHAR(30) NOT NULL COMMENT 'Kunci notifikasi WhatsApp tagihan',
    `address` TEXT NULL,
    `status` ENUM('aktif', 'lulus', 'pindah', 'keluar') NOT NULL DEFAULT 'aktif',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_nis` (`school_id`, `nis`),
    INDEX `idx_student_name` (`school_id`, `full_name`),
    CONSTRAINT `fk_students_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Tabel Pivot Siswa Masuk Kelas (Riwayat Akademik)
CREATE TABLE `student_classes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `class_id` BIGINT UNSIGNED NOT NULL,
    `academic_year_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('aktif', 'mutasi_keluar', 'lulus') NOT NULL DEFAULT 'aktif',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_academic_class` (`student_id`, `academic_year_id`),
    CONSTRAINT `fk_sc_student` 
        FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_sc_class` 
        FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_sc_academic` 
        FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. Tabel Master Pos Pembayaran
CREATE TABLE `payment_types` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL COMMENT 'Contoh: SPP Bulanan, Uang Gedung, Seragam',
    `billing_cycle` ENUM('monthly', 'yearly', 'once') NOT NULL COMMENT 'Siklus tagihan',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_pt_school` (`school_id`, `billing_cycle`),
    CONSTRAINT `fk_pt_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. Tabel Tarif Pembayaran (Matriks Tarif Standar & Pengecualian Siswa)
CREATE TABLE `payment_rates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `payment_type_id` BIGINT UNSIGNED NOT NULL,
    `academic_year_id` BIGINT UNSIGNED NOT NULL,
    `class_id` BIGINT UNSIGNED NULL COMMENT 'Jika NULL, berlaku untuk semua kelas di unit tersebut',
    `student_id` BIGINT UNSIGNED NULL COMMENT 'Jika terisi, merupakan tarif khusus beasiswa/keringanan siswa bersangkutan',
    `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `notes` VARCHAR(255) NULL COMMENT 'Keterangan diskon/alasan tarif khusus',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_rate_lookup` (`payment_type_id`, `academic_year_id`, `class_id`, `student_id`),
    CONSTRAINT `fk_rate_payment_type` 
        FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_rate_academic` 
        FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_rate_class` 
        FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_rate_student` 
        FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. Tabel Tagihan Siswa (Bills / Invoices)
CREATE TABLE `bills` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `payment_type_id` BIGINT UNSIGNED NOT NULL,
    `academic_year_id` BIGINT UNSIGNED NOT NULL,
    `period_month` TINYINT UNSIGNED NULL COMMENT '1 s.d 12 untuk tagihan bulanan (SPP)',
    `period_year` SMALLINT UNSIGNED NULL COMMENT 'Tahun kalender tagihan (misal 2026)',
    `amount_due` DECIMAL(12, 2) NOT NULL COMMENT 'Kewajiban tagihan awal',
    `amount_paid` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Akumulasi yang telah dibayar',
    `status` ENUM('unpaid', 'partially_paid', 'paid') NOT NULL DEFAULT 'unpaid',
    `due_date` DATE NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_bills_filtering` (`school_id`, `status`, `due_date`),
    INDEX `idx_bills_student` (`student_id`, `status`),
    CONSTRAINT `fk_bills_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_bills_student` 
        FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_bills_pt` 
        FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_bills_academic` 
        FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. Tabel Transaksi Pembayaran Kasir (Ledger Transaksi)
CREATE TABLE `payment_transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `receipt_number` VARCHAR(50) NOT NULL COMMENT 'Nomor unik kuitansi bayar, misal: KWT-SMP-202611-0001',
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `payment_method` ENUM('cash', 'transfer_bank', 'qris', 'payment_gateway') NOT NULL DEFAULT 'cash',
    `transaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `received_by` VARCHAR(100) NOT NULL COMMENT 'Nama kasir / User ID petugas',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_receipt_number` (`receipt_number`),
    INDEX `idx_tx_school_date` (`school_id`, `transaction_date`),
    CONSTRAINT `fk_tx_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_tx_student` 
        FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 11. Tabel Rincian Alokasi Transaksi (Transaction Details)
CREATE TABLE `payment_transaction_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `transaction_id` BIGINT UNSIGNED NOT NULL,
    `bill_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL COMMENT 'Nominal yang dialokasikan untuk tagihan ini',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_ptd_lookup` (`transaction_id`, `bill_id`),
    CONSTRAINT `fk_ptd_transaction` 
        FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_ptd_bill` 
        FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;
```

---

## 5. Bedah Keputusan Desain dan Kunci Integritas Finansial

Sebagai perekayasa perangkat lunak sistem informasi, Anda harus mencermati lima keputusan kritis di balik rancangan basis data di atas:

### 1. Pantang Menggunakan Tipe Data Float / Double
Dalam aplikasi akuntansi dan transaksi finansial, **haram hukumnya menggunakan tipe data `FLOAT` atau `DOUBLE`**. Kedua tipe tersebut menggunakan representasi biner perkiraan (*floating-point approximation*) standar IEEE 754. Pada kalkulasi ribuan transaksi, representasi biner ini akan menghasilkan galat presisi pecahan sen (misalnya hasil penjumlahan menjadi `Rp 500.000,000000000004` yang memicu ketidaksesuaian neraca). 

Tipe data **`DECIMAL(12, 2)`** menyimpan angka secara tepat (*exact fixed-point numeric*), mendukung rentang angka hingga Rp 9.999.999.999,99 (hampir 10 miliar rupiah per transaksi) yang sangat memadai bagi institusi pendidikan.

### 2. Disiplin Integritas `ON DELETE RESTRICT`
Perhatikan seluruh batasan kunci asing (*Foreign Keys*) di atas. Kita sengaja menggunakan klausa **`ON DELETE RESTRICT`**, bukan `CASCADE`. 
> [!CAUTION]
> Jangan pernah memasang `ON DELETE CASCADE` pada tabel keuangan! Jika seorang operator sekolah secara tidak sengaja menghapus data siswa atau kelas, klausa `CASCADE` akan memusnahkan seluruh rekam jejak tagihan dan kuitansi pembayaran historis yang bernilai audit hukum. 
> 
> Dengan `RESTRICT`, mesin basis data MySQL akan menolak eksekusi penghapusan master siswa selama siswa tersebut masih memiliki kaitan data dengan tagihan atau kuitansi pembayaran.

### 3. Pemisahan Transaksi Kasir (`payment_transactions`) dari Tagihan (`bills`)
Banyak pengembang pemula menggabungkan data pembayaran langsung di tabel tagihan dengan menambahkan kolom tanggal bayar. Pendekatan tersebut keliru besar (*bad architectural smell*) karena tidak mampu menangani dua skenario nyata di dunia sekolah:
* **Pembayaran Sebagian (*Cicilan / Partial Payment*)**: Siswa ingin membayar uang gedung sebesar Rp 500.000 dari total tagihan Rp 2.000.000.
* **Pembayaran Jamak Sekaligus (*Bundled Payment*)**: Seorang wali murid datang ke meja kasir menyerahkan uang Rp 1.500.000 untuk melunasi SPP bulan November, SPP bulan Desember, dan uang seragam sekaligus dalam **satu lembar kuitansi**.

Melalui tabel perantara **`payment_transaction_details`**, satu nomor kuitansi (`payment_transactions`) dapat melunasi banyak tagihan sekaligus (*one-to-many allocation*), atau sebuah tagihan dapat dilunasi secara bertahap melalui beberapa kali setoran transaksi kasir.

### 4. Strategi Pengindeksan Majemuk (*Composite Indexing*)
Ketika sistem ini telah beroperasi selama 3 tahun dan menampung ratusan ribu baris data tagihan, kueri pencarian akan menjadi sangat lambat jika hanya mengandalkan kunci primer. Oleh karena itu, kita merancang indeks gabungan yang selaras dengan kueri aplikasi:
* `INDEX idx_bills_filtering (school_id, status, due_date)`: Mempercepat dasbor kasir saat mencari *daftar tagihan siswa yang menunggak di unit SMP*.
* `INDEX idx_tx_school_date (school_id, transaction_date)`: Mempercepat laporan rekapitulasi penerimaan kas harian/bulanan bendahara yayasan.

---

## 6. Sinergi Arsitektur dan Mitigasi Keamanan Siber

Perancangan basis data yang rapi ini selaras dengan prinsip-prinsip rekayasa komputasi yang kita diskusikan di MAS-AGUS Knowledge Hub:
* **Penanggulangan Kerentanan Transaksional**: Basis data ini menerapkan arsitektur transaksi ACID (*Atomicity, Consistency, Isolation, Durability*) melalui *engine* InnoDB. Selaras dengan refleksi [Kesiapan Ketahanan Infrastruktur Digital dan Badai Siber](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia), setiap aksi pembayaran di Laravel kelak wajib dibungkus dalam blok `DB::transaction()` guna menjamin bahwa pembaruan status `bills` dan pembuatan `payment_transactions` berhasil secara serempak atau dibatalkan seutuhnya (*rollback*) jika server mengalami gangguan koneksi di tengah proses.
* **Metodologi Rekayasa Artefak Terapan**: Perancangan skema ini merupakan fase pemodelan representasi data yang berpatokan pada siklus perancangan artefak terapan [Design Science Research Methodology (DSRM)](/blog/metodologi-penelitian-terapan-dalam-bidang-sistem-informasi).
* **Paralelisme dengan Arsitektur Enterprise**: Pola pemodelan relasi dan integritas data ini juga dapat dikomparasikan dengan kedisiplinan Active Record pada [Kajian Membangun CRUD Tangguh Yii 2 Framework](/blog/tutorial-crud-yii-framework-panduan-praktisi) dan prinsip konvensi modern [Transformasi Framework CakePHP](/blog/transformasi-dan-perkembangan-fitur-cakephp).

---

## 7. Roadmap Tutorial Berseri Selanjutnya

Perancangan basis data MySQL yang kita selesaikan pada Bagian 1 ini adalah batu fondasi utama. Pada penerbitan artikel berseri berikutnya, kita akan melangkah ke lapisan implementasi kode:

* **Bagian 2 (Tersedia)**: [Migrasi Skema, Model Eloquent, dan Multi-Tenant Global Scope](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope) — Translasi DDL ke Migration, implementasi Trait `BelongsToSchool`, dan isolasi kueri otomatis.
* **Bagian 3 (Tersedia)**: [Billing Generation Engine, Tarif Beasiswa, dan Transaksi Kasir Pelunasan Cicilan](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-billing-transaksi) — Pembangunan BillingService, cascading rate resolver, dan alur kasir pelunasan bertahap berbasis transaksi ACID.
* **Bagian 4 (Tersedia)**: [Kuitansi PDF Dinamis, Integrasi WhatsApp Gateway, dan Dasbor Eksekutif Yayasan](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-pdf-wa-dashboard) — Otomasi kuitansi PDF resmi berstandar akuntansi, antrean non-blocking WhatsApp, dan dasbor konsolidasi keuangan yayasan.
* **Bagian 5 (Tersedia)**: [Arsitektur RESTful API, Laravel Sanctum, dan Integrasi Klien Terdistribusi](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-rest-api) — Ekspose layanan pembayaran secara *stateless* melalui Bearer Token, API Resources, dan Rate Limiting.

Simpan dan eksekusi skrip SQL di atas pada lingkungan server lokal (Laragon/XAMPP/MySQL) Anda sebagai persiapan mengikuti episode berikutnya!

---

## Catatan Kaki & Tautan Terkait

1. **Dokumentasi Resmi MySQL InnoDB Storage Engine**: Panduan arsitektur transaksi ACID, batasan integritas kunci asing, dan optimasi pengindeksan biner tersedia di [MySQL Official Documentation](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html).
2. **Dokumentasi Resmi Laravel Database Migrations**: Spesifikasi pembangun skema dan deklarasi indeks pada Laravel tersedia di [Laravel Database Documentation](https://laravel.com/docs/migrations).
3. **Standar Desain IEEE 754 dan Angka Desimal Presisi**: Kajian teknis mengenai bahaya kalkulasi representasi biner pada komputasi finansial dapat dipelajari melalui literatur rekayasa perangkat lunak ACM / IEEE.
4. **Jejaring Kajian Relevan MAS-AGUS Knowledge Hub**:
   - Kelanjutan tutorial berseri Bagian 4 (Final): [Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Kuitansi PDF Dinamis, Integrasi WhatsApp Gateway, dan Dasbor Eksekutif Yayasan (Bagian 4)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-pdf-wa-dashboard).
   - Kelanjutan tutorial berseri Bagian 3: [Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Billing Generation Engine, Tarif Beasiswa, dan Transaksi Kasir Pelunasan Cicilan (Bagian 3)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-billing-transaksi).
   - Kelanjutan tutorial berseri Bagian 2: [Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Migrasi Skema, Model Eloquent, dan Multi-Tenant Global Scope (Bagian 2)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope).
   - Eksplorasi fitur Eloquent dan ekosistem modern: [Transformasi Framework Laravel: Dari Alternatif Elegan Menjadi Raksasa Ekosistem Web Modern](/blog/transformasi-dan-perkembangan-fitur-laravel-framework).
   - Pengorganisasian logika data enterprise dan pencegahan kueri N+1: [Membangun CRUD Tangguh dengan Yii 2 Framework: Catatan dan Panduan Praktisi Rekayasa Sistem](/blog/tutorial-crud-yii-framework-panduan-praktisi).
   - Strategi tata kelola data publik terintegrasi: [Transformasi Digital dalam Sistem Informasi: Integrasi Layanan Publik Menuju Efisiensi Tata Kelola Modern](/blog/transformasi-digital-dalam-sistem-informasi).
   - Rekayasa metodologi penelitian sistem terapan: [Metodologi Penelitian Terapan dalam Bidang Sistem Informasi](/blog/metodologi-penelitian-terapan-dalam-bidang-sistem-informasi).
   - Pengerasan keamanan transaksi dan perlindungan aset digital: [Menghadapi Badai Siber: Refleksi Kritis atas Ketahanan Infrastruktur Digital Indonesia](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia).
