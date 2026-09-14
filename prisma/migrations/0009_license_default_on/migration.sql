-- AlterTable
-- Solo cambia el valor por defecto para FILAS NUEVAS (instalaciones que
-- todavía no tienen fila de Settings). No toca las filas existentes.
ALTER TABLE "Settings" ALTER COLUMN "licenseEnabled" SET DEFAULT true;
