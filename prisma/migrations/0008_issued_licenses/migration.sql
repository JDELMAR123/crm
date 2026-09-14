-- CreateTable
CREATE TABLE "IssuedLicense" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssuedLicense_pkey" PRIMARY KEY ("id")
);
