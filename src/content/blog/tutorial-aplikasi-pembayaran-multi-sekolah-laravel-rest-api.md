---
title: "Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Arsitektur RESTful API, Laravel Sanctum, dan Integrasi Klien Terdistribusi (Bagian 5)"
description: "Panduan praktisi rekayasa sistem membangun RESTful API stateless di atas arsitektur Multi-Tenant Laravel menggunakan Laravel Sanctum, Eloquent API Resources, Rate Limiting, dan resolusi konteks sekolah berbasis header HTTP."
pubDate: 2026-11-26
updatedDate: 2026-11-26
category: "Rekayasa Sistem"
tags:
  - Laravel
  - RESTful API
  - Laravel Sanctum
  - Multi-Tenancy
  - API Resources
  - Software Architecture
  - Tutorial Berseri
featured: true
draft: false
cover: "/images/articles/aplikasi-pembayaran-multi-sekolah-laravel-part5.svg"
coverAlt: "Diagram arsitektur RESTful API stateless berbasis Laravel Sanctum dan Eloquent API Resources untuk sistem pembayaran multi-sekolah yayasan"
seoTitle: "Aplikasi Pembayaran Multi-Sekolah Laravel: RESTful API & Sanctum (Bagian 5) — MAS-AGUS"
seoDescription: "Tutorial berseri Laravel Bagian 5: merancang RESTful API stateless multi-tenant dengan Laravel Sanctum, API Resources, Rate Limiting, dan integrasi aplikasi mobile."
focusKeyword: "RESTful API Laravel Sanctum Multi-Sekolah"
lang: "id"
translationSlug: "multi-school-payment-system-laravel-restful-api-sanctum-part-5"
---

> **Dokumentasi Rekayasa Perangkat Lunak & Tutorial Berseri (Bagian 5)**  
> **Penulis:** Agus Sifaunajah (MAS-AGUS)  
> **Prasyarat Pengetahuan:** Telah menyelesaikan [Bagian 1: Analisis Basis Data MySQL](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database), [Bagian 2: Eloquent Multi-Tenant Scope](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope), [Bagian 3: Billing Engine & Transaksi Kasir ACID](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-billing-transaksi), dan [Bagian 4: Kuitansi PDF, WhatsApp Gateway & Dasbor Eksekutif](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-pdf-wa-dashboard).  
> **Target Luaran Sistem:** Lapisan RESTful API *stateless* berstandar produksi (`/api/v1`) dengan autentikasi token Sanctum, isolasi tenant otomatis via HTTP header, transformasi JSON via API Resources, dan proteksi *Rate Limiting*.

---

## 1. Pendahuluan: Dari Aplikasi Web Monolitik Menuju Ekosistem Terdistribusi

Pada empat episode terdahulu, kita telah membangun inti sistem pembayaran multi-sekolah yang beroperasi utuh di atas peramban web: mulai dari [perancangan skema relasional MySQL 3NF](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database), [penguncian isolasi data melalui Eloquent Global Scope](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope), [mesin penagihan massal dan transaksi kasir ACID](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-billing-transaksi), hingga [otomasi kuitansi PDF, antrean WhatsApp, dan dasbor eksekutif yayasan](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-pdf-wa-dashboard).

Namun, dalam realitas operasional yayasan pendidikan modern, aplikasi web administratif saja tidak lagi memadai. Selama saya mendampingi transformasi digital di berbagai institusi pendidikan dan instansi publik—sebagaimana yang juga saya bedah secara empiris pada kajian [Transformasi Digital dalam Sistem Informasi dan Integrasi REST API](/blog/transformasi-digital-dalam-sistem-informasi)—kebutuhan integrasi lintas platform selalu muncul segera setelah sistem inti berjalan:

1. **Aplikasi Mobile Wali Murid**: Orang tua siswa ingin mengecek sisa tunggakan SPP, melihat riwayat pelunasan, dan mengunduh kuitansi PDF langsung dari ponsel pintar mereka (misalnya melalui klien mobile hibrida berbasis [Framework7](/blog/mengenal-framework-7-aplikasi-mobile-hibrida) atau PWA).
2. **Integrasi Aplikasi Akademik Eksternal (SIAKAD)**: Sistem informasi akademik atau portal e-rapor yayasan perlu memeriksa status kelayakan ujian (*bebas tunggakan*) secara otomatis sebelum menerbitkan kartu ujian siswa.
3. **Kesiapan Konsumsi *Payment Gateway* & Kanal Pembayaran Modern**: Loket kasir tidak lagi eksklusif tunai; sistem perlu melayani permintaan konfirmasi tagihan dan pelunasan dari mesin EDC, aplikasi kasir tablet, maupun *callback* layanan perbankan.

Untuk menjawab kebutuhan tersebut tanpa menduplikasi logika bisnis (`BillingService` dan `PaymentService`) yang sudah kita bangun susah payah, solusi rekayasa paling bersih adalah membungkus inti layanan tersebut dengan **lapisan RESTful API**.

---

## 2. Tantangan Arsitektural: RESTful API pada Sistem Multi-Tenant

Sebagaimana dirumuskan oleh Roy Fielding (2000) dalam disertasinya mengenai *Representational State Transfer (REST)*, prinsip paling fundamental dari RESTful API adalah **Statelessness**—setiap permintaan (*request*) dari klien ke server harus membawa seluruh informasi konteks yang dibutuhkan untuk memprosesnya tanpa bergantung pada memori *Session* server.

Di sinilah letak jebakan arsitektural yang sering luput dari perhatian pengembang pemula:

> [!IMPORTANT]
> Pada Bagian 2, middleware `SetTenantContext` mengandalkan `session('active_school_id')` untuk menentukan konteks unit sekolah bagi admin yayasan. **Di jalur RESTful API (`routes/api.php`), PHP Session dan Cookie tidak digunakan.** Oleh karena itu, kita wajib merancang mekanisme resolusi tenant yang murni *stateless* berbasis **Token Autentikasi (Bearer Token)** dan **HTTP Request Header (`X-School-Code`)**!

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             ARSITEKTUR RESTFUL API STATELESS MULTI-TENANT                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Klien Mobile / SIAKAD]                                                    │
│     │  Authorization: Bearer <Sanctum_Token>                                │
│     │  X-School-Code: SMP-IT   (Opsional bagi Admin Yayasan)                │
│     ▼                                                                       │
│  [API Gateway Middleware Pipeline]                                          │
│     ├─ 1. throttle:api         (Proteksi Brute-Force & DDoS)                │
│     ├─ 2. auth:sanctum         (Validasi Bearer Token & Abilities)          │
│     └─ 3. resolve.api.tenant   (Kunci TenantManager ke school_id aktif)     │
│     │                                                                       │
│     ▼                                                                       │
│  [Thin API Controllers] ──> [PaymentService / BillingService]               │
│     │                       (Memanfaatkan Eloquent SchoolScope Otomatis)    │
│     ▼                                                                       │
│  [Eloquent API Resources] ──> Payload JSON Terstandarisasi (HTTP 200/201)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

Keindahan dari arsitektur berlapis yang kita rancang sejak Bagian 2 adalah: begitu `ResolveApiTenant` berhasil menyuntikkan objek `School` ke dalam singleton `TenantManager`, **seluruh model (`Student`, `Bill`, `PaymentTransaction`) dan seluruh service (`BillingService`, `PaymentService`) secara otomatis terisolasi tanpa mengubah satu baris pun kode kueri!**

---

## 3. Langkah 1: Instalasi & Konfigurasi Laravel Sanctum

Pada Laravel 11 dan 12, kerangka kerja API dan **Laravel Sanctum** dapat diaktifkan melalui satu perintah Artisan resmi:

```bash
php artisan install:api
```

Perintah tersebut akan membuat berkas `routes/api.php`, menerbitkan migrasi tabel `personal_access_tokens`, dan menjalankan migrasi basis data.

Selanjutnya, pastikan model `App\Models\User` menggunakan trait `HasApiTokens` dari Sanctum agar setiap pengguna (kasir unit, admin yayasan, maupun akun layanan SIAKAD) dapat menerbitkan token akses:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',      // 'foundation_admin', 'cashier', 'api_client'
        'school_id', // NULL jika foundation_admin
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
```

---

## 4. Langkah 2: Membangun Middleware `ResolveApiTenant` (Stateless)

Mari kita buat middleware khusus jalur API yang mengekstrak konteks unit sekolah tanpa menyentuh `session()`:

```bash
php artisan make:middleware ResolveApiTenant
```

Buka `app/Http/Middleware/ResolveApiTenant.php`, lalu implementasikan logika resolusi berbasis token dan header `X-School-Code`:

```php
<?php

namespace App\Http\Middleware;

use App\Models\School;
use App\Services\TenantManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveApiTenant
{
    public function __construct(
        protected TenantManager $tenantManager
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthenticated API request.',
            ], 401);
        }

        // 1. Jika pengguna terikat pada unit sekolah tertentu (Kasir Unit / Klien Unit)
        if ($user->role !== 'foundation_admin') {
            $school = School::where('id', $user->school_id)
                ->where('is_active', true)
                ->first();

            if (!$school) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Akun Anda tidak terhubung dengan unit sekolah yang aktif.',
                ], 403);
            }

            $this->tenantManager->setSchool($school);
            return $next($request);
        }

        // 2. Jika pengguna adalah Admin Yayasan, periksa header HTTP X-School-Code
        $schoolCode = $request->header('X-School-Code');

        if ($schoolCode) {
            $school = School::where('code', $schoolCode)
                ->where('is_active', true)
                ->first();

            if (!$school) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Unit sekolah dengan kode '{$schoolCode}' tidak ditemukan atau nonaktif.",
                ], 404);
            }

            $this->tenantManager->setSchool($school);
        }

        // Catatan: Jika foundation_admin tidak mengirim header X-School-Code,
        // TenantManager tetap NULL (beroperasi pada mode konsolidasi lintas-unit).
        return $next($request);
    }
}
```

Daftarkan alias middleware ini di `bootstrap/app.php` (struktur Laravel 11+):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'resolve.api.tenant' => \App\Http\Middleware\ResolveApiTenant::class,
    ]);
})
```

---

## 5. Langkah 3: Endpoint Autentikasi & Token Abilities (`AuthController`)

Dalam praktik rekayasa keamanan API, token tidak boleh diberikan hak akses tanpa batas. Sanctum mendukung konsep **Token Abilities** (hak akses granular yang disematkan pada token).

Buat `app/Http/Controllers/Api/V1/AuthController.php`:

```bash
php artisan make:controller Api/V1/AuthController
```

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Menerbitkan Bearer Token Sanctum beserta hak akses (abilities) sesuai peran.
     */
    public function issueToken(Request $request): JsonResponse
    {
        $request->validate([
            'email'       => ['required', 'email'],
            'password'    => ['required', 'string'],
            'device_name' => ['required', 'string', 'max:100'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang Anda masukkan tidak valid.'],
            ]);
        }

        // Tentukan abilities token berdasarkan peran pengguna
        $abilities = match ($user->role) {
            'foundation_admin' => ['bills:read', 'payments:write', 'foundation:aggregate'],
            'cashier'          => ['bills:read', 'payments:write'],
            default            => ['bills:read'],
        };

        // Terbitkan token baru dengan masa berlaku terukur
        $token = $user->createToken($request->device_name, $abilities, now()->addDays(7));

        return response()->json([
            'status' => 'success',
            'data'   => [
                'access_token' => $token->plainTextToken,
                'token_type'   => 'Bearer',
                'expires_at'   => $token->accessToken->expires_at?->toIso8601String(),
                'user'         => [
                    'id'        => $user->id,
                    'name'      => $user->name,
                    'role'      => $user->role,
                    'school_id' => $user->school_id,
                ],
            ],
        ], 200);
    }

    /**
     * Mencabut token aktif saat pengguna keluar (logout).
     */
    public function revokeToken(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Token akses berhasil dicabut.',
        ], 200);
    }
}
```

---

## 6. Langkah 4: Transformasi JSON Terstandarisasi via API Resources

Salah satu kesalahan paling umum dalam pembuatan RESTful API adalah mengembalikan objek model Eloquent secara mentah (`return response()->json($bills)`). Praktik ini berisiko membocorkan kolom internal basis data dan menghasilkan format JSON yang tidak konsisten jika struktur tabel berubah di masa depan.

Kita wajib menggunakan **Eloquent API Resources** sebagai kontrak data (*Data Transfer Object / DTO*):

```bash
php artisan make:resource Api/V1/BillResource
php artisan make:resource Api/V1/PaymentTransactionResource
```

### A. `app/Http/Resources/Api/V1/BillResource.php`
```php
<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $remaining = (float) ($this->amount_due - $this->amount_paid);

        return [
            'bill_id'           => $this->id,
            'payment_type'      => $this->whenLoaded('paymentType', fn() => $this->paymentType->name),
            'billing_cycle'     => $this->whenLoaded('paymentType', fn() => $this->paymentType->billing_cycle),
            'period'            => [
                'month' => $this->period_month,
                'year'  => $this->period_year,
            ],
            'amount_due'        => (float) $this->amount_due,
            'amount_paid'       => (float) $this->amount_paid,
            'remaining_balance' => $remaining,
            'formatted'         => [
                'remaining' => 'Rp ' . number_format($remaining, 0, ',', '.'),
            ],
            'status'            => $this->status,
            'due_date'          => $this->due_date?->format('Y-m-d'),
        ];
    }
}
```

### B. `app/Http/Resources/Api/V1/PaymentTransactionResource.php`
```php
<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'receipt_number'   => $this->receipt_number,
            'total_amount'     => (float) $this->total_amount,
            'payment_method'   => $this->payment_method,
            'transaction_date' => $this->transaction_date?->toIso8601String(),
            'received_by'      => $this->received_by,
            'student'          => $this->whenLoaded('student', fn() => [
                'nis'       => $this->student->nis,
                'full_name' => $this->student->full_name,
            ]),
            'allocations'      => $this->whenLoaded('details', fn() => $this->details->map(fn($detail) => [
                'bill_id'      => $detail->bill_id,
                'payment_type' => $detail->bill?->paymentType?->name,
                'amount'       => (float) $detail->amount,
            ])),
            'receipt_pdf_url'  => route('receipt.download', ['receipt_number' => $this->receipt_number]),
        ];
    }
}
```

---

## 7. Langkah 5: Controller API & Orkestrasi Rute Terversi (`/api/v1`)

Sekarang kita buat dua controller API yang ramping (*thin controllers*) karena seluruh logika bisnis berat sudah ditangani secara terpusat oleh `PaymentService` dan `SchoolScope`.

```bash
php artisan make:controller Api/V1/StudentBillApiController
php artisan make:controller Api/V1/PaymentApiController
```

### A. `app/Http/Controllers/Api/V1/StudentBillApiController.php`
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BillResource;
use App\Models\Bill;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentBillApiController extends Controller
{
    /**
     * Mengambil daftar tagihan siswa berdasarkan NIS di dalam unit sekolah aktif.
     */
    public function index(Request $request, string $nis): JsonResponse
    {
        if (!$request->user()->tokenCan('bills:read')) {
            return response()->json(['status' => 'error', 'message' => 'Token tidak memiliki izin baca tagihan.'], 403);
        }

        // Karena BelongsToSchool aktif, kueri ini otomatis terisolasi ke unit sekolah yang sah
        $student = Student::where('nis', $nis)->first();

        if (!$student) {
            return response()->json([
                'status'  => 'error',
                'message' => "Siswa dengan NIS {$nis} tidak ditemukan pada unit sekolah ini.",
            ], 404);
        }

        $statusFilter = $request->query('status'); // opsional: unpaid, partially_paid, paid

        $bills = Bill::with('paymentType')
            ->where('student_id', $student->id)
            ->when($statusFilter, fn($q) => $q->where('status', $statusFilter))
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json([
            'status'  => 'success',
            'student' => [
                'id'        => $student->id,
                'nis'       => $student->nis,
                'full_name' => $student->full_name,
            ],
            'data' => BillResource::collection($bills),
        ], 200);
    }
}
```

### B. `app/Http/Controllers/Api/V1/PaymentApiController.php`
Perhatikan bagaimana controller API ini **memanfaatkan ulang 100%** `StorePaymentTransactionRequest` dan `PaymentService` yang telah kita uji pada Bagian 3! Tidak ada duplikasi logika penguncian baris (`lockForUpdate`) ataupun pemrosesan antrean WhatsApp.

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentTransactionRequest;
use App\Http\Resources\Api\V1\PaymentTransactionResource;
use App\Models\PaymentTransaction;
use App\Models\Student;
use App\Services\PaymentService;
use App\Services\TenantManager;
use Illuminate\Http\JsonResponse;

class PaymentApiController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
        protected TenantManager $tenantManager
    ) {}

    /**
     * Memproses pelunasan tagihan melalui endpoint RESTful API.
     */
    public function store(StorePaymentTransactionRequest $request): JsonResponse
    {
        if (!$request->user()->tokenCan('payments:write')) {
            return response()->json(['status' => 'error', 'message' => 'Token tidak memiliki izin transaksi pembayaran.'], 403);
        }

        $school = $this->tenantManager->getSchool();

        if (!$school) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Header X-School-Code wajib disertakan untuk transaksi API lintas unit.',
            ], 422);
        }

        $student = Student::findOrFail($request->validated('student_id'));

        $transaction = $this->paymentService->processPayment(
            school: $school,
            student: $student,
            allocations: $request->validated('allocations'),
            paymentMethod: $request->validated('payment_method'),
            receivedBy: $request->user()->name . ' (API)',
            notes: $request->validated('notes')
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Transaksi pembayaran berhasil dicatat melalui API.',
            'data'    => new PaymentTransactionResource($transaction),
        ], 201);
    }

    /**
     * Mengambil detail kuitansi transaksi berdasarkan nomor kuitansi.
     */
    public function show(string $receiptNumber): JsonResponse
    {
        $transaction = PaymentTransaction::with(['student', 'details.bill.paymentType'])
            ->where('receipt_number', $receiptNumber)
            ->first();

        if (!$transaction) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Nomor kuitansi tidak ditemukan pada unit sekolah aktif.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => new PaymentTransactionResource($transaction),
        ], 200);
    }
}
```

### C. Definisi Rute API Terversi (`routes/api.php`)
```php
<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PaymentApiController;
use App\Http\Controllers\Api\V1\StudentBillApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Rute Publik: Penerbitan Token (dibatasi rate limiter ketat)
    Route::post('/auth/token', [AuthController::class, 'issueToken'])
        ->middleware('throttle:10,1');

    // Rute Terproteksi: Wajib Bearer Token Sanctum + Isolasi Tenant
    Route::middleware(['auth:sanctum', 'throttle:60,1', 'resolve.api.tenant'])->group(function () {
        Route::post('/auth/revoke', [AuthController::class, 'revokeToken']);

        // Kueri Tagihan Siswa
        Route::get('/students/{nis}/bills', [StudentBillApiController::class, 'index']);

        // Transaksi Pembayaran & Kuitansi
        Route::post('/payments', [PaymentApiController::class, 'store']);
        Route::get('/payments/{receiptNumber}', [PaymentApiController::class, 'show'])
            ->where('receiptNumber', '.*');
    });
});
```

> [!TIP]
> Perhatikan penggunaan `->where('receiptNumber', '.*')` pada rute `GET /payments/{receiptNumber}`. Karena format nomor kuitansi kita mengandung garis miring (`KWT/SMP-IT/202611/0001`), parameter wildcard regex tersebut wajib ditambahkan agar Laravel Router tidak salah mengira tanda `/` sebagai pemisah segmen URL! Alternatif lainnya adalah mengirimkan nomor kuitansi sebagai *query parameter* (`?receipt_number=...`).

---

## 8. Langkah 6: Pengujian End-to-End Menggunakan `curl`

Setelah server lokal berjalan (`php artisan serve`), Anda dapat menguji seluruh siklus API langsung dari terminal:

### 1. Meminta Bearer Token
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/token \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kasir.smp@yayasan.ac.id",
    "password": "password-rahasia",
    "device_name": "Mobile-Kasir-Tablet-01"
  }'
```

### 2. Mengambil Daftar Tagihan Belum Lunas Siswa
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/students/SMP-2001/bills?status=unpaid" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|aBcDeFgHiJkLmNoPqRsTuVwXyZ"
```

### 3. Mengirim Transaksi Pelunasan (Multi-Pos)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/payments \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|aBcDeFgHiJkLmNoPqRsTuVwXyZ" \
  -d '{
    "student_id": 15,
    "payment_method": "qris",
    "notes": "Pembayaran via Aplikasi Mobile Wali Murid",
    "allocations": [
      { "bill_id": 10, "amount": 400000 },
      { "bill_id": 11, "amount": 200000 }
    ]
  }'
```

---

## 9. Pengerasan Keamanan API (API Security Hardening)

Mengekspos layanan keuangan ke jaringan internet publik melalui RESTful API membuka permukaan serangan baru. Selaras dengan refleksi saya dalam kajian [Menghadapi Badai Siber: Refleksi Kritis Infrastruktur Digital Indonesia](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia), empat lapis pertahanan berikut wajib diterapkan sebelum naik ke server produksi:

1. **Mitigasi *Insecure Direct Object Reference* (IDOR)**: Jika pengguna nakal mencoba mengubah `student_id` atau `bill_id` pada payload JSON menjadi ID milik sekolah lain, kombinasi `SchoolScope` dan kueri `where('school_id', $school->id)` di dalam `PaymentService` akan seketika menolak permintaan tersebut dengan `ModelNotFoundException` (HTTP 404).
2. **Pembatasan Laju Permintaan (*Rate Limiting*)**: Endpoint login `/auth/token` dibatasi `throttle:10,1` (maksimal 10 percobaan per menit per IP) guna melumpuhkan serangan *credential stuffing* dan *brute-force*.
3. **Konfigurasi CORS Ketat (`config/cors.php`)**: Jangan pernah membiarkan `'allowed_origins' => ['*']` pada sistem finansial produksi. Daftarkan hanya domain resmi portal yayasan dan skema aplikasi mobile yang sah.
4. **Wajib Enkripsi Transport (HTTPS/TLS)**: Token *Bearer* setara dengan kunci rumah kasir. Pastikan seluruh trafik API wajib melewati protokol HTTPS dengan konfigurasi HSTS aktif di web server (Nginx/Cloudflare).

---

## 10. Penutup: Menyempurnakan Ekosistem Multi-Sekolah

Dengan selesainya **Bagian 5** ini, sistem pembayaran multi-sekolah yayasan kita telah berevolusi sepenuhnya menjadi platform enterprise terdistribusi:
* **[Bagian 1](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database)**: Fondasi Basis Data MySQL 3NF & presisi `DECIMAL(12, 2)`.
* **[Bagian 2](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope)**: Isolasi Multi-Tenant otomatis via `SchoolScope` & Trait `BelongsToSchool`.
* **[Bagian 3](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-billing-transaksi)**: Mesin Billing Massal, Tarif Beasiswa Bertingkat, & Transaksi Kasir ACID (`lockForUpdate()`).
* **[Bagian 4](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-pdf-wa-dashboard)**: Kuitansi PDF Resmi, Antrean Asynchronous WhatsApp Gateway, & Dasbor Eksekutif Yayasan.
* **Bagian 5 (Artikel Ini)**: Lapisan **RESTful API Stateless** berstandar produksi dengan Laravel Sanctum, API Resources, dan integrasi klien mobile/eksternal.

Arsitektur yang terpisah secara bersih (*decoupled*) ini kini siap dikonsumsi oleh aplikasi Android/iOS wali murid, diintegrasikan dengan SIAKAD kampus/sekolah, maupun dihubungkan ke berbagai kanal *Payment Gateway* modern.

---

## Catatan Kaki & Tautan Terkait

1. **Dokumentasi Resmi Laravel Sanctum**: Spesifikasi autentikasi SPA, penerbitan API token, dan token abilities tersedia di [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum).
2. **Dokumentasi Resmi Eloquent API Resources**: Panduan transformasi layer JSON pada [Laravel Eloquent Resources](https://laravel.com/docs/eloquent-resources).
3. **Disertasi Arsitektur REST (Roy Fielding)**: Landasan teoretis arsitektur *Representational State Transfer* (REST), *Architectural Styles and the Design of Network-based Software Architectures*, UC Irvine, 2000.
4. **Jejaring Kajian Relevan MAS-AGUS Knowledge Hub**:
   - Fondasi arsitektur integrasi API sektor publik: [Transformasi Digital dalam Sistem Informasi: Mengatasi Sistem Silo Melalui Tata Kelola SPBE dan Integrasi REST API](/blog/transformasi-digital-dalam-sistem-informasi).
   - Membangun klien mobile konsumen API: [Mengenal Framework7: Membangun Aplikasi Mobile Hibrida dan PWA Berkinerja Tinggi](/blog/mengenal-framework-7-aplikasi-mobile-hibrida).
   - Evolusi lengkap kerangka kerja PHP modern: [Transformasi Framework Laravel: Dari Alternatif Elegan Menjadi Raksasa Ekosistem Web Modern](/blog/transformasi-dan-perkembangan-fitur-laravel-framework).
   - Keamanan infrastruktur jaringan & API: [Menghadapi Badai Siber: Refleksi Kritis atas Kerentanan Infrastruktur Digital Indonesia](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia).
