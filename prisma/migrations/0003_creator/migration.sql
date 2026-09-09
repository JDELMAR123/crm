-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creatorNotice" TEXT,
ADD COLUMN     "disabledModules" TEXT NOT NULL DEFAULT '[]';
