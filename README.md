# MAS-AGUS — Personal Website & Professional Knowledge Hub

Situs web personal profesional dan pusat pengetahuan mandiri untuk **Agus Sifaunajah (MAS-AGUS)**, yang memadukan keahlian akademis, riset ilmiah, arsitektur sistem informasi, dan rekayasa perangkat lunak modern.

- **URL Produksi**: [https://agus1991.github.io](https://agus1991.github.io)
- **Domain Utama**: [https://askapubliser.biz.id](https://askapubliser.biz.id)
- **Repositori GitHub**: [https://github.com/agus1991/agus1991.github.io](https://github.com/agus1991/agus1991.github.io)
- **Hosting**: GitHub Pages via GitHub Actions (Native GitHub Pages: agus1991.github.io)

---

## 1. TEKNOLOGI & ARSITEKTUR

Situs ini dibangun dengan prinsip rekayasa web modern berorientasi performa tinggi dan nol pemeliharaan server dinamis (*zero-maintenance static architecture*):

- **Astro (v5)**: Static Site Generation (SSG) dengan paradigma *Islands Architecture* (0 KB JS klien secara default pada konten naskah).
- **TypeScript**: Jaminan tipe data ketat dan integritas skema konten.
- **Tailwind CSS**: Desain sistem bergaya *Elegant Minimalist Editorial* dengan dukungan tema gelap (*dark mode*) yang persisten.
- **Astro Content Collections**: Validasi skema frontmatter artikel markdown menggunakan Zod.
- **Typography & Desain**: Google Fonts Lora (Headings) dan Inter (Body text) dengan palet warna natural editorial (`#F8F7F4`, `#FFFFFF`, `#252525`, `#777777`, `#A58B62`, `#E8E5DF`).
- **Technical SEO & Schema.org JSON-LD**: Metadata lengkap (Open Graph, Twitter Cards, Sitemap XML, robots.txt, BreadcrumbList, Person, WebSite, ProfilePage, BlogPosting).
- **Google AdSense Ready**: Komponen periklanan modular yang menjaga skor Core Web Vitals (dinonaktifkan secara aman sampai terverifikasi).
- **CI/CD Otomatis**: GitHub Actions workflow untuk kompilasi dan deployment otomatis ke GitHub Pages.

---

## 2. STRUKTUR DIREKTORI PROYEK

```text
web_profil/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Otomatisasi GitHub Actions deployment
├── public/
│   ├── images/
│   │   ├── articles/               # Sampul artikel blog (SVG/WebP)
│   │   ├── profile/                # Foto profil avatar SVG
│   │   └── projects/               # Sampul portofolio proyek
│   ├── ads.txt                     # Berkas verifikasi Google AdSense
│   ├── favicon.svg                 # Ikon situs monogram editorial
│   └── robots.txt                  # Direktif crawler mesin pencari
├── src/
│   ├── components/                 # Komponen antarmuka modular
│   │   ├── AdSenseScript.astro     # Penyuntik skrip AdSense aman
│   │   ├── AdSlot.astro            # Kontainer iklan anti-CLS
│   │   ├── ArticleAd.astro         # Penempatan iklan dalam artikel
│   │   ├── SidebarAd.astro         # Penempatan iklan bilah samping
│   │   ├── ArticleCard.astro       # Kartu artikel blog
│   │   ├── FeaturedArticle.astro   # Kartu artikel sorotan utama
│   │   ├── BaseHead.astro          # Metadata SEO, Open Graph & Fonts
│   │   ├── Breadcrumb.astro        # Navigasi remah roti + JSON-LD
│   │   ├── Header.astro            # Navigasi header & menu responsif
│   │   ├── Footer.astro            # Footer & tautan legal
│   │   ├── JsonLd.astro            # Komponen render Schema.org
│   │   ├── ReadingProgress.astro   # Indikator progres baca artikel
│   │   ├── SocialShare.astro       # Tombol berbagi media sosial
│   │   ├── TableOfContents.astro   # Daftar isi artikel otomatis
│   │   └── ThemeToggle.astro       # Pengalih tema gelap/terang
│   ├── content/
│   │   ├── config.ts               # Skema validasi Astro Content Collections
│   │   └── blog/                   # Naskah artikel Markdown (.md)
│   ├── data/                       # Pusat data terpusat (No Hardcoding UI)
│   │   ├── profile.json            # Biodata, riwayat akademis, keahlian
│   │   ├── social.json             # Tautan SINTA, Scopus, Scholar, ORCID, GitHub, LinkedIn
│   │   ├── site.json               # Konfigurasi situs & AdSense
│   │   ├── navigation.json         # Menu navigasi & kategori blog
│   │   ├── research.json           # Roadmap riset, ongoing, metodologi
│   │   ├── publications.json       # Daftar publikasi ilmiah & DOI
│   │   └── projects.json           # Portofolio proyek teknologi
│   ├── layouts/
│   │   ├── BaseLayout.astro        # Layout dasar situs
│   │   ├── PageLayout.astro        # Layout halaman informasi standar
│   │   └── ArticleLayout.astro     # Layout artikel blog membaca nyaman
│   ├── pages/                      # Rute halaman website
│   │   ├── index.astro             # Beranda (Homepage)
│   │   ├── about.astro             # Tentang Saya (/about)
│   │   ├── blog/
│   │   │   ├── index.astro         # Indeks Blog, pencarian, & filter
│   │   │   └── [...slug].astro     # Detail artikel dinamis (/blog/[slug])
│   │   ├── research/index.astro    # Halaman Riset & Roadmap (/research)
│   │   ├── publications/index.astro# Halaman Publikasi Ilmiah (/publications)
│   │   ├── projects/index.astro    # Halaman Proyek (/projects)
│   │   ├── contact.astro           # Halaman Kontak & Kolaborasi (/contact)
│   │   ├── privacy-policy.astro    # Kebijakan Privasi (/privacy-policy)
│   │   ├── disclaimer.astro        # Penafian (/disclaimer)
│   │   ├── terms-and-conditions.astro # Syarat & Ketentuan (/terms-and-conditions)
│   │   └── 404.astro               # Halaman 404 Not Found
│   ├── styles/
│   │   └── global.css              # Variabel CSS & gaya typography editorial
│   └── utils/
│       ├── formatDate.ts          # Format tanggal lokal Indonesia
│       ├── readingTime.ts         # Kalkulator estimasi waktu baca
│       └── seo.ts                 # Generator skema Schema.org JSON-LD
├── astro.config.mjs                # Konfigurasi Astro, Tailwind, Sitemap, MDX
├── tailwind.config.mjs             # Konfigurasi sistem warna & tipografi
├── tsconfig.json                   # Konfigurasi TypeScript path aliases
├── README.md                       # Dokumentasi arsitektur utama
├── WRITING_STYLE_GUIDE.md          # Panduan baku DNA gaya kepenulisan MAS-AGUS
├── README_CONTENT.md               # Panduan alur pembaruan konten
├── DEPLOYMENT.md                   # Panduan deployment & DNS GitHub Pages
└── ADSENSE_SETUP.md                # Panduan aktivasi Google AdSense
```

---

## 3. INSTALASI & PENGEMBANGAN LOKAL

### Prasyarat
- Node.js versi 18.x atau 20.x (disarankan 20 LTS).
- Pengelola paket `npm`.

### Menjalankan Server Lokal:
```bash
# 1. Masuk ke direktori proyek
cd d:\laragon8\www\web_profil

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```
Akses pratinjau di browser: `http://localhost:4321`.

### Kompilasi Produksi (Production Build):
```bash
npm run build
```
Hasil kompilasi statis akan berada di dalam direktori `dist/` siap saji untuk GitHub Pages.

### Pratinjau Hasil Kompilasi:
```bash
npm run preview
```

---

## 4. DOKUMENTASI TERKAIT

Untuk mempermudah pengelolaan harian, silakan pelajari panduan terpisah berikut:
- **Pengelolaan & Penulisan Konten**: Baca [README_CONTENT.md](file:///d:/laragon8/www/web_profil/README_CONTENT.md)
- **Deployment & Pengaturan DNS Domain**: Baca [DEPLOYMENT.md](file:///d:/laragon8/www/web_profil/DEPLOYMENT.md)
- **Aktivasi & Kepatuhan Iklan**: Baca [ADSENSE_SETUP.md](file:///d:/laragon8/www/web_profil/ADSENSE_SETUP.md)

---

## 5. LISENSI & HAK CIPTA

Hak Cipta &copy; 2026 **Agus Sifaunajah (MAS-AGUS)**. Seluruh hak dilindungi undang-undang.
Kode sumber arsitektur web dilisensikan di bawah [MIT License](https://opensource.org/licenses/MIT).
# web_profil
# agus1991
# agus1991.github.io
