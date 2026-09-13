-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "licenseEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licensePaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licensePaymentInstructions" TEXT,
ADD COLUMN     "licensePriceLabel" TEXT;

-- CreateTable
CREATE TABLE "LicensePaymentClaim" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "method" TEXT,
    "contactInfo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "LicensePaymentClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LicensePaymentClaim_status_idx" ON "LicensePaymentClaim"("status");
