-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "licensePaid",
ADD COLUMN     "licenseKey" TEXT;
