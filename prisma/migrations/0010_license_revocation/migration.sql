-- AlterTable
ALTER TABLE "IssuedLicense" ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "IssuedLicense_key_key" ON "IssuedLicense"("key");

-- CreateIndex
CREATE INDEX "IssuedLicense_revoked_idx" ON "IssuedLicense"("revoked");
