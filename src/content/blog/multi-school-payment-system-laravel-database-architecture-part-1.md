---
title: "Building a Multi-School Payment System for Educational Foundations with Laravel: Requirements Analysis and MySQL Relational Database Architecture (Part 1)"
description: "A systems engineering practitioner guide on multi-tenant architecture, educational foundation financial modeling, and normalized MySQL relational database design for a centralized school fee billing platform."
pubDate: 2026-11-23
updatedDate: 2026-11-23
category: "Rekayasa Sistem"
tags:
  - Laravel
  - MySQL
  - Multi-Tenancy
  - Database Design
  - Sistem Informasi
  - Tutorial Berseri
featured: true
draft: false
cover: "/images/articles/aplikasi-pembayaran-multi-sekolah-laravel.svg"
coverAlt: "Multi-tenant MySQL relational database architecture for a centralized multi-school payment system in Laravel"
seoTitle: "Multi-School Payment System with Laravel: Database Architecture (Part 1) — MAS-AGUS"
seoDescription: "Step-by-step software engineering tutorial: multi-tenant school payment systems in Laravel, business process analysis, and normalized MySQL schema DDL."
focusKeyword: "Multi School Payment System Laravel"
lang: "en"
translationSlug: "tutorial-aplikasi-pembayaran-multi-sekolah-laravel-database"
---

> **Software Engineering Documentation & Serial Tutorial (Model 1)**  
> **Author:** Agus Sifaunajah (MAS-AGUS)  
> **Topic Focus:** Cashier Systems Analysis, Single-Database Multi-Tenancy Architecture, MySQL Relational Schema Design, and Financial Data Integrity.

---

## 1. Introduction: Financial Complexities in Integrated Educational Foundations

In the private educational ecosystem—particularly educational foundations governing multiple school units ranging from Kindergarten (TK/KB) and Elementary (SD/MI) to Junior High (SMP/MTs) and Senior Vocational High Schools (SMA/SMK)—managing cash flow, tuition collection, and fee reconciliation is notoriously fraught with operational friction.

Throughout my experience advising educational institutions and regional public bodies on information systems digitalization, I have routinely observed heavily fragmented financial administration:
1. **The Fragility of Siloed Operations**: Each school unit operates an independent accounting notebook or disjointed spreadsheet. Some record monthly tuition in paper ledgers, others rely on fragile local spreadsheets vulnerable to data loss, while others purchase unintegrated commercial turnkey software.
2. **Zero Real-Time Cash Visibility for Central Governance**: When foundation executives or the chief treasurer require consolidated cash flow statements to make strategic capital investments (such as cross-subsidizing new classroom construction or library facilities), administrative staff spend days manually collecting and reconciling figures across dispersed school branches.
3. **Disparate Fee Categories and Discretionary Subsidies**: Every educational tier features radically distinct fee categories. Kindergarten units bill for meals and creative supplies; junior high units bill for science laboratories; vocational high schools bill for industrial certification exams. Simultaneously, foundations frequently enforce centralized discount policies (such as sibling tuition relief or orphan scholarships).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│          CONSOLIDATED FINANCIAL ARCHITECTURE FOR SCHOOL FOUNDATIONS         │
├─────────────────────────────────────────────────────────────────────────────┤
│                       FOUNDATION CENTRAL EXECUTIVE BOARD                    │
│             (Global Cash Telemetry & Consolidated Rate Governance)          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│ KINDERGARTEN (TK)│          │ ELEMENTARY (SD)  │          │ HIGH SCHOOL (SMA)│
│ • Monthly Fee    │          │ • Monthly & Dues │          │ • Monthly & Labs │
│ • Local Cashier  │          │ • Local Cashier  │          │ • Local Cashier  │
│ • Bank Account A │          │ • Bank Account B │          │ • Bank Account C │
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

To permanently dismantle these structural bottlenecks, the most robust engineering approach is constructing a **Centralized Multi-Tenant School Payment Application**.

Throughout this comprehensive serial guide, I will lead you step-by-step from scratch to production in engineering a multi-school payment system using the modern **Laravel** framework. And as with any disciplined software engineering undertaking, resilient financial systems must begin with **a meticulously designed database architecture**.

---

## 2. Selecting the Multi-Tenancy Architecture: Why Single-Database?

Before writing DDL statements, a systems architect must determine the optimal multi-tenancy storage paradigm:

| Architecture Pattern | Storage Mechanism | Strengths | Trade-offs & Operational Costs |
| :--- | :--- | :--- | :--- |
| **Multi-Database** | Each school unit has an isolated MySQL database | Absolute physical data isolation | High server RAM overhead; extremely complex foundation consolidation queries (*cross-database joins*); high schema migration maintenance. |
| **Multi-Schema** | One database with separate table schemas per school | Strong logical isolation | Complex user permission management; inconsistent support across standard MySQL storage engines. |
| **Single-Database (Shared Schema)** | **One shared database with a discriminator column: `school_id`** | **Extremely cost-efficient infrastructure; instantaneous foundation consolidation queries; unified centralized schema migrations.** | **Demands developer discipline (*Global Scopes* / Row-Level Filtering) to prevent cross-tenant data leakage.** |

### Our Architectural Decision
For an educational foundation overseeing 3 to 15 school branches with 1,000 to 15,000 enrolled students, the **Single-Database (Shared Schema)** architecture is by far the most pragmatic and performant choice.

In Part 2 of this series, we will harness **Eloquent Global Scopes** within [The Evolution of Laravel Framework](/en/blog/evolution-of-laravel-framework-from-elegant-mvc-to-modern-web-ecosystem) to automatically inject `WHERE school_id = ?` into every reading and writing operation. This guarantees that a cashier at School A can never view billing data from School B, while preserving the foundation's ability to aggregate enterprise financials in real time.

---

## 3. Data Dictionary and Core Relational Entities

This payment platform is engineered upon 10 core relational entities:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ENTITY-RELATIONSHIP ARCHITECTURAL MAP                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  [foundations] 1:N ──> [schools] 1:N ──> [academic_years]                   │
│                           │                                                 │
│                           ├── 1:N ──> [classes]                             │
│                           ├── 1:N ──> [students] 1:N ──> [student_classes]  │
│                           ├── 1:N ──> [payment_types]                       │
│                           │                 │                               │
│                           │                1:N                              │
│                           │                 ▼                               │
│                           ├── 1:N ──> [payment_rates]                       │
│                           │                 │                               │
│                           │                1:N                              │
│                           │                 ▼                               │
│                           ├── 1:N ──> [bills (invoices)]                    │
│                           │                 ▲                               │
│                           │                N:1                              │
│                           └── 1:N ──> [payment_transactions] 1:N ───────────┘
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **`foundations`**: Represents the legal governing educational foundation.
2. **`schools`**: Represents the individual educational branches (TK, SD, SMP, SMA) including dedicated bank account details.
3. **`academic_years`**: Defines calendar academic sessions (e.g., 2026/2027 Odd Semester) with active status flags.
4. **`classes`**: Grade sections and student groups tied to specific school branches and academic years.
5. **`students`**: Master student demographic records (student IDs, full name, guardian contacts, active status).
6. **`student_classes`**: Pivot table capturing student academic progressions across academic years (preserving historical records upon promotion).
7. **`payment_types`**: Master catalog of billable fee categories (Monthly Tuition, Registration/Capital, Uniforms, Books, Examination Fees).
8. **`payment_rates`**: Granular rate matrix. Rates can be assigned globally per school, overridden per class section, or customized per student to accommodate scholarships and hardship discounts.
9. **`bills` (Student Invoices)**: Concrete billing obligations generated systematically per student per cycle.
10. **`payment_transactions` & `payment_transaction_details`**: Concrete ledger of cashier settlements, recording unique receipt numbers, payment methods (cash/bank/gateway), timestamps, and cashier identities.

---

## 4. Complete Production-Ready MySQL DDL Script

Below is the complete MySQL Data Definition Language (DDL) script ready for deployment. Notice that all financial monetary attributes strictly utilize `DECIMAL(12, 2)` to eliminate floating-point rounding errors:

```sql
-- =============================================================================
-- MULTI-SCHOOL EDUCATIONAL FOUNDATION PAYMENT DATABASE SCHEMA
-- Storage Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Designed by: Agus Sifaunajah (MAS-AGUS)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `db_foundation_payments`
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `db_foundation_payments`;

-- 1. Master Foundation Table
CREATE TABLE `foundations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `legal_number` VARCHAR(100) NULL COMMENT 'Statutory License / Legal Operational Deed',
    `address` TEXT NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 2. School Branch Units (Tenants)
CREATE TABLE `schools` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `foundation_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(20) NOT NULL COMMENT 'Branch code, e.g., SMP-IT, SMA-01',
    `name` VARCHAR(150) NOT NULL,
    `education_level` ENUM('KB', 'TK', 'SD', 'MI', 'SMP', 'MTS', 'SMA', 'MA', 'SMK') NOT NULL,
    `npsn` VARCHAR(20) NULL,
    `bank_name` VARCHAR(50) NULL COMMENT 'Unit depository bank',
    `bank_account_number` VARCHAR(50) NULL,
    `bank_account_holder` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_school_code` (`code`),
    CONSTRAINT `fk_schools_foundation` 
        FOREIGN KEY (`foundation_id`) REFERENCES `foundations` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. Academic Calendar Years
CREATE TABLE `academic_years` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(50) NOT NULL COMMENT 'e.g., 2026/2027 Odd',
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_academic_active` (`school_id`, `is_active`),
    CONSTRAINT `fk_academic_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. Classes / Cohort Groups
CREATE TABLE `classes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `academic_year_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(50) NOT NULL COMMENT 'e.g., VII-A, X-RPL-1',
    `grade_level` TINYINT UNSIGNED NOT NULL COMMENT 'Grade numerical index: 1-12',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_class_search` (`school_id`, `academic_year_id`),
    CONSTRAINT `fk_classes_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_classes_academic` 
        FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Student Demographic Master
CREATE TABLE `students` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `nis` VARCHAR(30) NOT NULL COMMENT 'Local School Student ID',
    `nisn` VARCHAR(30) NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `gender` ENUM('L', 'P') NOT NULL,
    `parent_name` VARCHAR(150) NOT NULL,
    `parent_phone` VARCHAR(30) NOT NULL COMMENT 'Key for WhatsApp billing notifications',
    `address` TEXT NULL,
    `status` ENUM('aktif', 'lulus', 'pindah', 'keluar') NOT NULL DEFAULT 'aktif',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_nis` (`school_id`, `nis`),
    INDEX `idx_student_name` (`school_id`, `full_name`),
    CONSTRAINT `fk_students_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Student Academic Placement History (Pivot)
CREATE TABLE `student_classes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `class_id` BIGINT UNSIGNED NOT NULL,
    `academic_year_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('aktif', 'mutasi_keluar', 'lulus') NOT NULL DEFAULT 'aktif',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_academic_class` (`student_id`, `academic_year_id`),
    CONSTRAINT `fk_sc_student` 
        FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_sc_class` 
        FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_sc_academic` 
        FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. Billable Payment Categories
CREATE TABLE `payment_types` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL COMMENT 'e.g., Monthly Tuition, Building Fee, Uniform',
    `billing_cycle` ENUM('monthly', 'yearly', 'once') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_pt_school` (`school_id`, `billing_cycle`),
    CONSTRAINT `fk_pt_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. Payment Rates Matrix (Standard and Exception Overrides)
CREATE TABLE `payment_rates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `payment_type_id` BIGINT UNSIGNED NOT NULL,
    `academic_year_id` BIGINT UNSIGNED NOT NULL,
    `class_id` BIGINT UNSIGNED NULL COMMENT 'If NULL, applies globally across the school',
    `student_id` BIGINT UNSIGNED NULL COMMENT 'If populated, represents an individualized scholarship or discount',
    `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `notes` VARCHAR(255) NULL COMMENT 'Discount explanation or policy rationale',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_rate_lookup` (`payment_type_id`, `academic_year_id`, `class_id`, `student_id`),
    CONSTRAINT `fk_rate_payment_type` 
        FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_rate_academic` 
        FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_rate_class` 
        FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_rate_student` 
        FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. Student Invoices (Bills)
CREATE TABLE `bills` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `payment_type_id` BIGINT UNSIGNED NOT NULL,
    `academic_year_id` BIGINT UNSIGNED NOT NULL,
    `period_month` TINYINT UNSIGNED NULL COMMENT '1-12 for monthly tuition cycles',
    `period_year` SMALLINT UNSIGNED NULL COMMENT 'Calendar year, e.g., 2026',
    `amount_due` DECIMAL(12, 2) NOT NULL COMMENT 'Initial invoiced obligation',
    `amount_paid` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Cumulative settled payments',
    `status` ENUM('unpaid', 'partially_paid', 'paid') NOT NULL DEFAULT 'unpaid',
    `due_date` DATE NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_bills_filtering` (`school_id`, `status`, `due_date`),
    INDEX `idx_bills_student` (`student_id`, `status`),
    CONSTRAINT `fk_bills_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_bills_student` 
        FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_bills_pt` 
        FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_bills_academic` 
        FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. Cashier Payment Receipts (Transaction Ledger)
CREATE TABLE `payment_transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` BIGINT UNSIGNED NOT NULL,
    `student_id` BIGINT UNSIGNED NOT NULL,
    `receipt_number` VARCHAR(50) NOT NULL COMMENT 'Unique receipt ID, e.g., KWT-SMP-202611-0001',
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `payment_method` ENUM('cash', 'transfer_bank', 'qris', 'payment_gateway') NOT NULL DEFAULT 'cash',
    `transaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `received_by` VARCHAR(100) NOT NULL COMMENT 'Cashier Name / User ID',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_receipt_number` (`receipt_number`),
    INDEX `idx_tx_school_date` (`school_id`, `transaction_date`),
    CONSTRAINT `fk_tx_school` 
        FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_tx_student` 
        FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 11. Transaction Settlement Allocations (Details)
CREATE TABLE `payment_transaction_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `transaction_id` BIGINT UNSIGNED NOT NULL,
    `bill_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL COMMENT 'Amount credited toward this specific invoice',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_ptd_lookup` (`transaction_id`, `bill_id`),
    CONSTRAINT `fk_ptd_transaction` 
        FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_ptd_bill` 
        FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;
```

---

## 5. Architectural Deep Dive: Financial Data Integrity Principles

As software systems engineers, five essential design decisions behind this database schema warrant close inspection:

### 1. Zero Tolerance for Floating-Point Approximations
In accounting software, **never utilize `FLOAT` or `DOUBLE` datatypes**. Both datatypes rely on binary fractional approximations adhering to IEEE 754 standards. Across thousands of accumulated transactions, these approximations produce subtle sub-cent precision errors that corrupt trial balances.

The **`DECIMAL(12, 2)`** datatype stores numbers as exact fixed-point decimals, supporting values up to 9,999,999,999.99 (nearly 10 billion units), which comfortably exceeds any school transaction requirements.

### 2. Enforcing `ON DELETE RESTRICT` for Audit Immutability
Notice every foreign key constraint defined in the schema. We deliberately configure **`ON DELETE RESTRICT`**, completely eschewing `CASCADE`.
> [!CAUTION]
> Never configure `ON DELETE CASCADE` in financial databases! If an administrative operator accidentally deletes a student record, a cascading delete would permanently destroy all associated historical billing and payment audit trails.
> 
> With `RESTRICT`, the MySQL engine firmly blocks deletion requests whenever dependent invoice or ledger records exist.

### 3. Decoupling Cashier Transactions (`payment_transactions`) from Invoices (`bills`)
Novice developers frequently merge payment records directly into the invoice table by appending a payment timestamp column. This constitutes an architectural anti-pattern incapable of supporting real-world school workflows:
* **Partial Installment Payments**: A parent paying an initial installment of Rp 500,000 toward a Rp 2,000,000 capital registration invoice.
* **Bundled Settlements**: A guardian presenting Rp 1,500,000 cash to simultaneously settle November tuition, December tuition, and laboratory fees within **a single issued receipt**.

Via **`payment_transaction_details`**, a single transaction receipt can settle multiple invoices (*one-to-many allocation*), or an individual invoice can be satisfied across multiple staggered installment transactions.

### 4. Composite Indexing for Production Query Performance
As the system scales across several years, tables accumulate hundreds of thousands of records. Single-column primary key lookups become bottlenecks:
* `INDEX idx_bills_filtering (school_id, status, due_date)`: Accelerates cashier queries locating *unpaid invoices across the Junior High branch*.
* `INDEX idx_tx_school_date (school_id, transaction_date)`: Optimizes daily and monthly cash flow reconciliation queries for foundation executive auditors.

---

## 6. Architectural Synergy and Security Hardening

This relational database design aligns with the core systems principles explored throughout the MAS-AGUS Knowledge Hub:
* **ACID Transaction Resilience**: The InnoDB engine enforces ACID transactions (*Atomicity, Consistency, Isolation, Durability*). Reflecting on our analysis in [Facing the Cyber Storm: Critical Reflections on Digital Infrastructure](/en/blog/facing-the-cyber-storm-critical-reflections-on-digital-infrastructure), all Laravel cashier operations must be wrapped within `DB::transaction()` blocks to guarantee that updating invoice balances and logging receipts succeed atomically or roll back completely during network drops.
* **Design Science Research Artifact**: This relational schema constitutes an empirical design artifact adhering to the structured guidelines of [Applied Research Methodologies in Information Systems (DSRM)](/en/blog/applied-research-methodologies-in-information-systems).
* **Enterprise ORM Parallels**: The modeling patterns established here can be contrasted with Active Record patterns in [Building Robust CRUD with Yii 2 Framework](/en/blog/building-robust-crud-with-yii-2-framework-practitioner-guide) and enterprise conventions in [The Evolution of CakePHP Framework](/en/blog/evolution-of-cakephp-framework-from-convention-to-modern-enterprise).

---

## 7. Roadmap for Upcoming Serial Installments

The MySQL relational foundation completed here in Part 1 sets the stage for implementation across the application tier:

* **Part 2 (Available)**: [Schema Migrations, Eloquent Modeling, and Multi-Tenant Global Scopes](/en/blog/multi-school-payment-system-laravel-eloquent-multi-tenant-part-2) — Translating DDL to Migrations, engineering the `BelongsToSchool` Trait, and automating query isolation.
* **Part 3 (Available)**: [Billing Generation Engine, Scholarship Rates, and ACID Cashier Transactions](/en/blog/multi-school-payment-system-laravel-billing-engine-acid-payments-part-3) — Developing `BillingService`, cascading rate resolvers, and installment cashier workflows.
* **Part 4 (Available)**: [Dynamic PDF Receipts, WhatsApp Gateway Integration, and Executive Dashboards](/en/blog/multi-school-payment-system-laravel-pdf-whatsapp-dashboard-part-4) — Official accounting-grade PDF generation, asynchronous WhatsApp queues, and consolidated foundation telemetry.

Execute the SQL script above in your local development environment to prepare for Part 2!

---

## References & Authoritative Documentation

1. **MySQL InnoDB Storage Engine Documentation**: In-depth guidance on ACID compliance, foreign key constraints, and indexing at [MySQL Documentation](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html).
2. **Laravel Database Migrations Guide**: Schema builder specifications and index declarations at [Laravel Documentation](https://laravel.com/docs/migrations).
3. **IEEE 754 Floating-Point Standards**: Technical analyses of binary precision hazards in financial systems engineering via ACM/IEEE literature.
4. **Relevant Articles in the MAS-AGUS Knowledge Hub**:
   - Tutorial Series Part 2: [Multi-School Payment System with Laravel: Eloquent Multi-Tenancy (Part 2)](/en/blog/multi-school-payment-system-laravel-eloquent-multi-tenant-part-2).
   - Tutorial Series Part 3: [Multi-School Payment System with Laravel: Billing Engine & ACID Transactions (Part 3)](/en/blog/multi-school-payment-system-laravel-billing-engine-acid-payments-part-3).
   - Tutorial Series Part 4 (Final): [Multi-School Payment System with Laravel: PDF Receipts, WhatsApp & Dashboard (Part 4)](/en/blog/multi-school-payment-system-laravel-pdf-whatsapp-dashboard-part-4).
   - Modern enterprise PHP architectures: [The Evolution of Laravel Framework: From Elegant MVC to Modern Web Ecosystem](/en/blog/evolution-of-laravel-framework-from-elegant-mvc-to-modern-web-ecosystem).
   - Resilient relational data modeling: [Building Robust CRUD with Yii 2 Framework: A Practitioner's Architectural Guide](/en/blog/building-robust-crud-with-yii-2-framework-practitioner-guide).
   - Distributed municipal data architectures: [Digital Transformation in Information Systems: Dismantling Silos Through REST APIs](/en/blog/digital-transformation-in-information-systems-public-service-integration).
