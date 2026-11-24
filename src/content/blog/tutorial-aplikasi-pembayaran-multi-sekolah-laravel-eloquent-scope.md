---
title: "Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Migrasi Skema, Model Eloquent, dan Multi-Tenant Global Scope (Bagian 2)"
description: "Panduan praktisi rekayasa sistem mengenai transformasi skema MySQL ke Migration Laravel, pemodelan relasi Eloquent, dan penerapan arsitektur Multi-Tenant otomatis via Global Scope dan Trait BelongsToSchool."
pubDate: 2026-11-24
updatedDate: 2026-11-24
category: "Rekayasa Sistem"
tags:
  - Laravel
  - Eloquent
  - Multi-Tenancy
  - Global Scope
  - Database Migrations
  - Tutorial Berseri
featured: true
draft: false
cover: "/images/articles/aplikasi-pembayaran-multi-sekolah-laravel-part2.svg"
coverAlt: "Arsitektur Multi-Tenant Global Scope dan Pemodelan Eloquent Laravel untuk Sistem Pembayaran Multi-Sekolah Yayasan"
seoTitle: "Aplikasi Pembayaran Multi-Sekolah Laravel: Migrasi & Global Scope (Bagian 2) — MAS-AGUS"
seoDescription: "Tutorial berseri Laravel Bagian 2: translasi DDL ke Migration, pembuatan Trait BelongsToSchool, manajemen konteks tenant, dan isolasi kueri otomatis."
focusKeyword: "Aplikasi Pembayaran Multi-Sekolah Laravel"
---

> **Dokumentasi Rekayasa Perangkat Lunak & Tutorial Berseri (Model 1)**  
> **Penulis:** Agus Sifaunajah (MAS-AGUS)  
> **Topik Bahasan:** Translasi Skema ke Migrasi Laravel, Pemodelan Relasi Eloquent ORM, Implementasi Multi-Tenant Global Scope, dan Pencegahan Kebocoran Data (*Data Leakage*).

---

## 1. Kilas Balik dan Sasaran Rekayasa Bagian 2

Pada [Bagian 1: Analisis Kebutuhan dan Perancangan Basis Data MySQL](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database), kita telah merumuskan 11 tabel relasional berstandar ACID dengan pola arsitektur *Single-Database Multi-Tenancy*. Kita telah menetapkan kolom diskriminator `school_id` sebagai batas pemisah logis antar-unit sekolah (KB/TK, SD/MI, SMP/MTs, dan SMA/SMK) di bawah naungan yayasan.

Namun, memiliki rancangan tabel MySQL di atas kertas belumlah cukup. Di lapisan kode aplikasi (*application layer*), tantangan terberat dari arsitektur *Shared-Database* adalah: **bagaimana menjamin bahwa setiap kueri basis data selalu terisolasi pada unit sekolah yang sedang aktif tanpa membebani programmer menuliskan klausa `WHERE school_id = ?` secara manual di ratusan Controller?**

Menyerahkan penyaringan data secara manual kepada disiplin pengembang adalah bom waktu. Cepat atau lambat, seorang programmer junior akan lupa menyertakan filter `school_id` pada modul penagihan, yang berakibat fatal: kasir SMP dapat melihat daftar tunggakan siswa SMA, atau lebih buruk lagi, kuitansi pembayaran tercampur aduk.

Pada **Bagian 2** ini, kita akan menyelesaikan tantangan tersebut secara elegan menggunakan fitur tersembunyi namun sangat perkasa di [Transformasi Framework Laravel Modern](/blog/transformasi-dan-perkembangan-fitur-laravel-framework): **Eloquent Global Scope** dan **Custom Model Traits**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ALUR ISOLASI DATA MULTI-TENANT OTOMATIS                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. PERMINTAAN KASIR ──> [SetTenantContext Middleware]                       │
│                              │                                              │
│                              ▼ Mengunci Identitas Unit                      │
│                         [TenantManager] (Session Context: school_id = 2)    │
│                              │                                              │
│                              ▼ Diinjeksi Otomatis                           │
│ 2. ELOQUENT ORM     ──> [SchoolScope via BelongsToSchool Trait]             │
│                              │                                              │
│                              ▼ Transformasi Kueri Biner                     │
│ 3. BASIS DATA MYSQL ──> SELECT * FROM bills WHERE school_id = 2             │
│                         (Data Sekolah Lain Terisolasi Sempurna)             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Prasyarat Lingkungan Pengembangan

Sebelum mengeksekusi langkah-langkah di bawah ini, pastikan mesin pengembangan lokal Anda telah memenuhi spesifikasi tumpukan teknologi (*tech stack*) berikut:
* **PHP**: Versi 8.2 atau 8.3 dengan ekstensi `pdo_mysql`, `bcmath`, `mbstring`, dan `intl` aktif.
* **Framework**: Laravel 11.x atau 12.x.
* **Basis Data**: MySQL 8.0+ atau MariaDB 10.11+ (menggunakan engine InnoDB).
* **Perkakas Dependensi**: Composer versi 2.7+.

---

## 3. Langkah 1: Translasi DDL MySQL ke Database Migrations Laravel

Kita akan menerjemahkan rancangan DDL dari Bagian 1 ke dalam berkas *Database Migration* bawaan Laravel. Pembuatan skema menggunakan migration menjamin bahwa struktur tabel dapat direproduksi secara konsisten oleh seluruh tim pengembang dan server produksi (*CI/CD deployment*).

Buka terminal di direktori proyek Laravel Anda, lalu buat berkas migrasi untuk entitas yayasan, unit sekolah, dan operasional akademik:

```bash
php artisan make:migration create_foundation_and_school_tables
php artisan make:migration create_academic_structure_tables
php artisan make:migration create_payment_and_billing_tables
```

### A. Migrasi Master Yayasan dan Unit Sekolah
Buka berkas `database/migrations/xxxx_create_foundation_and_school_tables.php`, lalu susun skema berikut:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Master Yayasan
        Schema::create('foundations', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 150);
            $table->string('legal_number', 100)->nullable()->comment('Nomor SK Kemenkumham / Izin');
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email', 100)->nullable();
            $table->timestamps();
        });

        // 2. Tabel Unit Sekolah (Tenants)
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('foundation_id')
                  ->constrained('foundations')
                  ->restrictOnDelete()
                  ->cascadeOnUpdate();
            $table->string('code', 20)->unique()->comment('Kode unik, misal: SMP-IT, SMA-01');
            $table->string('name', 150);
            $table->enum('education_level', ['KB', 'TK', 'SD', 'MI', 'SMP', 'MTS', 'SMA', 'MA', 'SMK']);
            $table->string('npsn', 20)->nullable();
            $table->string('bank_name', 50)->nullable()->comment('Bank penampung kas unit');
            $table->string('bank_account_number', 50)->nullable();
            $table->string('bank_account_holder', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
        Schema::dropIfExists('foundations');
    }
};
```

### B. Migrasi Struktur Akademik dan Data Siswa
Buka berkas `database/migrations/xxxx_create_academic_structure_tables.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 3. Tabel Tahun Ajaran
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('name', 50)->comment('Contoh: 2026/2027 Ganjil');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->index(['school_id', 'is_active'], 'idx_academic_active');
        });

        // 4. Tabel Kelas
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('name', 50)->comment('Contoh: VII-A, X-RPL-1');
            $table->unsignedTinyInteger('grade_level')->comment('Tingkat: 1 s.d 12');
            $table->timestamps();

            $table->index(['school_id', 'academic_year_id'], 'idx_class_search');
        });

        // 5. Tabel Siswa
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('nis', 30)->comment('Nomor Induk Lokal Unit');
            $table->string('nisn', 30)->nullable();
            $table->string('full_name', 150);
            $table->enum('gender', ['L', 'P']);
            $table->string('parent_name', 150);
            $table->string('parent_phone', 30)->comment('Nomor WhatsApp untuk notifikasi tagihan');
            $table->text('address')->nullable();
            $table->enum('status', ['aktif', 'lulus', 'pindah', 'keluar'])->default('aktif');
            $table->timestamps();

            $table->unique(['school_id', 'nis'], 'uk_student_nis');
            $table->index(['school_id', 'full_name'], 'idx_student_name');
        });

        // 6. Tabel Pivot Kenaikan / Mutasi Kelas Siswa
        Schema::create('student_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('class_id')->constrained('classes')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete()->cascadeOnUpdate();
            $table->enum('status', ['aktif', 'mutasi_keluar', 'lulus'])->default('aktif');
            $table->timestamps();

            $table->unique(['student_id', 'academic_year_id'], 'uk_student_academic_class');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_classes');
        Schema::dropIfExists('students');
        Schema::dropIfExists('classes');
        Schema::dropIfExists('academic_years');
    }
};
```

### C. Migrasi Master Biaya, Tagihan, dan Transaksi Kasir
Buka berkas `database/migrations/xxxx_create_payment_and_billing_tables.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 7. Tabel Master Pos Pembayaran
        Schema::create('payment_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('name', 100);
            $table->enum('billing_cycle', ['monthly', 'yearly', 'once']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['school_id', 'billing_cycle'], 'idx_pt_school');
        });

        // 8. Tabel Tarif Pembayaran (Standar & Pengecualian Khusus)
        Schema::create('payment_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_type_id')->constrained('payment_types')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('class_id')->nullable()->constrained('classes')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('student_id')->nullable()->constrained('students')->restrictOnDelete()->cascadeOnUpdate();
            $table->decimal('amount', 12, 2)->default(0.00);
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['payment_type_id', 'academic_year_id', 'class_id', 'student_id'], 'idx_rate_lookup');
        });

        // 9. Tabel Tagihan Siswa (Bills)
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('payment_type_id')->constrained('payment_types')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete()->cascadeOnUpdate();
            $table->unsignedTinyInteger('period_month')->nullable()->comment('1 s.d 12');
            $table->unsignedSmallInteger('period_year')->nullable();
            $table->decimal('amount_due', 12, 2);
            $table->decimal('amount_paid', 12, 2)->default(0.00);
            $table->enum('status', ['unpaid', 'partially_paid', 'paid'])->default('unpaid');
            $table->date('due_date');
            $table->timestamps();

            $table->index(['school_id', 'status', 'due_date'], 'idx_bills_filtering');
            $table->index(['student_id', 'status'], 'idx_bills_student');
        });

        // 10. Tabel Transaksi Kasir (Ledger Pembayaran)
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('receipt_number', 50)->unique();
            $table->decimal('total_amount', 12, 2);
            $table->enum('payment_method', ['cash', 'transfer_bank', 'qris', 'payment_gateway'])->default('cash');
            $table->dateTime('transaction_date')->useCurrent();
            $table->string('received_by', 100);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'transaction_date'], 'idx_tx_school_date');
        });

        // 11. Tabel Rincian Alokasi Pelunasan
        Schema::create('payment_transaction_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('payment_transactions')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('bill_id')->constrained('bills')->restrictOnDelete()->cascadeOnUpdate();
            $table->decimal('amount', 12, 2);
            $table->timestamps();

            $table->index(['transaction_id', 'bill_id'], 'idx_ptd_lookup');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transaction_details');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('bills');
        Schema::dropIfExists('payment_rates');
        Schema::dropIfExists('payment_types');
    }
};
```

Jalankan perintah migrasi untuk membangun seluruh tabel di server MySQL Anda:

```bash
php artisan migrate
```

---

## 4. Langkah 2: Manajemen Konteks Tenant (Service & Middleware)

Aplikasi harus mengetahui secara pasti: **siapa pengguna yang sedang aktif dan unit sekolah mana yang menjadi konteks operasinya saat ini?**

Kita memiliki dua profil pengguna:
1. **Kasir / Bendahara Unit**: Hanya memiliki akses ke 1 unit sekolah tertentu (misal kasir SMP hanya bisa bertransaksi di SMP).
2. **Pengurus Yayasan / Bendahara Umum**: Memiliki hak istimewa untuk mengawasi seluruh unit sekolah dan dapat berpindah (*switch*) antar-unit sekolah sesuka hati melalui antarmuka dasbor.

### A. Membuat TenantManager Service
Buat berkas layanan di `app/Services/TenantManager.php`. Layanan ini akan didaftarkan sebagai *Singleton* di dalam Laravel Service Container:

```php
<?php

namespace App\Services;

use App\Models\School;

class TenantManager
{
    protected ?School $currentSchool = null;

    /**
     * Menetapkan unit sekolah aktif dalam siklus permintaan saat ini.
     */
    public function setSchool(?School $school): void
    {
        $this->currentSchool = $school;
    }

    /**
     * Mendapatkan objek unit sekolah aktif.
     */
    public function getSchool(): ?School
    {
        return $this->currentSchool;
    }

    /**
     * Mendapatkan ID unit sekolah aktif.
     */
    public function getSchoolId(): ?int
    {
        return $this->currentSchool?->id;
    }

    /**
     * Memeriksa apakah konteks sekolah sedang aktif (tidak dalam mode konsolidasi yayasan).
     */
    public function hasActiveSchool(): bool
    {
        return !is_null($this->currentSchool);
    }
}
```

Daftarkan layanan tersebut di `app/Providers/AppServiceProvider.php`:

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\TenantManager;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Daftarkan TenantManager sebagai Singleton
        $this->app->singleton(TenantManager::class, function () {
            return new TenantManager();
        });
    }

    public function boot(): void
    {
        //
    }
}
```

### B. Membuat Middleware Penyinkron Konteks
Buat middleware bernama `SetTenantContext`:

```bash
php artisan make:middleware SetTenantContext
```

Buka `app/Http/Middleware/SetTenantContext.php`, lalu pasang logika resolusi sesi:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\TenantManager;
use App\Models\School;

class SetTenantContext
{
    public function __construct(
        protected TenantManager $tenantManager
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $schoolId = null;

            // 1. Jika pengguna adalah Admin Yayasan, periksa apakah ada session switch sekolah
            if ($user->role === 'foundation_admin') {
                $schoolId = session('active_school_id');
            } else {
                // 2. Jika kasir / petugas unit, kunci permanen ke school_id miliknya
                $schoolId = $user->school_id;
            }

            if ($schoolId) {
                $school = School::where('id', $schoolId)->where('is_active', true)->first();
                if ($school) {
                    $this->tenantManager->setSchool($school);
                }
            }
        }

        return $next($request);
    }
}
```

---

## 5. Langkah 3: Mengotomatisasi Isolasi Data via Global Scope & Trait

Inilah inti kecerdasan arsitektur kita. Alih-alih menambahkan klausa penyaring secara berulang, kita akan merancang **`SchoolScope`** yang bekerja secara otomatis di belakang layar.

### A. Membuat Kelas Scope
Buat berkas di `app/Models/Scopes/SchoolScope.php`:

```php
<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use App\Services\TenantManager;

class SchoolScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $tenantManager = app(TenantManager::class);

        // Jika ada unit sekolah aktif, suntikkan filter WHERE school_id = ?
        if ($tenantManager->hasActiveSchool()) {
            $builder->where($model->getTable() . '.school_id', $tenantManager->getSchoolId());
        }
    }
}
```

### B. Membuat Trait `BelongsToSchool`
Agar scope di atas dapat dipasang ke model mana pun hanya dengan satu baris kode, buat *Trait* di `app/Traits/BelongsToSchool.php`:

```php
<?php

namespace App\Traits;

use App\Models\Scopes\SchoolScope;
use App\Models\School;
use App\Services\TenantManager;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToSchool
{
    /**
     * Boot trait untuk mendaftarkan Global Scope dan event model.
     */
    protected static function bootBelongsToSchool(): void
    {
        // 1. Suntikkan penyaring kueri otomatis
        static::addGlobalScope(new SchoolScope());

        // 2. Otomasi pengisian kolom school_id saat record baru dibuat (creating)
        static::creating(function ($model) {
            $tenantManager = app(TenantManager::class);
            if ($tenantManager->hasActiveSchool() && empty($model->school_id)) {
                $model->school_id = $tenantManager->getSchoolId();
            }
        });
    }

    /**
     * Relasi standar ke entitas Unit Sekolah.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Scope pembantu untuk mengabaikan isolasi (berguna untuk laporan yayasan).
     */
    public function scopeWithoutSchool($query)
    {
        return $query->withoutGlobalScope(SchoolScope::class);
    }
}
```

> [!TIP]
> **Keanggunan Arsitektur Trait:**  
> Dengan memasang `use BelongsToSchool;` pada model (misalnya `Student` atau `Bill`), dua keajaiban terjadi secara otomatis:
> 1. Perintah `Bill::all()` seketika menjadi `SELECT * FROM bills WHERE school_id = [unit_aktif]`.
> 2. Perintah `Bill::create([...])` akan **otomatis mengisi atribut `school_id`** sesuai unit yang sedang aktif di sesi kasir tanpa Anda perlu mengetiknya secara manual!

---

## 6. Langkah 4: Menyusun Model Eloquent Relasional

Sekarang, mari kita pasang trait tersebut ke dalam Model Eloquent utama kita.

### A. Model `School`
Buat berkas `app/Models/School.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class School extends Model
{
    protected $fillable = [
        'foundation_id',
        'code',
        'name',
        'education_level',
        'npsn',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function foundation(): BelongsTo
    {
        return $this->belongsTo(Foundation::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
```

### B. Model `Student` (Menggunakan Trait Multi-Tenant)
Buat berkas `app/Models/Student.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\BelongsToSchool;

class Student extends Model
{
    use BelongsToSchool; // <--- Multi-Tenancy Otomatis Aktif!

    protected $fillable = [
        'school_id',
        'nis',
        'nisn',
        'full_name',
        'gender',
        'parent_name',
        'parent_phone',
        'address',
        'status',
    ];

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
```

### C. Model `Bill` (Tagihan Keuangan Siswa)
Buat berkas `app/Models/Bill.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\BelongsToSchool;

class Bill extends Model
{
    use BelongsToSchool;

    protected $fillable = [
        'school_id',
        'student_id',
        'payment_type_id',
        'academic_year_id',
        'period_month',
        'period_year',
        'amount_due',
        'amount_paid',
        'status',
        'due_date',
    ];

    protected $casts = [
        'amount_due' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'due_date' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function paymentType(): BelongsTo
    {
        return $this->belongsTo(PaymentType::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(PaymentTransactionDetail::class);
    }

    /**
     * Menghitung sisa kewajiban yang belum dibayar.
     */
    public function getRemainingBalanceAttribute(): float
    {
        return (float) ($this->amount_due - $this->amount_paid);
    }
}
```

### D. Model `PaymentTransaction` (Kuitansi Kasir)
Buat berkas `app/Models/PaymentTransaction.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\BelongsToSchool;

class PaymentTransaction extends Model
{
    use BelongsToSchool;

    protected $fillable = [
        'school_id',
        'student_id',
        'receipt_number',
        'total_amount',
        'payment_method',
        'transaction_date',
        'received_by',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'transaction_date' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(PaymentTransactionDetail::class, 'transaction_id');
    }
}
```

---

## 7. Langkah 5: Pengujian Empiris Isolasi Tenant via Tinker

Untuk membuktikan bahwa sistem isolasi data kita bekerja secara deterministik tanpa cacat, mari kita lakukan uji coba interaktif menggunakan baris perintah **Laravel Tinker**:

```bash
php artisan tinker
```

Jalankan skenario pengujian berikut di dalam konsol Tinker:

```php
// 1. Simulasikan Kasir Unit SD (School ID = 1) Sedang Login
$schoolSD = App\Models\School::find(1);
app(App\Services\TenantManager::class)->setSchool($schoolSD);

// Buat siswa baru di unit SD
$siswaSD = App\Models\Student::create([
    'nis' => 'SD-1001',
    'full_name' => 'Ahmad Fauzi',
    'gender' => 'L',
    'parent_name' => 'Bambang',
    'parent_phone' => '081234567890'
]);

// Periksa kolom school_id
echo $siswaSD->school_id; // Output: 1 (Terisi otomatis oleh Trait!)

// 2. Simulasikan Kasir Berganti ke Unit SMP (School ID = 2)
$schoolSMP = App\Models\School::find(2);
app(App\Services\TenantManager::class)->setSchool($schoolSMP);

// Lakukan kueri pencarian siswa
$hasilCari = App\Models\Student::where('nis', 'SD-1001')->first();
var_dump($hasilCari); // Output: NULL! (Data SD tidak bocor ke kasir SMP!)

// 3. Simulasikan Pengurus Yayasan Membuka Seluruh Data (Konsolidasi Global)
$semuaSiswa = App\Models\Student::withoutSchool()->get();
echo $semuaSiswa->count(); // Menampilkan seluruh siswa lintas unit yayasan!
```

Hasil simulasi di atas membuktikan bahwa:
* Operator sekolah **tidak memiliki celah teknis** untuk melihat data sekolah lain.
* Pengurus yayasan tetap memiliki fleksibilitas penuh untuk menarik data agregat menggunakan fungsi pembantu `withoutSchool()`.

---

## 8. Sinergi Tata Kelola, Keamanan, dan Kesiapan Produksi

Arsitektur yang kita bangun pada Bagian 2 ini memberikan perlindungan berlapis terhadap integritas sistem:
1. **Mitigasi Celah Kebocoran Data Antar-Tenant**: Sebagaimana yang kita soroti dalam kajian [Menghadapi Badai Siber: Refleksi Kritis atas Ketahanan Infrastruktur Digital Indonesia](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia), kebocoran data antar-institusi paling sering dipicu oleh kelalaian kueri di tingkat kode aplikasi. Dengan mengunci isolasi pada level *Eloquent Global Scope*, risiko kesalahan manusia (*human error*) berhasil dipangkas hingga nol.
2. **Kesesuaian dengan Metodologi Rekayasa Artefak Terapan**: Tahap implementasi model dan isolasi kueri ini merupakan tahapan instansiasi artefak perangkat lunak yang berpijak pada siklus pengembangan [Design Science Research Methodology (DSRM)](/blog/metodologi-penelitian-terapan-dalam-bidang-sistem-informasi).
3. **Penyelarasan dengan Standar Enterprise**: Arsitektur *Service-Scope* ini mengadopsi prinsip modularitas tinggi yang selaras dengan kematangan arsitektur sistem informasi enterprise pada [Transformasi Digital dalam Sistem Informasi](/blog/transformasi-digital-dalam-sistem-informasi) dan ketangguhan validasi data pada [Kajian Membangun CRUD Tangguh dengan Yii 2](/blog/tutorial-crud-yii-framework-panduan-praktisi).

---

## 9. Roadmap Seri Selanjutnya (Menuju Bagian 3)

Setelah fondasi basis data (Bagian 1) dan infrastruktur isolasi Eloquent multi-tenant (Bagian 2) berhasil ditegakkan, pada artikel berseri berikutnya kita akan masuk ke inti alur transaksi kasir:

* **Bagian 3**: Pembangunan Mesin Pembuat Tagihan Otomatis (*Billing Generation Engine*), Penanganan Penyesuaian Tarif Beasiswa Bersaudara/Yatim, dan Alur Transaksi Kasir Pelunasan Bertahap (*Partial Payment*) Berbasis ACID Database Transaction.
* **Bagian 4**: Otomasi Cetak Kuitansi PDF Resmi, Notifikasi Pengingat Tagihan WhatsApp Gateway, dan Dasbor Rekapitulasi Keuangan Real-Time Yayasan.

Tetap ikuti seri tutorial ini untuk membangun sistem informasi sekolah yang tangguh, aman, dan siap pakai di dunia industri!

---

## Catatan Kaki & Tautan Terkait

1. **Artikel Bagian 1**: [Membangun Aplikasi Pembayaran Multi-Sekolah Satu Yayasan dengan Laravel: Analisis Kebutuhan dan Perancangan Basis Data MySQL (Bagian 1)](/blog/tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database).
2. **Dokumentasi Resmi Laravel Eloquent Global Scopes**: Panduan arsitektur penyaringan model otomatis dan penulisan *custom scopes* tersedia pada [Laravel Official Documentation](https://laravel.com/docs/eloquent#global-scopes).
3. **Dokumentasi Resmi Laravel Service Container**: Panduan pengelolaan *Singleton Service Binding* dan injeksi dependensi modern pada [Laravel Container Documentation](https://laravel.com/docs/container).
4. **Jejaring Kajian Relevan MAS-AGUS Knowledge Hub**:
   - Eksplorasi fitur Eloquent dan ekosistem modern: [Transformasi Framework Laravel: Dari Alternatif Elegan Menjadi Raksasa Ekosistem Web Modern](/blog/transformasi-dan-perkembangan-fitur-laravel-framework).
   - Pengorganisasian logika data enterprise dan keandalan skema relasional: [Membangun CRUD Tangguh dengan Yii 2 Framework: Catatan dan Panduan Praktisi Rekayasa Sistem](/blog/tutorial-crud-yii-framework-panduan-praktisi).
   - Strategi tata kelola interoperabilitas sistem data terpusat: [Transformasi Digital dalam Sistem Informasi: Integrasi Layanan Publik Menuju Efisiensi Tata Kelola Modern](/blog/transformasi-digital-dalam-sistem-informasi).
   - Metodologi rekayasa artefak komputasi terapan: [Metodologi Penelitian Terapan dalam Bidang Sistem Informasi](/blog/metodologi-penelitian-terapan-dalam-bidang-sistem-informasi).
   - Pengerasan keamanan transaksi dan isolasi hak akses data: [Menghadapi Badai Siber: Refleksi Kritis atas Ketahanan Infrastruktur Digital Indonesia](/blog/menghadapi-badai-siber-refleksi-kritis-infrastruktur-digital-indonesia).
