---
title: "Building a Multi-School Payment System for Educational Foundations with Laravel: Schema Migrations, Eloquent Modeling, and Multi-Tenant Global Scopes (Part 2)"
description: "A systems engineering practitioner guide on converting MySQL DDL to Laravel Migrations, mapping Eloquent relationships, and implementing automated multi-tenancy isolation via Global Scopes and the BelongsToSchool Trait."
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
coverAlt: "Multi-Tenant Global Scope Architecture and Eloquent Modeling for School Foundation Payments in Laravel"
seoTitle: "Multi-School Payment System with Laravel: Eloquent Multi-Tenancy (Part 2) — MAS-AGUS"
seoDescription: "Step-by-step tutorial Part 2: translating DDL to Laravel Migrations, building the BelongsToSchool Trait, managing tenant context, and automating query isolation."
focusKeyword: "Multi School Payment System Laravel Eloquent Global Scope"
lang: "en"
translationSlug: "tutorial-aplikasi-pembayaran-multi-sekolah-laravel-eloquent-scope"
---

> **Software Engineering Documentation & Serial Tutorial (Model 1)**  
> **Author:** Agus Sifaunajah (MAS-AGUS)  
> **Topic Focus:** Database Migrations Translation, Eloquent ORM Relationship Modeling, Multi-Tenant Global Scope Engineering, and Cross-Tenant Data Leakage Prevention.

---

## 1. Retrospective & Architectural Objectives for Part 2

In [Part 1: Requirements Analysis and MySQL Relational Database Architecture](/en/blog/multi-school-payment-system-laravel-database-architecture-part-1), we established a normalized 11-table schema adhering to ACID financial standards within a *Single-Database Multi-Tenancy* pattern. We defined `school_id` as the fundamental logical boundary separating school branches (Kindergarten, Elementary, Junior High, and Senior High) governed under a unified foundation.

However, having a robust schema on paper is insufficient. In the application code, the primary hazard of a shared-database architecture is: **how do we guarantee that every database query is automatically restricted to the active school branch without requiring developers to manually append `WHERE school_id = ?` across hundreds of Controllers?**

Relying on manual filtering is a ticking time bomb. Eventually, a developer will omit `school_id` in a billing report, resulting in catastrophic cross-tenant leakage: a Junior High cashier viewing Senior High student balances, or receipts becoming cross-mingled.

In **Part 2**, we resolve this challenge cleanly using two powerful features in [The Evolution of Laravel Framework](/en/blog/evolution-of-laravel-framework-from-elegant-mvc-to-modern-web-ecosystem): **Eloquent Global Scopes** and **Custom Model Traits**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 AUTOMATED MULTI-TENANT QUERY ISOLATION FLOW                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. CASHIER REQUEST ──> [SetTenantContext Middleware]                        │
│                             │                                               │
│                             ▼ Locks Branch Identity                         │
│                        [TenantManager] (Session Context: school_id = 2)     │
│                             │                                               │
│                             ▼ Automatically Injected                        │
│ 2. ELOQUENT ORM    ──> [SchoolScope via BelongsToSchool Trait]              │
│                             │                                               │
│                             ▼ Query Transformation                          │
│ 3. MYSQL DATABASE  ──> SELECT * FROM bills WHERE school_id = 2              │
│                        (Complete Cross-Tenant Isolation Guaranteed)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Development Environment Prerequisites

Ensure your local development environment meets the following baseline specifications:
* **PHP**: Version 8.2 or 8.3 with `pdo_mysql`, `bcmath`, `mbstring`, and `intl` extensions enabled.
* **Framework**: Laravel 11.x or 12.x.
* **Database**: MySQL 8.0+ or MariaDB 10.11+ (InnoDB storage engine).
* **Dependency Tooling**: Composer 2.7+.

---

## 3. Step 1: Translating MySQL DDL into Laravel Database Migrations

We translate the relational DDL from Part 1 into native Laravel Migration files, ensuring consistent deployment across CI/CD environments:

```bash
php artisan make:migration create_foundation_and_school_tables
php artisan make:migration create_academic_structure_tables
php artisan make:migration create_payment_and_billing_tables
```

### A. Foundation and School Master Tables Migration
Open `database/migrations/xxxx_create_foundation_and_school_tables.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Foundation Master Table
        Schema::create('foundations', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 150);
            $table->string('legal_number', 100)->nullable()->comment('Statutory License / Deed');
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email', 100)->nullable();
            $table->timestamps();
        });

        // 2. School Branches (Tenants)
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('foundation_id')
                  ->constrained('foundations')
                  ->restrictOnDelete()
                  ->cascadeOnUpdate();
            $table->string('code', 20)->unique()->comment('e.g., SMP-IT, SMA-01');
            $table->string('name', 150);
            $table->enum('education_level', ['KB', 'TK', 'SD', 'MI', 'SMP', 'MTS', 'SMA', 'MA', 'SMK']);
            $table->string('npsn', 20)->nullable();
            $table->string('bank_name', 50)->nullable()->comment('Branch depository bank');
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

### B. Academic Structure and Student Demographics Migration
Open `database/migrations/xxxx_create_academic_structure_tables.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 3. Academic Calendar Years
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('name', 50)->comment('e.g., 2026/2027 Odd');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->index(['school_id', 'is_active'], 'idx_academic_active');
        });

        // 4. Class Sections
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('name', 50)->comment('e.g., VII-A, X-RPL-1');
            $table->unsignedTinyInteger('grade_level')->comment('Numerical grade level: 1-12');
            $table->timestamps();

            $table->index(['school_id', 'academic_year_id'], 'idx_class_search');
        });

        // 5. Students
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('nis', 30)->comment('Local Student ID');
            $table->string('nisn', 30)->nullable();
            $table->string('full_name', 150);
            $table->enum('gender', ['L', 'P']);
            $table->string('parent_name', 150);
            $table->string('parent_phone', 30)->comment('WhatsApp notification destination');
            $table->text('address')->nullable();
            $table->enum('status', ['aktif', 'lulus', 'pindah', 'keluar'])->default('aktif');
            $table->timestamps();

            $table->unique(['school_id', 'nis'], 'uk_student_nis');
            $table->index(['school_id', 'full_name'], 'idx_student_name');
        });

        // 6. Student Academic History Pivot
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

### C. Payment Categories, Invoices, and Transactions Migration
Open `database/migrations/xxxx_create_payment_and_billing_tables.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 7. Payment Categories
        Schema::create('payment_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('name', 100);
            $table->enum('billing_cycle', ['monthly', 'yearly', 'once']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['school_id', 'billing_cycle'], 'idx_pt_school');
        });

        // 8. Payment Rates Matrix
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

        // 9. Invoices (Bills)
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('payment_type_id')->constrained('payment_types')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete()->cascadeOnUpdate();
            $table->unsignedTinyInteger('period_month')->nullable()->comment('1-12');
            $table->unsignedSmallInteger('period_year')->nullable();
            $table->decimal('amount_due', 12, 2);
            $table->decimal('amount_paid', 12, 2)->default(0.00);
            $table->enum('status', ['unpaid', 'partially_paid', 'paid'])->default('unpaid');
            $table->date('due_date');
            $table->timestamps();

            $table->index(['school_id', 'status', 'due_date'], 'idx_bills_filtering');
            $table->index(['student_id', 'status'], 'idx_bills_student');
        });

        // 10. Cashier Payment Transactions
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

        // 11. Transaction Settlement Allocations
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

Run the migrations:

```bash
php artisan migrate
```

---

## 4. Step 2: Tenant Context Management (Service & Middleware)

The application must deterministically identify: **who is currently authenticated, and which school branch governs their active operational scope?**

We identify two user personas:
1. **Branch Cashier**: Restricted strictly to 1 school branch.
2. **Foundation Executive**: Empowered to inspect all school branches and dynamically switch contexts from an executive portal.

### A. Creating the `TenantManager` Service
Create `app/Services/TenantManager.php`:

```php
<?php

namespace App\Services;

use App\Models\School;

class TenantManager
{
    protected ?School $currentSchool = null;

    public function setSchool(?School $school): void
    {
        $this->currentSchool = $school;
    }

    public function getSchool(): ?School
    {
        return $this->currentSchool;
    }

    public function getSchoolId(): ?int
    {
        return $this->currentSchool?->id;
    }

    public function hasActiveSchool(): bool
    {
        return !is_null($this->currentSchool);
    }
}
```

Register it as a Singleton in `app/Providers/AppServiceProvider.php`:

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\TenantManager;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
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

### B. Creating Context Middleware (`SetTenantContext`)
Scaffold the middleware:

```bash
php artisan make:middleware SetTenantContext
```

Open `app/Http/Middleware/SetTenantContext.php`:

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

            // 1. Foundation Admin: check for dynamic session context switch
            if ($user->role === 'foundation_admin') {
                $schoolId = session('active_school_id');
            } else {
                // 2. Branch Cashier: hard-locked to their designated school_id
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

## 5. Step 3: Automating Query Isolation via Global Scope & Trait

Now for the architectural centerpiece: automating isolation via **`SchoolScope`**.

### A. Creating the Scope Class
Create `app/Models/Scopes/SchoolScope.php`:

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

        if ($tenantManager->hasActiveSchool()) {
            $builder->where($model->getTable() . '.school_id', $tenantManager->getSchoolId());
        }
    }
}
```

### B. Creating the `BelongsToSchool` Trait
Create `app/Traits/BelongsToSchool.php`:

```php
<?php

namespace App\Traits;

use App\Models\Scopes\SchoolScope;
use App\Models\School;
use App\Services\TenantManager;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToSchool
{
    protected static function bootBelongsToSchool(): void
    {
        // 1. Register automated query filtering
        static::addGlobalScope(new SchoolScope());

        // 2. Automatically populate school_id on model creation
        static::creating(function ($model) {
            $tenantManager = app(TenantManager::class);
            if ($tenantManager->hasActiveSchool() && empty($model->school_id)) {
                $model->school_id = $tenantManager->getSchoolId();
            }
        });
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function scopeWithoutSchool($query)
    {
        return $query->withoutGlobalScope(SchoolScope::class);
    }
}
```

> [!TIP]
> By attaching `use BelongsToSchool;` to any Eloquent model (e.g., `Student` or `Bill`):
> 1. `Bill::all()` transparently compiles to `SELECT * FROM bills WHERE school_id = [active_branch]`.
> 2. `Bill::create([...])` automatically populates `school_id` without requiring manual assignment!

---

## 6. Step 4: Constructing Eloquent Models

Now attach the trait to the primary Eloquent models:

### A. Model `Student`
In `app/Models/Student.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\BelongsToSchool;

class Student extends Model
{
    use BelongsToSchool;

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

### B. Model `Bill`
In `app/Models/Bill.php`:

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

    public function getRemainingBalanceAttribute(): float
    {
        return (float) ($this->amount_due - $this->amount_paid);
    }
}
```

---

## 7. Step 5: Empirical Testing via Laravel Tinker

Validate tenant isolation inside the **Laravel Tinker** console:

```bash
php artisan tinker
```

Execute the validation scenario:

```php
// 1. Simulate Elementary School Cashier Login (School ID = 1)
$schoolSD = App\Models\School::find(1);
app(App\Services\TenantManager::class)->setSchool($schoolSD);

$studentSD = App\Models\Student::create([
    'nis' => 'SD-1001',
    'full_name' => 'Ahmad Fauzi',
    'gender' => 'L',
    'parent_name' => 'Bambang',
    'parent_phone' => '081234567890'
]);

echo $studentSD->school_id; // Output: 1 (Automatically injected by Trait!)

// 2. Switch Context to Junior High Cashier (School ID = 2)
$schoolSMP = App\Models\School::find(2);
app(App\Services\TenantManager::class)->setSchool($schoolSMP);

$lookup = App\Models\Student::where('nis', 'SD-1001')->first();
var_dump($lookup); // Output: NULL! (Complete isolation: zero data leakage)

// 3. Foundation Executive Global Consolidation
$allStudents = App\Models\Student::withoutSchool()->get();
echo $allStudents->count(); // Retrieves all students across all branches!
```

---

## 8. Conclusion and Part 3 Roadmap

By formalizing our multi-tenant isolation within Eloquent Global Scopes, we eliminate the primary vulnerability of shared-database architectures.

* **Part 3 (Available)**: [Billing Generation Engine, Scholarship Rates, and ACID Cashier Transactions](/en/blog/multi-school-payment-system-laravel-billing-engine-acid-payments-part-3) — Constructing `BillingService`, cascading rate algorithms, and pessimistic row locking for installment cashier settlements.
