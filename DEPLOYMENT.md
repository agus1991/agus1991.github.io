# PANDUAN DEPLOYMENT & KONFIGURASI DOMAIN GITHUB PAGES
## MAS-AGUS — Personal Website & Professional Knowledge Hub

Dokumen ini menjelaskan langkah-langkah deployment otomatis ke **GitHub Pages** menggunakan **GitHub Actions** dan pengaturan DNS subdomain kustom `mas.askapubliser.biz.id`.

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
  ├─ 4. npm run build (Static Site Compilation)
  ├─ 5. Verifikasi CNAME: dist/CNAME -> 'mas.askapubliser.biz.id'
  └─ 6. Upload & Deploy Artifact ke GitHub Pages Edge
            │
            ▼
[GitHub Pages Edge CDN] 
            │
            ▼
[Custom Subdomain: https://mas.askapubliser.biz.id]
```

- **Domain Utama**: `https://askapubliser.biz.id` (TETAP AMAN, TIDAK DIUBAH)
- **Subdomain Web Personal**: `https://mas.askapubliser.biz.id`
- **GitHub Repository**: `agus1991/agus1991.github.io`
- **Tipe Hosting**: GitHub Pages Static Hosting (Langsung / Native, **tanpa iframe**, **tanpa URL masking**)

---

## 2. PENGATURAN DNS (DOMAIN NAME SYSTEM)

Pengaturan DNS dilakukan pada penyedia domain / DNS manager domain Anda (`askapubliser.biz.id`):

### Tambahkan DNS Record Baru:

| Tipe Record | Nama Host / Subdomain | Target / Nilai (Value) | TTL | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `mas` | `agus1991.github.io.` | Automatic / 3600 | Mengarahkan subdomain `mas` ke server GitHub Pages |

> **PERINGATAN PENTING**:
> - Jangan mengubah DNS record `@` atau `www` milik domain utama `askapubliser.biz.id`.
> - Penambahan CNAME hanya berlaku khusus untuk prefiks `mas`.
> - Jangan menggunakan fitur iframe redirect atau URL masking pada panel domain.

---

## 3. PENGATURAN GITHUB REPOSITORY

Setelah kode sumber di-push ke repositori GitHub `https://github.com/agus1991/agus1991.github.io`:

### Langkah A: Aktifkan Sumber GitHub Pages
1. Buka repositori `agus1991/agus1991.github.io` di GitHub.
2. Klik tab **Settings** di navigasi atas.
3. Pada bilah samping kiri, pilih menu **Pages** (di bawah *Code and automation*).
4. Pada bagian **Build and deployment**:
   - Di bawah **Source**, pilih opsi **GitHub Actions** (bukan "Deploy from a branch").
   - Opsi ini akan mengizinkan berkas `.github/workflows/deploy.yml` untuk mempublikasikan artefak *dist* secara otomatis setiap ada push ke branch `main`.

### Langkah B: Daftarkan Custom Domain di GitHub Pages
1. Masih di halaman **Settings &rarr; Pages**, gulir ke bagian **Custom domain**.
2. Masukkan alamat: `mas.askapubliser.biz.id`
3. Klik tombol **Save**.
4. GitHub akan memvalidasi DNS CNAME yang telah Anda buat di penyedia domain.
5. Setelah verifikasi DNS berhasil, centang opsi **Enforce HTTPS** untuk mengamankan situs dengan sertifikat SSL gratis dari Let's Encrypt / DigiCert.

---

## 4. INTEGRASI BERKAS CNAME

Proyek ini telah dikonfigurasi dengan berkas `public/CNAME` yang berisi:
```
mas.askapubliser.biz.id
```
Setiap kali perintah `npm run build` dijalankan, Astro secara otomatis menyalin isi folder `public/` ke folder `dist/`, sehingga berkas `dist/CNAME` selalu tercipta dan mencegah pengaturan domain ter-reset saat deployment berlangsung.

---

## 5. CARA PUSH PERDANA DARI KOMPUTER LOKAL

Buka terminal pada direktori proyek (`d:\laragon8\www\web_profil`) dan jalankan:

```bash
# 1. Inisialisasi Git (jika belum ada)
git init

# 2. Tambahkan remote origin ke repositori GitHub Anda
git remote add origin https://github.com/agus1991/agus1991.github.io.git

# 3. Tambahkan semua berkas dan commit
git add .
git commit -m "feat: Initial production release of MAS-AGUS Knowledge Hub"

# 4. Pastikan berada pada branch 'main'
git branch -M main

# 5. Push ke GitHub
git push -u origin main
```

Segera setelah perintah `git push` selesai, buka tab **Actions** di repositori GitHub Anda untuk memantau proses deployment yang sedang berjalan otomatis.
