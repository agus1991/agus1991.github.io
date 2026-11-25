---
title: "Kesenjangan Penerapan TIK Pusat dan Daerah: Dilema Sistem Silo dan Interoperabilitas SPBE"
description: "Kajian mendalam disparitas adopsi teknologi informasi antara kementerian pusat dan pemerintah daerah, analisis beban aplikasi vertikal pada Organisasi Perangkat Daerah (OPD), serta perancangan arsitektur jaringan dan integrasi API terdistribusi."
pubDate: 2026-11-17
updatedDate: 2026-11-17
category: "Information Systems"
tags:
  - SPBE
  - Digital Governance
  - Information Systems
  - Computer Networks
  - REST API
  - Enterprise Architecture
featured: true
draft: false
cover: "/images/articles/kesenjangan-ict-pusat-daerah.svg"
coverAlt: "Infografis perbandingan kesenjangan indeks SPBE antara pemerintah pusat dan daerah serta solusi interoperabilitas data"
seoTitle: "Kesenjangan TIK Pusat dan Daerah: Dilema Sistem Silo & SPBE — MAS-AGUS"
seoDescription: "Analisis kritis kesenjangan penerapan ICT di instansi pemerintah pusat dan daerah, fenomena aplikasi silo di OPD, serta arsitektur solusi integrasi terpadu."
focusKeyword: "Kesenjangan Penerapan ICT Pemerintah Pusat Daerah SPBE"
lang: "id"
translationSlug: "ict-implementation-divide-between-central-and-local-governments"
---

> **Informasi Kajian Ilmiah:**  
> **Ruang Lingkup:** Tata Kelola Teknologi Informasi dan Komunikasi (TIK), Sistem Pemerintahan Berbasis Elektronik (SPBE), Disparitas Infrastruktur Digital, dan Tata Kelola Data Satu Data Indonesia.  
> **Metode Pendekatan:** Analisis Regulasi Kebijakan Publik, Benchmarking Komparatif Indeks SPBE Nasional, Evaluasi Empiris Lapangan, dan Rekayasa Arsitektur Jaringan Terdistribusi.

---

## Pendahuluan

Penerapan teknologi informasi dan komunikasi (*Information and Communication Technology / ICT*) dalam tata kelola sektor publik diakui secara global sebagai instrumen determinan dalam mendorong efisiensi birokrasi, transparansi fiskal, dan kualitas pelayanan kepada masyarakat [1][2]. Di Indonesia, transformasi ini diorkestrasi melalui kebijakan **Sistem Pemerintahan Berbasis Elektronik (SPBE)**, yang berakar dari **Instruksi Presiden Republik Indonesia No. 3 Tahun 2003** dan ditegaskan secara komprehensif melalui **Peraturan Presiden No. 95 Tahun 2018 tentang SPBE** serta **Peraturan Presiden No. 39 Tahun 2019 tentang Satu Data Indonesia (SDI)** [3][4].

Regulasi tersebut mengamanatkan arsitektur teknologi yang terpadu, interoperabel, dan aman guna menghapus ego-sektoral kelembagaan. Pemerintah pusat telah merancang peta jalan ambisius yang mencakup pembangunan Pusat Data Nasional (PDN), jaringan intra-pemerintah, dan platform layanan digital terintegrasi (*GovTech*) [4].

Kendati demikian, dalam realitas implementasi di lapangan, terdapat jurang disparitas yang menganga lebar antara kapasitas komputasi di tingkat kementerian/lembaga pusat dengan kapasitas operasional di tingkat pemerintah daerah (kabupaten/kota). Alih-alih melahirkan integrasi nasional yang mulus, gelombang digitalisasi yang berjalan asimetris ini kerap memicu fragmentasi sistem informasi baru, kelelahan kredensial aparatur, dan pembengkakan inefisiensi anggaran pada level operasional bawah.

---

## 1. Paradoks Kinerja: Benchmarking Indeks SPBE Pusat vs Realitas Daerah

Evaluasi tahunan tingkat kematangan SPBE yang dirilis oleh Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (KemenPAN-RB) memperlihatkan kontras yang tajam antara capaian agregat kementerian pusat melawan realitas di pemerintah kabupaten dan kota [5][6].

Berdasarkan data komposit nasional, mayoritas Kementerian dan Lembaga (K/L) di tingkat pusat berhasil membukukan indeks SPBE pada rentang **3,50 hingga 4,20** dengan predikat *"Sangat Baik"* hingga *"Memuaskan"*. Sebaliknya, lebih dari **65% Pemerintah Kabupaten dan Kota di luar kawasan metropolitan Pulau Jawa masih berkutat pada skor di bawah 2,60** dengan predikat *"Cukup"* atau bahkan *"Kurang"* [5][7].

| Dimensi Komparasi | Pemerintah Pusat (K/L) | Pemerintah Daerah (Kabupaten / Kota) |
| :--- | :--- | :--- |
| **Indeks Kematangan SPBE** | Rata-rata **> 3,65** *(Predikat: Sangat Baik / Baik)* | Rata-rata **< 2,50** *(Predikat: Cukup / Kurang)* |
| **Kapasitas Komputasi** | Akses Pusat Data Nasional (PDN) & Multi-Cloud | Server Lokal Sering Tanpa Redundansi Daya Listrik |
| **Arsitektur Sistem** | Microservices Terstandarisasi & API Terkelola | Sistem Silo Sektoral Tanpa Jembatan Pertukaran Data |
| **Ketersediaan SDM** | Analis Sistem & Perekayasa Terdedikasi | Defisit Pranata Komputer & Insinyur Bersertifikasi |
| **Konektivitas Jaringan** | Backbone Serat Optik 100G Terproteksi | Ketergantungan Akses Internet Publik Rentan Gangguan |

Data Badan Pusat Statistik (BPS) dan Kementerian Komunikasi dan Digital (Komdigi) menegaskan bahwa disparitas ini berakar pada ketimpangan infrastruktur fisik dan alokasi sumber daya fiskal [7]. Ketika instansi pusat telah menguji coba arsitektur kecerdasan artifisial dan integrasi *multi-cloud*, dinas-dinas teknis di daerah terpencil masih harus berhadapan dengan masalah infrastruktur dasar: pemadaman listrik berkala (*power outages*), ketiadaan jalur internet cadangan (*failover link*), dan keterbatasan kapasitas bandwidth kantor kecamatan yang minim [7][8]. Kerentanan infrastruktur ini pada akhirnya juga memperlebar celah eksploitasi keamanan siber di tingkat daerah, sebagaimana saya kupas dalam [Refleksi Kritis Kerentanan Infrastruktur Digital Indonesia](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia).

---

## 2. Kesenjangan Teoretis: Tiga Tingkatan Digital Divide dalam Tata Kelola Publik

Secara teoretis, kegagalan adopsi teknologi di sektor publik daerah tidak dapat disederhanakan semata-mata sebagai persoalan "ketiadaan perangkat keras". Dalam literatur sosiologi komputasi, fenomena ini dikaji melalui kerangka **Tiga Tingkatan Kesenjangan Digital (*Three Levels of Digital Divide*)** [8][9]:

1. **First-Level Digital Divide (Akses Fisik & Infrastruktur)**: Kesenjangan ketersediaan jaringan kabel serat optik, perangkat router kelas industri, pusat data bersertifikasi Tier, dan kestabilan daya listrik antara ibukota negara dengan daerah otonom [8].
2. **Second-Level Digital Divide (Keterampilan & Kapabilitas SDM)**: Kesenjangan kompetensi teknis aparatur sipil negara (ASN). Instansi pusat memiliki kemewahan untuk merekrut konsultan arsitektur perangkat lunak independen, sementara dinas daerah kerap membebankan pengelolaan seluruh jaringan dan aplikasi kepada segelintir staf fungsional umum tanpa sertifikasi profesional [9].
3. **Third-Level Digital Divide (Dampak Kemanfaatan Kebijakan)**: Ketidakmampuan pemerintah daerah dalam memanfaatkan data yang telah dihimpun untuk pengambilan keputusan taktis (*evidence-based policymaking*), sehingga data yang diinput hanya berakhir sebagai arsip mati tanpa nilai analitis [9].

Dalam studinya mengenai kegagalan proyek e-government di negara berkembang, Heeks (2003) menemukan bahwa **tingkat kegagalan (*failure rate*) inisiatif digitalisasi mencapai 85%**, di mana kegagalan total mencapai 35% dan kegagalan parsial mencapai 50% [10]. Penyebab utamanya adalah *Design-Actuality Gaps*—jurang pemisah yang lebar antara asumsi desain sistem yang dirancang idealis oleh perumus kebijakan di Jakarta dengan kenyataan operasional aparatur birokrasi di daerah [10][11].

---

## 3. Studi Kasus Empiris: Problematika Silo dan Beban Aplikasi di Tingkat OPD

Pengamatan lapangan langsung pada berbagai Organisasi Perangkat Daerah (OPD) teknis di tingkat kabupaten/kota (seperti Dinas Pertanian, Dinas Kesehatan, dan Disdukcapil) mengungkap tiga friksi operasional yang sangat membebani aparatur [11]:

### A. Tsunami Aplikasi Vertikal Pusat (*Vertical Application Sprawl*)
Setiap kementerian di tingkat pusat memiliki kecenderungan membangun aplikasi vertikal masing-masing dan mewajibkan dinas di seluruh Indonesia untuk mengisinya secara berkala:
- Kementerian Dalam Negeri mewajibkan SIPD (Sistem Informasi Pembangunan Daerah).
- Badan Kepegawaian Negara mewajibkan SIASN (Sistem Informasi Aparatur Sipil Negara).
- Kementerian Keuangan, KemenPAN-RB, dan kementerian sektoral lainnya mewajibkan pelaporan melalui portal terpisah.

Masalah mendasar muncul karena **aplikasi-aplikasi vertikal dari pusat tersebut tidak menyediakan antarmuka pertukaran data (API) dua arah yang dapat diakses oleh server pemerintah daerah** [11]. Pemerintah daerah dilarang mengakses basis data mentah, namun diwajibkan menyuplai data setiap hari.

### B. Kelelahan Kredensial dan Duplikasi Entri Data (*Credential Fatigue & Repeated Input*)
Akibat nihilnya interoperabilitas, operator ASN di tingkat daerah mengalami beban kerja ganda yang sangat melelahkan (*burnout* administratif):
- Operator harus menginput data penerima bantuan komoditas ke dalam sistem internal dinas kabupaten.
- Operator yang sama kemudian harus membuka jendela peramban lain, mengingat kembali puluhan akun *username* dan *password* yang berbeda-beda (*credential fatigue*), lalu mengetikkan ulang data identik tersebut ke dalam sistem *E-Office* kabupaten dan aplikasi kementerian pusat.

```
ALUR KERJA DUPLIKASI MANUAL OPERATOR DAERAH:

[Operator ASN Lapangan]
   ├── 1. Entri Manual Pertama   ──> [Aplikasi Sektoral OPD Daerah]
   ├── 2. Entri Ulang Kedua      ──> [Aplikasi E-Office Pemkab]
   └── 3. Entri Ulang Ketiga     ──> [Aplikasi Vertikal Kementerian Pusat]
   
*Dampak: Beban jam kerja terkuras habis, inkonsistensi data, dan kelelahan kredensial.*
```

### C. Jebakan Pengembang Pihak Ketiga (*Turnkey Vendor Trap*)
Keterbatasan anggaran dan minimnya insinyur perangkat lunak internal mendorong Diskominfo daerah mengontrak vendor pihak ketiga jangka pendek untuk membangun aplikasi pesanan (*custom software*). Ironisnya, ketika masa kontrak selesai, kode sumber (*source code*) dan dokumentasi arsitektur tidak diserahkan secara utuh. Saat terjadi galat (*bug*) atau perubahan regulasi, sistem tersebut terbengkalai dan menjadi tumpukan "aplikasi zombie" yang membuang anggaran daerah [11][12].

---

## 4. Solusi Rekayasa Arsitektur: Jembatan Interoperabilitas Data dan Infrastruktur Tangguh

Guna mengatasi kesenjangan struktural antara pusat dan daerah, transformasi digital tidak boleh lagi berfokus pada pengadaan perangkat keras baru, melainkan pada **pembangunan jembatan interoperabilitas data terdistribusi dan rekayasa jaringan yang tangguh** [12][13].

```
ARSITEKTUR INTEROPERABILITAS DATA TERPADU:

┌────────────────────────────────────────────────────────┐
│               KEMENTERIAN PUSAT / PDN                  │
│       (SIPD, SIASN, Portal Nasional Satu Data)         │
└───────────────────────────▲────────────────────────────┘
                            │ REST API (JSON Schema Terstandarisasi)
                            │ Token-Based Auth (OAuth2 / JWT)
┌───────────────────────────▼────────────────────────────┐
│      REGIONAL API GATEWAY (DISKOMINFO KABUPATEN)       │
│  ├─ Middleware Sinkronisasi Asinkron (Message Broker)  │
│  ├─ Validasi Skema Metadata Satu Data Indonesia (SDI)  │
│  └─ Single Sign-On (SSO) Terpusat Bagi Operator OPD    │
└───────────▲────────────────────────────────▲───────────┘
            │                                │
    ┌───────▼────────┐               ┌───────▼────────┐
    │  OPD Pertanian │               │   OPD Medis    │
    │ (RouterOS WAN) │               │ (RouterOS WAN) │
    └────────────────┘               └────────────────┘
```

### A. Pembangunan Regional API Gateway & Middleware Berbasis REST API
Pemerintah kabupaten/kota wajib membangun pintu gerbang antarmuka (*API Gateway*) terpusat di Diskominfo daerah [12][13]. Setiap kali operator dinas teknis memasukkan data ke aplikasi lokal, sistem secara otomatis mengeksekusi panggilan API (*RESTful Web Services*) secara asinkron ke server kabupaten dan kementerian pusat. Mekanisme ini menghapus praktik entri data berulang secara permanen dan merealisasikan prinsip *Single Source of Truth* [13], sebagaimana dibuktikan secara empiris dalam arsitektur integrasi data pada Organisasi Perangkat Daerah di Kabupaten Jombang [15]—sebuah studi kasus yang diulas lebih mendalam dalam artikel [Transformasi Digital SPBE dan Integrasi REST API](/blog/transformasi-digital-dalam-sistem-informasi).

### B. Otentikasi Terpadu: Single Sign-On (SSO) Berbasis Protokol OAuth2/JWT
Mengintegrasikan seluruh sistem informasi di lingkungan pemerintah daerah ke dalam satu direktori otentikasi terpusat. Aparatur dinas hanya memerlukan satu identitas kredensial tunggal untuk mengakses seluruh ekosistem layanan, secara instan mengeliminasi *credential fatigue* dan meminimalisasi risiko kebocoran kata sandi.

### C. Rekayasa Jaringan Tangguh Berbasis SD-WAN dan MikroTik RouterOS
Di lapisan infrastruktur fisik, instansi daerah tidak boleh lagi mengandalkan perangkat jaringan kelas konsumen (*home-grade routers*) yang tidak memiliki manajemen antrean [14]. Penerapan perangkat berbasis **MikroTik RouterOS** di setiap kantor dinas dan kecamatan menghadirkan solusi berbiaya efisien dengan keandalan enterprise [14], sejalan dengan prinsip ketahanan jaringan yang saya paparkan dalam kajian [Sejarah dan Perkembangan MikroTik 1996–2026](/blog/perkembangan-mikrotik-1996-2026):
- **Multi-WAN Failover Otomatis**: Menggabungkan tautan serat optik utama dengan tautan seluler cadangan (LTE/5G via modem terintegrasi) menggunakan fitur *check-gateway* dan *routing table*, menjamin layanan publik tidak terputus saat kabel optik putus.
- **Manajemen Kualitas Layanan (*QoS & Queue Tree*)**: Memprioritaskan paket data transaksi basis data kependudukan dan aplikasi keuangan di atas lalu lintas browsing umum atau streaming multimedia.
- **Interkoneksi Aman via WireGuard/IPsec Tunnel**: Menghubungkan seluruh jaringan lokal kantor dinas ke pusat data Diskominfo melalui terowongan terenkripsi berkecepatan tinggi tanpa memerlukan sewa jalur privat (*leased line*) yang mahal.

---

## 5. Kesimpulan dan Rekomendasi Kebijakan

Kesenjangan penerapan ICT antara pemerintah pusat dan daerah adalah tantangan sosio-teknikal multidimensi yang tidak dapat diselesaikan hanya dengan mendistribusikan instruksi kepatuhan dari Jakarta.

Jika pemerintah pusat sungguh-sungguh berkomitmen mewujudkan kedaulatan data dan efisiensi birokrasi, maka paradigma kebijakan wajib diselaraskan:
1. **Buka Akses API Dua Arah**: Kementerian pusat wajib menghentikan praktik sistem tertutup (*walled garden*) dan membuka endpoint REST API terstandarisasi agar sistem daerah dapat berinteraksi secara otomatis.
2. **Standardisasi Arsitektur Terbuka di Daerah**: Pemerintah daerah harus mewajibkan setiap pengembang pihak ketiga menyerahkan kode sumber, skema basis data, dan dokumentasi API terbuka guna mencegah ketergantungan sepihak (*vendor lock-in*).
3. **Investasi Masif pada Sertifikasi SDM**: Pemerintah daerah wajib mengalokasikan anggaran untuk peningkatan kompetensi teknis ASN pranata komputer, khususnya sertifikasi arsitektur jaringan (seperti MikroTik MTCNA/MTCRE) dan rekayasa perangkat lunak modern.

Hanya dengan menyatukan kejelasan regulasi tata kelola, keterbukaan arsitektur pertukaran data, dan keandalan rekayasa infrastruktur jaringan di tingkat akar rumput, amanat SPBE dan Satu Data Indonesia dapat bertransformasi dari sekadar narasi administratif menjadi kenyataan pelayanan publik yang prima dan berkeadilan sosial.

---

## Referensi Ilmiah

[1] R. Heeks, *Implementing and Managing eGovernment: An International Text*. London: SAGE Publications, 2006.  
[2] J. E. Fountain, *Building the Virtual State: Information Technology and Institutional Change*. Washington, D.C.: Brookings Institution Press, 2001.  
[3] Republik Indonesia, *Instruksi Presiden Republik Indonesia Nomor 3 Tahun 2003 tentang Kebijakan dan Strategi Nasional Pengembangan E-Government*, Jakarta: Sekretariat Kabinet RI, 2003.  
[4] Republik Indonesia, *Peraturan Presiden Republik Indonesia Nomor 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik*, Jakarta: Kementerian Sekretariat Negara RI, 2018.  
[5] Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (KemenPAN-RB), *Laporan Hasil Evaluasi Sistem Pemerintahan Berbasis Elektronik (SPBE) Nasional*, Jakarta: KemenPAN-RB, 2023.  
[6] I. S. Widiarti and D. Napitupulu, "Evaluation of e-government implementation using SPBE maturity framework," *Journal of Physics: Conference Series*, vol. 1367, p. 012012, 2019.  
[7] Badan Pusat Statistik (BPS), *Statistik Telekomunikasi Indonesia: Potret Disparitas Akses Digital Antar-Wilayah*, Jakarta: BPS RI, 2024.  
[8] J. van Dijk, *The Deepening Divide: Inequality in the Information Society*. Thousand Oaks: SAGE Publications, 2005.  
[9] E. Ferro, J. R. Gil-Garcia, and N. C. Helbig, "The role of digital divide in e-government: A conceptual and empirical exploration," *Information Polity*, vol. 16, no. 1, pp. 3–17, 2011.  
[10] R. Heeks, "Most eGovernment-for-development projects fail: How can risks be reduced?," *iGovernment Working Paper Series*, no. 14, Institute for Development Policy and Management, University of Manchester, 2003.  
[11] B. Kurniawan, "Tantangan dan hambatan implementasi sistem pemerintahan berbasis elektronik pada pemerintah daerah," *Jurnal Borneo Administrator*, vol. 16, no. 2, pp. 215–234, 2020.  
[12] R. T. Fielding, "Architectural Styles and the Design of Network-based Software Architectures," Ph.D. dissertation, Dept. Inf. Comput. Sci., Univ. California, Irvine, CA, 2000.  
[13] C. Pautasso, O. Zimmermann, and F. Leymann, "RESTful web services vs. big'web services: making the right architectural decision," in *Proc. 17th Int. Conf. World Wide Web (WWW '08)*, Beijing, China, 2008, pp. 805–814.  
[14] MikroTik, "RouterOS v7 General Documentation: Policy Routing, Multi-WAN Failover, and WireGuard Tunneling Architectures," *MikroTik Documentation*, 2026. [Online]. Tersedia: https://help.mikrotik.com/docs/  
[15] A. Sifaunajah, R. D. Amalia, D. A. Lestari, M. Z. Arifin, N. Khafidhoh, and N. Yaqin, "RESTful Web Service Architecture for Secure and Efficient Agricultural Data Integration in Jombang Regency," in *2024 International Conference on Informatics, Multimedia, Cyber and Information System (ICIMCIS)*, IEEE, 2024, pp. 856–863, doi: 10.1109/ICIMCIS63365.2024.10842277.
