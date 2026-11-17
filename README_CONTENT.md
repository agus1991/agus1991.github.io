# PANDUAN PENGELOLAAN KONTEN (CONTENT UPDATE WORKFLOW)
## MAS-AGUS — Personal Website & Professional Knowledge Hub

Situs MAS-AGUS mengadopsi arsitektur **Content-Driven Static Site Generation (SSG)** berbasis Astro. Seluruh konten website (profil, blog, riset, publikasi, proyek, dan tautan sosial) dikelola melalui berkas teks terstruktur (**JSON** dan **Markdown / MDX**) tanpa memerlukan dashboard admin terpisah atau basis data yang rentan.

> [!TIP]
> Untuk menjaga konsistensi nada penulisan, otoritas ilmiah, dan struktur narasi, seluruh pembuatan artikel baru wajib mengacu pada **[PANDUAN GAYA KEPENULISAN (WRITING_STYLE_GUIDE.md)](./WRITING_STYLE_GUIDE.md)**.

---

## 1. STRUKTUR LOKASI KONTEN

| Jenis Konten | Lokasi Berkas | Format | Keterangan |
| :--- | :--- | :--- | :--- |
| **Profil Pribadi** | `src/data/profile.json` | JSON | Nama, headline, biografi, keahlian, riwayat pendidikan |
| **Media Sosial & Kontak** | `src/data/social.json` | JSON | Surel, LinkedIn, GitHub, Google Scholar, ORCID |
| **Artikel Blog** | `src/content/blog/*.md` | Markdown | Setiap artikel disimpan dalam berkas individual `.md` |
| **Riset & Metodologi** | `src/data/research.json` | JSON | Minat riset, ongoing research, metodologi, roadmap |
| **Publikasi Ilmiah** | `src/data/publications.json` | JSON | Jurnal, konferensi, tahun, DOI, abstrak, tautan |
| **Portofolio Proyek** | `src/data/projects.json` | JSON | Judul, deskripsi, tujuan, tech stack, status, URL |
| **Pengaturan Situs & AdSense** | `src/data/site.json` | JSON | Judul situs, konfigurasi Google AdSense |
| **Gambar & Media** | `public/images/` | WebP/SVG/JPG | Subdirektori `articles/`, `profile/`, `projects/` |

---

## 2. METODE PEMBARUAN KONTEN

### METODE A: Melalui Antigravity AI Agent atau VS Code

Ini adalah metode tercepat untuk pemilik situs saat bekerja di lingkungan lokal.

#### Contoh Prompt ke Antigravity:
1. **Membuat artikel baru:**
   > *"Antigravity, buatkan artikel baru di blog dengan judul 'Penerapan Enterprise Architecture Framework di Sektor Publik', kategori 'Information Systems', tags 'Enterprise Architecture', 'TOGAF', 'Governance'. Sertakan pembahasan mengenai tahapan TOGAF ADM dan studi kasus empiris."*

2. **Menambahkan publikasi baru:**
   > *"Antigravity, tambahkan publikasi baru ke `src/data/publications.json` untuk paper saya yang baru terbit di Jurnal XYZ tahun 2026 dengan DOI 10.1234/xyz.2026.01."*

3. **Memperbarui riwayat pengalaman atau kontak:**
   > *"Antigravity, perbarui jabatan saya di `src/data/profile.json` dan tambahkan tautan ResearchGate baru di `src/data/social.json`."*

---

### METODE B: Melalui Antarmuka Web GitHub (Tanpa Perlu Instalasi Lokal)

Pemilik situs dapat memperbarui konten kapan saja langsung dari browser (laptop maupun smartphone) melalui antarmuka web GitHub:

#### Langkah 1: Memperbarui Berkas JSON (Contoh: Menambah Publikasi)
1. Buka repositori Anda di browser: `https://github.com/agus1991/agus1991.github.io`
2. Navigasikan ke berkas target, misal: `src/data/publications.json`
3. Klik ikon pensil (**Edit this file**) di sudut kanan atas.
4. Tambahkan entri publikasi baru di dalam array:
   ```json
   {
     "id": "pub-2026-03",
     "title": "Judul Artikel Ilmiah Terbaru Anda",
     "authors": ["Agus Sifaunajah"],
     "venue": "Nama Jurnal atau Konferensi",
     "year": 2026,
     "type": "Journal",
     "doi": "10.xxxx/xxxxxx",
     "url": "https://agus1991.github.io/publications",
     "abstract": "Ringkasan abstrak artikel...",
     "featured": true
   }
   ```
5. Gulir ke bawah ke bagian **Commit changes...**, tulis pesan ringkas (misal: `Update publikasi 2026`), lalu klik **Commit changes**.
6. GitHub Actions akan secara otomatis mengompilasi dan mempublikasikan versi terbaru dalam hitungan detik.

---

#### Langkah 2: Menulis Artikel Blog Baru (.md)
1. Buka folder `src/content/blog/` di GitHub.
2. Klik tombol **Add file** &rarr; **Create new file**.
3. Beri nama berkas dengan format slug SEO, misalnya:
   `tata-kelola-teknologi-informasi-modern.md`
4. Isi bagian atas berkas dengan **Frontmatter YAML**:
   ```markdown
   ---
   title: "Tata Kelola Teknologi Informasi Modern untuk Organisasi Publik"
   description: "Panduan implementasi framework tata kelola TI dalam mencapai efisiensi birokrasi digital."
   pubDate: 2026-11-20
   updatedDate: 2026-11-20
   category: "Information Systems"
   tags:
     - Digital Governance
     - Information Systems
     - Enterprise Architecture
   featured: false
   draft: false
   cover: "/images/articles/default-cover.svg"
   coverAlt: "Ilustrasi tata kelola sistem informasi modern"
   seoTitle: "Tata Kelola TI Modern — MAS-AGUS"
   seoDescription: "Ulasan kerangka kerja tata kelola teknologi informasi modern."
   focusKeyword: "Tata Kelola TI"
   ---

   Tuliskan isi artikel Anda di sini menggunakan format Markdown standar.
   Gunakan heading tingkat 2 (##) dan heading tingkat 3 (###) untuk sub-pembahasan.
   ```
5. Klik **Commit changes**. GitHub Actions akan langsung memvalidasi schema dan mempublikasikan artikel ke `https://agus1991.github.io/blog/tata-kelola-teknologi-informasi-modern`.

---

#### Langkah 3: Mengunggah Gambar Baru
1. Buka folder `public/images/articles/` (atau `public/images/projects/`).
2. Klik **Add file** &rarr; **Upload files**.
3. Tarik atau pilih gambar dari komputer Anda (disarankan format `.webp` atau `.svg` beresolusi rasio 16:9).
4. Klik **Commit changes**.
5. Gunakan path relatif publik dalam artikel Anda, contoh: `cover: "/images/articles/nama-gambar-anda.webp"`.

---

## 3. PANDUAN PENULISAN MARKDOWN ARTIKEL

Astro mendukung fitur typography Markdown lengkap:
- **Heading 2**: `## Judul Bagian` (otomatis masuk ke Daftar Isi / Table of Contents)
- **Heading 3**: `### Sub-bagian`
- **Kutipan / Quote**: `> "Kutipan penting di sini"`
- **Blok Kode Berwarna**:
  ````markdown
  ```typescript
  const portal = "MAS-AGUS";
  console.log(`Knowledge hub for ${portal}`);
  ```
  ````
- **Tabel**:
  ```markdown
  | Parameter | Nilai Awal | Target |
  | :--- | :--- | :--- |
  | LCP | 1.8s | 0.7s |
  ```
- **Tautan**: `[Nama Tautan](https://example.com)`

---

## 4. STATUS DRAFT ARTIKEL

Jika Anda sedang menulis artikel dan belum ingin menampilkannya di halaman produksi:
Set nilai `draft: true` di bagian frontmatter berkas markdown:
```yaml
draft: true
```
Artikel dengan status `draft: true` otomatis disaring dan **tidak akan muncul** di halaman blog produksi maupun di sitemap Google.
