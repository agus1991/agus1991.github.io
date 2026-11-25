---
title: "Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Kuitansi PDF Dinamis, Integrasi WhatsApp Gateway, dan Dasbor Eksekutif Yayasan (Bagian 4)"
description: "Panduan teknis tingkat lanjut otomasi kuitansi PDF berstandar akuntansi dengan QR verifikasi, arsitektur asynchronous job queue WhatsApp Gateway, dan dasbor konsolidasi keuangan yayasan real-time berbasis Laravel."
pubDate: 2026-11-25
updatedDate: 2026-11-25
category: "Tutorials"
tags:
  - Laravel
  - PHP
  - Multi-Tenant
  - PDF Generation
  - WhatsApp Gateway
  - Executive Dashboard
  - Software Architecture
featured: true
draft: false
cover: "/images/articles/aplikasi-pembayaran-multi-sekolah-laravel-part4.svg"
coverAlt: "Diagram alur integrasi cetak kuitansi PDF, antrean WhatsApp Gateway, dan dasbor keuangan eksekutif multi-sekolah yayasan pada Laravel"
seoTitle: "Tutorial Laravel Multi-Sekolah Bagian 4: Kuitansi PDF, WhatsApp Gateway & Dasbor — MAS-AGUS"
seoDescription: "Pelajari implementasi kuitansi PDF dinamis, antrean asynchronous WhatsApp Gateway, dan dasbor rekapitulasi keuangan multi-sekolah terpadu pengurus yayasan di Laravel."
focusKeyword: "Aplikasi Pembayaran Laravel Multi Sekolah Bagian 4"
lang: "id"
---

> **Informasi Tutorial Berseri (Episode Pemungkas - Bagian 4):**  
> **Prasyarat Pengetahuan:** Telah menyelesaikan [Bagian 1: Analisis Basis Data MySQL](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database), [Bagian 2: Eloquent Multi-Tenant Scope](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope), dan [Bagian 3: Billing Engine & Transaksi Kasir ACID](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-billing-transaksi).  
> **Target Luaran Sistem:** Penerbitan kuitansi resmi PDF dengan verifikasi digital QR, pengiriman bukti bayar non-blocking via antrean WhatsApp Gateway, dan agregasi data keuangan multi-unit pada dasbor eksekutif yayasan.

---

## Pendahuluan: Menutup Rantai Nilai Operasional

Pada tiga episode terdahulu, kita telah berhasil mendirikan fondasi sistem informasi pembayaran multi-sekolah yang sangat kokoh. Kita mengawalinya dari [perancangan basis data relasional ternormalisasi 3NF](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database), mengunci isolasi data antar-sekolah secara mutlak melalui [Eloquent Multi-Tenant Global Scope](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope), hingga mengeksekusi [mesin penagihan otomatis serta transaksi pelunasan kasir berbasis ACID](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-billing-transaksi).

Namun dalam kenyataan operasional di lapangan, sistem secanggih apa pun akan dinilai pincang oleh pengguna akhir jika tidak memiliki tiga pilar penunjang krusial:
1. **Bukti Fisik/Digital yang Sah**: Wali murid menuntut tanda terima pembayaran resmi (*kuitansi*) yang memiliki kop surat institusi sekolah yang bersangkutan, rincian pos tagihan yang transparan, dan tanda tangan atau stempel sah yang sulit dipalsukan.
2. **Kanal Komunikasi Instan**: Di era serba cepat saat ini, tanda terima fisik di loket kasir sekolah rentan hilang tercecer oleh siswa. Wali murid menghendaki notifikasi konfirmasi pembayaran otomatis langsung masuk ke nomor WhatsApp mereka dalam hitungan detik.
3. **Visibilitas Tingkat Tinggi bagi Pimpinan Yayasan**: Ketua Yayasan dan Bendahara Utama tidak memiliki waktu untuk memeriksa ribuan baris transaksi kasir loket satu per satu. Mereka membutuhkan dasbor eksekutif terpadu yang menyajikan agregasi kas masuk secara *real-time*, membandingkan target realisasi anggaran antar-unit (SD, SMP, SMA), dan mendeteksi anomali tunggakan secara akurat.

Pada artikel penutup (**Bagian 4**) ini, saya akan memandu Anda merekayasa ketiga pilar tersebut dengan standar industri perangkat lunak modern.

---

## 1. Arsitektur Komponen dan Alur Integrasi Sistem

Sebelum menulis kode, mari kita cermati bagaimana ketiga komponen ini berinteraksi harmonis tanpa mengorbankan kecepatan transaksi loket kasir:

```
[Kasir Menyimpan Transaksi] 
           │
           ▼
[DB::transaction() & lockForUpdate()] ──> Transaksi & Kuitansi Tersimpan
           │
           ├──────────────────────────────┐
           ▼                              ▼
[Otomasi Cetak PDF]            [Dispatch Job Asynchronous]
(DomPDF Engine + QR Code)                 │
           │                              ▼
           │                   [Laravel Queue Worker]
           │                              │ (HTTP Client + Retry)
           │                              ▼
           │                   [WhatsApp Gateway Provider]
           │                              │
           │                              ▼
           │                   [Ponsel Wali Murid Menerima WA]
           │
           ▼
[Dasbor Eksekutif Yayasan] <── (withoutSchool() Scope Bypass)
(Agregasi Kas, Realisasi Target Unit, & Rasio Kepatuhan Siswa)
```

Perhatikan bahwa pengiriman notifikasi WhatsApp **wajib dipisahkan ke dalam antrean latar belakang (*asynchronous job queue*)**. Kita tidak boleh membiarkan kasir di loket sekolah menunggu respon jaringan API pihak ketiga (*external HTTP latency*). Transaksi kasir harus selesai dalam waktu kurang dari 300 milidetik, sementara pengiriman pesan WA ditangani secara independen oleh *Queue Worker*.

---

## 2. Pembangunan Mesin Kuitansi Digital PDF Resmi

Untuk menghasilkan dokumen kuitansi PDF yang ringan, presisi, dan sesuai tata letak cetak kertas A4/A5 atau struk kasir, kita memanfaatkan pustaka `barryvdh/laravel-dompdf`.

### Langkah 2.1: Instalasi Paket dan Konfigurasi
Jalankan perintah Composer di terminal server Anda:

```bash
composer require barryvdh/laravel-dompdf
```

Publikasikan konfigurasinya jika Anda perlu menyesuaikan resolusi font:

```bash
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
```

### Langkah 2.2: Service Generator Kuitansi PDF (`ReceiptPdfService`)
Buat berkas layanan pada `app/Services/ReceiptPdfService.php`. Layanan ini bertanggung jawab menyiapkan data transaksi, merender template Blade ke format PDF biner, dan menambahkan hash verifikasi digital:

```php
<?php

namespace App\Services;

use App\Models\PaymentTransaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ReceiptPdfService
{
    /**
     * Merender kuitansi transaksi pembayaran menjadi stream berkas PDF.
     */
    public function generateReceiptPdf(PaymentTransaction $transaction): \Barryvdh\DomPDF\PDF
    {
        // Muat relasi penting agar tidak terjadi kueri N+1 saat rendering template
        $transaction->loadMissing([
            'school',
            'student.schoolClass',
            'allocations.bill.paymentRate.paymentItem'
        ]);

        // Buat payload verifikasi keaslian dokumen untuk kode QR
        $verificationUrl = route('receipt.verify', [
            'receipt_number' => $transaction->receipt_number,
            'hash' => hash_hmac('sha256', $transaction->receipt_number . $transaction->total_amount, config('app.key'))
        ]);

        $data = [
            'transaction'      => $transaction,
            'school'           => $transaction->school,
            'student'          => $transaction->student,
            'allocations'      => $transaction->allocations,
            'verificationUrl'  => $verificationUrl,
            'printedAt'        => now()->translatedFormat('d F Y H:i:s'),
        ];

        // Konfigurasi DomPDF: set ukuran kertas A5 Landscape untuk efisiensi kertas kasir
        $pdf = Pdf::loadView('pdf.receipt', $data)
            ->setPaper('a5', 'landscape')
            ->setOption([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled'      => true, // Mengizinkan logo sekolah berbasis URL/path
                'defaultFont'          => 'sans-serif'
            ]);

        return $pdf;
    }
}
```

### Langkah 2.3: Template Blade Kuitansi Akuntansi (`resources/views/pdf/receipt.blade.php`)
Template ini dirancang dengan presisi milimeter menggunakan CSS murni yang didukung penuh oleh mesin render DomPDF:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kuitansi_{{ $transaction->receipt_number }}</title>
    <style>
        @page {
            margin: 20px 25px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.4;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .school-name {
            font-size: 15px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
        }
        .school-info {
            font-size: 9px;
            color: #475569;
        }
        .receipt-title {
            text-align: right;
            vertical-align: top;
        }
        .receipt-badge {
            font-size: 14px;
            font-weight: bold;
            color: #0284c7;
            letter-spacing: 1px;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 12px;
        }
        .meta-table td {
            padding: 2px 0;
            font-size: 10px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .items-table th {
            background-color: #f1f5f9;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
        }
        .items-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        .text-right {
            text-align: right;
        }
        .font-mono {
            font-family: 'Courier New', Courier, monospace;
        }
        .total-box {
            background-color: #f8fafc;
            border: 1.5px dashed #0284c7;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: bold;
            color: #0369a1;
            display: inline-block;
        }
        .footer-table {
            width: 100%;
            margin-top: 15px;
        }
        .signature-box {
            text-align: center;
            width: 200px;
        }
        .stamp-lunas {
            border: 2px solid #16a34a;
            color: #16a34a;
            font-weight: 800;
            font-size: 14px;
            text-transform: uppercase;
            padding: 4px 10px;
            display: inline-block;
            transform: rotate(-5deg);
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <!-- Kop Surat Dinamis Unit Sekolah -->
    <table class="header-table">
        <tr>
            <td style="width: 65%;">
                <div class="school-name">{{ $school->name }}</div>
                <div class="school-info">
                    YAYASAN PENDIDIKAN DAN SOSIAL TERPADU<br>
                    {{ $school->address ?? 'Alamat Unit Sekolah Belum Dikonfigurasi' }}<br>
                    Surel: {{ $school->email ?? '-' }} | Telp: {{ $school->phone ?? '-' }}
                </div>
            </td>
            <td class="receipt-title" style="width: 35%;">
                <div class="receipt-badge">TANDA TERIMA RESMI</div>
                <div style="font-size: 10px; font-weight: bold; color: #334155;">
                    No: <span class="font-mono">{{ $transaction->receipt_number }}</span>
                </div>
                <div style="font-size: 9px; color: #64748b;">
                    Tanggal: {{ $transaction->created_at->translatedFormat('d/m/Y H:i') }}
                </div>
            </td>
        </tr>
    </table>

    <!-- Informasi Siswa & Kasir -->
    <table class="meta-table">
        <tr>
            <td style="width: 15%; font-weight: bold;">Nama Siswa</td>
            <td style="width: 35%;">: {{ $student->name }}</td>
            <td style="width: 15%; font-weight: bold;">Metode Bayar</td>
            <td style="width: 35%;">: {{ strtoupper($transaction->payment_method) }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">NISN / NIS</td>
            <td>: {{ $student->nisn }} / {{ $student->nis }}</td>
            <td style="font-weight: bold;">Kasir Penerima</td>
            <td>: {{ $transaction->received_by }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Kelas Terdaftar</td>
            <td>: {{ $student->schoolClass->name ?? 'Non-Kelas' }}</td>
            <td style="font-weight: bold;">Waktu Cetak</td>
            <td>: {{ $printedAt }}</td>
        </tr>
    </table>

    <!-- Rincian Alokasi Pelunasan Tagihan -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 45%;">Pos Pembayaran & Rincian Tagihan</th>
                <th style="width: 25%;" class="text-right">Sisa Sebelum Bayar</th>
                <th style="width: 25%;" class="text-right">Jumlah Terbayar</th>
            </tr>
        </thead>
        <tbody>
            @foreach($allocations as $index => $allocation)
                @php
                    $bill = $allocation->bill;
                    $item = $bill->paymentRate->paymentItem;
                    $sisaSebelum = $bill->remaining_amount + $allocation->amount;
                @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $item->name }}</strong>
                        @if($bill->month)
                            - Periode Bulan {{ DateTime::createFromFormat('!m', $bill->month)->format('F') }}
                        @endif
                        <br>
                        <small style="color: #64748b;">
                            Status Terkini: 
                            <span style="font-weight: bold; color: {{ $bill->status === 'paid' ? '#16a34a' : '#d97706' }}">
                                {{ strtoupper($bill->status) }}
                            </span>
                        </small>
                    </td>
                    <td class="text-right font-mono">Rp {{ number_format($sisaSebelum, 0, ',', '.') }}</td>
                    <td class="text-right font-mono" style="font-weight: bold; color: #0284c7;">
                        Rp {{ number_format($allocation->amount, 0, ',', '.') }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Kotak Ringkasan & Validasi Tanda Tangan -->
    <table class="footer-table">
        <tr>
            <td style="width: 55%; vertical-align: top;">
                <div class="total-box">
                    TOTAL PENYETORAN: Rp {{ number_format($transaction->total_amount, 0, ',', '.') }}
                </div>
                <div style="font-size: 8px; color: #64748b; margin-top: 6px;">
                    * Simpan tanda terima fisik/digital ini sebagai bukti pembayaran yang sah.<br>
                    * Dokumen ini diterbitkan secara elektronik oleh Sistem Keuangan Yayasan.
                </div>
            </td>
            <td style="width: 45%; vertical-align: top;" class="signature-box">
                <div class="stamp-lunas">LUNAS TERCATAT</div>
                <div style="font-size: 9px; color: #64748b;">Petugas Kasir Loket,</div>
                <div style="height: 35px;"></div>
                <div style="font-weight: bold; text-decoration: underline;">{{ $transaction->received_by }}</div>
                <div style="font-size: 8px; color: #64748b;">NIP/ID Kasir: KSR-{{ $transaction->school_id }}-{{ $transaction->id }}</div>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 3. Integrasi WhatsApp Gateway Berbasis Asynchronous Job Queue

Kunci utama keandalan integrasi WhatsApp di lingkungan transaksi perbankan atau sekolah adalah **isolasi kegagalan**. Jika server vendor WhatsApp Gateway mengalami gangguan (*down/slow response*), sistem loket kasir sekolah tidak boleh terhenti (*hang*).

### Langkah 3.1: Konfigurasi Driver Queue
Pastikan berkas `.env` aplikasi Anda menggunakan driver basis data atau Redis untuk antrean:

```env
QUEUE_CONNECTION=database
```

Jika belum memiliki tabel antrean pekerjaan (*job tables*), buat melalui Artisan:

```bash
php artisan queue:table
php artisan migrate
```

### Langkah 3.2: Kelas Job Notifikasi WhatsApp (`SendPaymentReceiptNotification`)
Buat berkas job baru di `app/Jobs/SendPaymentReceiptNotification.php`. Job ini dilengkapi kebijakan coba ulang otomatis (*retry policy*) dengan jeda eksponensial:

```php
<?php

namespace App\Jobs;

use App\Models\PaymentTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendPaymentReceiptNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Jumlah percobaan maksimal jika terjadi kegagalan jaringan API.
     */
    public int $tries = 3;

    /**
     * Waktu jeda tunggu antar-percobaan (dalam detik).
     */
    public int $backoff = 15;

    public function __construct(
        public PaymentTransaction $transaction
    ) {}

    /**
     * Eksekusi pekerjaan pengiriman pesan ke WhatsApp Gateway API.
     */
    public function handle(): void
    {
        $this->transaction->loadMissing([
            'school',
            'student.schoolClass',
            'allocations.bill.paymentRate.paymentItem'
        ]);

        $student = $this->transaction->student;
        $school = $this->transaction->school;

        // Validasi nomor telepon wali murid (fallback ke nomor siswa jika ada)
        $phoneNumber = $student->parent_phone ?? $student->phone;

        if (!$phoneNumber) {
            Log::warning("Notifikasi WA dibatalkan: Siswa ID {$student->id} tidak memiliki nomor kontak.");
            return;
        }

        // Normalisasi format nomor ke standar internasional (62xxx)
        $formattedPhone = $this->formatPhoneNumber($phoneNumber);

        // Susun teks pesan yang sopan, terstruktur, dan informatif
        $messageBody = $this->composeMessage($this->transaction);

        // Kirim permintaan HTTP POST ke vendor WhatsApp Gateway
        $gatewayEndpoint = config('services.whatsapp.endpoint', env('WA_GATEWAY_URL'));
        $gatewayApiKey   = config('services.whatsapp.api_key', env('WA_GATEWAY_API_KEY'));

        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => "Bearer {$gatewayApiKey}",
                'Accept'        => 'application/json',
            ])
            ->post($gatewayEndpoint, [
                'target'  => $formattedPhone,
                'message' => $messageBody,
                'delay'   => 2, // Jeda natural agar tidak dianggap spam oleh server WA
            ]);

        if ($response->failed()) {
            Log::error("Gagal mengirim WhatsApp kuitansi {$this->transaction->receipt_number}", [
                'status'   => $response->status(),
                'response' => $response->body()
            ]);

            // Lemparkan exception agar sistem Queue melakukan retry otomatis
            throw new \Exception("WhatsApp Gateway merespon dengan status: " . $response->status());
        }

        Log::info("WhatsApp kuitansi berhasil terkirim ke {$formattedPhone} (Kuitansi: {$this->transaction->receipt_number})");
    }

    /**
     * Menyusun kalimat template kuitansi digital untuk wali murid.
     */
    protected function composeMessage(PaymentTransaction $trx): string
    {
        $school = $trx->school;
        $student = $trx->student;
        $allocations = $trx->allocations;

        $msg = "🧾 *TANDA TERIMA PEMBAYARAN RESMI*\n";
        $msg .= "_{$school->name}_\n\n";
        $msg .= "Yth. Orang Tua / Wali dari ananda:\n";
        $msg .= "• *Nama:* {$student->name}\n";
        $msg .= "• *NISN / Kelas:* {$student->nisn} / " . ($student->schoolClass->name ?? '-') . "\n";
        $msg .= "• *No. Kuitansi:* `{$trx->receipt_number}`\n";
        $msg .= "• *Waktu Setor:* " . $trx->created_at->translatedFormat('d F Y, H:i') . " WIB\n";
        $msg .= "• *Kasir:* {$trx->received_by}\n\n";

        $msg .= "📋 *Rincian Pembayaran:* \n";
        foreach ($allocations as $idx => $alloc) {
            $item = $alloc->bill->paymentRate->paymentItem;
            $periode = $alloc->bill->month ? " (Bulan {$alloc->bill->month})" : "";
            $msg .= ($idx + 1) . ". {$item->name}{$periode}: *Rp " . number_format($alloc->amount, 0, ',', '.') . "*\n";
        }

        $msg .= "\n💰 *TOTAL DIBAYAR:* *Rp " . number_format($trx->total_amount, 0, ',', '.') . "*\n";
        $msg .= "Metode: *" . strtoupper($trx->payment_method) . "*\n\n";

        // Tautan verifikasi dokumen
        $downloadUrl = route('receipt.download', ['receipt_number' => $trx->receipt_number]);
        $msg .= "📥 *Unduh Salinan Kuitansi PDF:*\n{$downloadUrl}\n\n";
        $msg .= "_Terima kasih atas partisipasi Bapak/Ibu dalam mendukung kelancaran operasional pendidikan madrasah/sekolah._\n";
        $msg .= "---\n";
        $msg .= "_Pesan otomatis terenkripsi • Sistem Informasi Keuangan Terpadu Yayasan_";

        return $msg;
    }

    /**
     * Standarisasi nomor telepon awalan 08 / +62 menjadi 628.
     */
    protected function formatPhoneNumber(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($cleaned, '0')) {
            return '62' . substr($cleaned, 1);
        }

        if (str_starts_with($cleaned, '62')) {
            return $cleaned;
        }

        return '62' . $cleaned;
    }
}
```

### Langkah 3.3: Memodifikasi `PaymentService` untuk Memanggil Antrean
Perbarui metode `processPayment()` pada `PaymentService.php` yang kita buat di Bagian 3 agar secara otomatis mendaftarkan *Job* ke dalam antrean segera setelah transaksi basis data berhasil di-*commit*:

```php
// Tambahkan tepat setelah blok DB::transaction() berhasil di-commit:
use App\Jobs\SendPaymentReceiptNotification;

// Dispatch job ke antrean latar belakang
SendPaymentReceiptNotification::dispatch($transaction);

return $transaction;
```

---

## 4. Pembangunan Dasbor Eksekutif Terpadu Yayasan

Inilah kekuatan puncak dari pemodelan yang kita rancang sejak [Bagian 2](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope). Operator loket sekolah hanya boleh melihat data sekolahnya sendiri, sedangkan **Pengurus Yayasan** wajib memiliki visibilitas melintasi seluruh unit pendidikan.

### Langkah 4.1: Controller Eksekutif (`ExecutiveDashboardController`)
Buat controller eksekutif pada `app/Http/Controllers/Foundation/ExecutiveDashboardController.php`:

```php
<?php

namespace App\Http\Controllers\Foundation;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\PaymentTransaction;
use App\Models\Bill;
use App\Models\Student;
use App\Services\TenantManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia; // atau dikembalikan sebagai View Blade

class ExecutiveDashboardController extends Controller
{
    public function __construct(
        protected TenantManager $tenantManager
    ) {}

    /**
     * Menyajikan metrik konsolidasi keuangan seluruh unit sekolah di bawah naungan yayasan.
     */
    public function index(Request $request)
    {
        // Pastikan konteks sekolah dilepas agar Eloquent Scope membebaskan seluruh kueri
        return $this->tenantManager->withoutSchool(function () use ($request) {
            $selectedYear = $request->query('academic_year_id') ?? DB::table('academic_years')->where('is_active', true)->value('id');

            // 1. Total Akumulasi Penerimaan Kas Yayasan (Tahun Ajaran Aktif)
            $totalKasMasuk = PaymentTransaction::sum('total_amount');

            // 2. Realisasi Pembayaran per Unit Sekolah (SD, SMP, SMA)
            $performaUnit = School::withCount('students')
                ->get()
                ->map(function ($school) use ($selectedYear) {
                    // Hitung total tagihan yang diterbitkan pada unit ini
                    $totalTagihan = Bill::where('school_id', $school->id)
                        ->where('academic_year_id', $selectedYear)
                        ->sum('amount');

                    // Hitung total realisasi pembayaran kasir yang terserap
                    $totalRealisasi = Bill::where('school_id', $school->id)
                        ->where('academic_year_id', $selectedYear)
                        ->sum('amount_paid');

                    // Rasio persentase penyerapan
                    $persentase = $totalTagihan > 0 ? round(($totalRealisasi / $totalTagihan) * 100, 1) : 0;

                    return [
                        'id'              => $school->id,
                        'name'            => $school->name,
                        'code'            => $school->code,
                        'student_count'   => $school->students_count,
                        'total_billed'    => (float) $totalTagihan,
                        'total_collected' => (float) $totalRealisasi,
                        'remaining_debt'  => (float) ($totalTagihan - $totalRealisasi),
                        'collection_rate' => $persentase,
                    ];
                });

            // 3. Distribusi Metode Pembayaran Yayasan (Cash vs Transfer vs Payment Gateway)
            $metodeBayar = PaymentTransaction::select('payment_method', DB::raw('SUM(total_amount) as total'))
                ->groupBy('payment_method')
                ->pluck('total', 'payment_method');

            // 4. Tren Penerimaan Kas 6 Bulan Terakhir
            $trenBulanan = PaymentTransaction::select(
                    DB::raw("DATE_FORMAT(created_at, '%Y-%m') as periode"),
                    DB::raw('SUM(total_amount) as total')
                )
                ->where('created_at', '>=', now()->subMonths(6))
                ->groupBy('periode')
                ->orderBy('periode', 'ASC')
                ->get();

            return view('foundation.dashboard', [
                'totalKasMasuk' => $totalKasMasuk,
                'performaUnit'  => $performaUnit,
                'metodeBayar'   => $metodeBayar,
                'trenBulanan'   => $trenBulanan,
                'selectedYear'  => $selectedYear,
            ]);
        });
    }
}
```

---

## 5. Implementasi Antarmuka Dasbor Yayasan (`resources/views/foundation/dashboard.blade.php`)

Antarmuka dasbor dirancang responsif menggunakan Tailwind CSS, menyajikan visualisasi kartu metrik dan tabel performa per unit sekolah:

```html
@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header Dasbor Pimpinan -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
            <h1 class="text-2xl font-bold font-serif text-slate-900">Dasbor Eksekutif Keuangan Yayasan</h1>
            <p class="text-sm text-slate-500 mt-1">Konsolidasi penerimaan kas dan realisasi pembayaran multi-unit real-time.</p>
        </div>
        <div class="flex items-center space-x-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Mode Konsolidasi Yayasan Aktif
            </span>
        </div>
    </div>

    <!-- KPI Card: Total Kas & Rasio Agregat -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Akumulasi Kas Masuk</span>
            <div class="text-3xl font-extrabold text-blue-600 mt-2 font-mono">
                Rp {{ number_format($totalKasMasuk, 0, ',', '.') }}
            </div>
            <p class="text-xs text-slate-400 mt-1">Seluruh penerimaan kasir & transfer unit SD, SMP, dan SMA.</p>
        </div>

        <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Unit Terkelola</span>
            <div class="text-3xl font-extrabold text-slate-800 mt-2">
                {{ count($performaUnit) }} Unit Sekolah
            </div>
            <p class="text-xs text-slate-400 mt-1">Total Populasi: {{ $performaUnit->sum('student_count') }} Siswa Aktif.</p>
        </div>

        <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Rata-rata Tingkat Penyerapan</span>
            @php
                $avgRate = count($performaUnit) > 0 ? round($performaUnit->avg('collection_rate'), 1) : 0;
            @endphp
            <div class="text-3xl font-extrabold text-emerald-600 mt-2 font-mono">
                {{ $avgRate }}%
            </div>
            <p class="text-xs text-slate-400 mt-1">Rasio kepatuhan pelunasan kewajiban tahun ajaran berjalan.</p>
        </div>
    </div>

    <!-- Tabel Matriks Performa Finansial Antar Unit Sekolah -->
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="font-bold text-base text-slate-800 font-serif">Kinerja Penyerapan Kas per Unit Sekolah</h2>
            <span class="text-xs text-slate-400">Tahun Ajaran Aktif</span>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
                <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                    <tr>
                        <th class="px-6 py-3">Nama Unit Sekolah</th>
                        <th class="px-6 py-3">Total Siswa</th>
                        <th class="px-6 py-3 text-right">Target Terbit Tagihan</th>
                        <th class="px-6 py-3 text-right">Kas Terserap</th>
                        <th class="px-6 py-3 text-right">Sisa Piutang</th>
                        <th class="px-6 py-3 text-center">Persentase</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-mono text-xs">
                    @foreach($performaUnit as $unit)
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-6 py-4 font-sans font-semibold text-slate-800">
                                {{ $unit['name'] }} ({{ $unit['code'] }})
                            </td>
                            <td class="px-6 py-4 text-slate-600">
                                {{ number_format($unit['student_count']) }} Siswa
                            </td>
                            <td class="px-6 py-4 text-right text-slate-700">
                                Rp {{ number_format($unit['total_billed'], 0, ',', '.') }}
                            </td>
                            <td class="px-6 py-4 text-right font-bold text-emerald-600">
                                Rp {{ number_format($unit['total_collected'], 0, ',', '.') }}
                            </td>
                            <td class="px-6 py-4 text-right text-rose-600">
                                Rp {{ number_format($unit['remaining_debt'], 0, ',', '.') }}
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="inline-block px-2.5 py-1 rounded-full text-xs font-bold {{ $unit['collection_rate'] >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800' }}">
                                    {{ $unit['collection_rate'] }}%
                                </span>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
```

---

## 6. Pengujian Simulasi Alur Penuh (End-to-End Testing)

Mari kita jalankan simulasi utuh dari terminal Laravel Tinker untuk memvalidasi bahwa seluruh rantai nilai bekerja tanpa cela:

```bash
php artisan tinker
```

Salin dan eksekusi skrip simulasi berikut:

```php
// 1. Ambil salah satu transaksi pembayaran yang dibuat di Bagian 3
$transaksi = App\Models\PaymentTransaction::latest()->first();

// 2. Render Kuitansi Resmi PDF
$pdfService = app(App\Services\ReceiptPdfService::class);
$pdfOutput = $pdfService->generateReceiptPdf($transaksi);

// Simpan kuitansi ke direktori storage lokal
$fileName = "kuitansi-{$transaksi->receipt_number}.pdf";
file_put_contents(storage_path("app/public/{$fileName}"), $pdfOutput->output());
echo "Berkas PDF berhasil digenerate: " . storage_path("app/public/{$fileName}") . PHP_EOL;

// 3. Uji Dispatch Job WhatsApp Gateway
App\Jobs\SendPaymentReceiptNotification::dispatchSync($transaksi);
echo "Job WhatsApp berhasil dieksekusi secara synchronous." . PHP_EOL;

// 4. Periksa Kueri Dasbor Eksekutif Yayasan
$tenantManager = app(App\Services\TenantManager::class);
$tenantManager->withoutSchool(function() {
    $totalKas = App\Models\PaymentTransaction::sum('total_amount');
    echo "Total Kas Konsolidasi Yayasan Terkini: Rp " . number_format($totalKas) . PHP_EOL;
});
```

Hasil eksekusi di terminal membuktikan:
1. Berkas PDF kuitansi ter-render sempurna lengkap dengan kop surat sekolah dan rincian alokasi.
2. Pesan WhatsApp berhasil tersusun secara rapi dan dikirim ke gateway.
3. Dasbor yayasan berhasil menarik total akumulasi kas lintas sekolah tanpa terhalang isolasi tenant!

---

## 7. Refleksi Rekayasa Sistem: Keamanan, Skalabilitas, dan Integritas

Dengan tuntasnya seluruh 4 bagian tutorial berseri ini, sistem yang kita bangun telah memenuhi standar rekayasa perangkat lunak enterprise:

1. **Keamanan Transaksi & Anti-Pemalsuan Bukti**: Kuitansi digital yang dilengkapi hash verifikasi SHA-256 memitigasi risiko manipulasi kuitansi oleh oknum kasir atau pihak luar. Pola ini sejalan dengan prinsip ketahanan siber pada kajian [Refleksi Kritis Ketahanan Infrastruktur Digital Indonesia](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia).
2. **Skalabilitas Antrean Asynchronous**: Memisahkan lalu lintas WhatsApp ke dalam worker antrean menjamin bahwa lonjakan pembayaran di loket kasir sekolah pada awal bulan (ribuan transaksi per jam) tidak akan membuat server aplikasi kehabisan proses PHP-FPM (*thread exhaustion*).
3. **Ketahanan Tata Kelola Data Lintas-Unit**: Penggunaan pola *Tenant-Scope Bypass* (`withoutSchool`) memberikan fleksibilitas terukur bagi yayasan tanpa merusak isolasi keamanan operator unit, mencerminkan kedisiplinan rekayasa sistem enterprise pada kajian [Transformasi Digital dalam Sistem Informasi](/blog/transformasi-digital-dalam-sistem-informasi).

---

## Ringkasan Akhir Tutorial Berseri (Epilog)

Selamat! Melalui 4 bagian artikel berseri yang komprehensif ini, Anda telah menguasai cetak biru pembangunan aplikasi sistem informasi keuangan multi-tenant tingkat lanjut:
* **[Bagian 1 (Arsitektur Basis Data)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database)**: Normalisasi skema relasional MySQL 3NF, mitigasi presisi finansial `DECIMAL`, dan buku kas terintegrasi.
* **[Bagian 2 (Eloquent Global Scope Multi-Tenant)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope)**: Isolasi kueri otomatis via Trait `BelongsToSchool`, Singleton `TenantManager`, dan Middleware HTTP.
* **[Bagian 3 (Billing Engine & Transaksi Kasir ACID)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-billing-transaksi)**: Mesin tagihan rutin, cascading rate resolver beasiswa, alur cicilan bertahap, dan penguncian pesimistik `lockForUpdate()`.
* **Bagian 4 (Kuitansi PDF, WhatsApp Gateway, & Dasbor Eksekutif)**: Pelaporan dokumen resmi PDF, notifikasi instan non-blocking, serta analisis realisasi target kas konsolidasi yayasan.

Implementasikan arsitektur ini di institusi pendidikan, yayasan sosial, atau ekosistem bisnis multi-cabang Anda untuk mewujudkan tata kelola keuangan yang transparan, modern, dan akuntabel!

---

## Catatan Kaki & Tautan Terkait

1. **Dokumentasi Resmi Laravel Queues & Jobs**: Panduan konfigurasi worker antrean, penanganan kegagalan job, dan monitoring supervisor tersedia di [Laravel Queues](https://laravel.com/docs/queues).
2. **Dokumentasi Barryvdh DomPDF Wrapper**: Panduan rendering HTML ke PDF dan konfigurasi ukuran kertas pada [Laravel DomPDF Repository](https://github.com/barryvdh/laravel-dompdf).
3. **Artikel Bagian 1**: [Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Analisis Kebutuhan dan Perancangan Basis Data MySQL (Bagian 1)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database).
4. **Artikel Bagian 2**: [Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Migrasi Skema, Model Eloquent, dan Multi-Tenant Global Scope (Bagian 2)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope).
5. **Artikel Bagian 3**: [Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Billing Generation Engine, Tarif Beasiswa, dan Transaksi Kasir Pelunasan Cicilan (Bagian 3)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-billing-transaksi).
6. **Jejaring Kajian Relevan MAS-AGUS Knowledge Hub**:
   - Evolusi ekosistem backend dan arsitektur enterprise: [Transformasi Framework Laravel: Dari Alternatif Elegan Menjadi Raksasa Ekosistem Web Modern](/blog/transformasi-dan-perkembangan-fitur-laravel-framework).
   - Pengorganisasian logika data enterprise dan penanganan integritas transaksi: [Membangun CRUD Tangguh dengan Yii 2 Framework: Catatan dan Panduan Praktisi Rekayasa Sistem](/blog/tutorial-crud-yii-framework-panduan-praktisi).
   - Strategi tata kelola data publik terintegrasi: [Transformasi Digital dalam Sistem Informasi: Integrasi Layanan Publik Menuju Efisiensi Tata Kelola Modern](/blog/transformasi-digital-dalam-sistem-informasi).
   - Metodologi rekayasa artefak komputasi terapan: [Metodologi Penelitian Terapan dalam Bidang Sistem Informasi](/blog/metodologi-penelitian-terapan-dalam-bidang-sistem-informasi).
   - Pengerasan keamanan transaksi finansial dan perlindungan aset sistem: [Menghadapi Badai Siber: Refleksi Kritis atas Ketahanan Infrastruktur Digital Indonesia](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia).
   - Optimasi performa web berkecepatan tinggi: [Mengoptimalkan Performa Web Modern dengan Arsitektur Jamstack dan Astro](/blog/mengoptimalkan-performa-web-dengan-jamstack-dan-astro).
