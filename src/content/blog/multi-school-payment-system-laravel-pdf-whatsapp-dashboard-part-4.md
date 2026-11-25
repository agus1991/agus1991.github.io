---
title: "Building a Multi-School Payment System for Educational Foundations with Laravel: Dynamic PDF Receipts, WhatsApp Gateway Integration, and Executive Dashboards (Part 4)"
description: "An advanced systems engineering guide on accounting-grade PDF receipt generation with verification QR codes, asynchronous WhatsApp Gateway queue architecture, and real-time consolidated foundation executive dashboards in Laravel."
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
coverAlt: "Integration diagram of PDF receipt printing, WhatsApp Gateway queuing, and multi-school executive financial dashboards in Laravel"
seoTitle: "Laravel Multi-School Tutorial Part 4: PDF Receipts, WhatsApp & Dashboard — MAS-AGUS"
seoDescription: "Learn how to engineer dynamic PDF receipts, asynchronous WhatsApp Gateway notification jobs, and consolidated executive dashboards in Laravel."
focusKeyword: "Laravel Multi School Payment App Part 4"
lang: "en"
translationSlug: "tutorial-aplikasi-pembayaran-multi-sekolah-laravel-pdf-wa-dashboard"
---

> **Software Engineering Documentation & Serial Tutorial (Final Episode - Part 4)**  
> **Prerequisites:** Completion of [Part 1: MySQL Database Architecture](/en/blog/multi-school-payment-system-laravel-database-architecture-part-1), [Part 2: Eloquent Multi-Tenant Scope](/en/blog/multi-school-payment-system-laravel-eloquent-multi-tenant-part-2), and [Part 3: Billing Engine & ACID Transactions](/en/blog/multi-school-payment-system-laravel-billing-engine-acid-payments-part-3).  
> **Target Deliverables:** Official PDF receipts with cryptographic verification QR codes, non-blocking asynchronous WhatsApp delivery queues, and consolidated multi-branch financial telemetry dashboards.

---

## Introduction: Completing the Operational Value Chain

Across our first three installments, we constructed a comprehensive multi-school financial engine: from [normalized 3NF relational database schemas](/en/blog/multi-school-payment-system-laravel-database-architecture-part-1), through [foolproof cross-tenant isolation via Eloquent Global Scopes](/en/blog/multi-school-payment-system-laravel-eloquent-multi-tenant-part-2), to [automated billing engines and ACID cashier transaction processing](/en/blog/multi-school-payment-system-laravel-billing-engine-acid-payments-part-3).

However, in frontline educational operations, even the most sophisticated backend architecture will fall short unless supported by three crucial user-facing pillars:
1. **Verifiable Accounting Receipts**: Parents demand formal printed or digital receipts displaying dynamic school letterheads, itemized billing allocations, and tamper-resistant digital verification signatures.
2. **Instant Asynchronous Delivery Channels**: In an era of immediate mobile communications, physical counter receipts are frequently misplaced by students. Guardians expect automated payment confirmation notifications delivered directly to WhatsApp within seconds.
3. **Consolidated Executive Telemetry for Foundation Leadership**: Board Trustees and Chief Financial Officers lack the time to inspect thousands of line-item counter entries. They demand unified dashboards providing real-time cash flow aggregation, comparing target absorption across branches (Elementary, Junior High, Senior High), and tracking compliance ratios.

In this concluding installment (**Part 4**), I will guide you through engineering these three essential pillars to modern software enterprise standards.

---

## 1. System Architecture & Component Integration Flow

Before writing code, examine how these three components integrate harmoniously without introducing cashier counter latency:

```
[Cashier Commits Settlement] 
           │
           ▼
[DB::transaction() & lockForUpdate()] ──> Ledger & Receipt Record Committed
           │
           ├──────────────────────────────┐
           ▼                              ▼
[Automated PDF Engine]         [Dispatch Asynchronous Job]
(DomPDF Engine + QR Code)                 │
           │                              ▼
           │                   [Laravel Queue Worker]
           │                              │ (HTTP Client + Retry)
           │                              ▼
           │                   [WhatsApp Gateway Provider]
           │                              │
           │                              ▼
           │                   [Guardian Mobile WhatsApp Influx]
           │
           ▼
[Foundation Executive Dashboard] <── (withoutSchool() Scope Bypass)
(Cash Aggregation, Branch Target Realization, & Compliance Ratios)
```

Notice that WhatsApp message delivery **must strictly be decoupled into an asynchronous background job queue**. Frontline cashier counters must never be subjected to external third-party API latency. Cashier settlement operations must finalize within 300 milliseconds, with message dispatching offloaded independently to background workers.

---

## 2. Engineering the Accounting-Grade PDF Receipt Engine

We leverage `barryvdh/laravel-dompdf` to generate lightweight, millimetre-accurate PDF receipts tailored for standard A5 landscape thermal or deskjet printing.

### Step 2.1: Package Installation & Setup
Run Composer in your terminal:

```bash
composer require barryvdh/laravel-dompdf
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
```

### Step 2.2: PDF Generator Service (`ReceiptPdfService`)
Create `app/Services/ReceiptPdfService.php`:

```php
<?php

namespace App\Services;

use App\Models\PaymentTransaction;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptPdfService
{
    /**
     * Renders a payment transaction receipt into an A5 landscape PDF stream.
     */
    public function generateReceiptPdf(PaymentTransaction $transaction): \Barryvdh\DomPDF\PDF
    {
        $transaction->loadMissing([
            'school',
            'student.schoolClass',
            'allocations.bill.paymentRate.paymentItem'
        ]);

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

        return Pdf::loadView('pdf.receipt', $data)
            ->setPaper('a5', 'landscape')
            ->setOption([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled'      => true,
                'defaultFont'          => 'sans-serif'
            ]);
    }
}
```

### Step 2.3: Clean Accounting Blade Template (`resources/views/pdf/receipt.blade.php`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt_{{ $transaction->receipt_number }}</title>
    <style>
        @page { margin: 20px 25px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.4; }
        .header-table { width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
        .school-name { font-size: 15px; font-weight: bold; color: #0f172a; text-transform: uppercase; }
        .school-info { font-size: 9px; color: #475569; }
        .receipt-title { text-align: right; vertical-align: top; }
        .receipt-badge { font-size: 14px; font-weight: bold; color: #0284c7; letter-spacing: 1px; }
        .meta-table { width: 100%; margin-bottom: 12px; font-size: 10px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .items-table th { background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
        .items-table td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
        .text-right { text-align: right; }
        .font-mono { font-family: 'Courier New', Courier, monospace; }
        .total-box { background-color: #f8fafc; border: 1.5px dashed #0284c7; padding: 8px 12px; font-size: 12px; font-weight: bold; color: #0369a1; display: inline-block; }
        .footer-table { width: 100%; margin-top: 15px; }
        .signature-box { text-align: center; width: 200px; }
        .stamp-lunas { border: 2px solid #16a34a; color: #16a34a; font-weight: 800; font-size: 14px; text-transform: uppercase; padding: 4px 10px; display: inline-block; transform: rotate(-5deg); margin-bottom: 5px; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width: 65%;">
                <div class="school-name">{{ $school->name }}</div>
                <div class="school-info">
                    INTEGRATED EDUCATIONAL FOUNDATION<br>
                    {{ $school->address ?? 'School Branch Address Unconfigured' }}<br>
                    Email: {{ $school->email ?? '-' }} | Phone: {{ $school->phone ?? '-' }}
                </div>
            </td>
            <td class="receipt-title" style="width: 35%;">
                <div class="receipt-badge">OFFICIAL RECEIPT</div>
                <div style="font-size: 10px; font-weight: bold; color: #334155;">
                    No: <span class="font-mono">{{ $transaction->receipt_number }}</span>
                </div>
                <div style="font-size: 9px; color: #64748b;">
                    Date: {{ $transaction->created_at->translatedFormat('d/m/Y H:i') }}
                </div>
            </td>
        </tr>
    </table>

    <table class="meta-table">
        <tr>
            <td style="width: 15%; font-weight: bold;">Student Name</td>
            <td style="width: 35%;">: {{ $student->name }}</td>
            <td style="width: 15%; font-weight: bold;">Payment Method</td>
            <td style="width: 35%;">: {{ strtoupper($transaction->payment_method) }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">NISN / NIS</td>
            <td>: {{ $student->nisn }} / {{ $student->nis }}</td>
            <td style="font-weight: bold;">Cashier</td>
            <td>: {{ $transaction->received_by }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Enrolled Class</td>
            <td>: {{ $student->schoolClass->name ?? 'N/A' }}</td>
            <td style="font-weight: bold;">Printed At</td>
            <td>: {{ $printedAt }}</td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 45%;">Fee Category & Description</th>
                <th style="width: 25%;" class="text-right">Balance Prior</th>
                <th style="width: 25%;" class="text-right">Settled Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($allocations as $index => $allocation)
                @php
                    $bill = $allocation->bill;
                    $item = $bill->paymentRate->paymentItem;
                    $priorBalance = $bill->remaining_amount + $allocation->amount;
                @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $item->name }}</strong>
                        @if($bill->month)
                            - Month Cycle {{ DateTime::createFromFormat('!m', $bill->month)->format('F') }}
                        @endif
                        <br>
                        <small style="color: #64748b;">
                            Current Status: 
                            <span style="font-weight: bold; color: {{ $bill->status === 'paid' ? '#16a34a' : '#d97706' }}">
                                {{ strtoupper($bill->status) }}
                            </span>
                        </small>
                    </td>
                    <td class="text-right font-mono">Rp {{ number_format($priorBalance, 0, ',', '.') }}</td>
                    <td class="text-right font-mono" style="font-weight: bold; color: #0284c7;">
                        Rp {{ number_format($allocation->amount, 0, ',', '.') }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="footer-table">
        <tr>
            <td style="width: 55%; vertical-align: top;">
                <div class="total-box">
                    TOTAL SETTLEMENT: Rp {{ number_format($transaction->total_amount, 0, ',', '.') }}
                </div>
                <div style="font-size: 8px; color: #64748b; margin-top: 6px;">
                    * Retain this document as valid proof of payment.<br>
                    * Electronically generated by Foundation Financial Management System.
                </div>
            </td>
            <td style="width: 45%; vertical-align: top;" class="signature-box">
                <div class="stamp-lunas">SETTLED IN FULL</div>
                <div style="font-size: 9px; color: #64748b;">Authorized Cashier,</div>
                <div style="height: 35px;"></div>
                <div style="font-weight: bold; text-decoration: underline;">{{ $transaction->received_by }}</div>
                <div style="font-size: 8px; color: #64748b;">ID: KSR-{{ $transaction->school_id }}-{{ $transaction->id }}</div>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 3. Asynchronous WhatsApp Gateway Job Integration

### Step 3.1: Queue Worker Configuration
In `.env`:

```env
QUEUE_CONNECTION=database
```

Run migration if queue tables are missing:

```bash
php artisan queue:table
php artisan migrate
```

### Step 3.2: Asynchronous Job (`SendPaymentReceiptNotification`)
In `app/Jobs/SendPaymentReceiptNotification.php`:

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

    public int $tries = 3;
    public int $backoff = 15;

    public function __construct(
        public PaymentTransaction $transaction
    ) {}

    public function handle(): void
    {
        $this->transaction->loadMissing([
            'school',
            'student.schoolClass',
            'allocations.bill.paymentRate.paymentItem'
        ]);

        $student = $this->transaction->student;
        $phoneNumber = $student->parent_phone ?? $student->phone;

        if (!$phoneNumber) {
            Log::warning("Notification cancelled: Student ID {$student->id} has no valid contact.");
            return;
        }

        $formattedPhone = $this->formatPhoneNumber($phoneNumber);
        $messageBody = $this->composeMessage($this->transaction);

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
                'delay'   => 2,
            ]);

        if ($response->failed()) {
            throw new \Exception("WhatsApp Gateway responded with status: " . $response->status());
        }

        Log::info("WhatsApp receipt delivered to {$formattedPhone} for {$this->transaction->receipt_number}");
    }

    protected function composeMessage(PaymentTransaction $trx): string
    {
        $school = $trx->school;
        $student = $trx->student;

        $msg = "🧾 *OFFICIAL TUITION PAYMENT RECEIPT*\n";
        $msg .= "_{$school->name}_\n\n";
        $msg .= "Dear Guardian of student:\n";
        $msg .= "• *Name:* {$student->name}\n";
        $msg .= "• *Receipt No:* `{$trx->receipt_number}`\n";
        $msg .= "• *Settlement Date:* " . $trx->created_at->translatedFormat('d F Y, H:i') . "\n";
        $msg .= "• *Cashier:* {$trx->received_by}\n\n";

        $msg .= "📋 *Allocation Breakdown:* \n";
        foreach ($trx->allocations as $idx => $alloc) {
            $item = $alloc->bill->paymentRate->paymentItem;
            $msg .= ($idx + 1) . ". {$item->name}: *Rp " . number_format($alloc->amount, 0, ',', '.') . "*\n";
        }

        $msg .= "\n💰 *TOTAL SETTLED:* *Rp " . number_format($trx->total_amount, 0, ',', '.') . "*\n";
        $msg .= "Method: *" . strtoupper($trx->payment_method) . "*\n\n";

        $downloadUrl = route('receipt.download', ['receipt_number' => $trx->receipt_number]);
        $msg .= "📥 *Download Digital PDF Receipt:*\n{$downloadUrl}\n\n";
        $msg .= "_Thank you for supporting our educational foundation._";

        return $msg;
    }

    protected function formatPhoneNumber(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($cleaned, '0')) return '62' . substr($cleaned, 1);
        if (str_starts_with($cleaned, '62')) return $cleaned;
        return '62' . $cleaned;
    }
}
```

Dispatch this job right after committing cashier payments in `PaymentService.php`:

```php
SendPaymentReceiptNotification::dispatch($transaction);
```

---

## 4. Foundation Consolidated Executive Dashboard

By bypassing `SchoolScope` using `withoutSchool()`, executive auditors inspect aggregated telemetry across all schools:

In `app/Http/Controllers/Foundation/ExecutiveDashboardController.php`:

```php
<?php

namespace App\Http\Controllers\Foundation;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\PaymentTransaction;
use App\Models\Bill;
use App\Services\TenantManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExecutiveDashboardController extends Controller
{
    public function __construct(
        protected TenantManager $tenantManager
    ) {}

    public function index(Request $request)
    {
        return $this->tenantManager->withoutSchool(function () use ($request) {
            $selectedYear = $request->query('academic_year_id') ?? DB::table('academic_years')->where('is_active', true)->value('id');

            $totalCashInflux = PaymentTransaction::sum('total_amount');

            $branchPerformance = School::withCount('students')
                ->get()
                ->map(function ($school) use ($selectedYear) {
                    $totalInvoiced = Bill::where('school_id', $school->id)
                        ->where('academic_year_id', $selectedYear)
                        ->sum('amount');

                    $totalCollected = Bill::where('school_id', $school->id)
                        ->where('academic_year_id', $selectedYear)
                        ->sum('amount_paid');

                    $rate = $totalInvoiced > 0 ? round(($totalCollected / $totalInvoiced) * 100, 1) : 0;

                    return [
                        'id'              => $school->id,
                        'name'            => $school->name,
                        'code'            => $school->code,
                        'student_count'   => $school->students_count,
                        'total_billed'    => (float) $totalInvoiced,
                        'total_collected' => (float) $totalCollected,
                        'remaining_debt'  => (float) ($totalInvoiced - $totalCollected),
                        'collection_rate' => $rate,
                    ];
                });

            return view('foundation.dashboard', [
                'totalCashInflux'   => $totalCashInflux,
                'branchPerformance' => $branchPerformance,
                'selectedYear'      => $selectedYear,
            ]);
        });
    }
}
```

---

## 5. End-to-End Testing & Engineering Epilogue

Execute end-to-end simulation inside **Laravel Tinker**:

```bash
php artisan tinker
```

```php
$trx = App\Models\PaymentTransaction::latest()->first();

// 1. Generate PDF Stream
$pdfService = app(App\Services\ReceiptPdfService::class);
$pdfOutput = $pdfService->generateReceiptPdf($trx);
file_put_contents(storage_path("app/public/receipt-{$trx->receipt_number}.pdf"), $pdfOutput->output());

// 2. Test WhatsApp Dispatch Synchronously
App\Jobs\SendPaymentReceiptNotification::dispatchSync($trx);

// 3. Inspect Executive Telemetry
$tenantManager = app(App\Services\TenantManager::class);
$tenantManager->withoutSchool(function() {
    echo "Consolidated Foundation Influx: Rp " . number_format(App\Models\PaymentTransaction::sum('total_amount'));
});
```

### Complete Series Architectural Epilogue
Across this 4-part masterclass, we established an enterprise blueprint:
* **[Part 1 (Database Architecture)](/en/blog/multi-school-payment-system-laravel-database-architecture-part-1)**: Normalized 3NF MySQL schema, `DECIMAL` financial precision, and integrated ledgers.
* **[Part 2 (Eloquent Global Scope Multi-Tenancy)](/en/blog/multi-school-payment-system-laravel-eloquent-multi-tenant-part-2)**: Automated query isolation via `BelongsToSchool`, Singleton `TenantManager`, and HTTP middleware.
* **[Part 3 (Billing Engine & ACID Cashier Transactions)](/en/blog/multi-school-payment-system-laravel-billing-engine-acid-payments-part-3)**: Automated invoices, cascading scholarship resolvers, partial installments, and `lockForUpdate()` pessimistic locking.
* **Part 4 (PDF Receipts, WhatsApp Gateway, & Executive Dashboards)**: Verifiable PDF receipts, non-blocking asynchronous WhatsApp queues, and consolidated foundation telemetry.

Deploy this architecture across your educational networks to achieve modern, transparent, and audit-proof financial governance!
