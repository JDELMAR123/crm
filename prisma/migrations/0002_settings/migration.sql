-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "businessName" TEXT NOT NULL DEFAULT 'Mi CRM',
    "aiProvider" TEXT NOT NULL DEFAULT 'simulation',
    "aiApiKey" TEXT,
    "aiModel" TEXT NOT NULL DEFAULT 'claude-opus-5',
    "aiBusinessContext" TEXT NOT NULL DEFAULT '',
    "productCatalog" TEXT NOT NULL DEFAULT '[]',
    "colorWords" TEXT NOT NULL DEFAULT '[]',
    "metaVerifyToken" TEXT,
    "waToken" TEXT,
    "waPhoneId" TEXT,
    "igToken" TEXT,
    "igAccountId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
