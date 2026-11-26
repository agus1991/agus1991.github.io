---
title: "Building a Multi-School Payment System for Educational Foundations with Laravel: Stateless RESTful API Architecture, Laravel Sanctum, and Distributed Client Integration (Part 5)"
description: "A systems engineering practitioner guide on building a stateless RESTful API atop a Multi-Tenant Laravel architecture using Laravel Sanctum, Eloquent API Resources, Rate Limiting, and HTTP header tenant resolution."
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
coverAlt: "Architectural diagram of a stateless RESTful API powered by Laravel Sanctum and Eloquent API Resources for a multi-school payment platform"
seoTitle: "Multi-School Payment System with Laravel: RESTful API & Sanctum (Part 5) — MAS-AGUS"
seoDescription: "Step-by-step tutorial Part 5: designing a stateless multi-tenant RESTful API with Laravel Sanctum, API Resources, Rate Limiting, and mobile client integration."
focusKeyword: "RESTful API Laravel Sanctum Multi-School"
lang: "en"
translationSlug: "tutorial-aplikasi-pembayaran-multi-sekolah-laravel-rest-api"
---

> **Software Engineering Documentation & Serial Tutorial (Part 5)**  
> **Author:** Agus Sifaunajah (MAS-AGUS)  
> **Prerequisites:** Completion of [Part 1: MySQL Database Architecture](/en/blog/multi-school-payment-system-laravel-database-architecture-part-1), [Part 2: Eloquent Multi-Tenant Scope](/en/blog/multi-school-payment-system-laravel-eloquent-multi-tenant-part-2), [Part 3: Billing Engine & ACID Transactions](/en/blog/multi-school-payment-system-laravel-billing-engine-acid-payments-part-3), and [Part 4: PDF Receipts, WhatsApp Gateway & Executive Dashboard](/en/blog/multi-school-payment-system-laravel-pdf-whatsapp-dashboard-part-4).  
> **Target Deliverables:** A production-hardened stateless RESTful API (`/api/v1`) utilizing Laravel Sanctum bearer authentication, HTTP header tenant resolution, JSON transformation via API Resources, and Rate Limiting protection.

---

## 1. Introduction: Evolving from a Web Monolith to a Distributed Ecosystem

Across the first four installments of this series, we built a comprehensive multi-school payment platform operating cleanly in web browsers: spanning [3NF relational MySQL schema design](/en/blog/multi-school-payment-system-laravel-database-architecture-part-1), [automated cross-tenant isolation via Eloquent Global Scopes](/en/blog/multi-school-payment-system-laravel-eloquent-multi-tenant-part-2), [batch billing engines and ACID cashier settlements](/en/blog/multi-school-payment-system-laravel-billing-engine-acid-payments-part-3), and [accounting-grade PDF receipts, asynchronous WhatsApp queues, and consolidated executive dashboards](/en/blog/multi-school-payment-system-laravel-pdf-whatsapp-dashboard-part-4).

However, in modern educational operations, an administrative web portal alone is no longer sufficient. Throughout my field work advising educational foundations and municipal agencies—as documented empirically in my study on [Digital Transformation in Information Systems and REST API Integration](/en/blog/digital-transformation-in-information-systems-public-service-integration)—cross-platform integration demands emerge immediately once the core ledger stabilizes:

1. **Parent & Guardian Mobile Applications**: Parents expect to inspect outstanding tuition balances, review payment histories, and download official PDF receipts directly on their smartphones (for instance, via hybrid mobile clients engineered with [Framework7](/en/blog/introduction-to-framework7-building-hybrid-mobile-apps-and-pwa) or PWAs).
2. **External Academic Portal (SIS) Integration**: The foundation's Student Information System needs programmatic verification of tuition clearance before issuing semester examination cards.
3. **Payment Gateway & POS Readiness**: School payment counters are no longer restricted to cash; the platform must ingest settlement requests from tablet POS terminals, EDC devices, and banking callbacks.

To fulfill these requirements without duplicating the core business logic (`BillingService` and `PaymentService`) we engineered earlier, the cleanest architectural solution is exposing a hardened **RESTful API layer**.

---

## 2. The Architectural Challenge: Stateless RESTful APIs in Multi-Tenant Systems

As formulated by Roy Fielding (2000) in his foundational dissertation on *Representational State Transfer (REST)*, the defining constraint of a RESTful API is **Statelessness**—every request from client to server must carry the complete context required to understand and process it without relying on stored server session state.

Here lies a critical architectural trap that frequently trips up developers:

> [!IMPORTANT]
> In Part 2, our web middleware `SetTenantContext` relied on `session('active_school_id')` to track the active school branch for foundation administrators. **In RESTful API routes (`routes/api.php`), PHP Sessions and stateful cookies are absent.** Therefore, we must engineer a strictly *stateless* tenant resolution pipeline driven by **Bearer Tokens** and **HTTP Request Headers (`X-School-Code`)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             STATELESS MULTI-TENANT RESTFUL API ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Mobile Client / External SIS]                                             │
│     │  Authorization: Bearer <Sanctum_Token>                                │
│     │  X-School-Code: SMP-IT   (Optional for Foundation Admins)             │
│     ▼                                                                       │
│  [API Gateway Middleware Pipeline]                                          │
│     ├─ 1. throttle:api         (Brute-Force & DoS Protection)               │
│     ├─ 2. auth:sanctum         (Bearer Token & Ability Verification)        │
│     └─ 3. resolve.api.tenant   (Binds TenantManager to active school_id)    │
│     │                                                                       │
│     ▼                                                                       │
│  [Thin API Controllers] ──> [PaymentService / BillingService]               │
│     │                       (Leverages Eloquent SchoolScope Automatically)  │
│     ▼                                                                       │
│  [Eloquent API Resources] ──> Standardized JSON Envelope (HTTP 200 / 201)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

The elegance of our layered architecture from Part 2 becomes unmistakably clear here: once `ResolveApiTenant` binds the resolved `School` model into the `TenantManager` singleton, **every Eloquent model (`Student`, `Bill`, `PaymentTransaction`) and every domain service (`BillingService`, `PaymentService`) automatically enforces tenant isolation without modifying a single line of query logic!**

---

## 3. Step 1: Installing & Configuring Laravel Sanctum

In Laravel 11 and 12, API routing and **Laravel Sanctum** are scaffolded cleanly using a single Artisan command:

```bash
php artisan install:api
```

This generates `routes/api.php`, publishes the `personal_access_tokens` migration, and executes database migrations.

Next, ensure `App\Models\User` incorporates Sanctum's `HasApiTokens` trait so cashiers, foundation admins, and external service accounts can issue API tokens:

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
        'school_id', // NULL for foundation_admin
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
```

---

## 4. Step 2: Building Stateless `ResolveApiTenant` Middleware

Let us create dedicated API middleware that resolves the active school tenant without touching `session()`:

```bash
php artisan make:middleware ResolveApiTenant
```

Open `app/Http/Middleware/ResolveApiTenant.php` and implement token and `X-School-Code` header resolution:

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

        // 1. Branch-bound users (Cashier or Branch API Client)
        if ($user->role !== 'foundation_admin') {
            $school = School::where('id', $user->school_id)
                ->where('is_active', true)
                ->first();

            if (!$school) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Account is not linked to an active school branch.',
                ], 403);
            }

            $this->tenantManager->setSchool($school);
            return $next($request);
        }

        // 2. Foundation Admins: inspect optional X-School-Code HTTP header
        $schoolCode = $request->header('X-School-Code');

        if ($schoolCode) {
            $school = School::where('code', $schoolCode)
                ->where('is_active', true)
                ->first();

            if (!$school) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "School branch code '{$schoolCode}' not found or inactive.",
                ], 404);
            }

            $this->tenantManager->setSchool($school);
        }

        return $next($request);
    }
}
```

Register the middleware alias in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'resolve.api.tenant' => \App\Http\Middleware\ResolveApiTenant::class,
    ]);
})
```

---

## 5. Step 3: Token Issuance & Granular Abilities (`AuthController`)

In secure API engineering, bearer tokens must adhere to the principle of least privilege. Sanctum supports **Token Abilities** to restrict what each issued token can execute.

Scaffold `app/Http/Controllers/Api/V1/AuthController.php`:

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
     * Issues a Sanctum Bearer Token scoped with role-specific abilities.
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
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $abilities = match ($user->role) {
            'foundation_admin' => ['bills:read', 'payments:write', 'foundation:aggregate'],
            'cashier'          => ['bills:read', 'payments:write'],
            default            => ['bills:read'],
        };

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
     * Revokes the active access token on logout.
     */
    public function revokeToken(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Access token revoked successfully.',
        ], 200);
    }
}
```

---

## 6. Step 4: Standardized JSON Contracts via Eloquent API Resources

Returning raw Eloquent models directly (`return response()->json($bills)`) is an anti-pattern that exposes internal database column names and breaks downstream mobile clients whenever schemas evolve.

We enforce strict JSON contracts using **Eloquent API Resources**:

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

## 7. Step 5: Thin API Controllers & Versioned Routing (`/api/v1`)

Now we scaffold two thin API controllers that delegate 100% of business logic and transactional locking to our existing `PaymentService` and `SchoolScope`:

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
    public function index(Request $request, string $nis): JsonResponse
    {
        if (!$request->user()->tokenCan('bills:read')) {
            return response()->json(['status' => 'error', 'message' => 'Token lacks bills:read ability.'], 403);
        }

        // Automatically scoped to the active tenant via BelongsToSchool
        $student = Student::where('nis', $nis)->first();

        if (!$student) {
            return response()->json([
                'status'  => 'error',
                'message' => "Student with NIS {$nis} not found in this school branch.",
            ], 404);
        }

        $statusFilter = $request->query('status');

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
Notice how this controller **reuses 100%** of `StorePaymentTransactionRequest` and `PaymentService` from Part 3—preserving pessimistic row locking (`lockForUpdate()`) and asynchronous WhatsApp receipt dispatching with zero code duplication.

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

    public function store(StorePaymentTransactionRequest $request): JsonResponse
    {
        if (!$request->user()->tokenCan('payments:write')) {
            return response()->json(['status' => 'error', 'message' => 'Token lacks payments:write ability.'], 403);
        }

        $school = $this->tenantManager->getSchool();

        if (!$school) {
            return response()->json([
                'status'  => 'error',
                'message' => 'X-School-Code header is required for cross-tenant API settlements.',
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
            'message' => 'Payment transaction recorded via API.',
            'data'    => new PaymentTransactionResource($transaction),
        ], 201);
    }

    public function show(string $receiptNumber): JsonResponse
    {
        $transaction = PaymentTransaction::with(['student', 'details.bill.paymentType'])
            ->where('receipt_number', $receiptNumber)
            ->first();

        if (!$transaction) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Receipt number not found in active school branch.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => new PaymentTransactionResource($transaction),
        ], 200);
    }
}
```

### C. Versioned API Route Definitions (`routes/api.php`)
```php
<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PaymentApiController;
use App\Http\Controllers\Api\V1\StudentBillApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public Token Issuance (strictly rate-limited)
    Route::post('/auth/token', [AuthController::class, 'issueToken'])
        ->middleware('throttle:10,1');

    // Protected Routes: Sanctum Bearer Auth + Stateless Tenant Isolation
    Route::middleware(['auth:sanctum', 'throttle:60,1', 'resolve.api.tenant'])->group(function () {
        Route::post('/auth/revoke', [AuthController::class, 'revokeToken']);

        // Student Invoices
        Route::get('/students/{nis}/bills', [StudentBillApiController::class, 'index']);

        // Cashier Settlements & Receipts
        Route::post('/payments', [PaymentApiController::class, 'store']);
        Route::get('/payments/{receiptNumber}', [PaymentApiController::class, 'show'])
            ->where('receiptNumber', '.*');
    });
});
```

> [!TIP]
> Notice `->where('receiptNumber', '.*')` on `GET /payments/{receiptNumber}`. Because our receipt format contains forward slashes (`KWT/SMP-IT/202611/0001`), this regex constraint prevents Laravel's router from misinterpreting slashes as nested path segments.

---

## 8. Step 6: End-to-End Testing with `curl`

With your local server running (`php artisan serve`), test the complete API flow directly from the terminal:

### 1. Request a Bearer Token
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/token \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cashier.smp@foundation.edu",
    "password": "secret-password",
    "device_name": "Mobile-POS-Tablet-01"
  }'
```

### 2. Query Unpaid Student Bills
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/students/SMP-2001/bills?status=unpaid" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|aBcDeFgHiJkLmNoPqRsTuVwXyZ"
```

### 3. Commit a Multi-Item Settlement
```bash
curl -X POST http://127.0.0.1:8000/api/v1/payments \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|aBcDeFgHiJkLmNoPqRsTuVwXyZ" \
  -d '{
    "student_id": 15,
    "payment_method": "qris",
    "notes": "Settled via Guardian Mobile App",
    "allocations": [
      { "bill_id": 10, "amount": 400000 },
      { "bill_id": 11, "amount": 200000 }
    ]
  }'
```

---

## 9. API Security Hardening Checklist

Exposing financial APIs to the public Internet expands the attack surface. Reflecting the defense-in-depth principles discussed in [Facing the Cyber Storm: Critical Reflections on Digital Infrastructure](/en/blog/facing-the-cyber-storm-critical-reflections-on-digital-infrastructure), enforce four mandatory safeguards before production deployment:

1. **Mitigating Insecure Direct Object Reference (IDOR)**: If a malicious actor tampers with `student_id` or `bill_id` in the JSON payload to target another school's records, the combination of `SchoolScope` and `where('school_id', $school->id)` inside `PaymentService` immediately rejects the request with HTTP 404.
2. **Strict Rate Limiting**: Endpoint `/auth/token` is locked to `throttle:10,1` (10 attempts per minute per IP) to neutralize credential-stuffing and brute-force attacks.
3. **Explicit CORS Whitelisting (`config/cors.php`)**: Never deploy `'allowed_origins' => ['*']` on production financial endpoints. Whitelist only authorized foundation web domains and mobile app origins.
4. **Mandatory TLS/HTTPS Encryption**: Bearer tokens grant direct access to financial operations. Ensure all API traffic is strictly routed over HTTPS with HSTS enabled at the edge proxy.

---

## 10. Conclusion: Completing the Distributed Foundation Ecosystem

With the completion of **Part 5**, our multi-school payment system has evolved into a full-fledged, distributed enterprise platform:
* **[Part 1](/en/blog/multi-school-payment-system-laravel-database-architecture-part-1)**: Normalized 3NF MySQL schema & `DECIMAL(12, 2)` precision.
* **[Part 2](/en/blog/multi-school-payment-system-laravel-eloquent-multi-tenant-part-2)**: Automated Multi-Tenant Isolation via `SchoolScope` & `BelongsToSchool`.
* **[Part 3](/en/blog/multi-school-payment-system-laravel-billing-engine-acid-payments-part-3)**: Mass Billing Engine, Cascading Scholarship Rates, & ACID Cashier Transactions (`lockForUpdate()`).
* **[Part 4](/en/blog/multi-school-payment-system-laravel-pdf-whatsapp-dashboard-part-4)**: Accounting PDF Receipts, Asynchronous WhatsApp Queues, & Executive Dashboards.
* **Part 5 (This Article)**: Production-ready **Stateless RESTful API** powered by Laravel Sanctum, API Resources, and multi-platform integration.

This cleanly decoupled architecture is now ready to power native/hybrid guardian mobile applications, integrate seamlessly with external academic portals, and connect to modern payment gateways.

---

## References & Related Resources

1. **Laravel Sanctum Official Documentation**: Specifications for SPA authentication, API token issuance, and token abilities at [Laravel Sanctum](https://laravel.com/docs/sanctum).
2. **Eloquent API Resources Documentation**: JSON transformation layer specifications at [Laravel Eloquent Resources](https://laravel.com/docs/eloquent-resources).
3. **REST Architectural Dissertation (Roy Fielding)**: *Architectural Styles and the Design of Network-based Software Architectures*, UC Irvine, 2000.
4. **Relevant Articles in the MAS-AGUS Knowledge Hub**:
   - Public sector API interoperability: [Digital Transformation in Information Systems: Dismantling Silos Through REST APIs](/en/blog/digital-transformation-in-information-systems-public-service-integration).
   - Building hybrid mobile API clients: [Introduction to Framework7: Building High-Performance Hybrid Mobile Apps and PWAs](/en/blog/introduction-to-framework7-building-hybrid-mobile-apps-and-pwa).
   - Modern PHP ecosystem evolution: [The Evolution of Laravel Framework: From Elegant MVC to Modern Web Ecosystem](/en/blog/evolution-of-laravel-framework-from-elegant-mvc-to-modern-web-ecosystem).
   - Infrastructure & API security hardening: [Facing the Cyber Storm: Critical Practitioner Reflections on Digital Infrastructure](/en/blog/facing-the-cyber-storm-critical-reflections-on-digital-infrastructure).
