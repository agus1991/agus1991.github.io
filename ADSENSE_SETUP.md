# PANDUAN INTEGRASI DAN AKTIVASI GOOGLE ADSENSE
## MAS-AGUS — Personal Website & Professional Knowledge Hub

Website MAS-AGUS telah dirancang dengan arsitektur **AdSense-Ready**. Seluruh komponen periklanan, kepatuhan tata letak Core Web Vitals, berkas `ads.txt`, dan dokumen Kebijakan Privasi telah disiapkan secara profesional.

Secara default, **seluruh fungsi periklanan dinonaktifkan (disabled)** sampai pemilik situs menerima persetujuan resmi (approval) dari Google AdSense.

---

## 1. PERSYARATAN KELAYAKAN SEBELUM MENDAFTAR ADSENSE

Pastikan situs Anda telah memenuhi standar Google Publisher Policy:
1. **Domain Aktif**: Subdomain `https://mas.askapubliser.biz.id` dapat diakses secara publik dengan HTTPS yang valid.
2. **Konten Orisinal**: Memiliki minimal 10-15 artikel informatif dan bermanfaat (bukan salinan / plagiarisme).
3. **Halaman Wajib**: Tersedia halaman statis Kebijakan Privasi (`/privacy-policy`), Penafian (`/disclaimer`), Syarat Ketentuan (`/terms-and-conditions`), dan Kontak (`/contact`).
4. **Navigasi Jelas**: Tidak ada tautan rusak (*broken link*) dan tata letak responsif di ponsel.

---

## 2. LANGKAH PENDAFTARAN GOOGLE ADSENSE

1. Kunjungi [Google AdSense](https://www.google.com/adsense/start/) dan masuk dengan akun Google Anda.
2. Klik **Tambahkan Situs (Add Site)**.
3. Masukkan URL situs Anda: `https://mas.askapubliser.biz.id`.
4. Anda akan diberikan **Publisher ID** (format: `pub-XXXXXXXXXXXXXXXX` atau `ca-pub-XXXXXXXXXXXXXXXX`).

---

## 3. TAHAP VERIFIKASI KEPEMILIKAN SITUS

Untuk memverifikasi kepemilikan situs ke Google:

### Opsi A: Melalui Berkas `src/data/site.json`
Buka berkas `src/data/site.json` dan ubah nilai pada objek `adsense`:
```json
"adsense": {
  "enabled": true,
  "client": "ca-pub-1234567890123456",
  "slotArticleTop": "1111111111",
  "slotArticleBottom": "2222222222",
  "slotSidebar": "3333333333"
}
```

### Opsi B: Melalui Environment Variables
Atau melalui berkas `.env` di lingkungan lokal / GitHub Secrets:
```bash
PUBLIC_ADSENSE_ENABLED=true
PUBLIC_ADSENSE_CLIENT=ca-pub-1234567890123456
```

Komponen `<AdSenseScript />` pada `src/components/AdSenseScript.astro` akan secara otomatis menyuntikkan tag skrip resmi Google AdSense ke dalam `<head>` dokumen HTML tanpa perlu menyentuh kode tema.

---

## 4. KONFIGURASI BERKAS `public/ads.txt`

Google mewajibkan berkas `ads.txt` di root domain untuk mencegah kecurangan inventaris iklan.

1. Buka berkas `public/ads.txt`.
2. Ganti baris komentar dengan publisher ID resmi Anda:
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
   *(Ganti `pub-XXXXXXXXXXXXXXXX` dengan 16 digit ID penayang Anda).*
3. Simpan dan commit perubahan ke GitHub.
4. Periksa melalui peramban: `https://mas.askapubliser.biz.id/ads.txt`. Pastikan berkas terbaca dalam teks polos.

---

## 5. POSISI PENEMPATAN IKLAN YANG TERSEDIA

Situs telah menyediakan komponen periklanan modular:

| Komponen | Lokasi Penempatan | Dimensi Aman (CLS-Friendly) |
| :--- | :--- | :--- |
| `<ArticleAd position="top" />` | Di bawah paragraf pembuka artikel | Responsive Banner (Min-Height: 100px) |
| `<ArticleAd position="bottom" />` | Di atas navigasi artikel berikutnya | Responsive / Rectangle |
| `<SidebarAd />` | Bilah samping desktop (opsional) | 300x250 Medium Rectangle |

### Keunggulan Arsitektur:
- **Zero Layout Shift**: Setiap kontainer iklan telah memiliki wadah dengan batas minimal dimensi sehingga tidak menyebabkan pergeseran tata letak konten saat iklan selesai dimuat.
- **Label Regulasi**: Otomatis menyematkan label mikro "IKLAN" sesuai standar kepatuhan Google AdSense.
- **Fail-Safe**: Bila iklan dinonaktifkan (`enabled: false`), kontainer iklan sama sekali tidak memakan ruang visual atau menjalankan skrip pihak ketiga.

---

## 6. ATURAN KEPATUHAN PENTING (GOOGLE POLICY)

- **Dilarang Keras Mengklik Iklan Sendiri**: Jangan pernah mengklik unit iklan yang tayang di situs Anda sendiri, meskipun untuk tujuan pengujian.
- **Jangan Meminta Pengunjung Mengklik Iklan**: Dilarang menggunakan teks persuasif seperti "Klik iklan ini untuk mendukung penulis".
- **Hindari Penempatan yang Menyesatkan**: Iklan tidak boleh ditempatkan berdekatan dengan tombol menu navigasi atau tombol aksi interaktif.
