# PANDUAN DEPLOYMENT GITHUB PAGES
## MAS-AGUS — Personal Website & Professional Knowledge Hub

Dokumen ini menjelaskan langkah-langkah deployment otomatis ke **GitHub Pages** menggunakan **GitHub Actions** berbasis native domain `https://agus1991.github.io`.

---

## 1. IKHTISAR ARSITEKTUR DEPLOYMENT

```
[Komit Git ke Branch 'main'] 
            │
            ▼
[GitHub Actions Workflow: .github/workflows/deploy.yml]
  ├─ 1. Checkout Repository
  ├─ 2. Setup Node.js 20 & Cache
  ├─ 3. npm ci
  ├─ 4. npm run build (Static Site Compilation dengan Astro)
  └─ 5. Upload & Deploy Artifact ke GitHub Pages Edge
            │
            ▼
[GitHub Pages Edge CDN] 
            │
            ▼
[Production URL: https://agus1991.github.io]
```

- **Domain Produksi**: `https://agus1991.github.io`
- **GitHub Repository**: `agus1991/agus1991.github.io`
- **Tipe Hosting**: GitHub Pages Static Hosting Native (Cepat, aman, otomatis SSL HTTPS)

---

## 2. PENGATURAN GITHUB REPOSITORY

Setelah kode sumber di-push ke repositori GitHub `https://github.com/agus1991/agus1991.github.io`:

### Langkah A: Aktifkan Sumber GitHub Pages
1. Buka repositori `agus1991/agus1991.github.io` di GitHub.
2. Klik tab **Settings** di navigasi atas.
3. Pada bilah samping kiri, pilih menu **Pages** (di bawah *Code and automation*).
4. Pada bagian **Build and deployment**:
   - Di bawah **Source**, pilih opsi **GitHub Actions** (bukan "Deploy from a branch").
   - Opsi ini akan mengizinkan berkas `.github/workflows/deploy.yml` untuk mempublikasikan artefak *dist* secara otomatis setiap ada push ke branch `main`.

### Langkah B: Pastikan Custom Domain Kosong (Native GitHub Pages)
1. Masih di halaman **Settings &rarr; Pages**, periksa bagian **Custom domain**.
2. Pastikan kolom **Custom domain** dalam keadaan **KOSONG** (jika sebelumnya pernah diisi `mas.askapubliser.biz.id`, klik **Remove** / hapus lalu simpan).
3. Centang opsi **Enforce HTTPS**.

---

## 3. WORKFLOW DEPLOYMENT OTOMATIS

Proyek ini telah dikonfigurasi dengan GitHub Actions (`.github/workflows/deploy.yml`). Setiap kali Anda melakukan perubahan konten atau kode dan melakukan push:

```bash
git add .
git commit -m "update: konten terbaru"
git push origin main
```

GitHub Actions akan secara otomatis menjalankan proses instalasi dependensi, pengecekan TypeScript, build Astro statis, dan mempublikasikan situs ke `https://agus1991.github.io`.
