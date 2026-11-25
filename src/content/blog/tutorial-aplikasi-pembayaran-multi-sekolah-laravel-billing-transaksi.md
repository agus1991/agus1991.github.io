---
title: "Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Billing Generation Engine, Tarif Beasiswa, dan Transaksi Kasir Pelunasan Cicilan (Bagian 3)"
description: "Panduan praktisi rekayasa sistem mengenai pembangunan mesin pembuat tagihan massal (Billing Engine), resolusi tarif beasiswa bertingkat, dan transaksi kasir pelunasan bertahap berbasis ACID Database Transaction."
pubDate: 2026-11-25
updatedDate: 2026-11-25
category: "Rekayasa Sistem"
tags:
  - Laravel
  - Billing Engine
  - ACID Transaction
  - Database Transactions
  - Sistem Kasir
  - Multi-Tenancy
  - Tutorial Berseri
featured: true
draft: false
cover: "/images/articles/aplikasi-pembayaran-multi-sekolah-laravel-part3.svg"
coverAlt: "Arsitektur Billing Engine dan Transaksi Kasir Pembayaran Multi-Sekolah Satu Yayasan Menggunakan Laravel"
seoTitle: "Aplikasi Pembayaran Multi-Sekolah Laravel: Billing & Transaksi Kasir (Bagian 3) — MAS-AGUS"
seoDescription: "Tutorial berseri Laravel Bagian 3: implementasi BillingService, cascading rate beasiswa, pessimistic locking kasir, dan alokasi cicilan multi-tagihan."
focusKeyword: "Aplikasi Pembayaran Multi-Sekolah Laravel"
---

> **Dokumentasi Rekayasa Perangkat Lunak & Tutorial Berseri (Model 1)**  
> **Penulis:** Agus Sifaunajah (MAS-AGUS)  
> **Topik Bahasan:** Otomasi Billing Engine, Cascading Rate Beasiswa Siswa, Transaksi ACID Database, Pessimistic Locking Kasir, dan Alokasi Kuitansi Pembayaran Cicilan.

---

## 1. Kilas Balik dan Sasaran Rekayasa Bagian 3

Pada dua bagian awal seri tutorial ini, kita telah membangun fondasi arsitektur yang kokoh:
1. Di [Bagian 1: Analisis Kebutuhan dan Perancangan Basis Data MySQL](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database), kita merancang skema relasional 11 tabel berstandar finansial presisi `DECIMAL(12, 2)` dengan integritas `ON DELETE RESTRICT`.
2. Di [Bagian 2: Migrasi Skema, Model Eloquent, dan Multi-Tenant Global Scope](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope), kita mengonversi skema tersebut ke dalam migrasi Laravel serta membangun pipa isolasi data otomatis via `SchoolScope` dan Trait `BelongsToSchool`.

Kini, kita melangkah ke **jantung logika bisnis aplikasi**: bagaimana sistem menerbitkan ribuan tagihan secara otomatis setiap awal bulan, bagaimana sistem menyelesaikan tarif bersyarat (seperti potongan beasiswa yatim atau keringanan bersaudara), dan bagaimana loket kasir sekolah melayani pembayaran yang fleksibel (pelunasan penuh maupun cicilan bertahap) dengan jaminan keamanan transaksi finansial mutlak.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ALUR TRANSAKSI PEMBAYARAN KASIR MULTI-POS                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. INPUT KASIR      ──> Uang Masuk: Rp 600.000 (Tunai / QRIS / Transfer)    │
│                              │                                              │
│                              ▼                                              │
│ 2. VALIDASI FORM    ──> StorePaymentTransactionRequest                      │
│                              │                                              │
│                              ▼ DB::transaction() & lockForUpdate()          │
│ 3. ALOKASI DANA     ──> [Kuitansi Induk: KWT-SMP-202611-0001]               │
│                         ├─ Alokasi 1: Uang Gedung Rp 400.000 (Cicilan)      │
│                         │   └─> Tagihan Awal: Rp 1.500.000                  │
│                         │   └─> Sisa: Rp 1.100.000 (Status: partially_paid) │
│                         │                                                   │
│                         └─ Alokasi 2: SPP Nov Rp 200.000 (Lunas)            │
│                             └─> Tagihan Awal: Rp 200.000                    │
│                             └─> Sisa: Rp 0 (Status: paid)                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Permasalahan Nyata di Meja Kasir Sekolah

Banyak aplikasi pembayaran sekolah gagal di lapangan karena perancangnya tidak memahami dua realitas mendasar:

### A. Masalah Tarif Bertingkat (*Cascading Rate Resolution*)
Biaya SPP bulanan atau uang gedung tidak selalu bernilai sama rata untuk seluruh siswa di satu sekolah:
* **Tarif Reguler Unit**: Siswa kelas VII SMP membayar tarif standar Rp 250.000.
* **Tarif Khusus Kelas**: Siswa kelas X SMK jurusan Teknik Komputer Jaringan (TKJ) membayar iuran praktikum Rp 300.000, berbeda dengan jurusan Akuntansi yang hanya Rp 200.000.
* **Tarif Beasiswa Personal**: Seorang siswa berprestasi, anak guru yayasan, atau anak yatim piatu menerima Surat Keputusan (SK) keringanan sehingga hanya membayar Rp 100.000 atau bebas biaya (Rp 0).

Sistem yang kita bangun harus memiliki **mesin resolusi tarif bertingkat (*Cascading Rate Resolver*)** yang mampu memeriksa prioritas tarif secara cerdas: cek tarif personal siswa $\rightarrow$ cek tarif kelas $\rightarrow$ ambil tarif default sekolah.

### B. Masalah Pembayaran Cicilan dan Pembayaran Borongan
Orang tua siswa yang datang ke meja kasir jarang membayar persis satu pos tagihan saja:
* Mereka kerap membayar **sebagian uang gedung** (misal mengangsur Rp 400.000 dari kewajiban Rp 1.500.000).
* Sekaligus melunasi **SPP bulan berjalan** (Rp 200.000).
* Seluruh transaksi tersebut harus tercatat dalam **satu nomor kuitansi kasir** agar tidak memboroskan kertas cetak dan memudahkan pembukuan harian bendahara.

---

## 3. Langkah 1: Membangun Mesin Resolusi Tarif & Pembuat Tagihan (`BillingService`)

Kita akan membuat *Service Layer* bernama `BillingService` di dalam direktori `app/Services/BillingService.php`. Layanan ini bertanggung jawab menentukan besaran tarif yang tepat dan menerbitkan tagihan secara massal tanpa risiko data ganda (*idempotent*).

```php
<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\PaymentRate;
use App\Models\PaymentType;
use App\Models\Student;
use App\Models\AcademicYear;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingService
{
    /**
     * Menyelesaikan besaran tarif yang berlaku untuk seorang siswa (Cascading Rate Resolver).
     * Urutan Prioritas:
     * 1. Tarif Khusus Siswa (Personal Exception / Beasiswa)
     * 2. Tarif Spesifik Kelas Siswa
     * 3. Tarif Standar Unit Sekolah
     */
    public function resolveRate(Student $student, PaymentType $paymentType, AcademicYear $academicYear, ?int $classId = null): ?PaymentRate
    {
        // 1. Cek apakah ada penetapan tarif khusus untuk siswa bersangkutan (Beasiswa/Keringanan)
        $studentRate = PaymentRate::where('payment_type_id', $paymentType->id)
            ->where('academic_year_id', $academicYear->id)
            ->where('student_id', $student->id)
            ->first();

        if ($studentRate) {
            return $studentRate;
        }

        // 2. Jika tidak ada, cek apakah ada tarif spesifik kelas
        if ($classId) {
            $classRate = PaymentRate::where('payment_type_id', $paymentType->id)
                ->where('academic_year_id', $academicYear->id)
                ->where('class_id', $classId)
                ->whereNull('student_id')
                ->first();

            if ($classRate) {
                return $classRate;
            }
        }

        // 3. Fallback: Ambil tarif standar unit sekolah (class_id IS NULL dan student_id IS NULL)
        return PaymentRate::where('payment_type_id', $paymentType->id)
            ->where('academic_year_id', $academicYear->id)
            ->whereNull('class_id')
            ->whereNull('student_id')
            ->first();
    }

    /**
     * Menerbitkan tagihan SPP bulanan untuk seluruh siswa aktif di suatu unit sekolah.
     * Bersifat Idempoten: Tidak akan membuat tagihan ganda jika periode sudah pernah diterbitkan.
     */
    public function generateMonthlyBills(int $schoolId, int $academicYearId, int $month, int $year, Carbon $dueDate): array
    {
        $paymentType = PaymentType::where('school_id', $schoolId)
            ->where('billing_cycle', 'monthly')
            ->where('is_active', true)
            ->firstOrFail();

        $academicYear = AcademicYear::findOrFail($academicYearId);

        // Ambil seluruh siswa aktif di unit sekolah tersebut beserta kelasnya pada tahun ajaran ini
        $activeStudents = Student::where('school_id', $schoolId)
            ->where('status', 'aktif')
            ->with(['studentClasses' => function ($query) use ($academicYearId) {
                $query->where('academic_year_id', $academicYearId)->where('status', 'aktif');
            }])
            ->get();

        $generatedCount = 0;
        $skippedCount = 0;

        DB::transaction(function () use (
            $activeStudents,
            $paymentType,
            $academicYear,
            $schoolId,
            $month,
            $year,
            $dueDate,
            &$generatedCount,
            &$skippedCount
        ) {
            foreach ($activeStudents as $student) {
                // Cek apakah tagihan periode ini sudah pernah diterbitkan sebelumnya
                $existingBill = Bill::where('school_id', $schoolId)
                    ->where('student_id', $student->id)
                    ->where('payment_type_id', $paymentType->id)
                    ->where('period_month', $month)
                    ->where('period_year', $year)
                    ->exists();

                if ($existingBill) {
                    $skippedCount++;
                    continue;
                }

                $currentClass = $student->studentClasses->first();
                $classId = $currentClass ? $currentClass->class_id : null;

                // Tentukan besaran tarif menggunakan resolver bertingkat
                $rate = $this->resolveRate($student, $paymentType, $academicYear, $classId);

                if (!$rate || $rate->amount <= 0) {
                    // Siswa dengan tarif Rp 0 (misal penerima beasiswa penuh 100%) tetap dicatat atau dilewati
                    Log::info("Siswa {$student->nis} - {$student->full_name} memiliki tarif Rp 0 atau belum dikonfigurasi.");
                    $skippedCount++;
                    continue;
                }

                // Terbitkan rekaman tagihan baru
                Bill::create([
                    'school_id' => $schoolId,
                    'student_id' => $student->id,
                    'payment_type_id' => $paymentType->id,
                    'academic_year_id' => $academicYear->id,
                    'period_month' => $month,
                    'period_year' => $year,
                    'amount_due' => $rate->amount,
                    'amount_paid' => 0.00,
                    'status' => 'unpaid',
                    'due_date' => $dueDate->format('Y-m-d'),
                ]);

                $generatedCount++;
            }
        });

        return [
            'generated' => $generatedCount,
            'skipped' => $skippedCount,
        ];
    }
}
```

---

## 4. Langkah 2: Otomasi Tagihan Massal via Artisan Command

Agar bendahara sekolah tidak perlu menekan tombol manual secara berulang, kita menyediakan perintah baris perintah (*CLI Artisan Command*) yang dapat dijadwalkan secara otomatis (*Laravel Task Scheduler*) setiap tanggal 1 awal bulan.

Jalankan perintah berikut di terminal:

```bash
php artisan make:command GenerateMonthlyBillsCommand --command=billing:generate-monthly
```

Buka `app/Console/Commands/GenerateMonthlyBillsCommand.php`, lalu pasang implementasi berikut:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BillingService;
use App\Models\School;
use App\Models\AcademicYear;
use Carbon\Carbon;

class GenerateMonthlyBillsCommand extends Command
{
    protected $signature = 'billing:generate-monthly 
                            {--school= : ID Unit Sekolah spesifik (Opsional, default: seluruh sekolah)} 
                            {--month= : Bulan tagihan 1-12 (Default: bulan berjalan)} 
                            {--year= : Tahun tagihan YYYY (Default: tahun berjalan)}';

    protected $description = 'Menerbitkan tagihan SPP bulanan otomatis untuk seluruh siswa aktif di yayasan';

    public function handle(BillingService $billingService): int
    {
        $month = (int) ($this->option('month') ?: date('n'));
        $year = (int) ($this->option('year') ?: date('Y'));
        $schoolOption = $this->option('school');

        // Jatuh tempo tagihan ditetapkan default tanggal 10 pada bulan berjalan
        $dueDate = Carbon::createFromDate($year, $month, 10);

        $this->info("Memulai penerbitan tagihan periode {$month}/{$year}...");

        $schoolsQuery = School::where('is_active', true);
        if ($schoolOption) {
            $schoolsQuery->where('id', $schoolOption);
        }
        $schools = $schoolsQuery->get();

        foreach ($schools as $school) {
            $activeYear = AcademicYear::where('school_id', $school->id)
                ->where('is_active', true)
                ->first();

            if (!$activeYear) {
                $this->warn("Unit [{$school->code}] {$school->name} tidak memiliki Tahun Ajaran aktif. Dilewati.");
                continue;
            }

            $this->line("Memproses Unit Sekolah: {$school->name}...");

            $result = $billingService->generateMonthlyBills(
                $school->id,
                $activeYear->id,
                $month,
                $year,
                $dueDate
            );

            $this->info(" -> Berhasil diterbitkan: {$result['generated']} tagihan | Dilewati: {$result['skipped']}");
        }

        $this->info('Penerbitan tagihan massal selesai.');
        return Command::SUCCESS;
    }
}
```

---

## 5. Langkah 3: Membangun Mesin Transaksi Kasir Berbasis Transaksi ACID (`PaymentService`)

Inilah bagian paling krusial dalam sistem finansial sekolah. Sebuah transaksi kasir harus mematuhi empat hukum dasar:
1. **Nomor Kuitansi Unik Berurutan**: Tidak boleh ada kuitansi ganda meskipun kasir bertransaksi secara serentak.
2. **Pessimistic Locking (`lockForUpdate()`)**: Tagihan yang sedang diproses harus dikunci sementara di tingkat baris pangkalan data (*row-level lock*) agar tidak dapat diubah oleh proses paralel lain.
3. **Penyelarasan Neraca Transaksi**: Jumlah alokasi pada rincian (`payment_transaction_details`) harus persis sama dengan total nominal uang yang diserahkan wali murid ke kasir.
4. **Pembaruan Status Tagihan Otomatis**: Tagihan yang telah lunas berubah menjadi `paid`, sedangkan yang baru diangsur sebagian berubah menjadi `partially_paid`.

Buat berkas layanan di `app/Services/PaymentService.php`:

```php
<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\PaymentTransaction;
use App\Models\PaymentTransactionDetail;
use App\Models\School;
use App\Models\Student;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    /**
     * Menghasilkan nomor kuitansi unik berurutan per unit sekolah.
     * Format: KWT/{KODE_UNIT}/{TAHUN}{BULAN}/{URUTAN 4 DIGIT}
     * Contoh: KWT/SMP-IT/202611/0042
     */
    public function generateReceiptNumber(School $school): string
    {
        $prefix = "KWT/{$school->code}/" . date('Ym') . '/';

        // Hitung transaksi yang telah terbit pada bulan ini untuk sekolah tersebut
        $latestTransaction = PaymentTransaction::withoutSchool()
            ->where('school_id', $school->id)
            ->where('receipt_number', 'LIKE', $prefix . '%')
            ->orderBy('id', 'desc')
            ->lockForUpdate()
            ->first();

        if ($latestTransaction) {
            $lastNumber = (int) substr($latestTransaction->receipt_number, -4);
            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '0001';
        }

        return $prefix . $nextNumber;
    }

    /**
     * Memproses transaksi setoran kasir dan mengalokasikan pelunasan ke masing-masing tagihan.
     * 
     * @param School $school
     * @param Student $student
     * @param array $allocations Array [ ['bill_id' => 1, 'amount' => 200000], ... ]
     * @param string $paymentMethod ('cash', 'transfer_bank', 'qris')
     * @param string $receivedBy Nama kasir / User ID
     * @param string|null $notes
     * @return PaymentTransaction
     */
    public function processPayment(
        School $school,
        Student $student,
        array $allocations,
        string $paymentMethod,
        string $receivedBy,
        ?string $notes = null
    ): PaymentTransaction {
        // 1. Hitung total uang transaksi yang diserahkan
        $totalAmount = array_sum(array_column($allocations, 'amount'));

        if ($totalAmount <= 0) {
            throw ValidationException::withMessages([
                'total_amount' => 'Nominal pembayaran harus lebih besar dari nol.'
            ]);
        }

        // 2. Eksekusi seluruh operasi di dalam blok Transaksi ACID
        return DB::transaction(function () use (
            $school,
            $student,
            $allocations,
            $totalAmount,
            $paymentMethod,
            $receivedBy,
            $notes
        ) {
            // A. Terbitkan nomor kuitansi unik
            $receiptNumber = $this->generateReceiptNumber($school);

            // B. Simpan data header transaksi kasir
            $transaction = PaymentTransaction::create([
                'school_id' => $school->id,
                'student_id' => $student->id,
                'receipt_number' => $receiptNumber,
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'transaction_date' => Carbon::now(),
                'received_by' => $receivedBy,
                'notes' => $notes,
            ]);

            // C. Proses setiap alokasi pelunasan tagihan
            foreach ($allocations as $item) {
                $billId = $item['bill_id'];
                $allocatedAmount = (float) $item['amount'];

                if ($allocatedAmount <= 0) {
                    continue;
                }

                // Kunci baris data tagihan (Pessimistic Lock) guna mencegah race-condition
                $bill = Bill::where('id', $billId)
                    ->where('school_id', $school->id)
                    ->where('student_id', $student->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $remainingBalance = (float) ($bill->amount_due - $bill->amount_paid);

                // Validasi agar kasir tidak menginput nominal alokasi melebihi sisa kewajiban
                if ($allocatedAmount > $remainingBalance) {
                    throw ValidationException::withMessages([
                        'allocations' => "Alokasi dana sebesar Rp " . number_format($allocatedAmount) . 
                                         " melebihi sisa tagihan Rp " . number_format($remainingBalance) . 
                                         " pada pos tagihan ID: {$bill->id}."
                    ]);
                }

                // Simpan rincian alokasi ke tabel perantara
                PaymentTransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'bill_id' => $bill->id,
                    'amount' => $allocatedAmount,
                ]);

                // Perbarui akumulasi pembayaran pada tabel bills
                $newPaidAmount = (float) ($bill->amount_paid + $allocatedAmount);
                $newStatus = ($newPaidAmount >= (float) $bill->amount_due) ? 'paid' : 'partially_paid';

                $bill->update([
                    'amount_paid' => $newPaidAmount,
                    'status' => $newStatus,
                ]);
            }

            return $transaction->load(['details.bill.paymentType', 'student']);
        });
    }
}
```

---

## 6. Langkah 4: Validasi Form Request & Controller Transaksi Kasir

Untuk melindungi gerbang Controller dari serangan data cacat, kita wajib membuat *Form Request* yang memvalidasi integritas struktur array alokasi kasir.

Jalankan perintah Artisan:

```bash
php artisan make:request StorePaymentTransactionRequest
php artisan make:controller PaymentController
```

### A. Validasi Ketat pada Form Request
Buka `app/Http/Requests/StorePaymentTransactionRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Dikelola oleh middleware otentikasi peran (RBAC)
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'payment_method' => ['required', 'in:cash,transfer_bank,qris,payment_gateway'],
            'notes' => ['nullable', 'string', 'max:500'],
            'allocations' => ['required', 'array', 'min:1'],
            'allocations.*.bill_id' => ['required', 'integer', 'exists:bills,id'],
            'allocations.*.amount' => ['required', 'numeric', 'min:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'allocations.required' => 'Minimal harus ada 1 tagihan yang dialokasikan pembayarannya.',
            'allocations.*.amount.min' => 'Nominal alokasi pembayaran minimal Rp 1.000.',
        ];
    }
}
```

### B. Controller Kasir yang Ramping (*Skinny Controller*)
Buka `app/Http/Controllers/PaymentController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentTransactionRequest;
use App\Models\Student;
use App\Services\PaymentService;
use App\Services\TenantManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
        protected TenantManager $tenantManager
    ) {}

    /**
     * Memproses setoran kasir dan menerbitkan lembar kuitansi.
     */
    public function store(StorePaymentTransactionRequest $request): JsonResponse
    {
        $school = $this->tenantManager->getSchool();
        
        if (!$school) {
            return response()->json([
                'message' => 'Konteks unit sekolah aktif belum ditetapkan.'
            ], 422);
        }

        // Ambil data siswa dalam konteks tenant aktif
        $student = Student::findOrFail($request->validated('student_id'));

        $transaction = $this->paymentService->processPayment(
            school: $school,
            student: $student,
            allocations: $request->validated('allocations'),
            paymentMethod: $request->validated('payment_method'),
            receivedBy: Auth::user()->name ?? 'Kasir Loket 1',
            notes: $request->validated('notes')
        );

        return response()->json([
            'message' => 'Transaksi pembayaran berhasil diproses.',
            'receipt_number' => $transaction->receipt_number,
            'data' => $transaction,
        ], 201);
    }
}
```

---

## 7. Langkah 5: Pengujian Kasus Nyata di Lapangan via Tinker

Mari kita uji skenario kasir nyata yang sering terjadi di lapangan menggunakan konsol **Laravel Tinker**:

```bash
php artisan tinker
```

Salin dan jalankan skenario berikut:

```php
// 1. Tetapkan konteks Kasir Unit SMP (School ID = 2)
$smp = App\Models\School::find(2);
app(App\Services\TenantManager::class)->setSchool($smp);

// Ambil siswa SMP bernama Ridwan
$siswa = App\Models\Student::where('nis', 'SMP-2001')->firstOrFail();

// Lihat tagihan aktif siswa:
// Misal Siswa memiliki:
// Bill ID 10: Uang Gedung Rp 1.500.000 (amount_paid: 0, status: unpaid)
// Bill ID 11: SPP Bulan November Rp 200.000 (amount_paid: 0, status: unpaid)
$tagihanSiswa = App\Models\Bill::where('student_id', $siswa->id)->get();

// 2. Wali murid menyetor uang tunai Rp 600.000 dengan rincian:
// - Cicil Uang Gedung: Rp 400.000
// - Lunas SPP November: Rp 200.000
$alokasiBayar = [
    ['bill_id' => 10, 'amount' => 400000],
    ['bill_id' => 11, 'amount' => 200000],
];

// 3. Eksekusi Pembayaran Kasir
$transaksi = app(App\Services\PaymentService::class)->processPayment(
    school: $smp,
    student: $siswa,
    allocations: $alokasiBayar,
    paymentMethod: 'cash',
    receivedBy: 'Hj. Siti Aminah (Kasir SMP)'
);

// Periksa Nomor Kuitansi yang Diterbitkan
echo "Nomor Kuitansi: " . $transaksi->receipt_number . PHP_EOL;
// Output: KWT/SMP-IT/202611/0001

// Periksa Status Terkini Tagihan 10 (Uang Gedung)
$tagihanGedung = App\Models\Bill::find(10);
echo "Gedung: Dibayar Rp " . number_format($tagihanGedung->amount_paid) . " | Status: " . $tagihanGedung->status . PHP_EOL;
// Output: Gedung: Dibayar Rp 400,000 | Status: partially_paid

// Periksa Status Terkini Tagihan 11 (SPP November)
$tagihanSPP = App\Models\Bill::find(11);
echo "SPP Nov: Dibayar Rp " . number_format($tagihanSPP->amount_paid) . " | Status: " . $tagihanSPP->status . PHP_EOL;
// Output: SPP Nov: Dibayar Rp 200,000 | Status: paid
```

Simulasi di atas membuktikan bahwa:
* Satu nomor kuitansi tunggal berhasil mendistribusikan pelunasan ke dua pos tagihan yang berbeda secara presisi.
* Tagihan uang gedung beralih status secara akurat menjadi `partially_paid` dengan sisa saldo kewajiban Rp 1.100.000.
* Tagihan SPP bulan November seketika beralih status menjadi `paid` (lunas).

---

## 8. Sinergi Integritas Data dan Keamanan Finansial

Implementasi teknis pada Bagian 3 ini mencerminkan komitmen terhadap standar rekayasa perangkat lunak finansial enterprise:
1. **Mitigasi Kondisi Balapan (*Race Condition Prevention*)**: Dengan menggunakan `lockForUpdate()`, kita mengeliminasi celah di mana kasir loket dan siswa (jika kelak membayar via gerbang payment gateway secara mandiri) memproses tagihan yang sama pada detik yang bersamaan. Ini merupakan perwujudan konkret dari prinsip pertahanan berlapis yang kita ulas dalam [Refleksi Kritis Infrastruktur Digital dan Badai Siber Indonesia](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia).
2. **Kepatuhan Terhadap Disiplin Transaksi ACID**: Membungkus seluruh mutasi tabel dalam `DB::transaction()` menjamin bahwa jika pencatatan salah satu rincian pembayaran gagal, seluruh histori kuitansi kasir akan dibatalkan (*rollback*) ke kondisi semula.
3. **Penyelarasan dengan Paradigma Service Layer**: Pendekatan arsitektur *Service-Oriented* ini selaras dengan disiplin rekayasa sistem yang kita bahas dalam [Transformasi Digital dalam Sistem Informasi](/blog/transformasi-digital-dalam-sistem-informasi) dan ketangguhan kontrol transaksi pada [Kajian Membangun CRUD Tangguh dengan Yii 2](/blog/tutorial-crud-yii-framework-panduan-praktisi).

---

## 9. Roadmap Seri Selanjutnya (Menuju Bagian 4)

Dengan rampungnya mesin penagihan massal dan mesin transaksi pelunasan kasir pada Bagian 3 ini, aplikasi kita telah memiliki logika inti yang berfungsi penuh. Pada episode pemungkas (**Bagian 4**), kita melengkapi sistem ini dengan fitur penunjang operasional modern:

* **Bagian 4 (Tersedia)**: [Kuitansi PDF Dinamis, Integrasi WhatsApp Gateway, dan Dasbor Eksekutif Yayasan](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-pdf-wa-dashboard) — Pembangunan modul cetak kuitansi PDF resmi, notifikasi WhatsApp Gateway berbasis Queue Job, dan dasbor analitik keuangan yayasan real-time.

Simpan kode di atas dan pastikan Anda telah menguji alur transaksinya di lingkungan lokal sebelum kita melangkah ke tahap penerbitan kuitansi dan integrasi WhatsApp Gateway!

---

## Catatan Kaki & Tautan Terkait

1. **Artikel Bagian 1**: [Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Analisis Kebutuhan dan Perancangan Basis Data MySQL (Bagian 1)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database).
2. **Artikel Bagian 2**: [Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Migrasi Skema, Model Eloquent, dan Multi-Tenant Global Scope (Bagian 2)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope).
3. **Artikel Bagian 4 (Final)**: [Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Kuitansi PDF Dinamis, Integrasi WhatsApp Gateway, dan Dasbor Eksekutif Yayasan (Bagian 4)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-pdf-wa-dashboard).
3. **Dokumentasi Resmi Laravel Database Transactions**: Panduan arsitektur transaksi ACID, penguncian pesimistik, dan penanganan deadlock tersedia pada [Laravel Database Transactions](https://laravel.com/docs/database#database-transactions).
4. **Dokumentasi Resmi Laravel Artisan Console**: Panduan pembuatan *Custom Command* dan penjadwalan tugas berkala pada [Laravel Artisan Documentation](https://laravel.com/docs/artisan).
5. **Jejaring Kajian Relevan MAS-AGUS Knowledge Hub**:
   - Evolusi ekosistem backend dan transaksi modern: [Transformasi Framework Laravel: Dari Alternatif Elegan Menjadi Raksasa Ekosistem Web Modern](/blog/transformasi-dan-perkembangan-fitur-laravel-framework).
   - Pengorganisasian logika data enterprise dan penanganan integritas transaksi: [Membangun CRUD Tangguh dengan Yii 2 Framework: Catatan dan Panduan Praktisi Rekayasa Sistem](/blog/tutorial-crud-yii-framework-panduan-praktisi).
   - Strategi tata kelola data publik terintegrasi: [Transformasi Digital dalam Sistem Informasi: Integrasi Layanan Publik Menuju Efisiensi Tata Kelola Modern](/blog/transformasi-digital-dalam-sistem-informasi).
   - Metodologi rekayasa artefak komputasi terapan: [Metodologi Penelitian Terapan dalam Bidang Sistem Informasi](/blog/metodologi-penelitian-terapan-dalam-bidang-sistem-informasi).
   - Pengerasan keamanan transaksi finansial dan perlindungan sistem: [Menghadapi Badai Siber: Refleksi Kritis atas Ketahanan Infrastruktur Digital Indonesia](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia).
