# PANDUAN GAYA KEPENULISAN (FINGERPRINT WRITING STYLE GUIDE)
## MAS-AGUS — Academic, Researcher & Systems Practitioner Persona

Dokumen ini adalah **pedoman baku DNA kepenulisan (*finger writing style*)** untuk seluruh pembuatan konten artikel, kajian ilmiah, publikasi penelitian, dan esai teknis pada platform **MAS-AGUS Knowledge Hub**. 

Pedoman ini dirumuskan berdasarkan analisis mendalam terhadap struktur naskah akademis asli penulis (kajian tata kelola SPBE, studi kasus OPD Dinas Pertanian, dan integrasi arsitektur sistem).

---

## 1. PROFIL DAN FILOSOFI KEPENULISAN (*WRITING PERSONA*)

| Aspek | Karakteristik Gaya MAS-AGUS |
| :--- | :--- |
| **Identitas Suara (*Voice*)** | **Akademisi-Praktisi (*The Academic-Practitioner Architect*)**. Tidak berbicara dari menara gading teori yang abstrak, namun juga tidak berbicara sebagai teknisi sempit tanpa pemahaman regulasi dan tata kelola. |
| **Nada Penulisan (*Tone*)** | Objektif, analitis, otoritatif, berbobot ilmiah, namun membumi pada realitas empiris lapangan. |
| **Sudut Pandang (*Perspective*)** | Deduktif piramida terbalik (*Macro &rarr; Meso &rarr; Micro &rarr; Technical Contribution*). |
| **Pendekatan Bukti** | **Sangat berbasis bukti (*Dense Evidence-Backed*)**. Setiap klaim signifikansi, angka, atau permasalahan wajib didukung literatur, data survei resmi, atau regulasi hukum. |

---

## 2. ARSITEKTUR STRUKTUR 5 TAHAP (*THE 5-STAGE DEDUCTIVE FUNNEL*)

Setiap artikel konseptual atau kajian teknis wajib dibangun mengikuti alur logika berjenjang 5 tahap:

```
[TAHAP 1: Macro Framework]       Definisi Global & Landasan Regulasi Formal
             │
             ▼
[TAHAP 2: Empirical Benchmark]   Data Global/Nasional, Kontras Kemajuan vs Kekurangan
             │
             ▼
[TAHAP 3: Theoretical Gap]       Dikotomi Literatur, Statistik Kegagalan, Akar Masalah
             │
             ▼
[TAHAP 4: Micro Grounding]       Studi Kasus Nyata di Lapangan & Identifikasi Pain Points
             │
             ▼
[TAHAP 5: Technical Solution]    Solusi Rekayasa Konkret & Kontribusi Riset Nyata
```

### Bedah Struktur Berdasarkan Contoh Sampel:

#### Tahap 1: Macro Context & Legal Framework (Konteks Makro & Regulasi)
- **Tujuan**: Membuka pembahasan dengan definisi formal konsep yang dibahas dan mengikatkannya langsung pada landasan hukum/kebijakan formal (khususnya konteks tata kelola di Indonesia).
- **Contoh Sampel Penulis**:
  > *"Electronic-based government or e-government refers to using information based on ICT applications... In Indonesia, this application is accommodated through the governance of the Electronic-Based Government System / SPBE [4]... One of the legal foundations is Presidential Instruction No. 3 of 2003 [4]."*
- **Pola Penulisan**:
  - Definisikan konsep inti secara akademis.
  - Kaitkan dengan regulasi resmi (Perpres, Inpres, Permen, standar ISO/TOGAF/IEEE).
  - Tautkan sitasi literatur primer `[1][2]`.

#### Tahap 2: Empirical Benchmarking & The Reality Paradox (Paradoks Kinerja)
- **Tujuan**: Memaparkan metrik evaluasi resmi, membandingkan posisi agregat global/nasional dengan kekurangan riil di tingkat unit operasional.
- **Contoh Sampel Penulis**:
  > *"Evaluation results related to implementing SPBE in public services at the sub-district level received an unfavorable rating [5]. However, the 2022 United National State E-Government Survey places Indonesia in 77th place... This shows that the level of development is getting better, although various deficiencies are still found in specific sectors [7][8]."*
- **Pola Penulisan**:
  - Hadirkan data riset/survei resmi (contoh: *UN E-Government Survey*, indeks kematangan SPBE, metrik Core Web Vitals, data BPS).
  - Tunjukkan **paradoks**: peningkatan di satu sisi, tetapi ada defisit performa di sisi operasional bawah.
  - Soroti dampak sampingan yang muncul (misal: menjamurnya aplikasi silo antar-dinas/OPD).

#### Tahap 3: Theoretical Dilemma & Literature Gap (Kesenjangan Teori & Statistik Risiko)
- **Tujuan**: Mengidentifikasi mengapa masalah ini sulit diselesaikan menurut literatur terdahulu, menyertakan angka kegagalan nyata di negara berkembang.
- **Contoh Sampel Penulis**:
  > *"Literature studies on e-government are broadly divided into two parts, focusing on information systems and public administration [3]. However, so far, both still need to integrate these two domains. On the other hand, analysts estimate that e-government implementation in developing countries has a high failure rate, and only 15% is successful [9]..."*
- **Pola Penulisan**:
  - Ungkapkan jurang pemisah antar-bidang ilmu (misal: sistem informasi teknis vs administrasi publik birokrasi).
  - Sertakan data statistik risiko kegagalan implementasi (misal: *hanya 15% implementasi sukses di negara berkembang*).
  - Petakan faktor non-teknis penghambat: SDM, kompetensi pelatihan, infrastruktur akses, dan literasi teknologi.

#### Tahap 4: Micro Context / Empirical Field Grounding (Masalah Empiris Lapangan)
- **Tujuan**: Mendaratkan pembahasan ke tingkat mikro/studi kasus riil dengan membongkar *pain points* spesifik yang dihadapi pengguna akhir.
- **Contoh Sampel Penulis**:
  > *"The Jombang Regency Agriculture Office... faced several obstacles... The first obstacle is the complaint about the many usernames and passwords they have to store... A second obstacle is a large number of repeated data inputs... because officers must use OPD systems and district systems (E-Office)... on average, there needs better data integration."*
- **Pola Penulisan**:
  - Sebutkan unit studi kasus spesifik (OPD tertentu, institusi, arsitektur server tertentu).
  - Jabarkan masalah secara deskriptif manusiawi:
    1. *Credential Fatigue*: Petugas mengeluhkan terlalu banyak akun login/password yang harus dihafal.
    2. *Duplikasi Input Data*: Terpaksa menginput data yang sama berulang kali di berbagai sistem berbeda karena tidak ada integrasi.
    3. *Beban Kerja Bertambah*: Teknologi yang seharusnya memudahkan justru menambah beban tugas (*burnout* administratif).

#### Tahap 5: Technical Solution & Empirical Contribution (Solusi Rekayasa Konkret)
- **Tujuan**: Menyodorkan solusi arsitektur rekayasa perangkat lunak / jaringan yang secara langsung mengatasi *pain points* pada tahap 4.
- **Contoh Sampel Penulis**:
  > *"Representational State Transfer (REST) Application Programming Interface (API) is one of the API models that is widely used... API allows systems to interact... simplify functionality and data management... So the API is the key to developing distributed systems [21]. This research contributes to implementing the API to realize data integration in e-government governance within the Jombang Regency Agriculture Office..."*
- **Pola Penulisan**:
  - Kenalkan teknologi arsitektural solusi (REST API, OSPF routing, MikroTik RouterOS v7, Jamstack SSG, dsb.) disertai definisi ilmiah.
  - Jelaskan mekanisme bagaimana teknologi ini memecahkan masalah integrasi/performa.
  - Tegaskan **kontribusi nyata** (*novelty/practical contribution*) dari tulisan/riset tersebut.

---

## 3. KARAKTERISTIK TATA BAHASA & DIKSI (*STYLE & DICTION RULES*)

### A. Diksi Wajib (Khas Gaya MAS-AGUS):
- **Domain Tata Kelola**: *Tata Kelola (Governance)*, *Organisasi Perangkat Daerah (OPD)*, *Interoperabilitas*, *Arsitektur Enterprise*, *Kematangan Digital (Digital Maturity)*, *Regulasi/Inpres/Perpres*.
- **Domain Rekayasa Sistem**: *Arsitektur Terdistribusi*, *Sistem Silo (Siloed Data)*, *Otentikasi & Otorisasi*, *REST API*, *Routing Dinamis/Statis*, *Throughput*, *Latensi*, *Automasi Operasional*.
- **Domain Empiris**: *Kendala Implementasi*, *Beban Kognitif Petugas*, *Duplikasi Input Data*, *Evaluasi Empiris*, *Tingkat Kesiapan*.

### B. Aturan Penyusunan Kalimat:
1. **Gunakan Kalimat Sebab-Akibat Kompleks yang Runtut**:
   - *Bukan:* "Sistemnya banyak. Petugas jadi pusing dan lama memasukkan data."
   - *Gaya MAS-AGUS:* "Proliferasi sistem informasi yang berdiri sendiri tanpa interoperabilitas data mengakibatkan tingginya beban duplikasi entri data dan kelelahan kredensial (*credential fatigue*) pada tingkat operator lapangan."
2. **Hindari Bahasa Sensasional / Clickbait**:
   - Dilarang menggunakan frasa kosong seperti: *"Cara revolusioner yang wajib Anda coba sekarang juga!"*
   - Gunakan pernyataan berbobot: *"Evaluasi komparatif menunjukkan bahwa transisi menuju arsitektur terdesentralisasi mereduksi redundansi data hingga 60%."*
3. **Penyisipan Rujukan & Standar (Citation Culture)**:
   - Setiap argumen konseptual atau angka statistik dalam teks harus dinotasikan dengan tanda sitasi `[n]` atau menyebutkan lembaga sumber (*UN E-Government Survey*, *BPS*, *RFC standard*, *Dokumentasi Resmi MikroTik*).

---

## 4. CONTOH TRANSFORMASI GAYA PENULISAN

Berikut contoh perbedaan teks standar vs teks yang telah disesuaikan dengan DNA kepenulisan MAS-AGUS:

| Topik | Draf Umum (Biasa) | Transformasi Gaya MAS-AGUS |
| :--- | :--- | :--- |
| **Jaringan Komputer (MikroTik)** | "MikroTik sangat bagus untuk kantor karena fiturnya lengkap dan murah. RouterOS v7 juga punya banyak update baru seperti WireGuard." | "Dalam lanskap infrastruktur jaringan terdistribusi, MikroTik RouterOS menghadirkan efisiensi fungsional dengan mengonsolidasikan routing dinamis, manajemen antrean (QoS), dan filtrasi keamanan dalam satu sistem operasi. Evolusi arsitektur menuju RouterOS v7 membawa pembaruan mendasar pada kernel Linux dan *routing engine*, memungkinkan implementasi protokol modern seperti WireGuard dan VXLAN guna menjawab kebutuhan interkoneksi kampus dan instansi pemerintah yang semakin kompleks." |
| **Web Jamstack & Astro** | "Astro bikin website jadi cepat karena tidak ada javascript yang berat. Cocok untuk SEO dan AdSense." | "Pendekatan konvensional berbasis CMS monolitik dinamis kerap memicu degradasi performa akibat beban komputasi server (*server compute overhead*) dan *payload* JavaScript berlebih. Mengadopsi arsitektur Jamstack melalui Astro dengan paradigma *Island Architecture* memungkinkan eliminasi eksekusi skrip klien yang tidak esensial, menghasilkan skor Core Web Vitals optimal yang secara langsung memperkuat otoritas teknis SEO dan kepatuhan standar penerbitan digital." |

---

## 5. INSTRUKSI PROMPT UNTUK GENERASI KONTEN MENDATANG

Gunakan instruksi baku berikut saat mengarahkan AI untuk menulis konten baru dengan gaya MAS-AGUS:

```markdown
Tulis artikel/kajian berikut menggunakan "MAS-AGUS Finger Writing Style Guide":
1. Peran/Persona: Akademisi-Praktisi Sistem Informasi & Arsitek Jaringan Komputer.
2. Alur Pembahasan (5 Tahap):
   - Tahap 1: Konteks Makro, definisi formal, dan landasan regulasi/standar industri.
   - Tahap 2: Benchmarking empiris, survei global/nasional, paradoks kemajuan vs kendala sektoral.
   - Tahap 3: Kesenjangan teori/literatur, statistik probabilitas kegagalan, kendala SDM & literasi.
   - Tahap 4: Masalah nyata di tingkat mikro lapangan (silo sistem, duplikasi kerja, beban operator).
   - Tahap 5: Solusi arsitektur rekayasa konkret dan kontribusi praktis yang terukur.
3. Nada & Diksi: Akademis formal, analitis, padat rujukan sitasi [n], lugas tanpa istilah sensasional.
4. Integritas Sitasi: Wajib mematuhi "Zero Hallucination Policy" — seluruh sitasi dan referensi harus nyata, valid, terindeks di Google Scholar/Scopus/SINTA, dan dapat diverifikasi. Dilarang mengarang sitasi atau DOI fiktif.
```

---

## 6. ATURAN INTEGRITAS DAN KETERTELUSURAN SITASI (ZERO HALLUCINATION & CITATION TRACEABILITY POLICY)

Kredibilitas platform **MAS-AGUS Knowledge Hub** bertumpu pada integritas akademis. Oleh karena itu, aturan ketertelusuran sitasi di bawah ini bersifat **mutlak (*non-negotiable*)** bagi seluruh agen AI, penulis, dan kontributor:

### A. Prinsip Nol Halusinasi (*Zero Hallucination Policy*)
1. **Dilarang Keras Mengarang Data Sitasi**: Tidak diperbolehkan menciptakan nama penulis fiktif, judul artikel karangan, nama jurnal buatan, volume/nomor karangan, ataupun *Digital Object Identifier* (DOI) palsu.
2. **Kewajiban Verifikasi Dua Arah**: Setiap sitasi angka, persentase, definisi teoritis, atau temuan studi empiris wajib berasal dari literatur yang benar-benar telah diterbitkan (*peer-reviewed* atau laporan resmi pemerintah/lembaga internasional).
3. **Ketertelusuran Publik (*Public Traceability*)**: Setiap naskah rujukan harus dapat ditemukan dan diverifikasi melalui salah satu kanal berikut:
   - **DOI resmi** (misal: `https://doi.org/10.1109/...` atau `https://doi.org/10.29207/...`).
   - **Google Scholar** (profil resmi terverifikasi).
   - **Scopus / ScienceDirect / IEEE Xplore / ACM Digital Library / SpringerLink / Taylor & Francis**.
   - **SINTA Kemdiktisaintek** (portal akreditasi jurnal ilmiah nasional).
   - **Jaringan Dokumentasi dan Informasi Hukum (JDIH)** BPK / Setneg untuk regulasi UU/Perpres/Inpres.
   - **Standar Teknis Resmi**: IETF RFC, ISO/IEC, NIST, atau dokumentasi resmi vendor (seperti MikroTik Documentation).

### B. Kaidah Sitasi Korpus Riset Penulis (*Author's Own Corpus Rule*)
Ketika artikel membahas studi kasus terapan di tingkat daerah, pemodelan integrasi data Organisasi Perangkat Daerah (OPD), evaluasi SPBE, implementasi REST API di Dinas Pertanian Kabupaten Jombang, sistem informasi mutu perguruan tinggi, klasifikasi data, atau virtualisasi jaringan, **wajib menggunakan rujukan otentik dari karya ilmiah Agus Sifaunajah yang terindeks di Google Scholar / Scopus**:

| Topik Kajian Lapangan | Naskah Rujukan Otentik Penulis | Forum Publikasi & Identitas |
| :--- | :--- | :--- |
| **Integrasi REST API Pertanian Jombang** | A. Sifaunajah et al., *"RESTful Web Service Architecture for Secure and Efficient Agricultural Data Integration in Jombang Regency"* | IEEE ICIMCIS 2024, pp. 856–863. |
| **Model API Integrasi Data E-Government** | A. Sifaunajah et al., *"Model Implementation of Application Programming Interface for E-Goverment Data Integration"* | IEEE ICIC 2022, pp. 1–6. |
| **Sistem Layanan Penyuluhan Pertanian** | A. Sifaunajah et al., *"Improving Agricultural Extension Services Through Dashboard Agricultural Land Data"* | Publikasi Riset Pertanian 2022. |
| **Adopsi & Determinan SPBE** | A. Sifaunajah, M. Z. Arifin, & N. Yaqin, *"Contextual Determinants of Theoretical Effectiveness in E-Government Adoption: A Systematic Review"* | Multidiscipline Int. Conf. 2025, vol. 3, no. 1, pp. 232–247. |
| **Sistem Penjaminan Mutu Perguruan Tinggi** | N. Fauziyah & A. Sifaunajah, *"Design and Development of an Interactive Audit Analytics Dashboard for Higher Education Quality Assurance"* | SAINTEKBU 2026, vol. 18, no. 1, pp. 21–31. |
| **Audit Mutu: Audit Trail & Aktivitas** | Y. N. Aditya & A. Sifaunajah, *"Pengembangan Fitur Audit Trail untuk Pelacakan Aktivitas Pengguna pada Sistem Informasi Audit Mutu"* | JUARA (Jurnal Rekayasa Piranti Lunak) 2026, vol. 1, no. 1, pp. 15–25. |
| **Audit Mutu: Notifikasi & Reminder** | A. N. R. Rasyid & A. Sifaunajah, *"Pengembangan Modul Notifikasi dan Pengingat Pada Sistem Informasi Manajemen Audit Mutu"* | JUARA 2026, vol. 1, no. 1, pp. 26–36. |
| **Virtualisasi Proxmox & Monitoring** | F. T. Setiawan & A. Sifaunajah, *"Implementasi Virtualisasi Server Berbasis Proxmox VE: Monitoring Resource Zabbix dan Notifikasi WhatsApp Gateway"* | JUSAKI 2026, vol. 1, no. 1. |
| **ERP Terintegrasi & Multi-Modul** | R. S. Nugroho, M. A. A. Widya, & A. Sifaunajah, *"Integrasi Multi-Modul Berbasis Enterprise Resource Planning di UD. Karya Sejati Jombang"* | Jurnal Manajemen dan Teknologi Informasi 2026, vol. 6, no. 2, pp. 16–27. |
| **Pariwisata Digital & Persuasi** | M. Fahimah, A. Sifaunajah, S. N. Qomariyah, & W. Rafdinal, *"From stories to visits: an integrated digital persuasion model of visit intention in Indonesian heritage tourism destinations"* | International Journal of Tourism Cities (Taylor & Francis / Emerald) 2026. |
| **Optimasi Kueri Basis Data Alumni** | A. Sifaunajah & R. T. Khusna, *"Application of Index for Optimization Query Data in Graduate Information Systems"* | IJAIT (Int. J. Applied Information Technology) 2021, pp. 90–98. |
| **Clustering Data Alumni (K-Means)** | A. Sifaunajah, M. Z. Arifin, & H. Q. Tabiin, *"Implementation of The K-Mean Algorithm for Data Clustering in Alumni Data Information Systems"* | NEWTON 2022, vol. 2, no. 2, pp. 89–98. |
| **Keamanan Informasi Dokumen (Rijndael)**| A. Sifaunajah, *"Implementasi Algoritma Rijndael pada Dokumen Elektronik untuk Keamanan Informasi"* | EPiC 2020, vol. 2, no. 2, pp. 255–258. |
| **Sistem Informasi Sasaran Kerja Pegawai**| A. Sifaunajah & K. Adi, *"Design Information System of Employees Target with Neural Network Backpropagation"* | JARES 2017, vol. 2, no. 1, p. 5 (Tesis Magister UNDIP 2015). |

### C. Standar Penulisan Daftar Referensi IEEE
Setiap artikel wajib menutup pembahasannya dengan daftar referensi bernomor urut sesuai kemunculan sitasi dalam teks `[1]`, `[2]`, `[3]`, dengan format IEEE standar berikut:

```markdown
[1] A. Sifaunajah, R. D. Amalia, D. A. Lestari, M. Z. Arifin, N. Khafidhoh, and N. Yaqin, "RESTful Web Service Architecture for Secure and Efficient Agricultural Data Integration in Jombang Regency," in 2024 International Conference on Informatics, Multimedia, Cyber and Information System (ICIMCIS), IEEE, 2024, pp. 856–863.
[2] R. Heeks, "Most eGovernment-for-development projects fail: How can risks be reduced?," iGovernment Working Paper Series, no. 14, Institute for Development Policy and Management, University of Manchester, 2003.
[3] Republik Indonesia, Peraturan Presiden Republik Indonesia Nomor 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik. Jakarta: Kementerian Sekretariat Negara RI, 2018.
```

### D. Daftar Periksa Verifikasi Pra-Publikasi (*Pre-Publication Verification Checklist*)
Sebelum naskah artikel diterbitkan atau dikompilasi ke dalam repositori, wajib memenuhi 4 parameter verifikasi:
- [ ] **Klaim vs Bukti**: Apakah seluruh klaim kuantitatif atau temuan empiris diiringi nomor sitasi `[n]`?
- [ ] **Validitas Sumber**: Apakah seluruh entri di daftar referensi benar-benar ada dan dapat dicari di Google Scholar / repositori resmi?
- [ ] **Ketepatan Kasus Empiris**: Jika membahas kasus Dinas Pertanian Jombang, apakah mengutip publikasi IEEE ICIMCIS 2024 atau IEEE ICIC 2022 milik Agus Sifaunajah et al.?
- [ ] **Konsistensi DOI / URL**: Apakah tautan atau identifikasi dokumen yang dicantumkan berfungsi dan tidak rusak?
