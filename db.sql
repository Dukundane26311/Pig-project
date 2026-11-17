-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'FIELD_OFFICER', 'VETERINARIAN', 'PROJECT_MANAGER', 'FINANCE_OFFICER', 'TRAINER', 'FUNDER');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('ALL', 'DISTRICT', 'SECTOR', 'CELL', 'VILLAGE');

-- CreateEnum
CREATE TYPE "BeneficiaryStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'COMPLETED', 'AWAITING_PIGLET', 'PIGLET_RECEIVED', 'GROWING', 'PREGNANT', 'LITTER_BORN', 'PIGLETS_GROWING', 'REPAYMENT_DUE', 'PARTIALLY_REPAID', 'REPAID_3_PIGLETS', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PigHealthStatus" AS ENUM ('HEALTHY', 'SICK', 'UNDER_TREATMENT', 'RECOVERED', 'CRITICAL', 'DECEASED');

-- CreateEnum
CREATE TYPE "PigStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'RETURNED', 'DECEASED', 'INACTIVE', 'REGISTERED', 'PURCHASED', 'DISTRIBUTED', 'GROWING', 'PREGNANT', 'DELIVERED', 'PIGLETS_RECORDED', 'PIGLETS_GROWING', 'REPAYMENT', 'RETURNED_PIGLETS', 'REDISTRIBUTED', 'SOLD');

-- CreateEnum
CREATE TYPE "PigSex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "RevolvingStatus" AS ENUM ('ACTIVE', 'PARTIALLY_COMPLETED', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PigletStatus" AS ENUM ('ALIVE', 'RETURNED', 'TRANSFERRED', 'DECEASED', 'SOLD', 'INACTIVE', 'WITH_MOTHER', 'GROWING', 'AVAILABLE_FOR_REDISTRIBUTION', 'REDISTRIBUTED');

-- CreateEnum
CREATE TYPE "VeterinaryVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FOLLOW_UP_REQUIRED', 'TREATMENT_REQUIRED', 'CRITICAL', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TreatmentStatus" AS ENUM ('ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MortalityReviewStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ALERT', 'APPROVAL', 'VETERINARY', 'REVOLVING', 'HEALTH_ALERT', 'MORTALITY_ALERT');

-- CreateEnum
CREATE TYPE "FinanceType" AS ENUM ('INCOME', 'EXPENSE', 'DISBURSEMENT', 'RETURN', 'FEE', 'OTHER');

-- CreateEnum
CREATE TYPE "FinanceStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT,
    "responsibilities" TEXT,
    "photo_url" TEXT,
    "specialization" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedin_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "show_email_public" BOOLEAN NOT NULL DEFAULT false,
    "show_phone_public" BOOLEAN NOT NULL DEFAULT false,
    "show_linkedin_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT NOT NULL,
    "category" TEXT,
    "location" TEXT,
    "photo_date" TIMESTAMP(3),
    "photographer" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_content" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL DEFAULT 'home',
    "section" TEXT NOT NULL DEFAULT 'hero',
    "title" TEXT,
    "description" TEXT,
    "primary_button_text" TEXT,
    "primary_button_link" TEXT,
    "secondary_button_text" TEXT,
    "secondary_button_link" TEXT,
    "image_url" TEXT,
    "image_alt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FIELD_OFFICER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "phoneVerified" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'ALL',
    "assignedDistrictId" TEXT,
    "assignedSectorId" TEXT,
    "assignedCellId" TEXT,
    "assignedVillageId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocationAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "districtId" TEXT,
    "sectorId" TEXT,
    "cellId" TEXT,
    "villageId" TEXT,
    "accessLevel" "AccessLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLocationAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "districtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cell" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "sectorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "cellId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nationalId" TEXT,
    "phone" TEXT,
    "gender" TEXT,
    "householdSize" INTEGER,
    "district" TEXT,
    "sector" TEXT,
    "cell" TEXT,
    "village" TEXT,
    "districtId" TEXT,
    "sectorId" TEXT,
    "cellId" TEXT,
    "villageId" TEXT,
    "status" "BeneficiaryStatus" NOT NULL DEFAULT 'ACTIVE',
    "dateJoined" TIMESTAMP(3) NOT NULL,
    "fieldOfficerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "alternativePhone" TEXT,
    "savingsGroup" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "testimony" TEXT,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pig" (
    "id" TEXT NOT NULL,
    "pigId" TEXT NOT NULL,
    "breed" TEXT,
    "sex" "PigSex",
    "sexString" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "estimatedAge" INTEGER,
    "currentWeight" DOUBLE PRECISION,
    "healthStatus" "PigHealthStatus" NOT NULL DEFAULT 'HEALTHY',
    "status" "PigStatus" NOT NULL DEFAULT 'ACTIVE',
    "beneficiaryId" TEXT,
    "districtId" TEXT,
    "sectorId" TEXT,
    "cellId" TEXT,
    "villageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateReceived" TIMESTAMP(3),
    "source" TEXT,
    "purchasePrice" DECIMAL(10,2),
    "currentLocation" TEXT,
    "healthStatusStr" TEXT,
    "pregnancyStatus" TEXT,
    "expectedDelivery" TIMESTAMP(3),
    "dateOfDelivery" TIMESTAMP(3),
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Pig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PigDistribution" (
    "id" TEXT NOT NULL,
    "pigId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "distributedById" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "initialWeight" DOUBLE PRECISION,
    "initialCondition" TEXT,
    "districtId" TEXT,
    "sectorId" TEXT,
    "cellId" TEXT,
    "villageId" TEXT,
    "programCycle" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PigDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PigReturn" (
    "id" TEXT NOT NULL,
    "pigId" TEXT,
    "beneficiaryId" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "condition" TEXT,
    "veterinaryVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedByVetId" TEXT,
    "districtId" TEXT,
    "sectorId" TEXT,
    "cellId" TEXT,
    "villageId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PigReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevolvingCycle" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expectedReturn" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "RevolvingStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevolvingCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PigTransfer" (
    "id" TEXT NOT NULL,
    "pigId" TEXT NOT NULL,
    "fromBeneficiaryId" TEXT,
    "toBeneficiaryId" TEXT,
    "previousDistrictId" TEXT,
    "previousSectorId" TEXT,
    "previousCellId" TEXT,
    "previousVillageId" TEXT,
    "newDistrictId" TEXT,
    "newSectorId" TEXT,
    "newCellId" TEXT,
    "newVillageId" TEXT,
    "reason" TEXT,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromLocation" TEXT,
    "toLocation" TEXT,

    CONSTRAINT "PigTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Litter" (
    "id" TEXT NOT NULL,
    "pigId" TEXT NOT NULL,
    "fatherPigId" TEXT,
    "pregnancyDate" TIMESTAMP(3),
    "expectedBirthDate" TIMESTAMP(3),
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "numberOfPigletsBorn" INTEGER NOT NULL,
    "numberSurvived" INTEGER NOT NULL,
    "numberLost" INTEGER NOT NULL,
    "recordedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Litter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Piglet" (
    "id" TEXT NOT NULL,
    "pigletId" TEXT,
    "litterId" TEXT NOT NULL,
    "sex" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "healthStatus" TEXT,
    "status" "PigletStatus" NOT NULL DEFAULT 'ALIVE',
    "beneficiaryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "breed" TEXT,
    "returnedDate" TIMESTAMP(3),
    "returnedFromId" TEXT,
    "newBeneficiaryId" TEXT,
    "redistributedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Piglet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VeterinaryExamination" (
    "id" TEXT NOT NULL,
    "pigId" TEXT NOT NULL,
    "beneficiaryId" TEXT,
    "veterinarianId" TEXT NOT NULL,
    "examinationDate" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "bodyCondition" TEXT,
    "temperature" DOUBLE PRECISION,
    "symptoms" TEXT,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "healthStatus" TEXT,
    "verificationStatus" "VeterinaryVerificationStatus" NOT NULL DEFAULT 'COMPLETED',
    "followUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VeterinaryExamination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" TEXT NOT NULL,
    "pigId" TEXT NOT NULL,
    "veterinarianId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "vaccinationDate" TIMESTAMP(3) NOT NULL,
    "batchNumber" TEXT,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "pigId" TEXT NOT NULL,
    "veterinarianId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "dosage" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "TreatmentStatus" NOT NULL DEFAULT 'ONGOING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MortalityRecord" (
    "id" TEXT NOT NULL,
    "pigId" TEXT NOT NULL,
    "beneficiaryId" TEXT,
    "recordedById" TEXT NOT NULL,
    "veterinarianId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "reportedCause" TEXT NOT NULL,
    "veterinaryCause" TEXT,
    "evidenceUrl" TEXT,
    "adminReviewStatus" "MortalityReviewStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "legacyPigId" TEXT,
    "veterinaryExaminationId" TEXT,
    "legacyStatus" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "MortalityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceTransaction" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "type" "FinanceType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "beneficiaryId" TEXT,
    "pigId" TEXT,
    "category" TEXT,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "receiptUrl" TEXT,
    "status" "FinanceStatus" NOT NULL DEFAULT 'DRAFT',
    "pigletId" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "FinanceTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repayment" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "sourcePigId" TEXT NOT NULL,
    "targetPiglets" INTEGER NOT NULL DEFAULT 3,
    "returnedPiglets" INTEGER NOT NULL DEFAULT 0,
    "remainingPiglets" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redistribution" (
    "id" TEXT NOT NULL,
    "pigletId" TEXT NOT NULL,
    "fromBeneficiaryId" TEXT NOT NULL,
    "toBeneficiaryId" TEXT NOT NULL,
    "redistributionDate" TIMESTAMP(3) NOT NULL,
    "approvedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VeterinaryRecord" (
    "id" TEXT NOT NULL,
    "pigId" TEXT NOT NULL,
    "veterinarianId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activityType" TEXT NOT NULL,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "medication" TEXT,
    "vaccination" TEXT,
    "weight" DOUBLE PRECISION,
    "bodyCondition" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VeterinaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VeterinaryVisit" (
    "id" TEXT NOT NULL,
    "pigId" TEXT NOT NULL,
    "veterinarianId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "healthStatus" TEXT NOT NULL,
    "vaccination" TEXT,
    "deworming" TEXT,
    "disease" TEXT,
    "treatment" TEXT,
    "medication" TEXT,
    "dosage" TEXT,
    "followUpDate" TIMESTAMP(3),
    "recommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VeterinaryVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldVisit" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "pigId" TEXT,
    "fieldOfficerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL,
    "observations" TEXT NOT NULL,
    "pigCondition" TEXT,
    "beneficiaryCondition" TEXT,
    "actionsTaken" TEXT,
    "recommendations" TEXT,
    "nextVisitDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedUserId" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "beneficiaryId" TEXT,
    "pigId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "beneficiaryId" TEXT,
    "pigId" TEXT,
    "pigletId" TEXT,
    "fieldVisitId" TEXT,
    "veterinaryRecordId" TEXT,
    "financeTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeReport" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workDone" TEXT NOT NULL,
    "familiesVisited" INTEGER NOT NULL DEFAULT 0,
    "pigsDistributed" INTEGER NOT NULL DEFAULT 0,
    "pigsReturned" INTEGER NOT NULL DEFAULT 0,
    "problemsFound" TEXT,
    "otherActivities" TEXT,
    "comment" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminReply" TEXT,
    "repliedById" TEXT,
    "replyDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_members_display_order_idx" ON "team_members"("display_order");

-- CreateIndex
CREATE INDEX "team_members_is_published_idx" ON "team_members"("is_published");

-- CreateIndex
CREATE INDEX "team_members_is_featured_idx" ON "team_members"("is_featured");

-- CreateIndex
CREATE INDEX "gallery_items_category_idx" ON "gallery_items"("category");

-- CreateIndex
CREATE INDEX "gallery_items_is_published_idx" ON "gallery_items"("is_published");

-- CreateIndex
CREATE INDEX "gallery_items_display_order_idx" ON "gallery_items"("display_order");

-- CreateIndex
CREATE INDEX "gallery_items_photo_date_idx" ON "gallery_items"("photo_date");

-- CreateIndex
CREATE UNIQUE INDEX "website_content_page_section_key" ON "website_content"("page", "section");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_key" ON "District"("name");

-- CreateIndex
CREATE UNIQUE INDEX "District_code_key" ON "District"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_name_districtId_key" ON "Sector"("name", "districtId");

-- CreateIndex
CREATE UNIQUE INDEX "Cell_name_sectorId_key" ON "Cell"("name", "sectorId");

-- CreateIndex
CREATE UNIQUE INDEX "Village_name_cellId_key" ON "Village"("name", "cellId");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_beneficiaryId_key" ON "Beneficiary"("beneficiaryId");

-- CreateIndex
CREATE INDEX "Beneficiary_nationalId_idx" ON "Beneficiary"("nationalId");

-- CreateIndex
CREATE INDEX "Beneficiary_phone_idx" ON "Beneficiary"("phone");

-- CreateIndex
CREATE INDEX "Beneficiary_districtId_idx" ON "Beneficiary"("districtId");

-- CreateIndex
CREATE INDEX "Beneficiary_sectorId_idx" ON "Beneficiary"("sectorId");

-- CreateIndex
CREATE INDEX "Beneficiary_cellId_idx" ON "Beneficiary"("cellId");

-- CreateIndex
CREATE INDEX "Beneficiary_villageId_idx" ON "Beneficiary"("villageId");

-- CreateIndex
CREATE UNIQUE INDEX "Pig_pigId_key" ON "Pig"("pigId");

-- CreateIndex
CREATE INDEX "Pig_pigId_idx" ON "Pig"("pigId");

-- CreateIndex
CREATE INDEX "Pig_beneficiaryId_idx" ON "Pig"("beneficiaryId");

-- CreateIndex
CREATE INDEX "Pig_districtId_idx" ON "Pig"("districtId");

-- CreateIndex
CREATE INDEX "Pig_sectorId_idx" ON "Pig"("sectorId");

-- CreateIndex
CREATE INDEX "Pig_cellId_idx" ON "Pig"("cellId");

-- CreateIndex
CREATE INDEX "Pig_villageId_idx" ON "Pig"("villageId");

-- CreateIndex
CREATE INDEX "Pig_healthStatus_idx" ON "Pig"("healthStatus");

-- CreateIndex
CREATE INDEX "Pig_status_idx" ON "Pig"("status");

-- CreateIndex
CREATE INDEX "PigDistribution_beneficiaryId_idx" ON "PigDistribution"("beneficiaryId");

-- CreateIndex
CREATE INDEX "PigDistribution_pigId_idx" ON "PigDistribution"("pigId");

-- CreateIndex
CREATE INDEX "PigDistribution_date_idx" ON "PigDistribution"("date");

-- CreateIndex
CREATE INDEX "PigReturn_beneficiaryId_idx" ON "PigReturn"("beneficiaryId");

-- CreateIndex
CREATE INDEX "PigReturn_pigId_idx" ON "PigReturn"("pigId");

-- CreateIndex
CREATE INDEX "PigReturn_returnDate_idx" ON "PigReturn"("returnDate");

-- CreateIndex
CREATE INDEX "RevolvingCycle_beneficiaryId_idx" ON "RevolvingCycle"("beneficiaryId");

-- CreateIndex
CREATE INDEX "RevolvingCycle_status_idx" ON "RevolvingCycle"("status");

-- CreateIndex
CREATE INDEX "RevolvingCycle_dueDate_idx" ON "RevolvingCycle"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Piglet_pigletId_key" ON "Piglet"("pigletId");

-- CreateIndex
CREATE INDEX "VeterinaryExamination_pigId_idx" ON "VeterinaryExamination"("pigId");

-- CreateIndex
CREATE INDEX "VeterinaryExamination_veterinarianId_idx" ON "VeterinaryExamination"("veterinarianId");

-- CreateIndex
CREATE INDEX "VeterinaryExamination_examinationDate_idx" ON "VeterinaryExamination"("examinationDate");

-- CreateIndex
CREATE INDEX "VeterinaryExamination_verificationStatus_idx" ON "VeterinaryExamination"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "MortalityRecord_legacyPigId_key" ON "MortalityRecord"("legacyPigId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceTransaction_transactionId_key" ON "FinanceTransaction"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "UserLocationAccess" ADD CONSTRAINT "UserLocationAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_fieldOfficerId_fkey" FOREIGN KEY ("fieldOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pig" ADD CONSTRAINT "Pig_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pig" ADD CONSTRAINT "Pig_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pig" ADD CONSTRAINT "Pig_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pig" ADD CONSTRAINT "Pig_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pig" ADD CONSTRAINT "Pig_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigDistribution" ADD CONSTRAINT "PigDistribution_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigDistribution" ADD CONSTRAINT "PigDistribution_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigDistribution" ADD CONSTRAINT "PigDistribution_distributedById_fkey" FOREIGN KEY ("distributedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigDistribution" ADD CONSTRAINT "PigDistribution_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigDistribution" ADD CONSTRAINT "PigDistribution_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigDistribution" ADD CONSTRAINT "PigDistribution_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigDistribution" ADD CONSTRAINT "PigDistribution_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigReturn" ADD CONSTRAINT "PigReturn_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigReturn" ADD CONSTRAINT "PigReturn_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigReturn" ADD CONSTRAINT "PigReturn_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigReturn" ADD CONSTRAINT "PigReturn_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigReturn" ADD CONSTRAINT "PigReturn_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigReturn" ADD CONSTRAINT "PigReturn_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigReturn" ADD CONSTRAINT "PigReturn_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevolvingCycle" ADD CONSTRAINT "RevolvingCycle_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigTransfer" ADD CONSTRAINT "PigTransfer_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigTransfer" ADD CONSTRAINT "PigTransfer_fromBeneficiaryId_fkey" FOREIGN KEY ("fromBeneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigTransfer" ADD CONSTRAINT "PigTransfer_toBeneficiaryId_fkey" FOREIGN KEY ("toBeneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigTransfer" ADD CONSTRAINT "PigTransfer_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PigTransfer" ADD CONSTRAINT "PigTransfer_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Litter" ADD CONSTRAINT "Litter_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Litter" ADD CONSTRAINT "Litter_fatherPigId_fkey" FOREIGN KEY ("fatherPigId") REFERENCES "Pig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piglet" ADD CONSTRAINT "Piglet_litterId_fkey" FOREIGN KEY ("litterId") REFERENCES "Litter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piglet" ADD CONSTRAINT "Piglet_returnedFromId_fkey" FOREIGN KEY ("returnedFromId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VeterinaryExamination" ADD CONSTRAINT "VeterinaryExamination_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VeterinaryExamination" ADD CONSTRAINT "VeterinaryExamination_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VeterinaryExamination" ADD CONSTRAINT "VeterinaryExamination_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MortalityRecord" ADD CONSTRAINT "MortalityRecord_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MortalityRecord" ADD CONSTRAINT "MortalityRecord_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MortalityRecord" ADD CONSTRAINT "MortalityRecord_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MortalityRecord" ADD CONSTRAINT "MortalityRecord_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MortalityRecord" ADD CONSTRAINT "MortalityRecord_legacyPigId_fkey" FOREIGN KEY ("legacyPigId") REFERENCES "Pig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MortalityRecord" ADD CONSTRAINT "MortalityRecord_veterinaryExaminationId_fkey" FOREIGN KEY ("veterinaryExaminationId") REFERENCES "VeterinaryRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_pigletId_fkey" FOREIGN KEY ("pigletId") REFERENCES "Piglet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repayment" ADD CONSTRAINT "Repayment_sourcePigId_fkey" FOREIGN KEY ("sourcePigId") REFERENCES "Pig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redistribution" ADD CONSTRAINT "Redistribution_pigletId_fkey" FOREIGN KEY ("pigletId") REFERENCES "Piglet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redistribution" ADD CONSTRAINT "Redistribution_fromBeneficiaryId_fkey" FOREIGN KEY ("fromBeneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redistribution" ADD CONSTRAINT "Redistribution_toBeneficiaryId_fkey" FOREIGN KEY ("toBeneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VeterinaryRecord" ADD CONSTRAINT "VeterinaryRecord_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VeterinaryRecord" ADD CONSTRAINT "VeterinaryRecord_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VeterinaryVisit" ADD CONSTRAINT "VeterinaryVisit_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VeterinaryVisit" ADD CONSTRAINT "VeterinaryVisit_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldVisit" ADD CONSTRAINT "FieldVisit_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldVisit" ADD CONSTRAINT "FieldVisit_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldVisit" ADD CONSTRAINT "FieldVisit_fieldOfficerId_fkey" FOREIGN KEY ("fieldOfficerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_pigId_fkey" FOREIGN KEY ("pigId") REFERENCES "Pig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_pigletId_fkey" FOREIGN KEY ("pigletId") REFERENCES "Piglet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_fieldVisitId_fkey" FOREIGN KEY ("fieldVisitId") REFERENCES "FieldVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_veterinaryRecordId_fkey" FOREIGN KEY ("veterinaryRecordId") REFERENCES "VeterinaryRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_financeTransactionId_fkey" FOREIGN KEY ("financeTransactionId") REFERENCES "FinanceTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeReport" ADD CONSTRAINT "EmployeeReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_repliedById_fkey" FOREIGN KEY ("repliedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

