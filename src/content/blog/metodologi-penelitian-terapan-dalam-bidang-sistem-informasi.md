---
title: "Metodologi Penelitian Terapan dalam Bidang Sistem Informasi: Panduan Kerangka DSRM"
description: "Membahas penerapan Design Science Research Methodology (DSRM) dalam perancangan dan evaluasi artefak teknologi informasi pada penelitian akademik dan praktis."
pubDate: 2026-11-12
updatedDate: 2026-11-14
category: "Research"
tags:
  - Research
  - Methodology
  - Academic
  - Information Systems
featured: false
draft: false
cover: "/images/articles/metodologi-riset-dsrm.svg"
coverAlt: "Siklus dan alur kerja Design Science Research Methodology dalam bidang sistem informasi"
seoTitle: "Metodologi Riset Terapan Sistem Informasi (DSRM) — MAS-AGUS"
seoDescription: "Panduan komprehensif metodologi riset terapan bidang sistem informasi menggunakan pendekatan Design Science Research Methodology (DSRM)."
focusKeyword: "Metodologi Penelitian Sistem Informasi DSRM"
---

Penelitian di bidang Sistem Informasi menempati posisi unik di antara ilmu komputer murni (*Computer Science*) dan ilmu perilaku organisasi (*Behavioral Science*). Jika ilmu perilaku berfokus pada memahami dan menjelaskan fenomena sosial manusia terhadap teknologi, maka penelitian terapan sistem informasi sering kali dituntut untuk **menciptakan solusi baru (*artefak*)** yang memecahkan masalah nyata di dunia industri maupun pendidikan.

Untuk menjembatani teori dan praktik rekayasa tersebut, kerangka kerja **Design Science Research Methodology (DSRM)** yang dipopulerkan oleh Peffers et al. (2007) menjadi salah satu metodologi yang paling diakui dan terstruktur secara ilmiah.

## 1. Apa itu Design Science Research (DSR)?

Design Science Research adalah paradigma penelitian ilmiah di mana peneliti menciptakan dan mengevaluasi artefak teknologi informasi baru yang ditujukan untuk memecahkan permasalahan yang teridentifikasi secara empiris.

Artefak dalam penelitian sistem informasi dapat berbentuk:

- **Konsep / Konstruk**: Kosakata dan pemahaman konseptual baru (misalnya taksonomi kelemahan sistem).
- **Model**: Representasi hubungan antar konsep atau alur data sistem informasi.
- **Metode**: Algoritma, panduan alur kerja (*guidelines*), atau formula matematis.
- **Instansiasi**: Implementasi perangkat lunak kerja nyata, platform sistem informasi, atau sistem prototipe yang dapat diuji.

## 2. Enam Tahapan Siklus DSRM

Peffers dkk. merumuskan siklus iteratif penelitian DSRM ke dalam enam langkah berurutan:

```
[1. Identifikasi Masalah & Motivasi]
              │
              ▼
[2. Definisi Tujuan Solusi]
              │
              ▼
[3. Perancangan & Pengembangan Artefak] ◄──┐
              │                           │ (Siklus
              ▼                           │  Iterasi)
[4. Demonstrasi Artefak]                  │
              │                           │
              ▼                           │
[5. Evaluasi Empiris Artefak] ────────────┘
              │
              ▼
[6. Komunikasi & Publikasi Ilmiah]
```

### Tahap 1: Problem Identification and Motivation
Mendefinisikan masalah spesifik yang dihadapi organisasi dan menjelaskan urgensi mengapa artefak baru diperlukan. Nilai kebaruan (*novelty*) riset diawali dari kejelasan rumusan masalah ini.

### Tahap 2: Define the Objectives for a Solution
Menentukan kriteria keberhasilan (*acceptance criteria*) dari solusi yang akan dibangun secara kuantitatif maupun kualitatif.

### Tahap 3: Design and Development
Membuat arsitektur artefak, model basis data, algoritma, atau rancang bangun perangkat lunak. Pada tahap ini, peneliti mengaplikasikan teori yang telah mapan ke dalam desain sistem.

### Tahap 4: Demonstration
Membuktikan bahwa artefak yang dibangun dapat berfungsi memecahkan masalah pada konteks uji coba terbatas atau studi kasus percontohan.

### Tahap 5: Evaluation
Mengukur seberapa baik artefak mendukung solusi atas permasalahan. Evaluasi dapat dilakukan melalui perbandingan metrik performa (*benchmarking*), uji coba lapangan, kuesioner adopsi pengguna (Technology Acceptance Model / TAM), atau audit pakar (*expert review*).

### Tahap 6: Communication
Mendokumentasikan seluruh proses penelitian, temuan teoritis, dan kontribusi praktis ke dalam naskah artikel ilmiah untuk dipublikasikan pada jurnal bereputasi atau prosiding seminar nasional/internasional.

## 3. Menghindari Jebakan Riset Terapan

Dalam membimbing mahasiswa dan meneliti proyek sistem informasi, ada beberapa kekeliruan yang kerap terjadi:

1. **Membuat Software Tanpa Kontribusi Ilmiah**: Membangun aplikasi web biasa tanpa adanya formulasi masalah yang jelas atau tanpa analisis metodologis bukanlah penelitian DSR, melainkan proyek pemrograman komersial biasa.
2. **Evaluasi yang Lemah**: Mengabaikan tahap evaluasi kuantitatif atau hanya mengandalkan opini subjektif pengembang tanpa melibatkan pengguna target atau data empiris.
3. **Mengabaikan Studi Literatur**: Tidak mengkaji artefak serupa yang pernah diteliti sebelumnya, sehingga mengklaim kebaruan yang sebenarnya sudah usang.

## Kesimpulan

Dengan menerapkan kerangka kerja DSRM secara disiplin, para akademisi dan praktisi sistem informasi dapat menghasilkan karya penelitian yang tidak hanya bernilai akademis tinggi dan lolos penelaahan jurnal internasional, tetapi juga memberikan dampak nyata bagi penyelesaian problematika operasional teknologi di masyarakat.
