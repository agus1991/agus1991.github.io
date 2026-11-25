---
title: "Metodologi Penelitian Terapan dalam Bidang Sistem Informasi: Panduan Kerangka Kerja DSRM Berbasis Bukti Empiris"
description: "Kajian komprehensif paradigma Design Science Research Methodology (DSRM), analisis tingkat penolakan naskah riset komputasi, serta panduan operasionalisasi enam siklus rekayasa artefak sistem informasi."
pubDate: 2026-11-12
updatedDate: 2026-11-17
category: "Research"
tags:
  - Research
  - Methodology
  - DSRM
  - Information Systems
  - Academic Publishing
  - Evaluation Framework
featured: false
draft: false
cover: "/images/articles/metodologi-riset-dsrm.svg"
coverAlt: "Diagram siklus enam tahapan Design Science Research Methodology dalam rekayasa sistem informasi"
seoTitle: "Metodologi Riset Terapan Sistem Informasi (DSRM) — MAS-AGUS"
seoDescription: "Panduan komprehensif metodologi riset terapan bidang sistem informasi menggunakan pendekatan Design Science Research Methodology (DSRM) dan evaluasi empiris."
focusKeyword: "Metodologi Penelitian Sistem Informasi DSRM"
lang: "id"
translationSlug: "applied-research-methodologies-in-information-systems"
---

> **Informasi Kajian Ilmiah:**  
> **Ruang Lingkup:** Metodologi Penelitian Komputasi, Epistemologi Sistem Informasi, Design Science Research Methodology (DSRM), dan Standar Evaluasi Artefak Akademis.  
> **Metode Pendekatan:** Analisis Epistemologis, Tinjauan Literatur Sistematis, dan Pedoman Operasionalisasi Empiris.

---

## Pendahuluan

Disiplin ilmu Sistem Informasi (SI) menempati posisi epistemologis yang unik dalam ranah sains komputasi. Disiplin ini berada pada persimpangan dinamis antara ilmu komputer murni (*Computer Science*) yang berorientasi pada algoritma dan matematika abstrak, dengan ilmu perilaku (*Behavioral Science*) yang berfokus pada dinamika manusia dan organisasi [1][2]. 

Jika ilmu perilaku konvensional bertujuan untuk memahami dan memprediksi fenomena sosial (*to understand and explain reality*), maka penelitian terapan dalam bidang sistem informasi memikul mandat tambahan yang bersifat preskriptif: **menciptakan solusi inovatif (*to create and change reality*)** guna memecahkan problematika operasional di dunia industri, pemerintahan, dan masyarakat [3].

Asosiasi internasional bidang Sistem Informasi (*Association for Information Systems / AIS*) bersama para pakar metodologi terkemuka merumuskan paradigma ini sebagai **Design Science Research (DSR)**, dengan kerangka operasional yang dipopulerkan secara luas oleh Peffers et al. (2007) melalui **Design Science Research Methodology (DSRM)** [4]. Namun, dalam praktik riset di perguruan tinggi dan penelitian terapan, metodologi ini kerap mengalami distorsi penafsiran yang fatal.

---

## 1. Paradoks Kinerja: Ledakan Publikasi vs Tingginya Tingkat Penolakan Naskah

Perkembangan riset terapan sistem informasi di Indonesia memperlihatkan paradoks yang mengkhawatirkan antara kuantitas produksi karya ilmiah melawan ketepatan metodologi yang diterapkan.

Data statistik editorial pada jurnal-jurnal bereputasi internasional (Scopus Q1/Q2) maupun jurnal nasional terakreditasi peringkat atas (SINTA 1 & 2) menunjukkan bahwa **tingkat penolakan awal (*desk rejection rate*) untuk naskah bertema "rancang bangun sistem informasi" mencapai lebih dari 75%** [5][6].

```
PARADOKS RISET SISTEM INFORMASI:

[Kuantitas Naskah "Rancang Bangun SI" Tinggi]
                   │
                   ▼
[Kekeliruan: Diperlakukan Sebagai Pemrograman Rutin]
                   │
                   ▼
[Nihil Landasan Teoretis & Evaluasi Empiris yang Ketat]
                   │
                   ▼
[Desk Rejection Rate > 75% pada Jurnal Ilmiah Bereputasi]
```

Paradoks ini membuktikan bahwa penulisan karya ilmiah terapan tidak dapat disamakan dengan laporan proyek pengembangan perangkat lunak komersial. Naskah yang hanya memaparkan kode pemrograman tanpa disertai formulasi konstruk teoritis dan evaluasi empiris yang terukur secara otomatis dinilai tidak memenuhi standar kontribusi ilmiah (*scientific novelty and rigor*) [7].

---

## 2. Kesenjangan Teoretis: Dikotomi "Routine Software Development" vs "Design Science"

Akar dari tingginya angka penolakan naskah ilmiah bermula dari ketidakmampuan peneliti dalam membedakan antara pekerjaan rekayasa rutin (*routine engineering/software development*) dengan riset ilmu desain (*Design Science Research*) [8][9]:

| Parameter Evaluasi | Pengembangan Perangkat Lunak Rutin | Design Science Research (DSRM) |
| :--- | :--- | :--- |
| **Fokus Utama** | Membangun aplikasi kerja untuk klien spesifik | Menghasilkan pengetahuan baru (*knowledge contribution*) |
| **Pendekatan Masalah** | Penerapan praktik terbaik (*best practices*) yang ada | Investigasi masalah kompleks yang belum terpecahkan secara optimal |
| **Bentuk Hasil (Luaran)** | Kode program instansiasi semata | Artefak komputasi (Konstruk, Model, Metode, atau Instansiasi) |
| **Kriteria Keberhasilan** | Perangkat lunak berjalan sesuai spesifikasi | Terujinya efektivitas artefak melalui evaluasi empiris terukur |
| **Kontribusi Ilmiah** | Nol (bersifat komersial praktis) | Kebaruan solusi teoritis dan kepatuhan metodologis ketat |

Berdasarkan formulasi Hevner et al. (2004), artefak yang dihasilkan dalam riset DSR tidak terbatas pada perangkat lunak jadi (*instantiations*), melainkan mencakup **Konstruk** (definisi istilah/taksonomi baru), **Model** (representasi arsitektural dan hubungan relasional), serta **Metode** (algoritma, pedoman tata kelola, atau protokol alur kerja) [3][10].

---

## 3. Studi Kasus Empiris: Tiga Jebakan Metodologis di Lingkungan Akademik

Melalui observasi mendalam selama proses pembimbingan riset mahasiswa sarjana dan pascasarjana, serta telaah editorial pada naskah jurnal ilmiah independen (seperti AskaPubliser), teridentifikasi tiga kekeliruan fatal yang berulang di lapangan:

### A. Perumusan Masalah Subjektif Tanpa Bukti Empiris
Peneliti kerap merumuskan latar belakang masalah semata-mata berdasarkan klaim subjektif (misal: *"instansi X membutuhkan website karena belum memilikinya"*), tanpa menyajikan data statistik inefisiensi operasional, analisis kesenjangan regulasi, atau tinjauan literatur atas kegagalan sistem terdahulu.

### B. Evaluasi Permukaan Tanpa Validasi Pengguna
Tahap evaluasi artefak sering kali berhenti pada pengujian kotak hitam (*black-box testing*) internal yang hanya memastikan bahwa tombol antarmuka berfungsi. Evaluasi ilmiah sejati menuntut pengujian adopsi pengguna menggunakan model psikometrik teruji (seperti *Technology Acceptance Model / TAM* atau *UTAUT*) atau pengujian performa kuantitatif (seperti *load testing*, *latency profiling*, dan *stress testing*).

### C. Ketiadaan Kontribusi Kebaruan (*Scientific Novelty*)
Peneliti sering kali membangun sistem yang identik dengan solusi yang telah mapan di industri tanpa menawarkan efisiensi baru, modifikasi arsitektur yang lebih hemat sumber daya, atau adaptasi sosio-teknikal terhadap karakteristik spesifik pengguna lokal.

---

## 4. Solusi Operasional: Implementasi Enam Tahapan Siklus DSRM

Guna memastikan riset terapan memenuhi kaidah rigor ilmiah sekaligus relevansi industri, peneliti wajib menerapkan enam siklus berulang kerangka kerja DSRM secara terstruktur [4]:

```
SIKLUS ENAM TAHAPAN DSRM (PEFFERS ET AL., 2007):

┌───────────────────────────────────────────────┐
│ 1. Problem Identification and Motivation      │
│    └─ Bukti empiris & referensi literatur     │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│ 2. Define Objectives for a Solution           │
│    └─ Metrik kuantitatif keberhasilan artefak │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐ ◄───┐
│ 3. Design and Development                     │     │
│    └─ Konstruk, Model, Algoritma, Prototipe   │     │
└───────────────────────┬───────────────────────┘     │ Siklus
                        │                             │ Iterasi
┌───────────────────────▼───────────────────────┐     │ Perbaikan
│ 4. Demonstration                              │     │
│    └─ Studi kasus lapangan percontohan        │     │
└───────────────────────┬───────────────────────┘     │
                        │                             │
┌───────────────────────▼───────────────────────┐     │
│ 5. Evaluation                                 │ ────┘
│    └─ SEM-PLS, UAT, Benchmarking Kinerja      │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│ 6. Communication                              │
│    └─ Publikasi jurnal bereputasi & diseminasi│
└───────────────────────────────────────────────┘
```

### Panduan Aksi Setiap Tahapan:

1. **Tahap 1 — Identifikasi Masalah & Urgensi**: Definisikan persoalan spesifik menggunakan data kuantitatif lapangan dan kutip riset terdahulu yang menunjukkan adanya celah (*gap*) yang belum terselesaikan.
2. **Tahap 2 — Perumusan Tujuan Solusi Terukur**: Tetapkan target spesifik yang dapat diuji secara objektif (misal: mereduksi redundansi input data hingga 50%, atau memangkas latensi TTFB di bawah 1 detik).
3. **Tahap 3 — Perancangan dan Rekayasa Artefak**: Bangun artefak sistem informasi dengan mendasarkan setiap keputusan desain pada teori komputasi atau arsitektur sistem terdistribusi yang valid (contoh konkritnya dapat dicermati pada [Arsitektur Integrasi REST API Tata Kelola SPBE](/blog/transformasi-digital-dalam-sistem-informasi)).
4. **Tahap 4 — Demonstrasi**: Terapkan artefak pada satu unit lingkungan riil (seperti satu OPD pemerintah atau satu divisi organisasi mitra) untuk membuktikan kelayakan operasionalnya (*proof of concept*).
5. **Tahap 5 — Evaluasi Empiris Ketat**: Ukur ketercapaian target menggunakan instrumen gabungan kuantitatif (analisis *Structural Equation Modeling / SEM-PLS* untuk penerimaan teknologi) dan audit teknis komparatif.
6. **Tahap 6 — Komunikasi Akademis**: Dokumentasikan kebaruan artefak ke dalam struktur naskah IMRAD (*Introduction, Method, Results, and Discussion*) untuk dipublikasikan pada forum akademik bereputasi.

---

## 5. Kesimpulan dan Rekomendasi Bagi Peneliti

Penerapan Design Science Research Methodology (DSRM) secara disiplin merupakan jembatan emas yang menyatukan dunia akademis dengan tuntutan praktis industri. 

Bagi dosen, peneliti mandiri, dan mahasiswa pascasarjana sistem informasi, meneliti bukan sekadar menyelesaikan baris kode pemrograman, melainkan merancang artefak komputasi yang dapat diuji secara transparan, memiliki landasan teoretis yang kuat, serta terbukti secara empiris menyelesaikan permasalahan nyata masyarakat. Kepatuhan terhadap siklus DSRM adalah kunci utama dalam mengamankan penerimaan naskah ilmiah pada jurnal terindeks Scopus dan SINTA peringkat puncak, sekaligus menjadi kompas dalam mentransformasi bimbingan tugas akhir di era AI sebagaimana saya bahas dalam [Tantangan Dosen TI Menghadapi Disrupsi AI Generatif](/blog/tantangan-dosen-ti-di-era-artificial-intelligence).

---

## Referensi Ilmiah

[1] A. S. Lee, "Architecture as a frame for research on information systems," in *Information Systems: The Next Generation*, Berlin: Springer, 2001, pp. 1–15.  
[2] R. Baskerville, M. Kaul, and V. Storey, "Genres of inquiry in design-science research: Justification and evaluation of knowledge production," *MIS Quarterly*, vol. 39, no. 3, pp. 541–564, 2015.  
[3] A. R. Hevner, S. T. March, J. Park, and S. Ram, "Design science in information systems research," *MIS Quarterly*, vol. 28, no. 1, pp. 75–105, 2004.  
[4] K. Peffers, T. Tuunanen, M. A. Rothenberger, and S. Chatterjee, "A design science research methodology for information systems research," *Journal of Management Information Systems*, vol. 24, no. 3, pp. 45–77, 2007.  
[5] J. Webster and R. T. Watson, "Analyzing the past to prepare for the future: Writing a literature review," *MIS Quarterly*, vol. 26, no. 2, pp. xiii–xxiii, 2002.  
[6] Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia, *Pedoman Akreditasi Jurnal Ilmiah Nasional (SINTA)*, Jakarta: Ditjen Diktiristek, 2024.  
[7] D. Gregor and A. R. Hevner, "Positioning and presenting design science research for maximum impact," *MIS Quarterly*, vol. 37, no. 2, pp. 337–355, 2013.  
[8] S. T. March and G. F. Smith, "Design and natural science research on technology," *Decision Support Systems*, vol. 15, no. 4, pp. 251–266, 1995.  
[9] J. Iivari, "A paradigmatic analysis of information systems as a design science," *Scandinavian Journal of Information Systems*, vol. 19, no. 2, pp. 39–64, 2007.  
[10] S. Gregor and D. Jones, "The anatomy of a design theory," *Journal of the Association for Information Systems*, vol. 8, no. 5, pp. 312–335, 2007.  
[11] F. D. Davis, "Perceived usefulness, perceived ease of use, and user acceptance of information technology," *MIS Quarterly*, vol. 13, no. 3, pp. 319–340, 1989.  
[12] V. Venkatesh, M. G. Morris, G. B. Davis, and F. D. Davis, "User acceptance of information technology: Toward a unified view," *MIS Quarterly*, vol. 27, no. 3, pp. 425–478, 2003.
