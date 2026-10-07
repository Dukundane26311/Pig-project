# PostgreSQL Database Structure — Pig Project

The database has been successfully upgraded and migrated using `prisma db push` and `prisma generate` to match all 29 requirements while safely preserving historic legacy fields mapped via `@map` to prevent data loss.

## Core Hierarchy

### 1. User Location Access
* **Purpose:** Allows Super Admins to define exactly which geographic regions (District, Sector, Cell, Village) a field officer operates in.
* **Primary Key:** `id`
* **Foreign Keys:** `userId` -> `User(id)`
* **Indexes:** PK index.

### 2. Geographic Hierarchy (District → Sector → Cell → Village)
* **Purpose:** Normalized geographic locations ensuring valid location reporting for beneficiaries and pigs.
* **Primary Keys:** `id` on each table.
* **Relationships:** District (1) -> (M) Sector (1) -> (M) Cell (1) -> (M) Village
* **Unique Constraints:** `[name, districtId]` on Sector, `[name, sectorId]` on Cell, `[name, cellId]` on Village. 

## Beneficiary and Logistics Engine

### 3. Beneficiary
* **Purpose:** Core profile for the farmers interacting with the revolving fund.
* **Primary Key:** `id`
* **Important Foreign Keys:** `districtId`, `sectorId`, `cellId`, `villageId`, `createdById` -> `User(id)`
* **Indexes:** `nationalId`, `phone`, `districtId`, `sectorId`, `cellId`, `villageId`
* **Legacy Map:** The old `dateJoined` maps to `registrationDate`, `beneficiaryId` maps to `beneficiaryNumber`.

### 4. Pig
* **Purpose:** Tracking physical livestock assets throughout their lifespan.
* **Primary Key:** `id`
* **Important Foreign Keys:** `currentBeneficiaryId` -> `Beneficiary(id)`, geographic relations.
* **Indexes:** `tagNumber`, `currentBeneficiaryId`, geographic indexes, `healthStatus`, `status`.
* **Legacy Map:** `pigId` maps to `tagNumber`, `beneficiaryId` maps to `currentBeneficiaryId`.

### 5. PigDistribution & PigReturn & PigTransfer
* **Purpose:** Immutable ledger of when a pig enters a farm, returns piglets to the program, or transfers ownership.
* **Primary Keys:** `id`
* **Relationships:** Links heavily between `Beneficiary` and `Pig` and the `User` performing the action.
* **Indexes:** `beneficiaryId`, `pigId`, `date` (or `returnDate` / `distributionDate`).

### 6. RevolvingCycle
* **Purpose:** Calculates expectations and statuses of the 3-piglet return mandate.
* **Primary Key:** `id`
* **Foreign Keys:** `beneficiaryId` -> `Beneficiary(id)`
* **Indexes:** `beneficiaryId`, `status`, `dueDate`

## Veterinary Protocol Engine

### 7. VeterinaryExamination & Vaccination & Treatment
* **Purpose:** Standardizing clinical histories of the livestock.
* **Primary Keys:** `id`
* **Important Foreign Keys:** `pigId` -> `Pig(id)`, `veterinarianId` -> `User(id)`
* **Indexes:** `pigId`, `veterinarianId`, `examinationDate`, `verificationStatus` (on Examination).

### 8. MortalityRecord
* **Purpose:** Managing death reporting and veterinary/admin autopsies without destroying the historical `Pig` asset.
* **Primary Key:** `id`
* **Foreign Keys:** `pigId` -> `Pig(id)`, `recordedById` -> `User(id)`, `approvedById` -> `User(id)`

## System Engine

### 9. SystemSetting & Notification & AuditLog
* **Purpose:** Maintaining systemic configuration, alert workflows (e.g. CRITICAL health alerts), and strict append-only auditing.
* **Primary Keys:** `id`
* **Unique Constraints:** `[key]` on SystemSetting.
* **Indexes:** `userId`, `entity`, `entityId`, `createdAt` on AuditLog.

### 10. FinancialTransaction
* **Purpose:** Storing monetary value utilizing Postgres `Decimal` types.
* **Primary Key:** `id`
* **Relationships:** Links optionally to `Beneficiary(id)`, `Pig(id)`, `Piglet(id)`.

**Validation:** All tables contain primary keys. No cascading deletes are enabled on historical records. Financial values are typed correctly. Migration deployed.
