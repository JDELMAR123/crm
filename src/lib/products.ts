import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Forma reducida de un producto, tal como la usan los motores de IA. */
export type CatalogEntry = { name: string; keywords: string[] };

export type ProductInfo = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price: number | null;
  sku: string | null;
  keywords: string[];
  active: boolean;
};

function parseKeywords(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function toProductInfo(row: {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price: number | null;
  sku: string | null;
  keywords: string;
  active: boolean;
}): ProductInfo {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    price: row.price,
    sku: row.sku,
    keywords: parseKeywords(row.keywords),
    active: row.active,
  };
}

/** Todos los productos, activos e inactivos, para la pantalla de gestión. */
export async function getAllProducts(): Promise<ProductInfo[]> {
  const rows = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return rows.map(toProductInfo);
}

/** Solo los productos activos: lo que la IA usa para guiarse (cacheado por request). */
export const getActiveProducts = cache(async (): Promise<ProductInfo[]> => {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return rows.map(toProductInfo);
});

/** Forma reducida (nombre + sinónimos) para el motor de simulación. */
export async function getCatalogEntries(): Promise<CatalogEntry[]> {
  const products = await getActiveProducts();
  return products.map((p) => ({
    name: p.name,
    keywords: p.keywords.length > 0 ? p.keywords : [p.name.toLowerCase()],
  }));
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}
