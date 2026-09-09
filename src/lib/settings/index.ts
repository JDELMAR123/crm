import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_AI_MODEL,
  DEFAULT_BUSINESS_CONTEXT,
  DEFAULT_BUSINESS_NAME,
  DEFAULT_COLOR_WORDS,
  DEFAULT_PRODUCT_CATALOG,
  type CatalogEntry,
} from "./defaults";

export type ResolvedSettings = {
  businessName: string;
  ai: {
    provider: "simulation" | "anthropic";
    apiKey: string | null;
    model: string;
    businessContext: string;
    /** Proveedor elegido en los ajustes, aunque falte la clave. */
    configuredProvider: "simulation" | "anthropic";
  };
  catalog: CatalogEntry[];
  colorWords: string[];
  channels: {
    verifyToken: string | null;
    whatsapp: { token: string; phoneId: string } | null;
    instagram: { token: string; accountId: string } | null;
  };
  disabledModules: string[];
  creatorNotice: string | null;
  branding: {
    hasLogo: boolean;
    /** Marca de tiempo para invalidar la caché del logo. */
    logoVersion: number;
    color: string | null;
    /** Color de texto legible sobre `color`. */
    colorContrast: string | null;
  };
};

export type ModuleName = "inbox" | "pipeline" | "ia";

/** Devuelve "#000000" o "#ffffff" según cuál contraste mejor con el color dado. */
export function contrastColor(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  // Luminancia relativa aproximada
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#171717" : "#ffffff";
}

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) && v.length > 0 ? (v as T[]) : fallback;
  } catch {
    return fallback;
  }
}

type SettingsRow = Awaited<ReturnType<typeof prisma.settings.findUnique>>;

// Caché en memoria de la instancia: los ajustes se leen en cada página pero se
// escriben raras veces. Ventana corta; se invalida al guardar.
let rowCache: { row: NonNullable<SettingsRow>; at: number } | null = null;
const ROW_TTL_MS = 15_000;

/** Devuelve el registro de ajustes, creándolo con valores por defecto si no existe. */
async function loadRow(): Promise<NonNullable<SettingsRow>> {
  if (rowCache && Date.now() - rowCache.at < ROW_TTL_MS) return rowCache.row;

  let row = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (!row) {
    row = await prisma.settings.create({
      data: {
        id: "singleton",
        businessName: DEFAULT_BUSINESS_NAME,
        aiModel: DEFAULT_AI_MODEL,
        aiBusinessContext: DEFAULT_BUSINESS_CONTEXT,
        productCatalog: JSON.stringify(DEFAULT_PRODUCT_CATALOG),
        colorWords: JSON.stringify(DEFAULT_COLOR_WORDS),
      },
    });
  }
  rowCache = { row, at: Date.now() };
  return row;
}

/**
 * Configuración efectiva: fila de la base de datos + variables de entorno como
 * respaldo (para despliegues que prefieran configurarlo por env).
 */
export const getSettings = cache(async (): Promise<ResolvedSettings> => {
  const row = await loadRow();

  const configuredProvider =
    row.aiProvider === "anthropic" ? "anthropic" : "simulation";
  const apiKey = row.aiApiKey || process.env.ANTHROPIC_API_KEY || null;
  const envProvider = process.env.AI_PROVIDER?.toLowerCase();
  const wantsAnthropic =
    configuredProvider === "anthropic" || envProvider === "anthropic";

  const verifyToken = row.metaVerifyToken || process.env.META_WEBHOOK_VERIFY_TOKEN || null;
  const waToken = row.waToken || process.env.META_WHATSAPP_TOKEN || null;
  const waPhoneId = row.waPhoneId || process.env.META_WHATSAPP_PHONE_ID || null;
  const igToken = row.igToken || process.env.META_INSTAGRAM_TOKEN || null;
  const igAccountId = row.igAccountId || process.env.META_INSTAGRAM_ACCOUNT_ID || null;

  return {
    businessName: row.businessName || DEFAULT_BUSINESS_NAME,
    ai: {
      provider: wantsAnthropic && apiKey ? "anthropic" : "simulation",
      configuredProvider,
      apiKey,
      model: row.aiModel || process.env.ANTHROPIC_MODEL || DEFAULT_AI_MODEL,
      businessContext: row.aiBusinessContext?.trim() || DEFAULT_BUSINESS_CONTEXT,
    },
    catalog: parseJsonArray<CatalogEntry>(row.productCatalog, DEFAULT_PRODUCT_CATALOG),
    colorWords: parseJsonArray<string>(row.colorWords, DEFAULT_COLOR_WORDS),
    channels: {
      verifyToken,
      whatsapp: waToken && waPhoneId ? { token: waToken, phoneId: waPhoneId } : null,
      instagram: igToken && igAccountId ? { token: igToken, accountId: igAccountId } : null,
    },
    disabledModules: parseJsonArray<string>(row.disabledModules, []),
    creatorNotice: row.creatorNotice?.trim() || null,
    branding: {
      hasLogo: Boolean(row.logo),
      logoVersion: Math.floor(row.updatedAt.getTime() / 1000),
      color: row.brandColor || null,
      colorContrast: row.brandColor ? contrastColor(row.brandColor) : null,
    },
  };
});

/** Bytes del logo (data URI) para servirlo. */
export async function getLogoDataUri(): Promise<string | null> {
  const row = await loadRow();
  return row.logo || null;
}

/** ¿Está activo un módulo? */
export async function isModuleEnabled(name: ModuleName): Promise<boolean> {
  return !(await getSettings()).disabledModules.includes(name);
}

/** Datos crudos para la pantalla de ajustes (sin respaldo de env). */
export async function getSettingsRow() {
  return loadRow();
}

export async function updateSettings(
  data: Parameters<typeof prisma.settings.update>[0]["data"]
) {
  await loadRow();
  const row = await prisma.settings.update({ where: { id: "singleton" }, data });
  rowCache = { row, at: Date.now() }; // refrescar la caché con lo recién guardado
  return row;
}
