"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type ProductState = { ok?: boolean; error?: string };

function revalidateAll() {
  revalidatePath("/productos");
  revalidatePath("/", "layout");
}

function parseKeywords(raw: string): string[] {
  return raw
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
}

function readForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = priceRaw ? Number(priceRaw.replace(",", ".")) : null;
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const keywords = parseKeywords(String(formData.get("keywords") ?? ""));
  const active = formData.get("active") === "on";
  return { name, category, description, price, sku, keywords, active };
}

export async function createProduct(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  await requireAdmin();
  const data = readForm(formData);
  if (!data.name) return { error: "El nombre no puede estar vacío." };
  if (data.price != null && Number.isNaN(data.price)) {
    return { error: "El precio no es válido." };
  }

  await prisma.product.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      price: data.price,
      sku: data.sku,
      keywords: JSON.stringify(
        data.keywords.length ? data.keywords : [data.name.toLowerCase()]
      ),
      active: data.active,
    },
  });
  revalidateAll();
  redirect("/productos");
}

export async function updateProduct(
  id: string,
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  await requireAdmin();
  const data = readForm(formData);
  if (!data.name) return { error: "El nombre no puede estar vacío." };
  if (data.price != null && Number.isNaN(data.price)) {
    return { error: "El precio no es válido." };
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      price: data.price,
      sku: data.sku,
      keywords: JSON.stringify(
        data.keywords.length ? data.keywords : [data.name.toLowerCase()]
      ),
      active: data.active,
    },
  });
  revalidateAll();
  redirect("/productos");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.product.delete({ where: { id } });
  revalidateAll();
  redirect("/productos");
}

export async function toggleProductActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "1";
  if (!id) return;
  await prisma.product.update({ where: { id }, data: { active } });
  revalidateAll();
}
