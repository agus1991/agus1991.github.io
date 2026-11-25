---
title: "Building a Multi-School Payment System for Educational Foundations with Laravel: Billing Generation Engine, Scholarship Rates, and ACID Cashier Transactions (Part 3)"
description: "A systems engineering practitioner guide on constructing an automated mass billing engine, cascading scholarship rate resolvers, and pessimistic locking cashier settlements using ACID database transactions in Laravel."
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
coverAlt: "Billing Engine architecture and cashier transaction flow for a multi-school educational foundation in Laravel"
seoTitle: "Multi-School Payment System with Laravel: Billing & Cashier Transactions (Part 3) — MAS-AGUS"
seoDescription: "Step-by-step tutorial Part 3: implementing BillingService, cascading scholarship rate resolvers, pessimistic row locking, and multi-invoice installment payments."
focusKeyword: "Multi School Payment System Laravel Billing Transactions"
lang: "en"
translationSlug: "tutorial-aplikasi-pembayaran-multi-sekolah-laravel-billing-transaksi"
---

> **Software Engineering Documentation & Serial Tutorial (Model 1)**  
> **Author:** Agus Sifaunajah (MAS-AGUS)  
> **Topic Focus:** Automated Billing Engines, Cascading Student Scholarship Resolvers, ACID Database Transactions, Cashier Pessimistic Locking, and Multi-Invoice Installment Allocations.

---

## 1. Retrospective & Engineering Objectives for Part 3

Across the first two installments of this tutorial series, we erected a rock-solid architectural foundation:
1. In [Part 1: Requirements Analysis and MySQL Relational Database Architecture](/en/blog/multi-school-payment-system-laravel-database-architecture-part-1), we engineered an 11-table schema utilizing `DECIMAL(12, 2)` financial precision and strict `ON DELETE RESTRICT` integrity.
2. In [Part 2: Schema Migrations, Eloquent Modeling, and Multi-Tenant Global Scopes](/en/blog/multi-school-payment-system-laravel-eloquent-multi-tenant-part-2), we translated that schema into Laravel migrations and established automated multi-tenant isolation via `SchoolScope` and the `BelongsToSchool` Trait.

Now, we advance to the **core business logic of the application**: automating the generation of thousands of monthly tuition invoices, resolving tiered discount policies (such as orphan scholarships or sibling discounts), and equipping cashier counters with robust settlement engines supporting partial installments under absolute ACID transaction guarantees.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 MULTI-ITEM CASHIER SETTLEMENT TRANSACTION FLOW              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. CASHIER INPUT    ──> Received: Rp 600,000 (Cash / QRIS / Bank Transfer)  │
│                              │                                              │
│                              ▼                                              │
│ 2. FORM VALIDATION  ──> StorePaymentTransactionRequest                      │
│                              │                                              │
│                              ▼ DB::transaction() & lockForUpdate()          │
│ 3. FUND ALLOCATION  ──> [Master Receipt: KWT/SMP-IT/202611/0001]            │
│                         ├─ Item 1: Building Fee Rp 400,000 (Installment)    │
│                         │   └─> Due: Rp 1,500,000                           │
│                         │   └─> Remaining: Rp 1,100,000 (partially_paid)    │
│                         │                                                   │
│                         └─ Item 2: Nov Tuition Rp 200,000 (Settled)         │
│                             └─> Due: Rp 200,000                             │
│                             └─> Remaining: Rp 0 (paid)                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Real-World Challenges at School Cashier Counters

School cashier systems often collapse in production because system designers fail to accommodate two operational realities:

### A. The Challenge of Cascading Rate Resolution
Tuition and fee structures are rarely uniform across all students in a given school branch:
* **Base School Rate**: Standard Junior High tuition of Rp 250,000.
* **Class Cohort Overrides**: Vocational high school IT majors paying Rp 300,000 for computer lab fees, compared to Rp 200,000 for Accounting students.
* **Personal Scholarship Exceptions**: Merit awardees, children of foundation teachers, or orphaned students possessing formal scholarships granting partial or full fee exemptions (Rp 0).

Our application demands a **Cascading Rate Resolver** that deterministically evaluates priority: personal exception $\rightarrow$ class override $\rightarrow$ default school rate.

### B. Partial Installments and Bundled Payments
Guardians visiting cashier counters rarely pay exactly one fee category at a time:
* They often make a **partial installment** toward capital building fees (e.g., paying Rp 400,000 against a Rp 1,500,000 obligation).
* Simultaneously settling the **current month's tuition** (Rp 200,000).
* All allocations must be recorded under **a single unified receipt number** to eliminate paper waste and maintain an audit-proof daily ledger.

---

## 3. Step 1: Engineering the Rate Resolver & Invoicing Engine (`BillingService`)

We create `app/Services/BillingService.php` to resolve rates and generate bulk invoices idempotently:

```php
<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\PaymentRate;
use App\Models\PaymentType;
use App\Models\Student;
use App\Models\AcademicYear;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingService
{
    /**
     * Resolves applicable fee rate using priority cascading:
     * 1. Student Personal Exception (Scholarship / Discount)
     * 2. Class Cohort Specific Rate
     * 3. Base School Default Rate
     */
    public function resolveRate(Student $student, PaymentType $paymentType, AcademicYear $academicYear, ?int $classId = null): ?PaymentRate
    {
        // 1. Personal Student Exception
        $studentRate = PaymentRate::where('payment_type_id', $paymentType->id)
            ->where('academic_year_id', $academicYear->id)
            ->where('student_id', $student->id)
            ->first();

        if ($studentRate) {
            return $studentRate;
        }

        // 2. Class Cohort Rate
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

        // 3. Fallback: Base School Default Rate
        return PaymentRate::where('payment_type_id', $paymentType->id)
            ->where('academic_year_id', $academicYear->id)
            ->whereNull('class_id')
            ->whereNull('student_id')
            ->first();
    }

    /**
     * Generates monthly tuition invoices idempotently for all active students.
     */
    public function generateMonthlyBills(int $schoolId, int $academicYearId, int $month, int $year, Carbon $dueDate): array
    {
        $paymentType = PaymentType::where('school_id', $schoolId)
            ->where('billing_cycle', 'monthly')
            ->where('is_active', true)
            ->firstOrFail();

        $academicYear = AcademicYear::findOrFail($academicYearId);

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

                $rate = $this->resolveRate($student, $paymentType, $academicYear, $classId);

                if (!$rate || $rate->amount <= 0) {
                    Log::info("Student {$student->nis} exempt or unconfigured rate (Rp 0).");
                    $skippedCount++;
                    continue;
                }

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

## 4. Step 2: Mass Invoicing via Artisan Scheduled Command

Create an Artisan CLI command for automated monthly scheduling:

```bash
php artisan make:command GenerateMonthlyBillsCommand --command=billing:generate-monthly
```

In `app/Console/Commands/GenerateMonthlyBillsCommand.php`:

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
                            {--school= : Optional school ID} 
                            {--month= : Month 1-12 (Default: current)} 
                            {--year= : Year YYYY (Default: current)}';

    protected $description = 'Generate monthly tuition invoices for all active foundation students';

    public function handle(BillingService $billingService): int
    {
        $month = (int) ($this->option('month') ?: date('n'));
        $year = (int) ($this->option('year') ?: date('Y'));
        $schoolOption = $this->option('school');

        $dueDate = Carbon::createFromDate($year, $month, 10);

        $this->info("Initiating billing run for {$month}/{$year}...");

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
                $this->warn("School [{$school->code}] has no active academic year. Skipping.");
                continue;
            }

            $this->line("Processing branch: {$school->name}...");

            $result = $billingService->generateMonthlyBills(
                $school->id,
                $activeYear->id,
                $month,
                $year,
                $dueDate
            );

            $this->info(" -> Generated: {$result['generated']} invoices | Skipped: {$result['skipped']}");
        }

        $this->info('Batch billing process completed.');
        return Command::SUCCESS;
    }
}
```

---

## 5. Step 3: ACID Cashier Settlement Engine (`PaymentService`)

We construct `app/Services/PaymentService.php` enforcing sequential receipting, pessimistic row locking, and transactional integrity:

```php
<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\PaymentTransaction;
use App\Models\PaymentTransactionDetail;
use App\Models\School;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function generateReceiptNumber(School $school): string
    {
        $prefix = "KWT/{$school->code}/" . date('Ym') . '/';

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

    public function processPayment(
        School $school,
        Student $student,
        array $allocations,
        string $paymentMethod,
        string $receivedBy,
        ?string $notes = null
    ): PaymentTransaction {
        $totalAmount = array_sum(array_column($allocations, 'amount'));

        if ($totalAmount <= 0) {
            throw ValidationException::withMessages([
                'total_amount' => 'Payment amount must exceed zero.'
            ]);
        }

        return DB::transaction(function () use (
            $school,
            $student,
            $allocations,
            $totalAmount,
            $paymentMethod,
            $receivedBy,
            $notes
        ) {
            $receiptNumber = $this->generateReceiptNumber($school);

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

            foreach ($allocations as $item) {
                $billId = $item['bill_id'];
                $allocatedAmount = (float) $item['amount'];

                if ($allocatedAmount <= 0) {
                    continue;
                }

                // Pessimistic Lock prevents concurrent settlement race conditions
                $bill = Bill::where('id', $billId)
                    ->where('school_id', $school->id)
                    ->where('student_id', $student->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $remainingBalance = (float) ($bill->amount_due - $bill->amount_paid);

                if ($allocatedAmount > $remainingBalance) {
                    throw ValidationException::withMessages([
                        'allocations' => "Allocation Rp " . number_format($allocatedAmount) . 
                                         " exceeds invoice balance Rp " . number_format($remainingBalance) . "."
                    ]);
                }

                PaymentTransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'bill_id' => $bill->id,
                    'amount' => $allocatedAmount,
                ]);

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

## 6. Step 4: Form Request Validation & Controller Logic

Generate the validation request and controller:

```bash
php artisan make:request StorePaymentTransactionRequest
php artisan make:controller PaymentController
```

In `app/Http/Requests/StorePaymentTransactionRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
}
```

In `app/Http/Controllers/PaymentController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentTransactionRequest;
use App\Models\Student;
use App\Services\PaymentService;
use App\Services\TenantManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
        protected TenantManager $tenantManager
    ) {}

    public function store(StorePaymentTransactionRequest $request): JsonResponse
    {
        $school = $this->tenantManager->getSchool();
        
        if (!$school) {
            return response()->json(['message' => 'Active school context missing.'], 422);
        }

        $student = Student::findOrFail($request->validated('student_id'));

        $transaction = $this->paymentService->processPayment(
            school: $school,
            student: $student,
            allocations: $request->validated('allocations'),
            paymentMethod: $request->validated('payment_method'),
            receivedBy: Auth::user()->name ?? 'Counter Cashier 1',
            notes: $request->validated('notes')
        );

        return response()->json([
            'message' => 'Payment transaction processed successfully.',
            'receipt_number' => $transaction->receipt_number,
            'data' => $transaction,
        ], 201);
    }
}
```

---

## 7. Step 5: Tinker Simulation & Roadmap for Part 4

Simulate cashier execution inside **Laravel Tinker**:

```bash
php artisan tinker
```

```php
$smp = App\Models\School::find(2);
app(App\Services\TenantManager::class)->setSchool($smp);
$student = App\Models\Student::where('nis', 'SMP-2001')->firstOrFail();

$allocations = [
    ['bill_id' => 10, 'amount' => 400000], // Installment for Building Fee
    ['bill_id' => 11, 'amount' => 200000], // Full settlement for Nov Tuition
];

$trx = app(App\Services\PaymentService::class)->processPayment(
    school: $smp,
    student: $student,
    allocations: $allocations,
    paymentMethod: 'cash',
    receivedBy: 'Counter Cashier'
);

echo $trx->receipt_number; // e.g., KWT/SMP-IT/202611/0001
```

* **Part 4 (Available)**: [Dynamic PDF Receipts, WhatsApp Gateway Integration, and Executive Dashboards](/en/blog/multi-school-payment-system-laravel-pdf-whatsapp-dashboard-part-4) — Official accounting-grade PDF generation, asynchronous WhatsApp queues, and consolidated foundation telemetry.
